import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PgService } from '../../pg/pg.service';
import {
  ControlComponentsTasksDTO,
  ControlComponentsTasksUpdates,
} from '../dto/control-components-tasks.dto';
import { ControlComponentsTasks } from '../entities/control-components-tasks.entity';
import { ControlComponentsTaskAnswersService } from './control-components-task-answers.service';
import { UsersControlSessionsService } from '../../control-components/services/users-control-sessions.service';
import { UsersTaskSetsService } from '../../users-task-sets/users-task-sets.service';
import { ControlComponentsService } from '../../control-components/services/control-components.service';
import { ControlComponentsTaskVariantsService } from './control-components-task-variants.service';
import { ControlComponentsTaskVariantsWithAnswers } from '../dto/control-components-task-variants.output.dto';
import {
  ControlComponentsTasksWithVariant,
  ControlComponentsTasksWithVariants,
} from '../dto/control-components-tasks.output.dto';
import UsersTaskSet from '../../users-task-sets/users-task-set.entity';
import { GroupMembersService } from '../../group-members/group-members.service';
import { ControlComponentsTaskVariants } from '../entities/control-components-task-variants.entity';
import { GroupsService } from '../../groups/groups.service';
import { DisciplinesGroupAccessService } from '../../disciplines-group-access/disciplines-group-access.service';

@Injectable()
export class ControlComponentsTasksService {
  constructor(
    private pgService: PgService,
    private controlComponentsTaskAnswersService: ControlComponentsTaskAnswersService,
    private usersControlSessionsService: UsersControlSessionsService,
    private usersTaskSetsService: UsersTaskSetsService,
    @Inject(forwardRef(() => ControlComponentsService))
    private controlComponentsService: ControlComponentsService,
    private controlComponentsTaskVariantsService: ControlComponentsTaskVariantsService,
    private groupMembersService: GroupMembersService,
    private groupsService: GroupsService,
    private disciplinesGroupAccessService: DisciplinesGroupAccessService,
  ) {}
  private tableName = 'ControlComponentsTasks';
  async createControlComponentsTask(
    controlComponentsTaskDTO: ControlComponentsTasksDTO,
  ): Promise<number> {
    const count = (
      await this.pgService.useQuery(
        `SELECT COUNT(*) as count FROM "${this.tableName}" WHERE "controlComponentID"=${controlComponentsTaskDTO.controlComponentID}`,
      )
    ).rows[0].count;
    if (count > 500) return;
    if (controlComponentsTaskDTO.maxPoint == undefined) {
      const controlComponent = await this.controlComponentsService.getControlComponent(
        controlComponentsTaskDTO.controlComponentID,
      );
      controlComponentsTaskDTO.maxPoint = controlComponent.maxPoint;
    }
    const res = await this.pgService.create({
      tableName: this.tableName,
      values: [controlComponentsTaskDTO],
      returning: 'taskID',
    });
    if (controlComponentsTaskDTO.type == 'files')
      await this.controlComponentsTaskVariantsService.createTaskVariant({
        taskID: res.rows[0].taskID,
      });
    return res.rows[0].taskID;
  }

  async deleteControlComponentsTask(taskID: number): Promise<void> {
    const variants = await this.controlComponentsTaskVariantsService.getTaskVariants(
      taskID,
    );
    for (const variant of variants) {
      await this.controlComponentsTaskVariantsService.deleteTaskVariant(
        variant.variantID,
      );
    }
    const { controlComponentID, index } = (
      await this.pgService.delete({
        tableName: this.tableName,
        where: { taskID },
        cascade: true,
        returning: '*',
      })
    ).rows[0];
    await this.pgService.useQuery(`
        UPDATE "${this.tableName}" SET "index" = "index" - 1 WHERE "controlComponentID"=${controlComponentID} AND "index">${index} 
    `);
  }

  async updateControlComponentsTask(
    taskID: number,
    updates: ControlComponentsTasksUpdates,
  ): Promise<void> {
    // if(updates.index!=undefined)
    await this.pgService.update({
      tableName: this.tableName,
      updates: { ...updates },
      where: { taskID },
    });
  }
  async getControlComponentTasks(
    controlComponentID: number,
  ): Promise<ControlComponentsTasks[]> {
    return await this.pgService.find({
      tableName: this.tableName,
      where: { controlComponentID },
    });
  }
  async getControlComponentTasksWithVariants(
    controlComponentID: number,
  ): Promise<ControlComponentsTasksWithVariants[]> {
    const tasks = await this.getControlComponentTasks(controlComponentID);
    return Promise.all(
      tasks.map(async (t) => {
        const variants: ControlComponentsTaskVariantsWithAnswers[] = await this.controlComponentsTaskVariantsService.getTaskVariantsWithAnswers(
          t.taskID,
        );
        return { ...t, variants };
      }),
    );
  }

  async getControlComponentTasksWithVariant(
    controlComponentID: number,
  ): Promise<ControlComponentsTasksWithVariant[]> {
    const tasks = await this.getControlComponentTasks(controlComponentID);
    return Promise.all(
      tasks.map(async (t) => {
        const variants: ControlComponentsTaskVariantsWithAnswers[] = await this.controlComponentsTaskVariantsService.getTaskVariantsWithAnswers(
          t.taskID,
        );
        return { ...t, variant: variants[0] };
      }),
    );
  }

  async getControlComponentTask(
    taskID: number,
  ): Promise<ControlComponentsTasks> {
    return await this.pgService.findOne({
      tableName: this.tableName,
      where: { taskID },
    });
  }

  async getControlComponentTaskWithVariants(
    taskID: number,
  ): Promise<ControlComponentsTasksWithVariants> {
    const task = await this.getControlComponentTask(taskID);
    const variants = await this.controlComponentsTaskVariantsService.getTaskVariantsWithAnswers(
      taskID,
    );
    return { ...task, variants };
  }

  async getMyTasks(
    userID: number,
    controlComponentID: number,
    disciplineID: number,
  ): Promise<ControlComponentsTasksWithVariant[]> {
    const session = await this.usersControlSessionsService.checkSession(
      userID,
      controlComponentID,
    );

    if (session.finalDate) throw new UnauthorizedException();
    let usersSet = await this.usersTaskSetsService.getUsersTaskSet(
      session.sessionID,
    );
    if (!usersSet || !usersSet.length)
      usersSet = await this.generateTasksSet(
        userID,
        controlComponentID,
        disciplineID,
      );
    const controlComponent = await this.controlComponentsService.getControlComponent(
      controlComponentID,
    );
    if (!controlComponent.canGoPrev && controlComponent.type != 'zvit')
      usersSet = usersSet.filter((us) => us.index >= session.index);
    const tasks = await Promise.all(
      usersSet.map(async (us) => {
        const variant: ControlComponentsTaskVariantsWithAnswers = await this.controlComponentsTaskVariantsService.getTaskVariantWithAnswers(
          us.variantID,
        );
        const task: ControlComponentsTasks = await this.getControlComponentTask(
          variant.taskID,
        );
        return {
          ...task,
          index: us.index,
          variant: {
            ...variant,
            answers: variant.answers.map((a) => {
              return { ...a, correct: false };
            }),
          },
        };
      }),
    );
    return tasks;
  }

  async generateTasksSet(
    userID: number,
    controlComponentID: number,
    disciplineID: number,
    editor = false,
  ): Promise<UsersTaskSet[]> {
    const controlComponent = await this.controlComponentsService.getControlComponent(
      controlComponentID,
    );
    let tasks: ControlComponentsTasks[] = await this.getControlComponentTasks(
      controlComponentID,
    );
    if (controlComponent.type == 'zvit') {
      const taskFiles = tasks.find((t) => t.type == 'files');
      tasks = [taskFiles];
    } else if (controlComponent.type == 'nofm') {
      tasks = tasks.sort(() => Math.random() - 0.5);
      tasks.splice(controlComponent.taskCountNOfM);
    } else if (controlComponent.sortRandomly) {
      tasks = tasks.sort(() => Math.random() - 0.5);
    }
    let session;
    if (!editor) {
      session = await this.usersControlSessionsService.checkSession(
        userID,
        controlComponentID,
      );
      if (!session || session.finalDate) throw new UnauthorizedException();
    } else {
      session = await this.usersControlSessionsService.getLastSession(
        userID,
        controlComponentID,
      );
    }
    const variantNumber = await this.groupMembersService.getNumberInGroupList(
      userID,
    );

    return Promise.all(
      tasks.map(async (t, index) => {
        let variant: ControlComponentsTaskVariants;
        const variantsCount = await this.controlComponentsTaskVariantsService.getCountOfVariants(
          t.taskID,
        );
        const variants = await this.controlComponentsTaskVariantsService.getTaskVariants(
          t.taskID,
        );
        if (t.choosingType == 'random') {
          const randVariantNumber = Math.floor(Math.random() * variantsCount);
          variant = variants.find((v) => v.variant == randVariantNumber);
        } else if (t.choosingType == 'byGroupList') {
          variant = variants.find((v) => v.variant == variantNumber);
        } else if (t.choosingType == 'uniqueInGroup') {
          const studentGroups = await this.groupsService.getStudentGroupsById(
            userID,
          );
          const disciplineGroups = await this.disciplinesGroupAccessService.findGroupsOfDiscipline(
            disciplineID,
          );
          const studentGroup = studentGroups.find((sg) =>
            disciplineGroups.find((dg) => dg.groupID == sg.groupID),
          );
          const usedVariants = await this.usersControlSessionsService.getSortedSessionsInGroup(
            studentGroup.groupID,
            t.taskID,
          );
          const sessionCount: number =
            (await this.usersControlSessionsService.getSessionCount(
              userID,
              controlComponentID,
            )) - 1;
          if (usedVariants.length > 0) {
            let curVar = usedVariants[0];
            let arr = [curVar];
            for (let i = 1; i < usedVariants.length; i++) {
              if (curVar.userID == usedVariants[i].userID) {
                arr.push(usedVariants[i]);
              } else {
                curVar = usedVariants[i];

                if (arr.length > sessionCount) {
                  const index = variants.findIndex(
                    (v) => v.variantID == arr[sessionCount].variantID,
                  );
                  if (index != -1) variants.splice(index, 1);
                }
                arr = [curVar];
              }
            }
            if (arr.length > sessionCount) {
              const index = variants.findIndex(
                (v) => v.variantID == arr[sessionCount].variantID,
              );
              if (index != -1) variants.splice(index, 1);
            }
          }
          variant = variants[Math.floor(Math.random() * variants.length)];
        }
        await this.usersTaskSetsService.createTaskSet({
          variantID: variant.variantID,
          sessionID: session.sessionID,
          taskID: t.taskID,
          index:
            controlComponent.type == 'nofm' || controlComponent.sortRandomly
              ? index
              : t.index,
        });
        return {
          variantID: variant?.variantID,
          sessionID: session.sessionID,
          taskID: t.taskID,
          index:
            controlComponent.type == 'nofm' || controlComponent.sortRandomly
              ? index
              : t.index,
        } as UsersTaskSet;
      }),
    );
  }
}

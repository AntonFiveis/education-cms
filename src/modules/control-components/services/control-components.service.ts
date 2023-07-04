import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PgService } from '../../pg/pg.service';
import {
  ControlComponentsDTO,
  ControlComponentsUpdates,
} from '../dto/control-components.dto';
import {
  ControlComponentsOutputDTO,
  ControlComponentsWithTasks,
} from '../dto/control-components.output.dto';
import { ControlComponentsTasksService } from '../../control-components-tasks/services/control-components-tasks.service';
import { ControlComponents } from '../entities/control-components.entity';
import { DisciplinesService } from '../../disciplines/disciplines.service';
import { GroupMembersService } from '../../group-members/group-members.service';

@Injectable()
export class ControlComponentsService {
  constructor(
    private pgService: PgService,
    @Inject(forwardRef(() => ControlComponentsTasksService))
    private controlComponentsTasksService: ControlComponentsTasksService,
    private groupMembersService: GroupMembersService,
    private disciplinesService: DisciplinesService,
  ) {}
  private tableName = 'ControlComponents';

  async createControlComponent(
    controlComponentDTO: ControlComponentsDTO,
  ): Promise<void> {
    await this.pgService.create({
      tableName: this.tableName,
      values: [controlComponentDTO],
    });
  }

  async updateControlComponent(
    controlComponentID: number,
    controlComponentUpdates: ControlComponentsUpdates,
  ): Promise<void> {
    const oldCC = await this.getControlComponent(controlComponentID);
    const tasks = await this.controlComponentsTasksService.getControlComponentTasks(
      controlComponentID,
    );
    const taskFiles = tasks.find((t) => t.type == 'files');
    if (
      controlComponentUpdates.type == 'nofm' &&
      (controlComponentUpdates.taskCountNOfM ||
        controlComponentUpdates.maxPoint)
    ) {
      await Promise.all(
        tasks.map(async (t) => {
          await this.controlComponentsTasksService.updateControlComponentsTask(
            t.taskID,
            {
              maxPoint:
                Number(controlComponentUpdates.maxPoint) /
                  controlComponentUpdates.taskCountNOfM ?? 1,
            },
          );
        }),
      );
    }
    if (oldCC.type != controlComponentUpdates.type) {
      for (const task of tasks) {
        await this.controlComponentsTasksService.deleteControlComponentsTask(
          task.taskID,
        );
      }
      if (controlComponentUpdates.type == 'zvit') {
        await this.controlComponentsTasksService.createControlComponentsTask({
          type: 'files',
          choosingType: 'random',
          controlComponentID,
          index: 0,
          maxPoint: Number(controlComponentUpdates.maxPoint ?? 0),
        });
      }
    }
    if (taskFiles && controlComponentUpdates.maxPoint) {
      await this.controlComponentsTasksService.updateControlComponentsTask(
        taskFiles.taskID,
        { maxPoint: Number(controlComponentUpdates.maxPoint) },
      );
    }
    await this.pgService.update({
      tableName: this.tableName,
      updates: { ...controlComponentUpdates },
      where: { controlComponentID },
    });
  }

  async deleteControlComponent(controlComponentID: number): Promise<void> {
    const tasks = await this.controlComponentsTasksService.getControlComponentTasks(
      controlComponentID,
    );
    for (const task of tasks) {
      await this.controlComponentsTasksService.deleteControlComponentsTask(
        task.taskID,
      );
    }
    await this.pgService.delete({
      tableName: this.tableName,
      where: { controlComponentID },
      cascade: true,
    });
  }

  async checkValidControlComponent(
    controlComponentID: number,
    disciplineID: number,
  ): Promise<boolean> {
    const controlComponent = await this.getControlComponent(controlComponentID);
    if (controlComponent.timeLimit <= 0) return false;
    const tasks = await this.controlComponentsTasksService.getControlComponentTasksWithVariants(
      controlComponentID,
    );
    const groups = await this.disciplinesService.getGroupsOfDiscipline(
      disciplineID,
    );
    let sum = 0;
    for (let i = 0; i < tasks.length; i++) {
      sum += tasks[i].maxPoint;
      if (tasks[i].variants.length == 0) {
        return false;
      }
      for (let j = 0; j < tasks[i].variants.length; j++) {
        if (
          tasks[i].type == '1xm' ||
          tasks[i].type == 'nxm' ||
          tasks[i].type == 'single-string'
        ) {
          if (!tasks[i].variants[j].answers.find((a) => a.correct)) {
            return false;
          }
        }
      }
      for (let j = 0; j < groups.length; j++) {
        if (tasks[i].choosingType != 'random') {
          const studentsCount = await this.groupMembersService.getStudentsCountOfTheGroup(
            groups[j].groupID,
          );
          if (studentsCount > tasks[i].variants.length) return false;
        }
      }
    }
    if (
      Math.abs(sum - controlComponent.maxPoint) > 0.01 &&
      controlComponent.type != 'nofm'
    )
      return false;
    return true;
  }

  async getControlComponent(
    controlComponentID: number,
  ): Promise<ControlComponentsOutputDTO> {
    const res = await this.pgService.useQuery(
      `SELECT CC.*, AC."name" FROM "${this.tableName}" CC INNER JOIN "ActivityComponent" AC 
        on CC."controlComponentID"=AC."activityComponentID" WHERE CC."controlComponentID"=${controlComponentID}`,
    );
    return res.rows[0];
  }
  async getControlComponentWithTasks(
    controlComponentID: number,
  ): Promise<ControlComponentsWithTasks> {
    const controlComponent: ControlComponentsOutputDTO = await this.getControlComponent(
      controlComponentID,
    );
    let tasks;
    if (controlComponent.type != 'nofm')
      tasks = await this.controlComponentsTasksService.getControlComponentTasks(
        controlComponentID,
      );
    else
      tasks = await this.controlComponentsTasksService.getControlComponentTasksWithVariant(
        controlComponentID,
      );
    return { ...controlComponent, tasks };
  }
  async getActivityControlComponents(
    activityID: number,
  ): Promise<ControlComponentsWithTasks[]> {
    const { rows }: { rows: ControlComponents[] } = await this.pgService
      .useQuery(`
    SELECT CC.*, AC."name" FROM "${this.tableName}" CC INNER JOIN "ActivityComponent" AC 
        on CC."controlComponentID"=AC."activityComponentID" WHERE CC."controlComponentID" IN (SELECT "activityComponentID" FROM "ActivityComponent" WHERE "activityID" = ${activityID}) ORDER BY AC."index"
    `);

    return await Promise.all(
      rows.map(async (cc) => {
        const tasks = await this.controlComponentsTasksService.getControlComponentTasks(
          cc.controlComponentID,
        );
        return { ...cc, tasks } as ControlComponentsWithTasks;
      }),
    );
  }
}

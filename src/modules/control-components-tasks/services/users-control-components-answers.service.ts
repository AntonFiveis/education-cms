import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PgService } from '../../pg/pg.service';
import { UsersControlComponentsAnswersDTO } from '../dto/users-control-components-answers.dto';
import { ControlComponentsTasksService } from './control-components-tasks.service';
import { ControlComponentsService } from '../../control-components/services/control-components.service';
import { UsersControlSessionsService } from '../../control-components/services/users-control-sessions.service';
import { ControlComponents } from '../../control-components/entities/control-components.entity';
import { UsersControlComponentsAnswers } from '../entities/users-control-components-answers.entity';
import * as fs from 'fs';
import { extname } from 'path';
import { Readable } from 'stream';
import { ControlComponentsTaskVariantsService } from './control-components-task-variants.service';
import { ControlComponentsTaskVariants } from '../entities/control-components-task-variants.entity';
import { ControlComponentsTasks } from '../entities/control-components-tasks.entity';
import { ControlComponentsTaskVariantsWithAnswers } from '../dto/control-components-task-variants.output.dto';
import { UsersTaskSetsService } from '../../users-task-sets/users-task-sets.service';
import {
  ControlComponentsTasksWithVariant,
  ControlComponentsTasksWithVariantAndUserAnswer,
} from '../dto/control-components-tasks.output.dto';
import { DisciplinesService } from '../../disciplines/disciplines.service';
import { UsersControlSessions } from '../../control-components/entities/users-control-sessions.entity';
import { last } from 'rxjs/operators';
@Injectable()
export class UsersControlComponentsAnswersService {
  constructor(
    private pgService: PgService,
    @Inject(forwardRef(() => ControlComponentsTasksService))
    private controlComponentsTasksService: ControlComponentsTasksService,
    @Inject(forwardRef(() => ControlComponentsService))
    private controlComponentsService: ControlComponentsService,
    private usersControlSessionsService: UsersControlSessionsService,
    @Inject(forwardRef(() => ControlComponentsTaskVariantsService))
    private controlComponentsTaskVariantsService: ControlComponentsTaskVariantsService,
    private usersTaskSetsService: UsersTaskSetsService,
  ) {}
  private tableName = 'UsersControlComponentsAnswers';

  async deleteAnswers(where: {
    variantID?: number;
    userID?: number;
    sessionID?: number;
  }): Promise<void> {
    const answers: UsersControlComponentsAnswers[] = await this.pgService.find({
      tableName: this.tableName,
      where: { ...where },
    });
    for (const answer of answers) {
      for (const file of answer.answer.split(';')) {
        if (fs.existsSync(`./files/${file}`) && file.replace(' ', '') != '') {
          fs.unlinkSync(`./files/${file}`);
        }
      }

      await this.pgService.delete({
        tableName: this.tableName,
        cascade: true,
        where: { userAnswerID: answer.userAnswerID },
      });
    }
  }
  handOverFile(
    userAnswer: UsersControlComponentsAnswers,
    file: Express.Multer.File,
  ): string {
    const path = './files';
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }

    if (userAnswer?.answer) {
      for (const fpath of userAnswer.answer.split(';'))
        try {
          if (fpath != '' && fs.existsSync(path + '/' + fpath))
            fs.unlinkSync(path + '/' + fpath);
        } catch (e) {
          console.log(e);
        }
    }
    const nameSplitted = file.originalname.replace('#', '-').split('.');
    nameSplitted.pop();
    const name = nameSplitted.join('');
    const fileExtName = extname(file.originalname);
    const randomName = Array.from({ length: 4 }, () =>
      Math.round(Math.random() * 16).toString(16),
    ).join('');
    const filename = `${name}-${randomName}${fileExtName.toLowerCase()}`;
    fs.writeFileSync(path + `/${filename}`, file.buffer);
    return filename;
  }
  async getFile(path: string): Promise<Readable> {
    return new Promise((resolve, reject) => {
      fs.readFile(`files/${path}`, null, (err, data) => {
        if (err) reject();
        const stream = new Readable();
        stream.push(data);
        stream.push(null);
        resolve(stream);
      });
    });
  }

  async handOverTask(
    { variantID, userID, answer }: UsersControlComponentsAnswersDTO,
    forced = false,
    file: Express.Multer.File = undefined,
    files: Express.Multer.File[] = undefined,
    editor = false,
  ): Promise<void> {
    const variant: ControlComponentsTaskVariantsWithAnswers = await this.controlComponentsTaskVariantsService.getTaskVariantWithAnswers(
      variantID,
    );
    const task: ControlComponentsTasks = await this.controlComponentsTasksService.getControlComponentTask(
      variant.taskID,
    );
    const controlComponent: ControlComponents = await this.controlComponentsService.getControlComponent(
      task.controlComponentID,
    );

    let validSession: UsersControlSessions;
    const lastSession = await this.usersControlSessionsService.getLastSession(
      userID,
      task.controlComponentID,
    );
    if (lastSession && lastSession.lastTaskID && (file || files)) {
      forced = true;
    }
    if (!editor && !forced) {
      validSession = await this.usersControlSessionsService.checkSession(
        userID,
        task.controlComponentID,
      );
      const usersSet = await this.usersTaskSetsService.getUsersTaskSetByTaskID(
        validSession.sessionID,
        task.taskID,
      );
      if (!validSession || validSession.finalDate)
        throw new UnauthorizedException('Invalid session');
      if (!controlComponent.canGoPrev && controlComponent.type != 'zvit') {
        if (usersSet.index < validSession.index)
          throw new UnauthorizedException(
            `You can't handover task with this index`,
          );
      }
    } else {
      validSession = lastSession;
    }

    if (forced) {
      const forcedDelta = 15 * 60;
      if (
        Number(controlComponent.timeLimit) + forcedDelta <
          Math.floor(
            (Number(new Date()) - Number(validSession.startDate)) / 1000,
          ) ||
        !validSession.lastTaskID ||
        validSession.lastTaskID != task.taskID
      ) {
        throw new UnauthorizedException('Invalid task for force push');
      }
    }

    const userAnswer: UsersControlComponentsAnswers = await this.pgService.findOne(
      {
        tableName: this.tableName,
        where: { userID, variantID, sessionID: validSession.sessionID },
      },
    );
    if (file) {
      answer = this.handOverFile(userAnswer, file);
    }
    if (files) {
      answer = files.reduce((prev, cur, index) => {
        if (index == 0) return this.handOverFile(userAnswer, cur) + ';';
        else
          return (
            prev +
            this.handOverFile({ ...userAnswer, answer: undefined }, cur) +
            (index != files.length - 1 ? ';' : '')
          );
      }, '');
    }
    if (!controlComponent.autocheck) {
      if (!userAnswer)
        await this.pgService.create({
          tableName: this.tableName,
          values: [
            {
              variantID,
              userID,
              answer,
              sessionID: validSession.sessionID,
              point: null,
            },
          ],
        });
      else
        await this.pgService.update({
          tableName: this.tableName,
          updates: { answer },
          where: { variantID, userID, sessionID: validSession.sessionID },
        });
    } else {
      const point =
        task.type == '1xm' || task.type == 'nxm' || task.type == 'single-string'
          ? this.checkAnswers(task, variant, answer)
          : null;
      if (!userAnswer)
        await this.pgService.create({
          tableName: this.tableName,
          values: [
            {
              variantID,
              userID,
              answer,
              point,
              sessionID: validSession.sessionID,
            },
          ],
        });
      else {
        await this.pgService.update({
          tableName: this.tableName,
          updates: { answer, point },
          where: { variantID, userID, sessionID: validSession.sessionID },
        });
      }
    }
    await this.usersControlSessionsService.removeLastTaskID(
      validSession.sessionID,
    );
  }

  private checkAnswers(
    task: ControlComponentsTasks,
    variant: ControlComponentsTaskVariantsWithAnswers,
    userAnswers: string,
  ): number {
    const correctAnswers = variant.answers.filter((answer) => answer.correct);
    const splittedAnswers = userAnswers?.toString().split(';') ?? [];
    const findCorrectUsersAnswerCount = (): number => {
      let correctUsersAnswersCount = 0;
      for (let i = 0; i < splittedAnswers.length; i++) {
        const taskAnswer = correctAnswers.find(
          (el) => parseInt(splittedAnswers[i]) == el.answerID,
        );
        if (taskAnswer && taskAnswer.correct) correctUsersAnswersCount++;
        else correctUsersAnswersCount--;
      }
      return correctUsersAnswersCount;
    };
    let point = 0;
    switch (task.type) {
      case '1xm':
        point = findCorrectUsersAnswerCount() > 0 ? task.maxPoint : 0;
        break;
      case 'nxm':
        const correctUsersAnswersCount = findCorrectUsersAnswerCount();
        point =
          correctUsersAnswersCount < 0
            ? 0
            : (task.maxPoint * correctUsersAnswersCount) /
              correctAnswers.length;
        break;
      case 'single-string':
        point =
          variant.answers && splittedAnswers[0] == variant.answers[0].text
            ? task.maxPoint
            : 0;
    }

    return point;
  }

  async getMyAnswers(
    controlComponentID: number,
    userID: number,
    disciplineID: number,
  ): Promise<{
    answers: UsersControlComponentsAnswers[];
    tasks: ControlComponentsTasksWithVariant[];
  }> {
    const session = await this.usersControlSessionsService.getLastSession(
      userID,
      controlComponentID,
    );
    const myTasks = await this.controlComponentsTasksService.getMyTasks(
      userID,
      controlComponentID,
      disciplineID,
    );
    const answers = await Promise.all(
      myTasks.map(async (t) => {
        const res: UsersControlComponentsAnswers = await this.pgService.findOne(
          {
            tableName: this.tableName,
            where: {
              variantID: t.variant.variantID,
              userID,
              sessionID: session.sessionID,
            },
          },
        );
        return res;
      }),
    );
    return { tasks: myTasks, answers };
  }

  async getTaskWithUserAnswer(
    taskID: number,
    userID: number,
    disciplineID: number,
    editor = false,
  ): Promise<ControlComponentsTasksWithVariantAndUserAnswer> {
    const task = await this.controlComponentsTasksService.getControlComponentTask(
      taskID,
    );
    const controlComponent = await this.controlComponentsService.getControlComponent(
      task.controlComponentID,
    );

    let session: UsersControlSessions;
    if (editor || controlComponent.type == 'zvit') {
      session = await this.usersControlSessionsService.getLastSession(
        userID,
        task.controlComponentID,
      );
    } else {
      session = await this.usersControlSessionsService.getLastClosedSession(
        userID,
        task.controlComponentID,
      );
    }
    if (!session && editor) {
      session = await this.usersControlSessionsService.createSession(
        userID,
        task.controlComponentID,
      );
    }
    let usersSet = await this.usersTaskSetsService.getUsersTaskSetByTaskID(
      session.sessionID,
      taskID,
    );
    if (!usersSet && editor) {
      await this.controlComponentsTasksService.generateTasksSet(
        userID,
        task.controlComponentID,
        disciplineID,
        editor,
      );
    }
    usersSet = await this.usersTaskSetsService.getUsersTaskSetByTaskID(
      session.sessionID,
      taskID,
    );
    const variant = await this.controlComponentsTaskVariantsService.getTaskVariantWithAnswers(
      usersSet.variantID,
    );
    let userAnswer: UsersControlComponentsAnswers = await this.pgService.findOne(
      {
        tableName: this.tableName,
        where: {
          variantID: variant.variantID,
          userID,
          sessionID: session.sessionID,
        },
      },
    );
    if (!userAnswer) {
      await this.handOverTask(
        {
          variantID: variant.variantID,
          userID: userID,
          answer: '',
        },
        false,
        undefined,
        undefined,
        editor,
      );
    }
    userAnswer = await this.pgService.findOne({
      tableName: this.tableName,
      where: {
        variantID: variant.variantID,
        userID,
        sessionID: session.sessionID,
      },
    });
    return { ...task, variant, userAnswer };
  }

  async updateUserPoint(
    point: number,
    variantID: number,
    userID: number,
    sessionID: string,
  ): Promise<void> {
    await this.pgService.update({
      tableName: this.tableName,
      updates: { point: point ?? 0 },
      where: { variantID, userID, sessionID },
    });
  }
}

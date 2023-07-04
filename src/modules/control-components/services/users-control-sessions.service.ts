import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PgService } from '../../pg/pg.service';
import { v4 as uuid } from 'uuid';
import { ControlComponentsService } from './control-components.service';
import { ControlComponentsOutputDTO } from '../dto/control-components.output.dto';
import { UsersControlSessions } from '../entities/users-control-sessions.entity';
@Injectable()
export class UsersControlSessionsService {
  constructor(
    private pgService: PgService,
    @Inject(forwardRef(() => ControlComponentsService))
    private controlComponentsService: ControlComponentsService,
  ) {}
  private tableName = 'UsersControlSessions';

  async getStartStatus(
    controlComponentID: number,
    userID: number,
  ): Promise<string> {
    const controlComponent = await this.controlComponentsService.getControlComponent(
      controlComponentID,
    );
    const currentDate = new Date();
    if (
      currentDate.getTime() < controlComponent.startDate.getTime() ||
      currentDate.getTime() > controlComponent.finalDate.getTime()
    )
      return '';
    const lastSession = await this.getLastSession(userID, controlComponentID);
    if (
      lastSession &&
      !lastSession.finalDate &&
      (currentDate.getTime() - lastSession.startDate.getTime()) / 1000 <
        controlComponent.timeLimit
    )
      return 'Continue';
    return 'Start';
  }
  async removeLastTaskID(sessionID: string): Promise<void> {
    await this.pgService.useQuery(
      `UPDATE "${this.tableName}" SET "lastTaskID" = NULL WHERE "sessionID"='${sessionID}'`,
    );
  }
  async setLastTaskID(
    userID: number,
    controlComponentID: number,
    taskID: number,
  ): Promise<void> {
    const lastSession = await this.getLastSession(userID, controlComponentID);
    await this.pgService.useQuery(
      `UPDATE "${this.tableName}" SET "lastTaskID" = ${taskID} WHERE "sessionID"='${lastSession.sessionID}'`,
    );
  }
  async finishTest(
    userID: number,
    controlComponentID: number,
    taskID: number,
  ): Promise<void> {
    const lastSession = await this.getLastSession(userID, controlComponentID);
    await this.pgService.useQuery(
      `UPDATE "${this.tableName}" SET "finalDate" = now(), "lastTaskID" = ${taskID} WHERE "sessionID"='${lastSession.sessionID}'`,
    );
  }

  async setIndexNext(
    userID: number,
    index: number,
    controlComponentID: number,
  ): Promise<void> {
    const validSession = await this.checkSession(userID, controlComponentID);
    if (validSession.index != index)
      throw new BadRequestException('Invalid index');
    await this.updateSessionIndex(validSession.sessionID);
  }

  async updateSessionIndex(sessionID: string): Promise<void> {
    await this.pgService.useQuery(
      `UPDATE "${this.tableName}" SET "index"="index"+1 WHERE "sessionID" = '${sessionID}'`,
    );
  }

  async getTimeLeft(
    userID: number,
    controlComponentID: number,
  ): Promise<number> {
    const session = await this.getOpenSession(userID, controlComponentID);
    if (!session)
      throw new NotFoundException('There are not any opened session');
    const controlComponent = await this.controlComponentsService.getControlComponent(
      controlComponentID,
    );
    if (controlComponent.type == 'zvit') {
      return Math.floor(
        (controlComponent.finalDate.getTime() - new Date().getTime()) / 1000,
      );
    }
    if (
      controlComponent.timeLimit <
      Math.floor((new Date().getTime() - session.startDate.getTime()) / 1000)
    )
      await this.closeSession(userID, controlComponentID);
    return (
      controlComponent.timeLimit -
      Math.floor((new Date().getTime() - session.startDate.getTime()) / 1000)
    );
  }

  async getSessionCount(
    userID: number,
    controlComponentID: number,
  ): Promise<number> {
    return await (
      await this.pgService
        .useQuery(`SELECT COUNT(*) AS "count" FROM "${this.tableName}" 
WHERE "userID"=${userID} AND "controlComponentID"=${controlComponentID}`)
    ).rows[0].count;
  }

  async getClosedSessionCount(
    userID: number,
    controlComponentID: number,
  ): Promise<number> {
    const lastSession = await this.getLastSession(userID, controlComponentID);
    const controlComponent = await this.controlComponentsService.getControlComponent(
      controlComponentID,
    );
    if (!lastSession) return 0;
    if (!lastSession.finalDate) {
      if (
        controlComponent.timeLimit <
        Math.floor(
          (new Date().getTime() - lastSession.startDate.getTime()) / 1000,
        )
      ) {
        await this.closeSession(userID, controlComponentID);
      }
    }
    return await (
      await this.pgService
        .useQuery(`SELECT COUNT(*) AS "count" FROM "${this.tableName}" 
WHERE "userID"=${userID} AND "controlComponentID"=${controlComponentID} AND "finalDate" IS NOT NULL`)
    ).rows[0].count;
  }

  async createNewSession(
    userID: number,
    controlComponentID: number,
  ): Promise<void> {
    const session = await this.getOpenSession(userID, controlComponentID);
    const sessionCount = await this.getSessionCount(userID, controlComponentID);
    const {
      triesCount,
      finalDate,
      startDate,
    } = await this.controlComponentsService.getControlComponent(
      controlComponentID,
    );
    if (
      !session &&
      sessionCount <= triesCount &&
      finalDate.getTime() > new Date().getTime() &&
      startDate.getTime() < new Date().getTime()
    )
      await this.createSession(userID, controlComponentID);
  }

  async createSession(
    userID: number,
    controlComponentID: number,
  ): Promise<UsersControlSessions> {
    const res = await this.pgService.create({
      tableName: this.tableName,
      values: [{ sessionID: uuid(), userID, controlComponentID }],
      returning: '*',
    });
    return res.rows[0];
  }

  async checkSession(
    userID: number,
    controlComponentID: number,
  ): Promise<UsersControlSessions> {
    const session: UsersControlSessions = await this.getOpenSession(
      userID,
      controlComponentID,
    );
    if (!session)
      throw new UnauthorizedException('There are not any open session.');
    const {
      timeLimit,
    }: ControlComponentsOutputDTO = await this.controlComponentsService.getControlComponent(
      controlComponentID,
    );
    const timeDiff =
      (new Date().getTime() - session.startDate.getTime()) / 1000;
    if (timeLimit < timeDiff) {
      return await this.closeSession(userID, controlComponentID);
    }
    return session;
  }

  async deleteSession(
    userID: number,
    controlComponentID: number,
  ): Promise<void> {
    await this.pgService.delete({
      tableName: this.tableName,
      where: { userID, controlComponentID },
    });
  }

  async closeSession(
    userID: number,
    controlComponentID: number,
  ): Promise<UsersControlSessions> {
    return (
      await this.pgService.useQuery(
        `UPDATE "${this.tableName}" SET "finalDate" = now() WHERE "userID"=${userID} AND "controlComponentID"= ${controlComponentID} AND "finalDate" IS NULL RETURNING *`,
      )
    ).rows[0];
  }

  async getOpenSession(
    userID: number,
    controlComponentID: number,
  ): Promise<UsersControlSessions> {
    const res = await this.pgService.useQuery(
      `SELECT * FROM "${this.tableName}" WHERE "userID"=${userID} AND "controlComponentID"= ${controlComponentID} AND "finalDate" IS NULL`,
    );
    // console.log(res)
    return res.rows[0];
  }

  async getSortedSessionsInGroup(
    groupID: number,
    taskID: number,
  ): Promise<{ startDate: Date; userID: number; variantID: number }[]> {
    const res = await this.pgService.useQuery(
      `
    SELECT ucs."startDate",u."userID", uts."variantID" FROM "UsersControlSessions" ucs
    LEFT JOIN "Users" u ON ucs."userID"=u."userID" 
    LEFT JOIN "UsersTaskSets" uts ON uts."sessionID"=ucs."sessionID" 
    WHERE uts."taskID"=${taskID} AND u."userID" IN (SELECT gm."studentID" FROM "GroupMembers" gm WHERE "groupID"=${groupID}) 
    ORDER BY CONCAT(u."lastName",u."firstName",u."patronymic"), ucs."startDate" 
    `,
    );
    return res.rows;
  }

  async getLastSession(
    userID: number,
    controlComponentID: number,
  ): Promise<UsersControlSessions> {
    const { rows } = await this.pgService.useQuery(`
    SELECT * FROM "${this.tableName}" WHERE "userID" = ${userID} AND "controlComponentID" = ${controlComponentID} ORDER BY "startDate" DESC LIMIT 1
    `);
    return rows[0];
  }

  async getLastClosedSession(
    userID: number,
    controlComponentID: number,
  ): Promise<UsersControlSessions> {
    const lastSession = await this.getLastSession(userID, controlComponentID);
    const controlComponent = await this.controlComponentsService.getControlComponent(
      controlComponentID,
    );
    if (!lastSession) return undefined;
    if (!lastSession.finalDate) {
      if (
        controlComponent.timeLimit <
        Math.floor(
          (new Date().getTime() - lastSession.startDate.getTime()) / 1000,
        )
      ) {
        await this.closeSession(userID, controlComponentID);
        return { ...lastSession, finalDate: new Date() };
      }
    }
    const { rows } = await this.pgService.useQuery(`
    SELECT * FROM "${this.tableName}" WHERE "userID" = ${userID} AND "finalDate" IS NOT NULL AND "controlComponentID" = ${controlComponentID} ORDER BY "startDate" DESC LIMIT 1
    `);
    return rows[0];
  }
}

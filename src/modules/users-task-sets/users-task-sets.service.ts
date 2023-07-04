import { Injectable } from '@nestjs/common';
import { PgService } from '../pg/pg.service';
import UsersTaskSet from './users-task-set.entity';

@Injectable()
export class UsersTaskSetsService {
  constructor(private pgService: PgService) {}
  private tableName = 'UsersTaskSets';

  async getUsersTaskSet(sessionID: string): Promise<UsersTaskSet[]> {
    return await this.pgService.find({
      tableName: this.tableName,
      where: { sessionID },
    });
  }
  async getUsersTaskSetByTaskID(
    sessionID: string,
    taskID: number,
  ): Promise<UsersTaskSet> {
    return await this.pgService.findOne({
      tableName: this.tableName,
      where: { sessionID, taskID },
    });
  }
  async createTaskSets(userSets: UsersTaskSet[]): Promise<void> {
    await this.pgService.create({
      tableName: this.tableName,
      values: userSets,
    });
  }
  async createTaskSet(userSet: UsersTaskSet): Promise<void> {
    await this.pgService.create({
      tableName: this.tableName,
      values: [userSet],
    });
  }
}

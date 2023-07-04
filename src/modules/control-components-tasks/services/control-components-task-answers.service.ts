import { Injectable } from '@nestjs/common';
import { PgService } from '../../pg/pg.service';
import { ControlComponentsTaskAnswers } from '../entities/control-components-task-answers.entity';
import {
  ControlComponentsTaskAnswersDTO,
  ControlComponentsTaskAnswersUpdates,
} from '../dto/control-components-task-answers.dto';

@Injectable()
export class ControlComponentsTaskAnswersService {
  constructor(private pgService: PgService) {}
  private tableName = 'ControlComponentTaskAnswers';
  async getTaskAnswers(
    variantID: number,
  ): Promise<ControlComponentsTaskAnswers[]> {
    return await this.pgService.find({
      tableName: this.tableName,
      where: { variantID },
    });
  }
  async updateTaskAnswer(
    answerID: number,
    updates: ControlComponentsTaskAnswersUpdates,
  ): Promise<void> {
    await this.pgService.update({
      tableName: this.tableName,
      where: { answerID },
      updates: { ...updates },
    });
  }

  async createControlComponentsTaskAnswers(
    controlComponentsTaskAnswer: ControlComponentsTaskAnswersDTO,
  ): Promise<number> {
    const count = (
      await this.pgService.useQuery(
        `SELECT COUNT(*) as "count" FROM "${this.tableName}" WHERE "variantID"=${controlComponentsTaskAnswer.variantID}`,
      )
    ).rows[0].count;
    if (count >= 15) return;
    const res = await this.pgService.create({
      tableName: this.tableName,
      values: [controlComponentsTaskAnswer],
      returning: 'answerID',
    });
    return res.rows[0].answerID;
  }

  async deleteControlComponentsTaskAnswer(answerID: number): Promise<void> {
    await this.pgService.delete({
      tableName: this.tableName,
      where: { answerID },
    });
  }
}

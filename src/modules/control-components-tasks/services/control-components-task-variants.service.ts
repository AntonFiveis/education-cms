import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PgService } from '../../pg/pg.service';
import { ControlComponentsTaskVariants } from '../entities/control-components-task-variants.entity';
import {
  ControlComponentsTaskVariantsDTO,
  ControlComponentsTaskVariantsUpdates,
} from '../dto/control-components-task-variants.dto';
import { ControlComponentsTaskAnswersService } from './control-components-task-answers.service';
import { ControlComponentsTaskVariantsWithAnswers } from '../dto/control-components-task-variants.output.dto';
import { UsersControlComponentsAnswersService } from './users-control-components-answers.service';

@Injectable()
export class ControlComponentsTaskVariantsService {
  constructor(
    private pgService: PgService,
    private controlComponentsTaskAnswersService: ControlComponentsTaskAnswersService,
    @Inject(forwardRef(() => UsersControlComponentsAnswersService))
    private usersControlComponentsAnswers: UsersControlComponentsAnswersService,
  ) {}
  private tableName = 'ControlComponentsTaskVariants';

  async getTaskVariants(
    taskID: number,
  ): Promise<ControlComponentsTaskVariants[]> {
    return await this.pgService.find({
      tableName: this.tableName,
      where: { taskID },
    });
  }
  async getTaskVariant(
    variantID: number,
  ): Promise<ControlComponentsTaskVariants> {
    return this.pgService.findOne({
      tableName: this.tableName,
      where: { variantID: Number(variantID) },
    });
  }
  async deleteTaskVariant(variantID: number): Promise<void> {
    await this.usersControlComponentsAnswers.deleteAnswers({ variantID });

    const { taskID, variant } = (
      await this.pgService.delete({
        tableName: this.tableName,
        where: { variantID },
        cascade: true,
        returning: '*',
      })
    ).rows[0];
    await this.pgService.useQuery(`
        UPDATE "${this.tableName}" SET "variant" = "variant" - 1 WHERE "taskID"=${taskID} AND "variant">${variant} 
    `);
  }
  async updateTaskVariant(
    variantID: number,
    updates: ControlComponentsTaskVariantsUpdates,
  ): Promise<void> {
    await this.pgService.update({
      tableName: this.tableName,
      updates: { ...updates },
      where: { variantID },
    });
  }
  async createTaskVariant({
    taskID,
  }: ControlComponentsTaskVariantsDTO): Promise<{
    variantID: number;
    variant: number;
  }> {
    const count = await this.getCountOfVariants(taskID);

    const { rows } = await this.pgService.create({
      tableName: this.tableName,
      values: [{ taskID, variant: count }],
      returning: 'variantID',
    });
    return { variantID: rows[0].variantID, variant: count };
  }
  async getTaskVariantWithAnswers(
    variantID: number,
  ): Promise<ControlComponentsTaskVariantsWithAnswers> {
    const taskVariant = await this.getTaskVariant(variantID);
    const answers = await this.controlComponentsTaskAnswersService.getTaskAnswers(
      variantID,
    );
    return { ...taskVariant, answers };
  }
  async getTaskVariantsWithAnswers(
    taskID: number,
  ): Promise<ControlComponentsTaskVariantsWithAnswers[]> {
    const taskVariants = await this.getTaskVariants(taskID);
    return Promise.all(
      taskVariants.map(async (tv) => {
        const answers = await this.controlComponentsTaskAnswersService.getTaskAnswers(
          tv.variantID,
        );
        return { ...tv, answers };
      }),
    );
  }

  async getCountOfVariants(taskID: number): Promise<number> {
    return (
      await this.pgService.useQuery(
        `SELECT COUNT(*) as "count" FROM "${this.tableName}" WHERE "taskID" = ${taskID}`,
      )
    ).rows[0].count;
  }
}

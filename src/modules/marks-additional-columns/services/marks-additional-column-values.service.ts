import { Injectable } from '@nestjs/common';
import MarksAdditionalColumnValuesEntity from '../entities/marks-additional-column-values.entity';
import { PgService } from '../../pg/pg.service';
import MarksAdditionalColumnValuesDTO, {
  MarksAdditionalColumnValuesUpdatesDTO,
} from '../dto/marks-additional-column-values.dto';

@Injectable()
export class MarksAdditionalColumnValuesService {
  constructor(private pgService: PgService) {}
  private tableName = 'MarksAdditionalColumnValues';

  async getColumnValues(
    columnID: number,
  ): Promise<MarksAdditionalColumnValuesEntity[]> {
    return await this.pgService.find({
      tableName: this.tableName,
      where: { columnID },
    });
  }

  async getStudentColumnValues(
    userID: number,
  ): Promise<MarksAdditionalColumnValuesEntity[]> {
    return this.pgService.find({
      tableName: this.tableName,
      where: { userID },
    });
  }

  async createColumnValue(
    marksAdditionalColumnValuesDTO: MarksAdditionalColumnValuesDTO,
  ): Promise<number> {
    const { rows } = await this.pgService.create({
      tableName: this.tableName,
      values: [{ ...marksAdditionalColumnValuesDTO }],
      returning: 'columnValueID',
    });
    return rows[0].columnValueID;
  }

  async updateColumnValue(
    columnValueID: number,
    marksAdditionalColumnValuesUpdatesDTO: MarksAdditionalColumnValuesUpdatesDTO,
  ): Promise<void> {
    await this.pgService.update({
      tableName: this.tableName,
      updates: { ...marksAdditionalColumnValuesUpdatesDTO },
      where: { columnValueID },
    });
  }
}

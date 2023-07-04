import { Injectable } from '@nestjs/common';
import { PgService } from '../../pg/pg.service';
import { MarksAdditionalColumnValuesService } from './marks-additional-column-values.service';
import MarksAdditionalColumnsEntity from '../entities/marks-additional-columns.entity';
import MarksAdditionalColumnsOutputDTO from '../dto/marks-additional-columns-output.dto';
import MarksAdditionalColumnsDTO, {
  MarksAdditionalColumnsUpdatesDTO,
} from '../dto/marks-additional-columns.dto';
import { DisciplinesGroupAccessService } from '../../disciplines-group-access/disciplines-group-access.service';

@Injectable()
export class MarksAdditionalColumnsService {
  constructor(
    private pgService: PgService,
    private marksAdditionalColumnValuesService: MarksAdditionalColumnValuesService,
    private disciplinesGroupAccessService: DisciplinesGroupAccessService,
  ) {}
  private tableName = 'MarksAdditionalColumns';

  async deleteColumn(columnID: number): Promise<void> {
    await this.pgService.delete({
      tableName: this.tableName,
      where: { columnID },
      cascade: true,
    });
  }
  async getMarksColumnsWithValues(
    disciplineID: number,
    groupID: number,
  ): Promise<MarksAdditionalColumnsOutputDTO[]> {
    const marksColumns = await this.getMarksColumns(disciplineID, groupID);

    return await Promise.all(
      marksColumns.map(async (marksColumn) => {
        const marksColumnValues = await this.marksAdditionalColumnValuesService.getColumnValues(
          marksColumn.columnID,
        );
        return { ...marksColumn, values: marksColumnValues };
      }),
    );
  }

  async getStudentMarksColumns(
    userID: number,
  ): Promise<MarksAdditionalColumnsOutputDTO[]> {
    const values = await this.marksAdditionalColumnValuesService.getStudentColumnValues(
      userID,
    );

    return Promise.all(
      values.map(async (value) => {
        const column = await this.getMarksColumn(value.columnID);
        return { ...column, values: [value] };
      }),
    );
  }

  async getMarksColumn(
    columnID: number,
  ): Promise<MarksAdditionalColumnsEntity> {
    return this.pgService.findOne({
      tableName: this.tableName,
      where: { columnID },
    });
  }

  async getMarksColumns(
    disciplineID: number,
    groupID: number,
  ): Promise<MarksAdditionalColumnsEntity[]> {
    const {
      rows,
    } = await this.pgService.useQuery(
      `SELECT * FROM "${this.tableName}" WHERE "disciplineID"=$1 AND "groupID"=$2`,
      [disciplineID, groupID],
    );
    return rows;
  }

  async createMarksColumn(
    marksAdditionalColumnsDTO: MarksAdditionalColumnsDTO,
    disciplineID: number,
    groupID: number,
  ): Promise<number> {
    const { rows } = await this.pgService.create({
      tableName: this.tableName,
      values: [
        {
          ...marksAdditionalColumnsDTO,
          disciplineID,
          groupID,
        },
      ],
      returning: 'columnID',
    });
    return rows[0].columnID;
  }

  async updateMarksColumn(
    columnID: number,
    marksAdditionalColumnsUpdatesDTO: MarksAdditionalColumnsUpdatesDTO,
  ): Promise<void> {
    await this.pgService.update({
      tableName: this.tableName,
      updates: { ...marksAdditionalColumnsUpdatesDTO },
      where: { columnID },
    });
  }
}

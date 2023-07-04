import { Injectable } from '@nestjs/common';
import { PgService } from '../pg/pg.service';
import { DisciplinesInformation } from './disciplines-information.entity';
import { DisciplinesInformationDTO } from './dto/disciplines-information.dto';

@Injectable()
export class DisciplinesInformationService {
  constructor(private pgService: PgService) {}

  async findOneByDisciplineID(id: number): Promise<DisciplinesInformation> {
    const res = await this.pgService.useQuery(
      `SELECT * FROM "DisciplinesInformation" WHERE "disciplineInformationID" = (SELECT "disciplineInformationID" FROM "Disciplines" WHERE "disciplineID" = ${id})`,
    );
    if (res.rows.length === 0) return null;
    const info = Object.keys(res.rows[0]).reduce((prev, curr) => {
      if (curr !== 'disciplineInformationID') {
        prev[curr] = res.rows[0][curr];
      }
      return prev;
    }, {} as DisciplinesInformation);
    return info;
  }

  async createDisciplinesInformation(
    disciplinesInformationDTO: DisciplinesInformationDTO,
    disciplineID: number,
  ): Promise<void> {
    const res = await this.pgService.create({
      tableName: 'DisciplinesInformation',
      values: [disciplinesInformationDTO],
      returning: 'disciplineInformationID',
    });
    const id = res.rows[0].disciplineInformationID;
    await this.pgService.useQuery(
      `UPDATE "Disciplines" SET "disciplineInformationID" = ${id} WHERE "disciplineID" = ${disciplineID}`,
    );
  }

  async updateDisciplineInformation(
    updates: DisciplinesInformationDTO,
    disciplineID: number,
  ): Promise<void> {
    const { disciplineInformationID } = await this.pgService
      .useQuery(
        `SELECT "disciplineInformationID" FROM "Disciplines" WHERE "disciplineID" = ${disciplineID}`,
      )
      .then((res) => res.rows[0]);
    await this.pgService.update({
      tableName: 'DisciplinesInformation',
      updates: { ...updates },
      where: { disciplineInformationID },
    });
  }
}

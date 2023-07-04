import { Injectable } from '@nestjs/common';
import { PgService } from '../pg/pg.service';
import { DisciplineAnnotation } from './disciplines-annotation.entity';
import { DisciplineAnnotationDTO } from './dto/discipline-annotation.dto';

@Injectable()
export class DisciplinesAnnotationService {
  constructor(private pgService: PgService) {}

  async findOneByDisciplineID(id: number): Promise<DisciplineAnnotation> {
    const res = await this.pgService.useQuery(
      `SELECT * FROM "GetDisciplineAnnotation"(${id})`,
    );
    return res.rows[0];
  }
  async createDisciplinesAnnotation(
    disciplineAnnotationDTO: DisciplineAnnotationDTO,
    disciplineID: number,
  ): Promise<void> {
    const res = await this.pgService.create({
      tableName: 'DisciplineAnnotation',
      values: [disciplineAnnotationDTO],
      returning: 'disciplineAnnotationID',
    });
    const id = res.rows[0].disciplineAnnotationID;
    await this.pgService.useQuery(
      `UPDATE "Disciplines" SET "disciplineAnnotationID" = ${id} WHERE "disciplineID" = ${disciplineID}`,
    );
  }
  async updateDisciplineAnnotation(
    updates: DisciplineAnnotationDTO,
    disciplineID: number,
  ): Promise<void> {
    const { disciplineAnnotationID } = await this.pgService
      .useQuery(
        `SELECT "disciplineAnnotationID" FROM "Disciplines" WHERE "disciplineID" = ${disciplineID}`,
      )
      .then((res) => res.rows[0]);
    this.pgService.update({
      tableName: 'DisciplineAnnotation',
      updates: { ...updates },
      where: { disciplineAnnotationID },
    });
  }
  async acceptDisciplineAnnotation(
    confirmed: boolean,
    disciplineID: number,
  ): Promise<void> {
    const { disciplineAnnotationID } = await this.pgService
      .useQuery(
        `SELECT "disciplineAnnotationID" FROM "Disciplines" WHERE "disciplineID" = ${disciplineID}`,
      )
      .then((res) => res.rows[0]);
    this.pgService.update({
      tableName: 'DisciplineAnnotation',
      updates: { confirmed },
      where: { disciplineAnnotationID },
    });
  }
}

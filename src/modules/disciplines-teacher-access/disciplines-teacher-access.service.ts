import { Injectable } from '@nestjs/common';
import { PgService } from '../pg/pg.service';
import { DisciplinesTeacherAccess } from './disciplines-teacher-access.entity';
import {
  DisciplinesTeacherAccessDto,
  DisciplinesTeacherAccessPrimaryKey,
  DisciplinesTeacherAccessUpdates,
} from './dto/disciplines-teacher-access.dto';

@Injectable()
export class DisciplinesTeacherAccessService {
  constructor(private pgService: PgService) {}

  private tableName = 'DisciplinesTeacherAccess';
  private addFunction = 'AddDisciplinesTeacherAccess';
  private updateFunction = 'UpdateDisciplinesTeacherAccess';
  private deleteFunction = 'DeleteDisciplinesTeacherAccess';

  async create({
    disciplineID,
    teacherID,
    editor,
    adder,
    remover,
  }: DisciplinesTeacherAccessDto): Promise<void> {
    this.pgService.useQuery(
      `SELECT "${this.addFunction}" (${disciplineID}, ${teacherID}, ${editor}, ${adder}, ${remover})`,
    );
  }

  async findOne({
    disciplineID,
    teacherID,
  }: DisciplinesTeacherAccessPrimaryKey): Promise<DisciplinesTeacherAccess> {
    return this.pgService.findOne<DisciplinesTeacherAccess>({
      tableName: this.tableName,
      where: { disciplineID, teacherID },
    });
  }

  async findAll(): Promise<DisciplinesTeacherAccess[]> {
    return this.pgService.find<DisciplinesTeacherAccess>({
      tableName: this.tableName,
    });
  }

  async delete({
    disciplineID,
    teacherID,
  }: DisciplinesTeacherAccessPrimaryKey): Promise<void> {
    this.pgService.useQuery(
      `SELECT "${this.deleteFunction}" (${disciplineID}, ${teacherID})`,
    );
  }

  async update(allUpdates: DisciplinesTeacherAccessUpdates[]): Promise<void> {
    const promises = allUpdates.map(
      ({ adder, editor, remover, disciplineID, teacherID }) =>
        this.pgService.useQuery(
          `SELECT "${this.updateFunction}" (${disciplineID}, ${teacherID}, ${editor}, ${adder}, ${remover})`,
        ),
    );
    Promise.all(promises);
  }
}

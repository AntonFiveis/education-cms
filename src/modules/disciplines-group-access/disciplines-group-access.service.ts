import { Injectable } from '@nestjs/common';
import { PgService } from '../pg/pg.service';
import { DisciplinesGroupAccess } from './disciplines-group-access.entity';
import { DisciplinesGroupAccessDto } from './dto/disciplines-group-access.dto';

@Injectable()
export class DisciplinesGroupAccessService {
  constructor(private pgService: PgService) {}
  private tableName = 'DisciplinesGroupAccess';
  private addFunction = 'AddDisciplinesGroupAccess';
  private deleteFunction = 'DeleteDisciplinesGroupAccess';

  async create({
    disciplineID,
    groupID,
  }: DisciplinesGroupAccessDto): Promise<void> {
    this.pgService.useQuery(
      `SELECT "${this.addFunction}" (${disciplineID}, ${groupID})`,
    );
    // this.pgService.create<DisciplinesGroupAccessDto>({tableName: this.tableName, values: [disciplineDto]})
  }

  async findOne({
    disciplineID,
    groupID,
  }: {
    disciplineID: number;
    groupID: number;
  }): Promise<DisciplinesGroupAccess> {
    return this.pgService.findOne<DisciplinesGroupAccess>({
      tableName: this.tableName,
      where: { disciplineID, groupID },
    });
  }

  async findAll(): Promise<DisciplinesGroupAccess[]> {
    return this.pgService.find<DisciplinesGroupAccess>({
      tableName: this.tableName,
    });
  }

  async findGroupsOfDiscipline(
    disciplineID: number,
  ): Promise<DisciplinesGroupAccess[]> {
    return this.pgService.find<DisciplinesGroupAccess>({
      tableName: this.tableName,
      where: { disciplineID },
    });
  }

  async findDisciplinesOfGroup(
    groupID: number,
  ): Promise<DisciplinesGroupAccess[]> {
    return this.pgService.find<DisciplinesGroupAccess>({
      tableName: this.tableName,
      where: { groupID },
    });
  }

  async delete({
    disciplineID,
    groupID,
  }: {
    disciplineID: number;
    groupID: number;
  }): Promise<void> {
    this.pgService.useQuery(
      `SELECT "${this.deleteFunction}" (${disciplineID}, ${groupID})`,
    );
    // this.pgService.delete({tableName: this.tableName, where: `"disciplineID"=${disciplineID} AND "groupID"=${groupID}`})
  }
}

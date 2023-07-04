import { BadRequestException, Injectable } from '@nestjs/common';
import { DisciplinesTeacherAccessService } from '../disciplines-teacher-access/disciplines-teacher-access.service';
import { Group } from '../groups/group.entity';
import { PgService } from '../pg/pg.service';
import { RolesPrivileges } from '../roles-privileges/roles-privileges.entity';
import { UserProfile } from '../users/user.entity';
import {
  Discipline,
  DisciplineWithAttestation,
  ExtendedDiscipline,
} from './discipline.entity';
import { DisciplineDto, DisciplineUpdates } from './dto/discipline.dto';

@Injectable()
export class DisciplinesService {
  constructor(
    private pgService: PgService,
    private disciplinesTeacherAccessService: DisciplinesTeacherAccessService,
  ) {}
  private tableName = 'Disciplines';
  private addFunction = 'AddDiscipline';
  private updateFunction = 'UpdateDiscipline';
  private deleteFunction = 'DeleteDiscipline';

  async create({ disciplineName, ownerID }: DisciplineDto): Promise<number> {
    try {
      const res = await this.pgService.useQuery(
        `SELECT "${this.addFunction}" ('${disciplineName}', ${ownerID})`,
      );
      const disciplineID = res.rows[0][this.addFunction];
      await this.disciplinesTeacherAccessService.create({
        disciplineID,
        teacherID: ownerID,
        editor: true,
        adder: true,
        remover: true,
      });
      return disciplineID;
    } catch (error) {
      throw new BadRequestException('No such user!');
    }
  }

  async findDisciplinesOfCathedra(userID: number): Promise<Discipline[]> {
    const request = `SELECT d.*, (SELECT "GetDisciplineOwnerName"("disciplineID")) AS "ownerName" 
        FROM "Disciplines" d 
        INNER JOIN "Users" u ON d."ownerID" = u."userID" 
        INNER JOIN "DisciplineAnnotation" an ON an."disciplineAnnotationID" = d."disciplineAnnotationID"
        WHERE an."cathedra" = (SELECT "cathedra" FROM "Users" WHERE "userID" = $1) 
        ORDER BY "disciplineName"`;

    const res = await this.pgService.useQuery(request, [userID]);
    return res.rows as Discipline[];
  }

  async findOneById(id: number, userID: number): Promise<ExtendedDiscipline> {
    // const res = await this.pgService.useQuery(
    //   `SELECT "Disciplines"."disciplineID", "Disciplines"."disciplineName", "Disciplines"."content", (SELECT "GetDisciplineOwnerName"("Disciplines"."disciplineID")) AS "ownerName",
    // FALSE AS "adder", FALSE AS "editor", FALSE AS "remover" FROM "Disciplines"
    // WHERE "Disciplines"."disciplineID" = $1;`,
    //   [id],
    // );
    const res = await this.pgService.useQuery(
      `SELECT * FROM "GetDisciplineWithPrivileges" (${id}, ${userID})`,
    );
    return res.rows[0];
  }

  async findOneWithoutPrivileges(
    disciplineID: number,
  ): Promise<DisciplineWithAttestation> {
    return this.pgService.findOne({
      tableName: this.tableName,
      where: { disciplineID },
    });
  }

  async findAll(): Promise<Discipline[]> {
    return this.pgService.find<Discipline>({ tableName: this.tableName });
  }

  async delete(id: number): Promise<void> {
    this.pgService.useQuery(`SELECT "${this.deleteFunction}" (${id})`);
  }

  async update(
    id: number,
    { disciplineName, content }: DisciplineUpdates,
  ): Promise<void> {
    this.pgService.useQuery(
      `SELECT "${this.updateFunction}" (${id},'${disciplineName}', '${content}')`,
    );
  }

  async getMyDisciplines(
    userID: number,
    privileges: RolesPrivileges = undefined,
  ): Promise<Discipline[]> {
    const res = await this.pgService.useQuery(
      `SELECT * FROM "GetMyDisciplines" (${userID})`,
    );
    const disciplinesAsChecker = privileges?.disciplinesAccepter
      ? (await this.findDisciplinesOfCathedra(userID)).map((item) => ({
          ...item,
          type: 'accepter',
        }))
      : [];
    return [...res.rows, ...disciplinesAsChecker];
  }

  async getTeachersOfDiscipline(disciplineID: number): Promise<UserProfile[]> {
    const res = await this.pgService.useQuery(
      `SELECT * FROM "GetTeachersOfDiscipline" (${disciplineID})`,
    );
    return res.rows as UserProfile[];
  }

  async getGroupsOfDiscipline(disciplineID: number): Promise<Group[]> {
    const res = await this.pgService.useQuery(
      `SELECT * FROM "GetGroupsOfDiscipline" (${disciplineID})`,
    );
    return res.rows as Group[];
  }

  async setMainTeacher(disciplineID: number, teacherID: number): Promise<void> {
    await this.pgService.update({
      tableName: this.tableName,
      updates: { ownerID: teacherID },
      where: { disciplineID },
    });
  }
}

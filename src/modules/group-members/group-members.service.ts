import { Injectable } from '@nestjs/common';
import { PgService } from '../pg/pg.service';
import { User } from '../users/user.entity';
import { GroupMember } from './group-members.entity';

@Injectable()
export class GroupMembersService {
  constructor(private pgService: PgService) {}

  private addFunction = 'AddGroupMember';
  private deleteFunction = 'DeleteGroupMember';

  async getStudentsOfTheGroup(groupID: number): Promise<User[]> {
    const res = await this.pgService.useQuery(
      `SELECT * FROM "GetStudentsOfTheGroup"(${groupID})`,
    );
    return res.rows.sort((a, b) =>
      (a.lastName + a.firstName + a.patronymic).localeCompare(
        b.lastName + b.firstName + b.patronymic,
      ),
    );
  }

  async getStudentsCountOfTheGroup(groupID: number): Promise<number> {
    const res = await this.pgService.useQuery(
      `SELECT COUNT(*) as "count" FROM "GroupMembers" WHERE "groupID"=${groupID}`,
    );
    return res.rows[0].count;
  }
  async insertStudents({ groupID, studentID }: GroupMember): Promise<void> {
    await this.pgService.useQuery(
      `SELECT "${this.addFunction}"(${groupID}, ${studentID})`,
    );
  }

  async getNumberInGroupList(userID: number): Promise<number> {
    const groupID = ((await this.pgService.findOne({
      tableName: 'GroupMembers',
      where: { studentID: userID },
    })) as GroupMember).groupID;
    const group = (await this.getStudentsOfTheGroup(groupID)).sort((a, b) =>
      (a.lastName + a.firstName + a.patronymic).localeCompare(
        b.lastName + b.firstName + b.patronymic,
      ),
    );
    return group.findIndex((u) => u.userID == userID);
  }
  async removeStudent(id: number): Promise<void> {
    this.pgService.useQuery(`SELECT "${this.deleteFunction}"(${id})`);
  }
}

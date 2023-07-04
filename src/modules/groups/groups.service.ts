import { Injectable } from '@nestjs/common';
import { GroupMember } from '../group-members/group-members.entity';
import { PgService } from '../pg/pg.service';
import { Group } from './group.entity';

@Injectable()
export class GroupsService {
  constructor(private pgService: PgService) {}
  private tableName = 'Groups';
  private addFunction = 'AddGroup';
  private updateFunction = 'UpdateGroup';
  private deleteFunction = 'DeleteGroup';
  private findFunction = 'FindGroups';

  async create(groupName: string): Promise<number> {
    const res = await this.pgService.useQuery(
      `SELECT "${this.addFunction}" ('${groupName}')`,
    );
    return res.rows[0][this.addFunction];
  }

  async findOneById(groupID: number): Promise<Group> {
    return this.pgService.findOne<Group>({
      tableName: this.tableName,
      where: { groupID },
    });
  }

  async getStudentGroupsById(studentID: number): Promise<Group[]> {
    const res = await this.pgService.find<GroupMember>({
      tableName: GroupMember.tableName,
      where: { studentID },
    });
    const promises = res.map((item) => this.findOneById(item.groupID));
    return await Promise.all(promises);
  }

  async findAll(): Promise<Group[]> {
    return this.pgService.find<Group>({ tableName: this.tableName });
  }

  async findOnSearch(search: string): Promise<Group[]> {
    const res = await this.pgService.useQuery(
      `SELECT * FROM "${this.findFunction}" ('${search}')`,
    );
    return res.rows as Group[];
  }

  async delete(groupID: string): Promise<void> {
    this.pgService.useQuery(`SELECT "${this.deleteFunction}" (${groupID})`);
  }

  async updateName(groupID: string, groupName: string): Promise<void> {
    this.pgService.useQuery(
      `SELECT "${this.updateFunction}" (${groupID}, '${groupName}')`,
    );
  }
}

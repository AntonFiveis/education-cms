import { Injectable } from '@nestjs/common';
import { UsersRoles } from './users-roles.entity';
import { PgService } from '../pg/pg.service';
import { UsersRolesDto } from './dto/users-roles.dto';

@Injectable()
export class UsersRolesService {
  constructor(private pgService: PgService) {}
  private addFunction = 'AddUsersRole';
  private deleteFunction = 'DeleteUsersRole';

  async getUserRolesByUserID(userID: number): Promise<UsersRoles[]> {
    return this.pgService.find<UsersRoles>({
      query: ['roleID'],
      tableName: UsersRoles.tableName,
      where: { userID },
    });
  }
  async deleteUserRoleByUsersRolesDTO({
    userID,
    roleID,
  }: UsersRolesDto): Promise<void> {
    this.pgService.delete({
      tableName: UsersRoles.tableName,
      where: { userID, roleID },
    });
  }

  async addUsersRoles({ userID, roleID }: UsersRolesDto): Promise<void> {
    this.pgService.useQuery(
      `SELECT "${this.addFunction}" (${userID}, ${roleID})`,
    );
  }
}

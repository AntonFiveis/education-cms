import { Injectable } from '@nestjs/common';
import { PgService } from '../pg/pg.service';
import { User } from '../users/user.entity';
import { RolePrivilegeDto } from './dto/role-privilege.dto';
import {
  RolesPrivileges,
  RolesPrivilegesUpdates,
} from './roles-privileges.entity';

@Injectable()
export class RolesPrivilegesService {
  constructor(private pgService: PgService) {}

  private addFunction = 'AddRolePrivilege';
  private updateFunction = 'UpdateRolePrivilege';
  private deleteFunction = 'DeleteRolePrivilege';

  async createRolePrivilege({ roleName }: RolePrivilegeDto): Promise<void> {
    const request = `SELECT "${this.addFunction}" ('${roleName}');`;
    this.pgService.useQuery(request);
  }

  async getAllRolesPrivileges(): Promise<RolesPrivileges[]> {
    return this.pgService.find<RolesPrivileges>({
      tableName: RolesPrivileges.tableName,
    });
  }

  async getRolePrivilegesByRoleId(roleID: number): Promise<RolesPrivileges> {
    return this.pgService.findOne<RolesPrivileges>({
      tableName: RolesPrivileges.tableName,
      where: { roleID },
    });
  }
  async checkScientificSecretary(userID: number): Promise<boolean> {
    const res = await this.pgService.useQuery(`
        SELECT "roleName" FROM "${RolesPrivileges.tableName}" 
        WHERE "roleID" IN 
        (SELECT "roleID" FROM "UsersRoles" WHERE "userID" = ${userID})
      `);
    for (let i = 0; i < res.rows.length; i++) {
      if (res.rows[i].roleName == 'ScientificSecretary') return true;
    }
    return false;
  }
  async getMyPrivileges(userID: number): Promise<RolesPrivileges> {
    const res = await this.pgService.useQuery(
      `SELECT * FROM "GetUsersPrivileges"(${userID})`,
    );
    return res.rows[0];
  }

  async updateRolePrivileges(
    allUpdates: RolesPrivilegesUpdates[],
  ): Promise<void> {
    const promises = [];
    for (let i = 0; i < allUpdates.length; i++) {
      const updates = allUpdates[i];
      const values = Object.values(updates);
      const keys = Object.keys(updates);
      const request = `UPDATE "${RolesPrivileges.tableName}" SET ${keys
        .map((key, index) => `"${key}" = $${index + 1}`)
        .join(', ')} WHERE "roleID" = ${updates.roleID}`;
      // const request = `SELECT "${this.updateFunction}" (${updates.roleID}, ` + values.reduce((prev, curr, index) => {
      //     if(typeof curr !== 'boolean') return prev
      //     return `${prev}${curr}${index === values.length - 1 ? '' : ', '}`
      // }, '') + `)`
      promises.push(this.pgService.useQuery(request, values));
    }

    Promise.all(promises);
  }

  async deleteRolePrivilege(roleID: number): Promise<void> {
    this.pgService.useQuery(`SELECT "${this.deleteFunction}" (${roleID})`);
  }

  async getUsersOfRole(roleID: number): Promise<User[]> {
    const res = await this.pgService.useQuery(
      `SELECT * FROM "GetUsersOfRole"(${roleID})`,
    );
    return res.rows;
  }
}

import { Injectable, PipeTransform } from '@nestjs/common';
import { RolesPrivileges } from 'src/modules/roles-privileges/roles-privileges.entity';
import { RolesPrivilegesService } from 'src/modules/roles-privileges/roles-privileges.service';
import { Token } from 'src/modules/tokens/tokens.entity';
import { UsersRolesService } from 'src/modules/users-roles/users-roles.service';

@Injectable()
export class GetPrivilegesPipe implements PipeTransform {
  constructor(
    private rolesPrivilegesService: RolesPrivilegesService,
    private usersRolesService: UsersRolesService,
  ) {}
  async transform(data: { token: Token }): Promise<GetPrivilegesPipeOutput> {
    const { token } = data;
    const privileges = (await this.rolesPrivilegesService.getMyPrivileges(
      token.userID,
    )) || {
      roleID: 0,
      roleName: '',
      articlesAdder: false,
      articlesUpdater: false,
      articlesRemover: false,
      newsAdder: false,
      newsUpdater: false,
      newsRemover: false,
      rolesChanger: false,
      announcementsAdder: false,
      announcementsUpdater: false,
      announcementsRemover: false,
      disciplinesAdder: false,
      groupAdder: false,
      groupRemover: false,
      groupMemberAdder: false,
      groupMemberRemover: false,
      disciplinesAccepter: false,
    };
    return { ...data, privileges, token };
  }
}

export interface GetPrivilegesPipeOutput {
  privileges: RolesPrivileges;
  token: Token;
}

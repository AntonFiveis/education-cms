import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import { TokensService } from '../tokens/tokens.service';
import { PgService } from '../pg/pg.service';
import { RolesPrivilegesService } from '../roles-privileges/roles-privileges.service';
import { UsersRolesService } from '../users-roles/users-roles.service';
import { GroupsService } from '../groups/groups.service';
import { GroupMembersService } from '../group-members/group-members.service';
import { UsersPasswordsService } from './services/users-passwords.service';
import { UsersControlComponentsAnswersService } from '../control-components-tasks/services/users-control-components-answers.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [
    UsersService,
    TokensService,
    PgService,
    RolesPrivilegesService,
    UsersRolesService,
    GroupsService,
    GroupMembersService,
    UsersPasswordsService,
  ],
  exports: [
    GroupsService,
    GroupMembersService,
    UsersPasswordsService,
    UsersService,
  ],
})
export class UsersModule {}

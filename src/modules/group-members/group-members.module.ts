import { Module } from '@nestjs/common';
import { GroupMembersService } from './group-members.service';
import { GroupMembersController } from './group-members.controller';
import { TokensModule } from '../tokens/tokens.module';
import { PgService } from '../pg/pg.service';
import { RolesPrivilegesService } from '../roles-privileges/roles-privileges.service';
import { UsersRolesService } from '../users-roles/users-roles.service';
import { UsersService } from '../users/services/users.service';
import { GroupsService } from '../groups/groups.service';

@Module({
  imports: [TokensModule],
  providers: [
    GroupMembersService,
    PgService,
    RolesPrivilegesService,
    UsersRolesService,
    UsersService,
    GroupsService,
  ],
  controllers: [GroupMembersController],
  exports: [GroupMembersService],
})
export class GroupMembersModule {}

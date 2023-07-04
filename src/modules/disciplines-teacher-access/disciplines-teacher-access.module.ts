import { Global, Module } from '@nestjs/common';
import { DisciplinesTeacherAccessService } from './disciplines-teacher-access.service';
import { DisciplinesTeacherAccessController } from './disciplines-teacher-access.controller';
import { PgService } from '../pg/pg.service';
import { TokensService } from '../tokens/tokens.service';
import { DisciplinesService } from '../disciplines/disciplines.service';
import { UsersService } from '../users/services/users.service';
import { RolesPrivilegesService } from '../roles-privileges/roles-privileges.service';
import { UsersRolesService } from '../users-roles/users-roles.service';
import { GroupsService } from '../groups/groups.service';
import { GroupMembersService } from '../group-members/group-members.service';
import { UsersModule } from '../users/users.module';
import { UsersPasswordsService } from '../users/services/users-passwords.service';
@Global()
@Module({
  imports: [UsersModule],
  providers: [
    DisciplinesTeacherAccessService,
    PgService,
    TokensService,
    DisciplinesService,
    UsersService,
    UsersPasswordsService,
    RolesPrivilegesService,
    UsersRolesService,
    GroupsService,
    GroupMembersService,
  ],
  controllers: [DisciplinesTeacherAccessController],
  exports: [
    DisciplinesTeacherAccessService,
    UsersService,
    UsersPasswordsService,
  ],
})
export class DisciplinesTeacherAccessModule {}

import { Module } from '@nestjs/common';
import { DisciplinesGroupAccessService } from './disciplines-group-access.service';
import { DisciplinesGroupAccessController } from './disciplines-group-access.controller';
import { PgService } from '../pg/pg.service';
import { TokensService } from '../tokens/tokens.service';
import { DisciplinesTeacherAccessService } from '../disciplines-teacher-access/disciplines-teacher-access.service';
import { GroupsService } from '../groups/groups.service';
import { DisciplinesService } from '../disciplines/disciplines.service';
import { RolesPrivilegesModule } from '../roles-privileges/roles-privileges.module';
import { RolesPrivilegesService } from '../roles-privileges/roles-privileges.service';
import { UsersRolesService } from '../users-roles/users-roles.service';

@Module({
  imports: [RolesPrivilegesModule],
  providers: [
    DisciplinesGroupAccessService,
    PgService,
    TokensService,
    GroupsService,
    DisciplinesService,
    DisciplinesTeacherAccessService,
    RolesPrivilegesService,
    UsersRolesService,
  ],
  controllers: [DisciplinesGroupAccessController],
  exports: [DisciplinesGroupAccessService],
})
export class DisciplinesGroupAccessModule {}

import { Module } from '@nestjs/common';
import { DisciplinesService } from './disciplines.service';
import { DisciplinesController } from './disciplines.controller';
import { DisciplinesTeacherAccessService } from '../disciplines-teacher-access/disciplines-teacher-access.service';
import { DisciplinesTeacherAccessModule } from '../disciplines-teacher-access/disciplines-teacher-access.module';
import { TokensModule } from '../tokens/tokens.module';
import { RolesPrivilegesModule } from '../roles-privileges/roles-privileges.module';
import { UsersRolesModule } from '../users-roles/users-roles.module';
import { RolesPrivilegesService } from '../roles-privileges/roles-privileges.service';
import { UsersRolesService } from '../users-roles/users-roles.service';
import { PgService } from '../pg/pg.service';
import { DisciplinesGroupAccessService } from '../disciplines-group-access/disciplines-group-access.service';
import { DisciplinesGroupAccessModule } from '../disciplines-group-access/disciplines-group-access.module';
import { GroupMembersService } from '../group-members/group-members.service';
import { GroupMembersModule } from '../group-members/group-members.module';
import { DisciplinesAnnotationService } from '../disciplines-annotation/disciplines-annotation.service';
import { GroupsService } from '../groups/groups.service';
import { DisciplinesInformationModule } from '../disciplines-information/disciplines-information.module';
import { DisciplinesInformationService } from '../disciplines-information/disciplines-information.service';

@Module({
  imports: [
    DisciplinesTeacherAccessModule,
    TokensModule,
    RolesPrivilegesModule,
    UsersRolesModule,
    DisciplinesGroupAccessModule,
    GroupMembersModule,
    DisciplinesInformationModule,
  ],
  providers: [
    PgService,
    DisciplinesService,
    DisciplinesTeacherAccessService,
    RolesPrivilegesService,
    UsersRolesService,
    GroupsService,
    DisciplinesGroupAccessService,
    GroupMembersService,
    DisciplinesAnnotationService,
    DisciplinesInformationService,
  ],
  controllers: [DisciplinesController],
  exports: [
    DisciplinesService,
    GroupsService,
    DisciplinesGroupAccessService,
    RolesPrivilegesService,
    UsersRolesService,
  ],
})
export class DisciplinesModule {}

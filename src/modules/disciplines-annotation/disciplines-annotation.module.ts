import { Global, Module } from '@nestjs/common';
import { DisciplinesAnnotationController } from './disciplines-annotation.controller';
import { DisciplinesAnnotationService } from './disciplines-annotation.service';
import { DisciplinesService } from '../disciplines/disciplines.service';
import { DisciplinesTeacherAccessService } from '../disciplines-teacher-access/disciplines-teacher-access.service';
import { DisciplinesTeacherAccessModule } from '../disciplines-teacher-access/disciplines-teacher-access.module';
import { DisciplinesModule } from '../disciplines/disciplines.module';
import { RolesPrivilegesService } from '../roles-privileges/roles-privileges.service';
import { UsersRolesService } from '../users-roles/users-roles.service';
import { UsersService } from '../users/services/users.service';
import { GroupsService } from '../groups/groups.service';
import { GroupMembersService } from '../group-members/group-members.service';
@Global()
@Module({
  controllers: [DisciplinesAnnotationController],
  providers: [
    DisciplinesAnnotationService,
    DisciplinesTeacherAccessService,
    UsersService,
    RolesPrivilegesService,
    UsersRolesService,
    DisciplinesService,
    GroupsService,
    GroupMembersService,
  ],
  imports: [DisciplinesModule, DisciplinesTeacherAccessModule],
})
export class DisciplinesAnnotationModule {}

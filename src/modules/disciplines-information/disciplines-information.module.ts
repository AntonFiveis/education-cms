import { forwardRef, Module } from '@nestjs/common';
import { DisciplinesInformationController } from './disciplines-information.controller';
import { DisciplinesInformationService } from './disciplines-information.service';
import { DisciplinesModule } from '../disciplines/disciplines.module';
import { DisciplinesService } from '../disciplines/disciplines.service';
import { RolesPrivilegesService } from '../roles-privileges/roles-privileges.service';
import { UsersRolesService } from '../users-roles/users-roles.service';

@Module({
  imports: [forwardRef(() => DisciplinesModule)],
  controllers: [DisciplinesInformationController],
  providers: [
    DisciplinesInformationService,
    DisciplinesService,
    RolesPrivilegesService,
    UsersRolesService,
  ],
  exports: [DisciplinesInformationService],
})
export class DisciplinesInformationModule {}

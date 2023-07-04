import { Global, Module } from '@nestjs/common';
import { PgService } from '../pg/pg.service';
import { UsersRolesController } from './users-roles.controller';
import { UsersRolesService } from './users-roles.service';
import { RolesPrivilegesService } from '../roles-privileges/roles-privileges.service';
@Global()
@Module({
  imports: [],
  controllers: [UsersRolesController],
  providers: [UsersRolesService, PgService, RolesPrivilegesService],
})
export class UsersRolesModule {}

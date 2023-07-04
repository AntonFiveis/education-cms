import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { TokensModule } from '../tokens/tokens.module';
import { PgService } from '../pg/pg.service';
import { RolesPrivilegesService } from '../roles-privileges/roles-privileges.service';
import { UsersRolesService } from '../users-roles/users-roles.service';

@Module({
  imports: [TokensModule],
  providers: [
    GroupsService,
    PgService,
    RolesPrivilegesService,
    UsersRolesService,
  ],
  controllers: [GroupsController],
})
export class GroupsModule {}

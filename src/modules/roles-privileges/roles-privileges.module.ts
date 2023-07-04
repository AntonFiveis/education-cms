import { Global, Module } from '@nestjs/common';
import { PgService } from '../pg/pg.service';
import { RolesPrivilegesController } from './roles-privileges.controller';
import { RolesPrivilegesService } from './roles-privileges.service';
import { TokensService } from '../tokens/tokens.service';
import { UsersRolesService } from '../users-roles/users-roles.service';

@Global()
@Module({
  imports: [],
  controllers: [RolesPrivilegesController],
  providers: [
    RolesPrivilegesService,
    PgService,
    UsersRolesService,
    TokensService,
  ],
})
export class RolesPrivilegesModule {}

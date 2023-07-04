import { Module } from '@nestjs/common';
import { PgService } from '../pg/pg.service';
import { RolesPrivilegesService } from '../roles-privileges/roles-privileges.service';
import { TokensService } from '../tokens/tokens.service';
import { UsersRolesService } from '../users-roles/users-roles.service';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';

@Module({
  providers: [
    PgService,
    ArticlesService,
    PgService,
    TokensService,
    RolesPrivilegesService,
    UsersRolesService,
  ],
  controllers: [ArticlesController],
})
export class ArticlesModule {}

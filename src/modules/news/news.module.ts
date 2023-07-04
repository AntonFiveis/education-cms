import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { PgService } from '../pg/pg.service';
import { TokensService } from '../tokens/tokens.service';
import { UsersRolesService } from '../users-roles/users-roles.service';
import { RolesPrivilegesService } from '../roles-privileges/roles-privileges.service';

@Module({
  providers: [
    NewsService,
    PgService,
    TokensService,
    UsersRolesService,
    RolesPrivilegesService,
  ],
  controllers: [NewsController],
})
export class NewsModule {}

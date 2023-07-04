import { Module } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { TokensService } from '../tokens/tokens.service';
import { RolesPrivilegesService } from '../roles-privileges/roles-privileges.service';
import { UsersRolesService } from '../users-roles/users-roles.service';
import { PgService } from '../pg/pg.service';

@Module({
  providers: [
    PgService,
    AnnouncementsService,
    TokensService,
    RolesPrivilegesService,
    UsersRolesService,
  ],
  controllers: [AnnouncementsController],
})
export class AnnouncementsModule {}

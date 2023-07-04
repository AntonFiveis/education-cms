import { Module } from '@nestjs/common';
import { PgService } from '../pg/pg.service';
import { AbstractPostController } from './abstract-post.controller';
import { AbstractPostService } from './abstract-post.service';

@Module({
  providers: [PgService, AbstractPostService],
  controllers: [AbstractPostController],
})
export class AbstractPostModule {}

import { Global, Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { PgService } from '../pg/pg.service';
import { PgModule } from '../pg/pg.module';
@Global()
@Module({
  imports: [PgModule],
  providers: [TokensService, PgService],
  controllers: [TokensController],
  exports: [TokensService],
})
export class TokensModule {}

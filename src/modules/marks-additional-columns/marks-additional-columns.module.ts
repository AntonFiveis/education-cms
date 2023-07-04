import { Module } from '@nestjs/common';
import { MarksAdditionalColumnsService } from './services/marks-additional-columns.service';
import { MarksAdditionalColumnsController } from './marks-additional-columns.controller';
import { MarksAdditionalColumnValuesService } from './services/marks-additional-column-values.service';
import { DisciplinesModule } from '../disciplines/disciplines.module';

@Module({
  imports: [DisciplinesModule],
  providers: [
    MarksAdditionalColumnsService,
    MarksAdditionalColumnValuesService,
  ],
  controllers: [MarksAdditionalColumnsController],
  exports: [MarksAdditionalColumnsService, MarksAdditionalColumnValuesService],
})
export class MarksAdditionalColumnsModule {}

import { Module } from '@nestjs/common';
import { ActivityContentController } from './activity-content.controller';
import { ActivityContentService } from './activity-content.service';
import { ImageMinModule } from '../image-min/image-min.module';
import { ImageMinService } from '../image-min/image-min.service';
import { DisciplinesModule } from '../disciplines/disciplines.module';
import { DisciplinesService } from '../disciplines/disciplines.service';

@Module({
  imports: [ImageMinModule, DisciplinesModule],
  controllers: [ActivityContentController],
  providers: [ActivityContentService, ImageMinService, DisciplinesService],
  exports: [DisciplinesService, ActivityContentService],
})
export class ActivityContentModule {}

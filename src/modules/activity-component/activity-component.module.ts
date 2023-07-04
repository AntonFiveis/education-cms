import { forwardRef, Module } from '@nestjs/common';
import { ActivityComponentService } from './activity-component.service';
import { ActivityComponentController } from './activity-component.controller';
import { ActivityContentModule } from '../activity-content/activity-content.module';
import { ActivityContentService } from '../activity-content/activity-content.service';
import { DisciplinesService } from '../disciplines/disciplines.service';
import { ControlComponentsModule } from '../control-components/control-components.module';
import { ControlComponentsService } from '../control-components/services/control-components.service';
import { UsersTaskSetsService } from '../users-task-sets/users-task-sets.service';

@Module({
  controllers: [ActivityComponentController],
  imports: [ActivityContentModule, ControlComponentsModule],
  providers: [
    ActivityComponentService,
    ActivityContentService,
    DisciplinesService,
    ControlComponentsService,
  ],
  exports: [ActivityComponentService, ActivityContentService],
})
export class ActivityComponentModule {}

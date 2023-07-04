import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './services/activity.service';
import { DisciplinesTeacherAccessService } from '../disciplines-teacher-access/disciplines-teacher-access.service';
import { DisciplinesModule } from '../disciplines/disciplines.module';
import { DisciplinesService } from '../disciplines/disciplines.service';
import { ActivityComponentService } from '../activity-component/activity-component.service';
import { ActivityComponentModule } from '../activity-component/activity-component.module';
import { ControlComponentsModule } from '../control-components/control-components.module';
import { ControlComponentsService } from '../control-components/services/control-components.service';
import { ActivityAttendanceService } from './services/activity-attendance.service';
import { GroupMembersModule } from '../group-members/group-members.module';

@Module({
  imports: [
    ActivityComponentModule,
    DisciplinesModule,
    ControlComponentsModule,
    GroupMembersModule,
  ],
  controllers: [ActivityController],
  providers: [
    ActivityService,
    DisciplinesTeacherAccessService,
    DisciplinesService,
    ActivityComponentService,
    ControlComponentsService,
    ActivityAttendanceService,
  ],
})
export class ActivityModule {}

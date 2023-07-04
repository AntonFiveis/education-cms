import { Module } from '@nestjs/common';
import { MarksService } from './marks.service';
import { MarksController } from './marks.controller';
import { GroupMembersModule } from '../group-members/group-members.module';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/services/users.service';
import { ActivityModule } from '../activity/activity.module';
import { ActivityService } from '../activity/services/activity.service';
import { ControlComponentsModule } from '../control-components/control-components.module';
import { ControlComponentsTasksModule } from '../control-components-tasks/control-components-tasks.module';
import { UsersControlComponentsAnswersService } from '../control-components-tasks/services/users-control-components-answers.service';
import { GroupsModule } from '../groups/groups.module';
import { GroupsService } from '../groups/groups.service';
import { ActivityComponentModule } from '../activity-component/activity-component.module';
import { ActivityComponentService } from '../activity-component/activity-component.service';
import { ActivityAttendanceService } from '../activity/services/activity-attendance.service';
import { GroupMembersService } from '../group-members/group-members.service';
import { ControlComponentsTaskVariantsService } from '../control-components-tasks/services/control-components-task-variants.service';
import { MarksAdditionalColumnsModule } from '../marks-additional-columns/marks-additional-columns.module';
import { MarksAdditionalColumnsService } from '../marks-additional-columns/services/marks-additional-columns.service';
import { DisciplinesGroupAccessService } from '../disciplines-group-access/disciplines-group-access.service';

@Module({
  imports: [
    MarksAdditionalColumnsModule,
    GroupMembersModule,
    UsersModule,
    ActivityModule,
    ControlComponentsModule,
    ControlComponentsTasksModule,
    GroupsModule,
    ActivityComponentModule,
  ],
  providers: [
    UsersControlComponentsAnswersService,
    MarksService,
    UsersService,
    ActivityService,
    UsersControlComponentsAnswersService,
    GroupsService,
    ActivityComponentService,
    ActivityAttendanceService,
    GroupMembersService,
    DisciplinesGroupAccessService,
    ControlComponentsTaskVariantsService,
    MarksAdditionalColumnsService,
  ],
  controllers: [MarksController],
})
export class MarksModule {}

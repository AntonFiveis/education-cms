import { forwardRef, Module } from '@nestjs/common';
import { ControlComponentsService } from './services/control-components.service';
import { ControlComponentsController } from './control-components.controller';
import { PgService } from '../pg/pg.service';
import { UsersControlSessionsService } from './services/users-control-sessions.service';
import { DisciplinesModule } from '../disciplines/disciplines.module';
import { DisciplinesService } from '../disciplines/disciplines.service';
import { ControlComponentsTasksModule } from '../control-components-tasks/control-components-tasks.module';
import { ControlComponentsTasksService } from '../control-components-tasks/services/control-components-tasks.service';
import { ControlComponentsTaskAnswersService } from '../control-components-tasks/services/control-components-task-answers.service';
import { UsersTaskSetsService } from '../users-task-sets/users-task-sets.service';
import { ControlComponentsTaskVariantsService } from '../control-components-tasks/services/control-components-task-variants.service';
import { GroupMembersService } from '../group-members/group-members.service';
import { UsersControlComponentsAnswersService } from '../control-components-tasks/services/users-control-components-answers.service';
import { ControlComponentsGroupAccessModule } from '../control-components-group-access/control-components-group-access.module';

@Module({
  imports: [
    DisciplinesModule,
    ControlComponentsTasksModule,
    ControlComponentsGroupAccessModule,
  ],
  providers: [
    ControlComponentsService,
    ControlComponentsTaskAnswersService,
    ControlComponentsTasksService,
    UsersControlComponentsAnswersService,
    PgService,
    UsersControlSessionsService,
    DisciplinesService,
    ControlComponentsTaskAnswersService,
    UsersTaskSetsService,
    ControlComponentsTaskVariantsService,
    GroupMembersService,
  ],
  controllers: [ControlComponentsController],
  exports: [
    ControlComponentsService,
    UsersControlSessionsService,
    DisciplinesService,
    ControlComponentsTasksService,
    ControlComponentsTaskAnswersService,
    UsersTaskSetsService,
    GroupMembersService,
    UsersControlComponentsAnswersService,
  ],
})
export class ControlComponentsModule {}

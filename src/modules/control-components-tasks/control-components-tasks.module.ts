import { forwardRef, Module } from '@nestjs/common';
import { ControlComponentsTasksService } from './services/control-components-tasks.service';
import { ControlComponentsTasksController } from './control-components-tasks.controller';
import { ControlComponentsTaskAnswersService } from './services/control-components-task-answers.service';
import { ControlComponentsModule } from '../control-components/control-components.module';
import { UsersControlSessionsService } from '../control-components/services/users-control-sessions.service';
import { GroupsService } from '../groups/groups.service';
import { DisciplinesGroupAccessService } from '../disciplines-group-access/disciplines-group-access.service';
import { ControlComponentsTaskVariantsService } from './services/control-components-task-variants.service';
import { UsersControlComponentsAnswersService } from './services/users-control-components-answers.service';
import { ControlComponentsGroupAccessModule } from '../control-components-group-access/control-components-group-access.module';

@Module({
  imports: [
    forwardRef(() => ControlComponentsModule),
    GroupsService,
    DisciplinesGroupAccessService,
    ControlComponentsGroupAccessModule,
  ],
  providers: [
    ControlComponentsTasksService,
    ControlComponentsTaskAnswersService,
    UsersControlComponentsAnswersService,
    UsersControlSessionsService,
    GroupsService,
    DisciplinesGroupAccessService,
    ControlComponentsTaskVariantsService,
  ],
  controllers: [ControlComponentsTasksController],
  exports: [
    UsersControlComponentsAnswersService,
    ControlComponentsTasksService,
    ControlComponentsTaskAnswersService,
  ],
})
export class ControlComponentsTasksModule {}

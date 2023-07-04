import { ControlComponentsTasks } from '../entities/control-components-tasks.entity';
import { ControlComponentsTaskAnswers } from '../entities/control-components-task-answers.entity';
import { UsersControlComponentsAnswers } from '../entities/users-control-components-answers.entity';
import { ControlComponentsTaskVariants } from '../entities/control-components-task-variants.entity';
import { ControlComponentsTaskVariantsWithAnswers } from './control-components-task-variants.output.dto';

export interface ControlComponentsTasksWithVariant
  extends ControlComponentsTasks {
  variant?: ControlComponentsTaskVariantsWithAnswers;
}
export interface ControlComponentsTasksWithVariantAndUserAnswer
  extends ControlComponentsTasksWithVariant {
  userAnswer: UsersControlComponentsAnswers;
}

export interface ControlComponentsTasksWithVariants
  extends ControlComponentsTasks {
  variants: ControlComponentsTaskVariantsWithAnswers[];
}
export interface ControlComponentsTasksWithAnswers
  extends ControlComponentsTasksWithVariant {
  answers: ControlComponentsTaskAnswers[];
}

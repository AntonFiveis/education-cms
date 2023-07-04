import { ControlComponentsTaskVariants } from '../entities/control-components-task-variants.entity';
import { ControlComponentsTaskAnswers } from '../entities/control-components-task-answers.entity';

export interface ControlComponentsTaskVariantsWithAnswers
  extends ControlComponentsTaskVariants {
  answers: ControlComponentsTaskAnswers[];
}

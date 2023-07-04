import { ControlComponents } from '../entities/control-components.entity';
import { ControlComponentsTasksWithVariant } from '../../control-components-tasks/dto/control-components-tasks.output.dto';

export interface ControlComponentsOutputDTO extends ControlComponents {
  name: string;
}
export interface ControlComponentsWithTasks extends ControlComponentsOutputDTO {
  tasks: ControlComponentsTasksWithVariant[];
}

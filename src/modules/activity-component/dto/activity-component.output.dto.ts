import { ActivityComponent } from '../activity-component.entity';
import { ActivityContent } from '../../activity-content/activity-content.entity';

export interface ActivityComponentOutputDto extends ActivityComponent {
  contents: ActivityContent[];
}

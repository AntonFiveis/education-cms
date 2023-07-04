import { Activity } from '../entities/activity.entity';
import { ActivityComponentOutputDto } from '../../activity-component/dto/activity-component.output.dto';

export interface ActivityOutputDto extends Activity {
  components: ActivityComponentOutputDto[];
}

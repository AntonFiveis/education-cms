import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ActivityComponentService } from '../modules/activity-component/activity-component.service';
import { Token } from '../modules/tokens/tokens.entity';
import { PgService } from '../modules/pg/pg.service';

@Injectable()
export class GetDisciplineIdFromControlComponentPipe implements PipeTransform {
  constructor(private pgService: PgService) {}

  async transform(data: any): Promise<any> {
    try {
      const controlComponentID =
        data.params?.controlComponentID || data.query?.controlComponentID;
      const res = await this.pgService.useQuery(
        `SELECT "disciplineID" FROM "Activity" WHERE "activityID"= 
                (SELECT "activityID" FROM "ActivityComponent" WHERE "activityComponentID" = ${controlComponentID})`,
      );
      const disciplineID = res.rows[0].disciplineID;
      return {
        ...data,
        params: {
          ...data.params,
          disciplineID,
          controlComponentID: Number(controlComponentID),
        },
      };
    } catch (err) {
      throw new BadRequestException('Bad Request');
    }
  }
}

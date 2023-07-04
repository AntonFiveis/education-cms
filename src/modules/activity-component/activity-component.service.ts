import { Injectable } from '@nestjs/common';
import { PgService } from '../pg/pg.service';
import {
  ActivityComponentDto,
  ActivityComponentUpdates,
} from './dto/activity-component.dto';
import { ActivityContentService } from '../activity-content/activity-content.service';
import { ActivityComponent } from './activity-component.entity';
import { ActivityComponentOutputDto } from './dto/activity-component.output.dto';
import { ActivityContent } from '../activity-content/activity-content.entity';
import { ControlComponentsDTO } from '../control-components/dto/control-components.dto';
import { ControlComponentsService } from '../control-components/services/control-components.service';

@Injectable()
export class ActivityComponentService {
  constructor(
    private pgService: PgService,
    private activityContentService: ActivityContentService,
    private controlComponentsService: ControlComponentsService,
  ) {}
  private tableName = 'ActivityComponent';

  async getActivityComponents(
    activityID: number,
  ): Promise<ActivityComponentOutputDto[]> {
    const activityComponents = (
      await this.pgService.useQuery(
        `SELECT * FROM "ActivityComponent" WHERE "activityID"=${activityID} ORDER BY "index"`,
      )
    ).rows;
    return await Promise.all(
      activityComponents.map(async (component: ActivityComponent) => {
        const contents: ActivityContent[] = await this.activityContentService.getActivityContentsOfComponent(
          component.activityComponentID,
        );
        return { ...component, contents } as ActivityComponentOutputDto;
      }),
    );
  }

  async getActivityComponent(
    activityComponentID: number,
  ): Promise<ActivityComponent> {
    return this.pgService.findOne({
      tableName: this.tableName,
      where: { activityComponentID },
    });
  }

  async createActivityComponent({
    activityID,
    name,
    type,
    index,
  }: ActivityComponentDto): Promise<{
    activityComponentID: number;
    content?: ActivityContent;
  }> {
    const count = (
      await this.pgService.useQuery(
        `SELECT COUNT(*) as "count" FROM "${this.tableName}" WHERE "activityID"=${activityID}`,
      )
    ).rows[0].count;
    if (count >= 15) return;
    const res = await this.pgService.create({
      tableName: this.tableName,
      values: [{ activityID, name, type, index }],
      returning: 'activityComponentID',
    });
    if (type === 'text') {
      const newContent = {
        name: 'Текст',
        activityComponentID: res.rows[0].activityComponentID,
        content: '',
      };
      const activityContentID: number = await this.activityContentService.saveActivityContent(
        newContent,
      );
      return {
        activityComponentID: res.rows[0].activityComponentID,
        content: { activityContentID, ...newContent },
      };
    } else if (type === 'test') {
      const newControlComponent: ControlComponentsDTO = {
        controlComponentID: res.rows[0].activityComponentID,
        maxPoint: 0,
        type: 'test',
        extraPoints: 0,
        mandatory: true,
        triesCount: 0,
        autocheck: false,
        hasPenalty: true,
        threshold: 0,
        penaltyPercentage: 0,
        penaltyDimension: 'day',
        minPoint: 0,
        penaltyComment: 'Comment',
        startDate: new Date(),
        deadlineDate: new Date(),
        finalDate: new Date(),
        timeLimit: 0,
        taskCountNOfM: 0,
        showStudentCorrectAnswer: true,
      };
      await this.controlComponentsService.createControlComponent(
        newControlComponent,
      );
    }
    return { activityComponentID: res.rows[0].activityComponentID };
  }
  async updateActivityComponent(
    updates: ActivityComponentUpdates,
    activityComponentID: number,
  ): Promise<void> {
    await this.pgService.update({
      tableName: this.tableName,
      updates: updates as Record<string, unknown>,
      where: { activityComponentID },
    });
  }
  async deleteActivityComponent(activityComponentID: number): Promise<void> {
    const activityComponent = await this.getActivityComponent(
      activityComponentID,
    );
    if (activityComponent.type != 'test') {
      const activityContents = await this.activityContentService.getActivityContentsOfComponent(
        activityComponentID,
      );

      for (const ac of activityContents) {
        await this.activityContentService.deleteActivityContent(
          ac.activityContentID,
        );
      }
    } else {
      await this.controlComponentsService.deleteControlComponent(
        activityComponentID,
      );
    }
    await this.pgService.delete({
      tableName: this.tableName,
      where: { activityComponentID },
      cascade: true,
    });
  }
}

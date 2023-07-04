import { Injectable } from '@nestjs/common';
import { PgService } from '../../pg/pg.service';
import { ActivityDTO, ActivityUpdates } from '../dto/activity.dto';
import { Activity } from '../entities/activity.entity';
import { ActivityComponentService } from '../../activity-component/activity-component.service';
import { ActivityComponentOutputDto } from '../../activity-component/dto/activity-component.output.dto';
import { ActivityOutputDto } from '../dto/activity.output.dto';
import { DisciplinesInformation } from '../../disciplines-information/disciplines-information.entity';

@Injectable()
export class ActivityService {
  constructor(
    private pgService: PgService,
    private activityComponentService: ActivityComponentService,
  ) {}

  async createActivitiesFromDisciplineInformation(
    information: DisciplinesInformation,
    disciplineID: number,
  ): Promise<void> {
    const query = await this.pgService.useQuery(
      `SELECT COUNT(*) AS "count" FROM "Activity" WHERE "disciplineID"=${disciplineID}`,
    );
    if (parseInt(query.rows[0].count)) return;
    for (let i = 0; i < information.lections / 2; i++) {
      await this.createActivity({
        disciplineID,
        name: `Лекція ${i + 1}`,
        type: 'lection',
        index: i,
      });
    }

    for (let i = 0; i < information.practices / 2; i++) {
      await this.createActivity({
        disciplineID,
        name: `Практика ${i + 1}`,
        type: 'practice',
        index: i,
      });
    }

    for (let i = 0; i < information.labs / 2; i++) {
      await this.createActivity({
        disciplineID,
        name: `Лабораторна ${i + 1}`,
        type: 'lab',
        index: i,
      });
    }
    for (let i = 0; i < information.independentWorks / 2; i++) {
      await this.createActivity({
        disciplineID,
        name: `СРС ${i + 1}`,
        type: 'independentWork',
        index: i,
      });
    }

    for (let i = 0; i < information.moduleControlWorks / 2; i++) {
      await this.createActivity({
        disciplineID,
        name: `Модульна контрольна ${i + 1}`,
        type: 'moduleControlWork',
        index: i,
      });
    }
    for (let i = 0; i < information.computerPractice / 2; i++) {
      await this.createActivity({
        disciplineID,
        name: `Комп'ютерний практикум ${i + 1}`,
        type: 'computerPractice',
        index: i,
      });
    }
    for (let i = 0; i < information.controlWorks / 2; i++) {
      await this.createActivity({
        disciplineID,
        name: `Контрольна ${i + 1}`,
        type: 'controlWork',
        index: i,
      });
    }

    for (let i = 0; i < information.settlementWork / 2; i++) {
      await this.createActivity({
        disciplineID,
        name: `Розрахункова робота ${i + 1}`,
        type: 'settlementWork',
        index: i,
      });
    }
    for (let i = 0; i < information.homeControlWork / 2; i++) {
      await this.createActivity({
        disciplineID,
        name: `ДКР ${i + 1}`,
        type: 'homeControlWork',
        index: i,
      });
    }
    for (let i = 0; i < information.essay / 2; i++) {
      await this.createActivity({
        disciplineID,
        name: `Реферат ${i + 1}`,
        type: 'essay',
        index: i,
      });
    }
  }

  async getActivitiesOfDiscipline(disciplineID: number): Promise<Activity[]> {
    const res = await this.pgService.useQuery(
      `SELECT * FROM "Activity" WHERE "disciplineID"=${disciplineID} ORDER BY "type", "index"`,
    );
    return res.rows;
  }

  async getActivityWithComponents(
    activityID: number,
  ): Promise<ActivityOutputDto> {
    const activity: Activity = await this.pgService.findOne({
      tableName: 'Activity',
      where: { activityID },
    });
    const components: ActivityComponentOutputDto[] = await this.activityComponentService.getActivityComponents(
      activityID,
    );
    return { ...activity, components };
  }

  async createActivity({
    disciplineID,
    name,
    type,
    index,
  }: ActivityDTO): Promise<number> {
    const res = await this.pgService.create({
      tableName: 'Activity',
      values: [{ disciplineID, name, type, index }],
      returning: 'activityID',
    });

    return res.rows[0].activityID;
  }
  async updateActivity(
    updates: ActivityUpdates,
    activityID: number,
  ): Promise<void> {
    await this.pgService.update({
      tableName: 'Activity',
      updates: updates as Record<string, unknown>,
      where: { activityID },
    });
  }
  async deleteActivity(activityID: number): Promise<void> {
    const activityComponents = await this.activityComponentService.getActivityComponents(
      activityID,
    );
    for (const ac of activityComponents) {
      await this.activityComponentService.deleteActivityComponent(
        ac.activityComponentID,
      );
    }
    await this.pgService.delete({
      tableName: 'Activity',
      where: { activityID },
      cascade: true,
    });
  }
  async changeVisibility(
    activityID: number,
    visibility: boolean,
  ): Promise<void> {
    await this.pgService.update({
      tableName: 'Activity',
      updates: { visible: visibility },
      where: { activityID },
    });
  }
}

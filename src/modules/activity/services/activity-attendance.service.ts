import { Injectable } from '@nestjs/common';
import { PgService } from '../../pg/pg.service';
import { GroupMembersService } from '../../group-members/group-members.service';
import ActivityAttendance from '../entities/activity-attendance.entity';

@Injectable()
export class ActivityAttendanceService {
  constructor(
    private pgService: PgService,
    private groupMembersService: GroupMembersService,
  ) {}
  private tableName = 'ActivityAttendance';

  async getGroupAttendance(
    groupID: number,
    activityID: number,
  ): Promise<ActivityAttendance[]> {
    const groupMembers = await this.groupMembersService.getStudentsOfTheGroup(
      groupID,
    );
    return Promise.all(
      groupMembers.map(async (gm) => {
        const userAttendance: ActivityAttendance = await this.getUserAttendance(
          gm.userID,
          activityID,
        );
        return userAttendance;
      }),
    );
  }

  async updateUserAttendance(
    userID: number,
    activityID: number,
    attendance: string,
  ): Promise<void> {
    const att = await this.getUserAttendance(userID, activityID);
    if (!att) {
      await this.createUserAttendance(userID, activityID, attendance);
    } else {
      await this.pgService.update({
        tableName: this.tableName,
        where: { userID, activityID },
        updates: { attendance },
      });
    }
  }

  async getUserAttendance(
    userID: number,
    activityID: number,
  ): Promise<ActivityAttendance> {
    const attendance: ActivityAttendance = await this.pgService.findOne({
      tableName: this.tableName,
      where: { userID, activityID },
    });
    if (!attendance) {
      const activityAttendanceID = await this.createUserAttendance(
        userID,
        activityID,
      );
      return { userID, activityID, activityAttendanceID, attendance: ' ' };
    }
    return attendance;
  }
  async createUserAttendance(
    userID: number,
    activityID: number,
    attendance = ' ',
  ): Promise<number> {
    const res = await this.pgService.create({
      tableName: this.tableName,
      values: [{ userID, activityID, attendance }],
      returning: 'activityAttendanceID',
    });
    return res.rows[0].activityAttendanceID;
  }
}

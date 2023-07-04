import { Injectable } from '@nestjs/common';
import { GroupMembersService } from '../group-members/group-members.service';
import { UsersService } from '../users/services/users.service';
import { ActivityService } from '../activity/services/activity.service';
import { ControlComponentsService } from '../control-components/services/control-components.service';
import GroupMarks, {
  ActivitiesWithMarks,
  StudentMarks,
  StudentAllMarks,
} from './interfaces/GroupMarks';
import { DisciplinesService } from '../disciplines/disciplines.service';
import {
  Discipline,
  DisciplineWithAttestation,
} from '../disciplines/discipline.entity';
import { Activity } from '../activity/entities/activity.entity';
import { ControlComponentsWithTasks } from '../control-components/dto/control-components.output.dto';
import { PgService } from '../pg/pg.service';
import { User } from '../users/user.entity';
import { GroupsService } from '../groups/groups.service';
import { ActivityAttendanceService } from '../activity/services/activity-attendance.service';
import ActivityAttendance from '../activity/entities/activity-attendance.entity';
import { UsersControlSessionsService } from '../control-components/services/users-control-sessions.service';
import { UsersTaskSetsService } from '../users-task-sets/users-task-sets.service';
import { ControlComponentsTaskVariantsService } from '../control-components-tasks/services/control-components-task-variants.service';
import { UsersControlComponentsAnswers } from '../control-components-tasks/entities/users-control-components-answers.entity';
import { Readable } from 'stream';
import * as ExcelJs from 'exceljs';
import { MarksAdditionalColumnsService } from '../marks-additional-columns/services/marks-additional-columns.service';
@Injectable()
export class MarksService {
  constructor(
    private groupMembersService: GroupMembersService,
    private usersService: UsersService,
    private activityService: ActivityService,
    private controlComponentsService: ControlComponentsService,
    private disciplinesService: DisciplinesService,
    private groupsService: GroupsService,
    private pgService: PgService,
    private activityAttendanceService: ActivityAttendanceService,
    private usersControlSessionsService: UsersControlSessionsService,
    private usersTaskSetsService: UsersTaskSetsService,
    private marksAdditionalColumnsService: MarksAdditionalColumnsService,
  ) {}

  async getGroupMarks(
    groupID: number,
    disciplineID: number,
  ): Promise<GroupMarks> {
    const students = await this.groupMembersService.getStudentsOfTheGroup(
      groupID,
    );

    const discipline: DisciplineWithAttestation = await this.disciplinesService.findOneWithoutPrivileges(
      disciplineID,
    );
    const group = await this.groupsService.findOneById(groupID);
    const additionalColumns = await this.marksAdditionalColumnsService.getMarksColumnsWithValues(
      disciplineID,
      groupID,
    );
    const marks: StudentMarks[] = await Promise.all(
      students.map(async (student) => {
        return await this.getStudentMarks(student, discipline, true);
      }),
    );
    return { discipline, group, marks, additionalColumns };
  }
  async getStudentMarks(
    user: User,
    discipline: Discipline,
    teacher = false,
  ): Promise<StudentMarks> {
    const disActivities: Activity[] = await this.activityService.getActivitiesOfDiscipline(
      discipline.disciplineID,
    );
    const activitiesWithMarks: ActivitiesWithMarks[] = await Promise.all(
      disActivities.map(async (activity) => {
        const activityControlComponents: ControlComponentsWithTasks[] = await this.controlComponentsService.getActivityControlComponents(
          activity.activityID,
        );
        const controlComponents = await Promise.all(
          activityControlComponents.map(async (acc) => {
            let lastSession, sessionCount;
            if (acc.type != 'zvit' && !teacher) {
              lastSession = await this.usersControlSessionsService.getLastClosedSession(
                user.userID,
                acc.controlComponentID,
              );

              sessionCount = await this.usersControlSessionsService.getClosedSessionCount(
                user.userID,
                acc.controlComponentID,
              );
            } else {
              lastSession = await this.usersControlSessionsService.getLastSession(
                user.userID,
                acc.controlComponentID,
              );

              sessionCount = await this.usersControlSessionsService.getSessionCount(
                user.userID,
                acc.controlComponentID,
              );
            }
            let point = 0;
            let sessionID = null;
            const tasks = await Promise.all(
              acc.tasks.map(async (task) => {
                try {
                  const userTaskSet = await this.usersTaskSetsService.getUsersTaskSetByTaskID(
                    lastSession.sessionID,
                    task.taskID,
                  );
                  const userAnswer: UsersControlComponentsAnswers = (
                    await this.pgService.useQuery(
                      `
                                SELECT *
                                FROM "UsersControlComponentsAnswers"
                                WHERE "sessionID" =
                                      (SELECT "sessionID"
                                       FROM "UsersControlSessions"
                                       WHERE "controlComponentID" = $1
                                         AND "userID" = $2
                                       ORDER BY "startDate" DESC
                                       LIMIT 1)
                                  AND "variantID" = $3
                      `,
                      [
                        acc.controlComponentID,
                        user.userID,
                        userTaskSet.variantID,
                      ],
                    )
                  ).rows[0];
                  sessionID = userAnswer.sessionID;
                  point += userAnswer.point;
                  return {
                    taskID: task.taskID,
                    point: userAnswer.point,
                    maxPoint: task.maxPoint,
                    index: task.index,
                    type: task.type,
                  };
                } catch (e) {
                  return {
                    taskID: task.taskID,
                    point: undefined,
                    maxPoint: task.maxPoint,
                    index: task.index,
                    type: task.type,
                  };
                }
              }),
            );
            let deadlinePenalty = 0;
            if (acc.hasPenalty && lastSession) {
              const sessionAndDeadlineDifference =
                Number(lastSession.startDate) > Number(acc.deadlineDate)
                  ? Number(lastSession.startDate) - Number(acc.deadlineDate)
                  : 0;

              switch (acc.penaltyDimension) {
                case 'day':
                  deadlinePenalty =
                    (Math.floor(
                      sessionAndDeadlineDifference / 1000 / 3600 / 24,
                    ) *
                      acc.penaltyPercentage) /
                    100;
                  break;
                case 'week':
                  deadlinePenalty =
                    (Math.floor(
                      sessionAndDeadlineDifference / 1000 / 3600 / 24 / 7,
                    ) *
                      acc.penaltyPercentage) /
                    100;
                  break;
                case 'month':
                  deadlinePenalty =
                    (Math.floor(
                      sessionAndDeadlineDifference / 1000 / 3600 / 24 / 30,
                    ) *
                      acc.penaltyPercentage) /
                    100;
                  break;
              }
            }
            const penalty =
              1 -
              (((+sessionCount - 1) * acc.tryPenalty) / 100 + deadlinePenalty);
            const pointWithPenalties = point * (penalty < 0 ? 0 : penalty);
            return {
              controlComponentID: acc.controlComponentID,
              name: acc.name,
              maxPoint: acc.maxPoint,
              autocheck: acc.autocheck,
              point:
                pointWithPenalties <= acc.minPoint && point >= acc.minPoint
                  ? acc.minPoint
                  : point <= acc.minPoint
                  ? point
                  : pointWithPenalties,
              penalty,
              threshold: acc.threshold,
              type: acc.type,
              showStudentCorrectAnswer: acc.showStudentCorrectAnswer,
              tasks: tasks.sort((a, b) => a.index - b.index),
              sessionID,
              minPoint: acc.minPoint,
            };
          }),
        );
        const attendance: ActivityAttendance = await this.activityAttendanceService.getUserAttendance(
          user.userID,
          activity.activityID,
        );
        return {
          activityID: activity.activityID,
          activityName: activity.name,
          controlComponents,
          attendance: attendance?.attendance || ' ',
        };
      }),
    );

    return { student: user, studentMarks: activitiesWithMarks };
  }

  async getMyMarks(userID: number): Promise<StudentAllMarks> {
    const user = await this.usersService.getUserById(userID);
    const disciplines = await this.disciplinesService.getMyDisciplines(userID);
    const studentAdditionalColumns = await this.marksAdditionalColumnsService.getStudentMarksColumns(
      userID,
    );
    const marks = await Promise.all(
      disciplines.map(async (d) => {
        const { studentMarks } = await this.getStudentMarks(user, d);
        const additionalColumns = studentAdditionalColumns.filter(
          (additionalColumn) => additionalColumn.disciplineID == d.disciplineID,
        );
        return { discipline: d, studentMarks, additionalColumns };
      }),
    );
    return { student: user, marks };
  }

  async getGroupMarksCSV(
    groupID: number,
    disciplineID: number,
  ): Promise<Readable> {
    const groupMarks = await this.getGroupMarks(groupID, disciplineID);

    const workbook = new ExcelJs.Workbook();
    const sheet = workbook.addWorksheet('My Sheet');
    if (groupMarks.marks.length > 0) {
      sheet.columns = [
        { header: 'Fullname', key: 'fullname', width: 10 },
        ...groupMarks.marks[0].studentMarks
          .map((sm) => {
            return sm.controlComponents.map((cc) => {
              return {
                header: cc.name,
                key: cc.name.replace(' ', ''),
                width: 10,
              };
            });
          })
          .reduce((prev, cur) => prev.concat(cur), []),
      ];
      groupMarks.marks
        .sort((a, b) =>
          (
            a.student.lastName +
            a.student.firstName +
            a.student.patronymic
          ).localeCompare(
            b.student.lastName + b.student.firstName + b.student.patronymic,
          ),
        )
        .forEach((sm, index) => {
          let counter = 0;
          sheet.getCell(index + 2, 1).value =
            sm.student.lastName +
            ' ' +
            sm.student.firstName +
            ' ' +
            sm.student.patronymic;
          sm.studentMarks.forEach((actm) => {
            actm.controlComponents.forEach((cc) => {
              sheet.getCell(index + 2, 2 + counter).value = cc.point ?? 0;
              counter++;
            });
          });
        });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    const stream = new Readable();
    // workbook.xlsx.writeFile('./files/3.xlsx')
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
}

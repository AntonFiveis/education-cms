import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ActivityService } from './services/activity.service';
import { QueryAndAuthorizationHeader } from '../../decorators/query-and-authorization-header.decorator';
import { TokensValidationPipe } from '../../pipes/tokens-validation.pipe';
import {
  GetTeacherAccessPipe,
  GetTeacherAccessPipeOutput,
} from '../../pipes/get-teacher-access.pipe';
import { ActivityDTO, ActivityUpdates } from './dto/activity.dto';
import {
  GetOwnerAccessPipe,
  GetOwnerAccessPipeOutput,
} from '../../pipes/get-owner-access.pipe';
import { GetPrivilegesPipe } from '../../pipes/get-privileges.pipe';
import GetStudentGroupPipe from '../../pipes/get-student-group.pipe';
import {
  GetGroupAccessPipe,
  GetGroupAccessPipeProps,
} from '../../pipes/get-group-access.pipe';
import { DisciplinesInformation } from '../disciplines-information/disciplines-information.entity';
import { Activity } from './entities/activity.entity';
import { ActivityOutputDto } from './dto/activity.output.dto';
import { ActivityAttendanceService } from './services/activity-attendance.service';
import ActivityAttendance from './entities/activity-attendance.entity';

interface GetOwnerAndTeacherAccessPipesOutput
  extends GetTeacherAccessPipeOutput,
    GetOwnerAccessPipeOutput {}

@Controller('activity')
export class ActivityController {
  constructor(
    private activityService: ActivityService,
    private activityAttendanceService: ActivityAttendanceService,
  ) {}
  @Get()
  async getActivity(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetPrivilegesPipe,
      GetTeacherAccessPipe,
      GetStudentGroupPipe,
      GetGroupAccessPipe,
    )
    { privileges, teacherPrivileges, access }: GetGroupAccessPipeProps,
    @Query('activityID') activityID: number,
  ): Promise<ActivityOutputDto> {
    if (!privileges && !access && !teacherPrivileges) {
      throw new UnauthorizedException("You don't have rights to do it");
    }
    const activity = await this.activityService.getActivityWithComponents(
      activityID,
    );
    if (access && !activity.visible) {
      throw new UnauthorizedException("You don't have rights to do it");
    }

    return activity;
  }

  @Get('/:disciplineID')
  async getDisciplineActivitiesByID(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetPrivilegesPipe,
      GetTeacherAccessPipe,
      GetStudentGroupPipe,
      GetGroupAccessPipe,
    )
    { privileges, teacherPrivileges, access }: GetGroupAccessPipeProps,
    @Param('disciplineID') id: number,
  ): Promise<Activity[]> {
    if (!privileges.disciplinesAccepter && !access && !teacherPrivileges)
      throw new UnauthorizedException("You don't have rights to do it");
    const activities = await this.activityService.getActivitiesOfDiscipline(id);
    return access ? activities.filter((a) => a.visible) : activities;
  }

  @Post()
  async createActivity(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Body('activity') activity: ActivityDTO,
  ): Promise<number> {
    if (!teacherPrivileges.adder && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    return await this.activityService.createActivity(activity);
  }

  @Post('/information')
  async createActivitiesByInformation(
    @QueryAndAuthorizationHeader(TokensValidationPipe, GetOwnerAccessPipe)
    { isOwner }: GetOwnerAccessPipeOutput,
    @Body('information') information: DisciplinesInformation,
    @Query('disciplineID') disciplineID: number,
  ): Promise<void> {
    if (!isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.activityService.createActivitiesFromDisciplineInformation(
      information,
      disciplineID,
    );
  }

  @Patch()
  async updateActivity(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Body('updates') updates: ActivityUpdates,
    @Query('activityID') activityID: number,
  ): Promise<void> {
    if (!teacherPrivileges.editor && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.activityService.updateActivity(updates, activityID);
  }

  @Delete()
  async deleteActivity(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('activityID') activityID: number,
  ): Promise<void> {
    if (!teacherPrivileges.editor && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.activityService.deleteActivity(activityID);
  }

  @Patch('/visible')
  async changeVisibility(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('activityID') activityID: number,
    @Query('visibility') visibility: boolean,
  ): Promise<void> {
    if (!teacherPrivileges.editor && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.activityService.changeVisibility(activityID, visibility);
  }

  @Patch('/attendance')
  async updateUserAttendance(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('activityID') activityID: number,
    @Query('userID') userID: number,
    @Body('attendance') attendance: string,
  ): Promise<void> {
    if (!teacherPrivileges.editor && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.activityAttendanceService.updateUserAttendance(
      userID,
      activityID,
      attendance,
    );
  }

  @Get('/attendance')
  async getGroupAttendance(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('activityID') activityID: number,
    @Query('groupID') groupID: number,
  ): Promise<ActivityAttendance[]> {
    if (!teacherPrivileges && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    return this.activityAttendanceService.getGroupAttendance(
      groupID,
      activityID,
    );
  }
}

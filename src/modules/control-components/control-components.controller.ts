import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Patch,
  Query,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { QueryAndAuthorizationHeader } from '../../decorators/query-and-authorization-header.decorator';
import { TokensValidationPipe } from '../../pipes/tokens-validation.pipe';
import { GetTeacherAccessPipe } from '../../pipes/get-teacher-access.pipe';
import GetStudentGroupPipe from '../../pipes/get-student-group.pipe';
import {
  GetGroupAccessPipe,
  GetGroupAccessPipeProps,
} from '../../pipes/get-group-access.pipe';
import { ControlComponentsService } from './services/control-components.service';
import { ControlComponentsUpdates } from './dto/control-components.dto';
import { GetOwnerAccessPipe } from '../../pipes/get-owner-access.pipe';
import { GetOwnerAndTeacherAccessPipesOutput } from '../activity-content/activity-content.controller';
import { ControlComponents } from './entities/control-components.entity';
import { UsersControlSessionsService } from './services/users-control-sessions.service';
import { ControlComponentsWithTasks } from './dto/control-components.output.dto';
import { GetDisciplineIdFromControlComponentPipe } from '../../pipes/get-discipline-id-from-control-component.pipe';
import { ControlComponentsGroupAccessService } from '../control-components-group-access/control-components-group-access.service';

@Controller('control-components')
export class ControlComponentsController {
  constructor(
    private controlComponentsService: ControlComponentsService,
    private usersControlSessionsService: UsersControlSessionsService,
    private controlComponentsGroupAccessService: ControlComponentsGroupAccessService,
  ) {}
  // @Post()
  // async createControlComponent(
  //   @QueryAndAuthorizationHeader(
  //     TokensValidationPipe,
  //     GetTeacherAccessPipe,
  //     GetOwnerAccessPipe,
  //   )
  //   { token, teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
  //   @Body('controlComponent') controlComponentDTO: ControlComponentsDTO,
  // ): Promise<void> {
  //   if (!teacherPrivileges.adder && !isOwner)
  //     throw new UnauthorizedException("You don't have rights to do it");
  //   await this.controlComponentsService.createControlComponent(
  //     controlComponentDTO,
  //   );
  // }

  @Patch()
  async updateControlComponent(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Body('updates') controlComponentUpdates: ControlComponentsUpdates,
    @Query('controlComponentID') controlComponentID: number,
  ): Promise<void> {
    if (!teacherPrivileges.editor && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.controlComponentsService.updateControlComponent(
      controlComponentID,
      controlComponentUpdates,
    );
  }

  // @Delete()
  // async deleteControlComponent(
  //   @QueryAndAuthorizationHeader(
  //     TokensValidationPipe,
  //     GetDisciplineIdFromControlComponentPipe,
  //     GetTeacherAccessPipe,
  //     GetOwnerAccessPipe,
  //   )
  //   { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
  //   @Query('controlComponentID') controlComponentID: number,
  // ): Promise<void> {
  //   if (!teacherPrivileges.remover && !isOwner)
  //     throw new UnauthorizedException("You don't have rights to do it");
  //   await this.controlComponentsService.deleteControlComponent(
  //     controlComponentID,
  //   );
  // }

  @Get()
  async getControlComponent(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
      GetStudentGroupPipe,
      GetGroupAccessPipe,
    )
    { teacherPrivileges, access, isOwner },
    @Query('controlComponentID') controlComponentID: number,
  ): Promise<ControlComponents> {
    if (!teacherPrivileges && !isOwner && !access)
      throw new UnauthorizedException("You don't have rights to do it");
    const res = await this.controlComponentsService.getControlComponent(
      controlComponentID,
    );

    return { ...res, isTeacher: !!teacherPrivileges };
    // return this.controlComponentsService.getControlComponentWithTasks(
    //     controlComponentID,
    // );
  }

  @Get('/with-tasks')
  async getControlComponentWithTasks(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
    )
    { teacherPrivileges, isOwner },
    @Query('controlComponentID') controlComponentID: number,
  ): Promise<ControlComponentsWithTasks> {
    if (!teacherPrivileges && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    // return this.controlComponentsService.getControlComponent(controlID);
    return this.controlComponentsService.getControlComponentWithTasks(
      controlComponentID,
    );
  }

  @Get('/check')
  async checkControlComponent(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
    )
    { teacherPrivileges, isOwner, params },
    @Query('controlComponentID') controlComponentID: number,
  ): Promise<boolean> {
    if (!teacherPrivileges && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    return this.controlComponentsService.checkValidControlComponent(
      controlComponentID,
      params.disciplineID,
    );
  }

  @Post('/start')
  async createNewSession(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetStudentGroupPipe,
      GetGroupAccessPipe,
    )
    { access, token, params }: GetGroupAccessPipeProps,
    @Query('controlComponentID') controlComponentID: number,
  ): Promise<void> {
    const controlComponentAccess = await this.controlComponentsGroupAccessService.checkUserAccess(
      token.userID,
      controlComponentID,
    );
    if (!access || !controlComponentAccess)
      throw new UnauthorizedException("You don't have rights to do it");
    const isValid = await this.controlComponentsService.checkValidControlComponent(
      controlComponentID,
      params.disciplineID,
    );
    if (!isValid)
      throw new InternalServerErrorException('Control component is not valid.');
    await this.usersControlSessionsService.createNewSession(
      token.userID,
      controlComponentID,
    );
  }

  @Post('/next')
  async setIndexNext(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetStudentGroupPipe,
      GetGroupAccessPipe,
    )
    { access, token }: GetGroupAccessPipeProps,
    @Query('controlComponentID') controlComponentID: number,
    @Query('index') index: number,
  ): Promise<void> {
    if (!access)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.usersControlSessionsService.setIndexNext(
      token.userID,
      index,
      controlComponentID,
    );
  }
  @Post('/finish')
  async finishSession(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetStudentGroupPipe,
      GetGroupAccessPipe,
    )
    { access, token }: GetGroupAccessPipeProps,
    @Query('controlComponentID') controlComponentID: number,
    @Query('taskID') taskID: number,
  ): Promise<void> {
    if (!access)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.usersControlSessionsService.finishTest(
      token.userID,
      controlComponentID,
      taskID,
    );
  }
  @Get('/start-status')
  async getStartStatus(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetStudentGroupPipe,
      GetGroupAccessPipe,
    )
    { access, token }: GetGroupAccessPipeProps,
    @Query('controlComponentID') controlComponentID: number,
  ): Promise<string> {
    if (!access)
      throw new UnauthorizedException("You don't have rights to do it");
    const controlComponentAccess = await this.controlComponentsGroupAccessService.checkUserAccess(
      token.userID,
      controlComponentID,
    );
    if (!controlComponentAccess) return '';
    return this.usersControlSessionsService.getStartStatus(
      controlComponentID,
      token.userID,
    );
  }
  @Post('/last-task')
  async setLastTaskID(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetStudentGroupPipe,
      GetGroupAccessPipe,
    )
    { access, token }: GetGroupAccessPipeProps,
    @Query('controlComponentID') controlComponentID: number,
    @Query('taskID') taskID: number,
  ): Promise<void> {
    if (!access)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.usersControlSessionsService.setLastTaskID(
      token.userID,
      controlComponentID,
      taskID,
    );
  }

  @Get('/time-left')
  async getTimeLeft(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetStudentGroupPipe,
      GetGroupAccessPipe,
    )
    { access, token }: GetGroupAccessPipeProps,
    @Query('controlComponentID') controlComponentID: number,
  ): Promise<number> {
    if (!access)
      throw new UnauthorizedException("You don't have rights to do it");
    return await this.usersControlSessionsService.getTimeLeft(
      token.userID,
      controlComponentID,
    );
  }

  @Get('/sessions-count')
  async getControlSessionsCount(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetStudentGroupPipe,
      GetGroupAccessPipe,
    )
    { access, token }: GetGroupAccessPipeProps,
    @Query('controlComponentID') controlComponentID: number,
  ): Promise<number> {
    if (!access)
      throw new UnauthorizedException("You don't have rights to do it");
    return await this.usersControlSessionsService.getClosedSessionCount(
      token.userID,
      controlComponentID,
    );
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ControlComponentsTasksService } from './services/control-components-tasks.service';
import {
  ControlComponentsTasksDTO,
  ControlComponentsTasksUpdates,
} from './dto/control-components-tasks.dto';
import { ControlComponentsTaskAnswersService } from './services/control-components-task-answers.service';
import { UsersControlComponentsAnswersService } from './services/users-control-components-answers.service';
import { QueryAndAuthorizationHeader } from '../../decorators/query-and-authorization-header.decorator';
import { TokensValidationPipe } from '../../pipes/tokens-validation.pipe';
import { GetOwnerAccessPipe } from '../../pipes/get-owner-access.pipe';
import { GetTeacherAccessPipe } from '../../pipes/get-teacher-access.pipe';
import GetStudentGroupPipe from '../../pipes/get-student-group.pipe';
import {
  GetGroupAccessPipe,
  GetGroupAccessPipeProps,
} from '../../pipes/get-group-access.pipe';
import {
  ControlComponentsTasksWithVariant,
  ControlComponentsTasksWithVariantAndUserAnswer,
  ControlComponentsTasksWithVariants,
} from './dto/control-components-tasks.output.dto';
import { GetOwnerAndTeacherAccessPipesOutput } from '../activity-content/activity-content.controller';
import {
  ControlComponentsTaskAnswersDTO,
  ControlComponentsTaskAnswersUpdates,
} from './dto/control-components-task-answers.dto';
import { GetDisciplineIdFromControlComponentPipe } from '../../pipes/get-discipline-id-from-control-component.pipe';
import { UsersControlComponentsAnswers } from './entities/users-control-components-answers.entity';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ControlComponentsTaskVariantsService } from './services/control-components-task-variants.service';
import { ControlComponentsTaskVariantsUpdates } from './dto/control-components-task-variants.dto';
import { ControlComponentsTasks } from './entities/control-components-tasks.entity';

@Controller('control-components-tasks')
export class ControlComponentsTasksController {
  constructor(
    private controlComponentsTasksService: ControlComponentsTasksService,
    private controlComponentsTaskAnswersService: ControlComponentsTaskAnswersService,
    private usersControlComponentsAnswersService: UsersControlComponentsAnswersService,
    private controlComponentsTaskVariantsService: ControlComponentsTaskVariantsService,
  ) {}
  @Post()
  async createControlComponentTask(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Body('controlComponentsTask')
    controlComponentsTaskDTO: ControlComponentsTasksDTO,
  ): Promise<number> {
    if (!teacherPrivileges.adder && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it.");
    return await this.controlComponentsTasksService.createControlComponentsTask(
      controlComponentsTaskDTO,
    );
  }

  @Get()
  async getControlComponentsTask(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('id') taskID: number,
  ): Promise<ControlComponentsTasksWithVariants> {
    if (!teacherPrivileges && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    return await this.controlComponentsTasksService.getControlComponentTaskWithVariants(
      taskID,
    );
  }

  @Get('file/:filename')
  async getFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const stream = await this.usersControlComponentsAnswersService.getFile(
      filename,
    );
    stream.pipe(res);
  }

  // @Get('my')
  // async getMyTasks(
  //   @QueryAndAuthorizationHeader(
  //     TokensValidationPipe,
  //     GetDisciplineIdFromControlComponentPipe,
  //     GetStudentGroupPipe,
  //     GetGroupAccessPipe,
  //   )
  //   { token, access, params }: GetGroupAccessPipeProps,
  //   @Query('controlComponentID') controlComponentID: number,
  // ): Promise<{ tasks: ControlComponentsTasksWithVariant[]; index: number }> {
  //   if (!access)
  //     throw new UnauthorizedException("You don't have rights to do it");
  //   return await this.controlComponentsTasksService.getMyTasks(
  //     token.userID,
  //     controlComponentID,
  //     params.disciplineID,
  //   );
  // }
  @Delete()
  async deleteControlComponentsTask(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('id') taskID: number,
  ): Promise<void> {
    if (!teacherPrivileges.remover && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.controlComponentsTasksService.deleteControlComponentsTask(
      taskID,
    );
  }
  @Patch()
  async updateControlComponentsTask(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('id') taskID: number,
    @Body('updates') updates: ControlComponentsTasksUpdates,
  ): Promise<void> {
    if (!teacherPrivileges.editor && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.controlComponentsTasksService.updateControlComponentsTask(
      taskID,
      updates,
    );
  }

  @Post('/handover/files')
  @UseInterceptors(FilesInterceptor('files'))
  async handOverFiles(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
      GetStudentGroupPipe,
      GetGroupAccessPipe,
    )
    { token, teacherPrivileges, access, isOwner },
    @UploadedFiles() files: Express.Multer.File[],
    @Query('id') variantID: number,
    @Query('forced') forced: string,
  ): Promise<void> {
    if (!isOwner && !teacherPrivileges && !access)
      throw new UnauthorizedException("You don't have rights to do it");
    for (const file of files) {
      if (file.size > 5000000) throw new Error('File is too large');
    }
    await this.usersControlComponentsAnswersService.handOverTask(
      {
        answer: undefined,
        variantID,
        userID: token.userID,
      },
      forced === 'true',
      undefined,
      files,
    );
  }

  @Post('/handover/file')
  @UseInterceptors(FileInterceptor('file'))
  async handOverFile(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
      GetStudentGroupPipe,
      GetGroupAccessPipe,
    )
    { token, teacherPrivileges, access, isOwner },
    @UploadedFile() file: Express.Multer.File,
    @Query('id') variantID: number,
    @Query('forced') forced: string,
  ): Promise<void> {
    if (!isOwner && !teacherPrivileges && !access)
      throw new UnauthorizedException("You don't have rights to do it");
    if (file.size > 5000000) throw new Error('File is too large');
    await this.usersControlComponentsAnswersService.handOverTask(
      {
        answer: undefined,
        variantID,
        userID: token.userID,
      },
      forced === 'true',
      file,
    );
  }

  @Post('/handover')
  async handOverTask(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
      GetStudentGroupPipe,
      GetGroupAccessPipe,
    )
    { token, teacherPrivileges, access, isOwner },
    @Query('id') variantID: number,
    @Body('answer') answer: string,
    @Query('forced') forced: string,
  ): Promise<void> {
    if (!isOwner && !teacherPrivileges && !access)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.usersControlComponentsAnswersService.handOverTask(
      {
        variantID,
        userID: token.userID,
        answer,
      },
      forced === 'true',
    );
  }

  @Get('/my')
  async getMyTaskWithAnswers(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetStudentGroupPipe,
      GetGroupAccessPipe,
    )
    { access, token, params: { disciplineID } }: GetGroupAccessPipeProps,
    @Query('controlComponentID') controlComponentID: number,
  ): Promise<{
    answers: UsersControlComponentsAnswers[];
    tasks: ControlComponentsTasksWithVariant[];
  }> {
    if (!access)
      throw new UnauthorizedException("You don't have rights to do it");
    return this.usersControlComponentsAnswersService.getMyAnswers(
      controlComponentID,
      token.userID,
      disciplineID,
    );
  }

  @Get('/answers/:taskID')
  async getAnswer(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner, token }: GetOwnerAndTeacherAccessPipesOutput,
    @Param('taskID') taskID: number,
    @Query('userID') userID: number,
    @Query('disciplineID') disciplineID: number,
  ): Promise<ControlComponentsTasksWithVariantAndUserAnswer> {
    const editor = isOwner || !!teacherPrivileges;
    if (!editor && token.userID != userID)
      throw new UnauthorizedException("You don't have rights to do it");

    return this.usersControlComponentsAnswersService.getTaskWithUserAnswer(
      taskID,
      userID,
      disciplineID,
      editor,
    );
  }

  @Post('/answers')
  async createControlComponentsTaskAnswer(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Body('answer')
    controlComponentsTaskAnswer: ControlComponentsTaskAnswersDTO,
  ): Promise<number> {
    if (!teacherPrivileges.adder && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    return await this.controlComponentsTaskAnswersService.createControlComponentsTaskAnswers(
      controlComponentsTaskAnswer,
    );
  }
  @Patch('/answers')
  async updateControlComponentsTaskAnswer(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('id') answerID: number,
    @Body('updates') updates: ControlComponentsTaskAnswersUpdates,
  ): Promise<void> {
    if (!teacherPrivileges.editor && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.controlComponentsTaskAnswersService.updateTaskAnswer(
      Number(answerID),
      updates,
    );
  }
  @Patch('/answers/user')
  async updateUserPoint(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('variantID') variantID: number,
    @Query('userID') userID: number,
    @Body('point') point: number,
    @Query('sessionID') sessionID: string,
  ): Promise<void> {
    if (!teacherPrivileges.editor && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.usersControlComponentsAnswersService.updateUserPoint(
      point,
      Number(variantID),
      Number(userID),
      sessionID,
    );
  }

  @Delete('/answers')
  async deleteControlComponentsTaskAnswer(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('id') answerID: number,
  ): Promise<void> {
    if (!teacherPrivileges.remover && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.controlComponentsTaskAnswersService.deleteControlComponentsTaskAnswer(
      answerID,
    );
  }

  @Post('/variant')
  async createNewTaskVariant(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Body('taskID') taskID: number,
  ): Promise<{ variantID: number; variant: number }> {
    if (!teacherPrivileges.adder && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    return await this.controlComponentsTaskVariantsService.createTaskVariant({
      taskID,
    });
  }

  @Patch('/variant')
  async updateTaskVariant(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Body('updates') updates: ControlComponentsTaskVariantsUpdates,
    @Query('variantID') variantID: number,
  ): Promise<void> {
    if (!teacherPrivileges.editor && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.controlComponentsTaskVariantsService.updateTaskVariant(
      variantID,
      updates,
    );
  }

  @Delete('/variant')
  async deleteTaskVariant(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetDisciplineIdFromControlComponentPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('variantID') variantID: number,
  ): Promise<void> {
    if (!teacherPrivileges.remover && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.controlComponentsTaskVariantsService.deleteTaskVariant(
      variantID,
    );
  }
}

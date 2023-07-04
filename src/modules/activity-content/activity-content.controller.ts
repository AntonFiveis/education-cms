import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { ActivityContentService } from './activity-content.service';
import { ActivityContent } from './activity-content.entity';
import { QueryAndAuthorizationHeader } from '../../decorators/query-and-authorization-header.decorator';
import { TokensValidationPipe } from '../../pipes/tokens-validation.pipe';
import {
  GetTeacherAccessPipe,
  GetTeacherAccessPipeOutput,
} from '../../pipes/get-teacher-access.pipe';
import {
  ActivityContentDTO,
  ActivityContentUpdates,
} from './dto/activity-content.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  GetOwnerAccessPipe,
  GetOwnerAccessPipeOutput,
} from '../../pipes/get-owner-access.pipe';
import { JsonParsePipe } from '../../pipes/json-parse.pipe';

export interface GetOwnerAndTeacherAccessPipesOutput
  extends GetTeacherAccessPipeOutput,
    GetOwnerAccessPipeOutput {}

@Controller('activity-content')
export class ActivityContentController {
  constructor(private activityContentService: ActivityContentService) {}
  @Get()
  async getActivityContent(
    @Query('activityContentID') activityContentID: number,
  ): Promise<ActivityContent> {
    return await this.activityContentService.getActivityContent(
      activityContentID,
    );
  }
  @Get('/:filename')
  async getImage(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const stream = await this.activityContentService.getFile(
      (filename),
    );
    stream.pipe(res);
  }

  @Get('/pictogram/:filename')
  async getImagePictogram(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const stream = await this.activityContentService.getImagePictogram(
      (filename),
    );
    stream.pipe(res);
  }
  @Post()
  async postActivityContent(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Body('activityContentDTO') activityContentDTO: ActivityContentDTO,
  ): Promise<number> {
    if (!teacherPrivileges.adder && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    return await this.activityContentService.saveActivityContent(
      activityContentDTO,
    );
  }
  @Post('/file')
  @UseInterceptors(FileInterceptor('file'))
  async postActivityContentWithImage(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Body('activityContent', JsonParsePipe) activityContent: ActivityContentDTO,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ activityContentID: number; path: string }> {
    if (!teacherPrivileges.adder && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    return await this.activityContentService.saveActivityContentWithFile(
      file,
      activityContent,
    );
  }

  @Patch()
  async updateActivityContent(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Body('activityContentUpdates')
    activityContentUpdates: ActivityContentUpdates,
    @Query('activityContentID') activityContentID: number,
  ): Promise<void> {
    if (!teacherPrivileges.editor && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.activityContentService.updateActivityContent(
      activityContentUpdates,
      activityContentID,
    );
  }
  @Patch('/file')
  @UseInterceptors(FileInterceptor('file'))
  async updateActivityContentWithImage(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Body('activityContentUpdates', JsonParsePipe)
    activityContentUpdates: ActivityContentUpdates,
    @Query('activityContentID') activityContentID: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    if (!teacherPrivileges.editor && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.activityContentService.updateActivityContentWithImage(
      file,
      activityContentUpdates,
      activityContentID,
    );
  }
  @Delete()
  async deleteActivityContentWithImage(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('activityContentID') activityContentID: number,
  ): Promise<void> {
    if (!teacherPrivileges.remover && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.activityContentService.deleteActivityContent(activityContentID);
  }
}

import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ActivityComponentService } from './activity-component.service';
import { QueryAndAuthorizationHeader } from '../../decorators/query-and-authorization-header.decorator';
import { TokensValidationPipe } from '../../pipes/tokens-validation.pipe';
import {
  GetTeacherAccessPipe,
  GetTeacherAccessPipeOutput,
} from '../../pipes/get-teacher-access.pipe';
import {
  GetOwnerAccessPipe,
  GetOwnerAccessPipeOutput,
} from '../../pipes/get-owner-access.pipe';
import {
  ActivityComponentDto,
  ActivityComponentUpdates,
} from './dto/activity-component.dto';
import { ActivityContent } from '../activity-content/activity-content.entity';

interface GetOwnerAndTeacherAccessPipesOutput
  extends GetTeacherAccessPipeOutput,
    GetOwnerAccessPipeOutput {}

@Controller('activity-component')
export class ActivityComponentController {
  constructor(private activityComponentService: ActivityComponentService) {}
  @Post()
  async createActivityComponent(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Body('activityComponent') activityComponentDTO: ActivityComponentDto,
  ): Promise<{ activityComponentID: number; content?: ActivityContent }> {
    if (!teacherPrivileges.adder && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    return await this.activityComponentService.createActivityComponent(
      activityComponentDTO,
    );
  }
  @Patch()
  async updateActivityComponent(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('activityComponentID') activityComponentID: number,
    @Body('activityComponentUpdates') updates: ActivityComponentUpdates,
  ): Promise<void> {
    if (!teacherPrivileges.editor && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.activityComponentService.updateActivityComponent(
      updates,
      activityComponentID,
    );
  }
  @Delete()
  async deleteActivityComponent(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('activityComponentID') activityComponentID: number,
  ): Promise<void> {
    if (!teacherPrivileges.remover && !isOwner)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.activityComponentService.deleteActivityComponent(
      activityComponentID,
    );
  }
}

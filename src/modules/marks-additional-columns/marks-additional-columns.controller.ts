import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { MarksAdditionalColumnsService } from './services/marks-additional-columns.service';
import { MarksAdditionalColumnValuesService } from './services/marks-additional-column-values.service';
import { QueryAndAuthorizationHeader } from '../../decorators/query-and-authorization-header.decorator';
import { TokensValidationPipe } from '../../pipes/tokens-validation.pipe';
import { GetTeacherAccessPipe } from '../../pipes/get-teacher-access.pipe';
import { GetOwnerAccessPipe } from '../../pipes/get-owner-access.pipe';
import { GetOwnerAndTeacherAccessPipesOutput } from '../activity-content/activity-content.controller';
import MarksAdditionalColumnsDTO, {
  MarksAdditionalColumnsUpdatesDTO,
} from './dto/marks-additional-columns.dto';
import MarksAdditionalColumnValuesDTO, {
  MarksAdditionalColumnValuesUpdatesDTO,
} from './dto/marks-additional-column-values.dto';

@Controller('marks-additional-columns')
export class MarksAdditionalColumnsController {
  constructor(
    private marksAdditionalColumnsService: MarksAdditionalColumnsService,
    private marksAdditionalColumnValuesService: MarksAdditionalColumnValuesService,
  ) {}

  @Post()
  async createColumn(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('groupID') groupID: number,
    @Query('disciplineID') disciplineID: number,
    @Body('marksAdditionalColumnDTO')
    marksAdditionalColumnsDTO: MarksAdditionalColumnsDTO,
  ): Promise<number> {
    if (!teacherPrivileges && !isOwner)
      throw new UnauthorizedException("You don't have rights to do this.");
    return this.marksAdditionalColumnsService.createMarksColumn(
      marksAdditionalColumnsDTO,
      disciplineID,
      groupID,
    );
  }

  @Delete()
  async deleteColumn(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('columnID') columnID: number,
  ): Promise<void> {
    if (!teacherPrivileges && !isOwner)
      throw new UnauthorizedException("You don't have rights to do this.");
    return this.marksAdditionalColumnsService.deleteColumn(columnID);
  }

  @Patch()
  async updateColumn(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('columnID') columnID: number,
    @Body('updates') updates: MarksAdditionalColumnsUpdatesDTO,
  ): Promise<void> {
    if (!teacherPrivileges && !isOwner)
      throw new UnauthorizedException("You don't have rights to do this.");
    return this.marksAdditionalColumnsService.updateMarksColumn(
      columnID,
      updates,
    );
  }

  @Post('/value')
  async createMarksColumnValue(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Body('marksAdditionalColumnValuesDTO')
    marksAdditionalColumnValuesDTO: MarksAdditionalColumnValuesDTO,
  ): Promise<number> {
    if (!teacherPrivileges && !isOwner)
      throw new UnauthorizedException("You don't have rights to do this.");
    return this.marksAdditionalColumnValuesService.createColumnValue(
      marksAdditionalColumnValuesDTO,
    );
  }

  @Patch('/value')
  async updateMarksColumnValue(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Body('updates')
    updates: MarksAdditionalColumnValuesUpdatesDTO,
    @Query('columnValueID') columnValueID: number,
  ): Promise<void> {
    if (!teacherPrivileges && !isOwner)
      throw new UnauthorizedException("You don't have rights to do this.");
    return this.marksAdditionalColumnValuesService.updateColumnValue(
      columnValueID,
      updates,
    );
  }
}

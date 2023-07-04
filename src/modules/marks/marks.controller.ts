import { Controller, Get, Query, Res, UnauthorizedException } from '@nestjs/common';
import { MarksService } from './marks.service';
import { QueryAndAuthorizationHeader } from '../../decorators/query-and-authorization-header.decorator';
import { TokensValidationPipe } from '../../pipes/tokens-validation.pipe';
import { GetTeacherAccessPipe } from '../../pipes/get-teacher-access.pipe';
import { GetOwnerAccessPipe } from '../../pipes/get-owner-access.pipe';
import { GetOwnerAndTeacherAccessPipesOutput } from '../activity-content/activity-content.controller';
import GroupMarks, { StudentAllMarks } from './interfaces/GroupMarks';
import { StudentDisciplineMarks } from './interfaces/GroupMarks';
import { Response} from 'express';

@Controller('marks')
export class MarksController {
  constructor(private marksService: MarksService) {}
  @Get()
  async getDisciplineGroupMarks(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('groupID') groupID: number,
    @Query('disciplineID') disciplineID: number,
  ): Promise<GroupMarks> {
    if (!teacherPrivileges && !isOwner)
      throw new UnauthorizedException("You don't have rights to do this.");
    return this.marksService.getGroupMarks(groupID, disciplineID);
  }

  @Get('/my')
  async getMyMarks(
    @QueryAndAuthorizationHeader(TokensValidationPipe)
    { token }: GetOwnerAndTeacherAccessPipesOutput,
  ): Promise<StudentAllMarks> {
    if (!token)
      throw new UnauthorizedException("You don't have rights to do this.");
    return this.marksService.getMyMarks(token.userID);
  }


  @Get('/csv')
  async getDisciplinesGroupMarksCSV(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
      { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @Query('groupID') groupID: number,
    @Query('disciplineID') disciplineID: number,
    @Res() res: Response,
  ): Promise<void> {
    if (!teacherPrivileges && !isOwner)
      throw new UnauthorizedException("You don't have rights to do this.");
    const stream = await this.marksService.getGroupMarksCSV(
      groupID,
      disciplineID,
    );
    res.attachment(`group-${groupID}.xlsx`);
    res.charset = 'win1252'
    stream.pipe(res);
  }
}

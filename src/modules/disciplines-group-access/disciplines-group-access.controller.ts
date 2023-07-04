import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { DisciplinesGroupAccess } from './disciplines-group-access.entity';
import { DisciplinesGroupAccessService } from './disciplines-group-access.service';
import { DisciplinesGroupAccessDto } from './dto/disciplines-group-access.dto';
import { QueryAndAuthorizationHeader } from '../../decorators/query-and-authorization-header.decorator';
import {
  TokensValidationPipe,
  TokensValidationPipeOutput,
} from '../../pipes/tokens-validation.pipe';
import {
  GetOwnerAccessPipe,
  GetOwnerAccessPipeOutput,
} from '../../pipes/get-owner-access.pipe';
import {
  GetTeacherAccessPipe,
  GetTeacherAccessPipeOutput,
} from '../../pipes/get-teacher-access.pipe';
import GetStudentGroupPipe, {
  GetStudentGroupPipeOutput,
} from '../../pipes/get-student-group.pipe';
import { DisciplinesService } from '../disciplines/disciplines.service';
import {
  GetPrivilegesPipe,
  GetPrivilegesPipeOutput,
} from '../../pipes/get-privileges.pipe';

@Controller('disciplines-group-access')
export class DisciplinesGroupAccessController {
  constructor(
    private disciplinesGroupAccessService: DisciplinesGroupAccessService,
    private disciplinesService: DisciplinesService,
  ) {}

  @Get()
  async getDisciplinesGroupAccess(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetOwnerAccessPipe,
      GetTeacherAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetTeacherAccessPipeOutput,
    @QueryAndAuthorizationHeader(TokensValidationPipe, GetStudentGroupPipe)
    studentData: GetStudentGroupPipeOutput,
    @Query('disciplineID') disciplineID: number,
    @Query('groupID') groupID: number,
  ): Promise<DisciplinesGroupAccess[]> {
    if (!(isOwner || teacherPrivileges))
      throw new UnauthorizedException("You don't have rights to do it");
    if (disciplineID && !groupID && (isOwner || teacherPrivileges))
      return this.disciplinesGroupAccessService.findGroupsOfDiscipline(
        disciplineID,
      );

    if (!disciplineID && groupID && studentData.groupIDs.includes(groupID))
      return this.disciplinesGroupAccessService.findDisciplinesOfGroup(groupID);
  }

  @Post()
  async createDisciplinesGroupAccess(
    @QueryAndAuthorizationHeader(TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Body() { disciplineID, groupID }: DisciplinesGroupAccessDto,
  ): Promise<void> {
    if (!privileges.groupAdder)
      throw new UnauthorizedException("You don't have rights to do it");
    return this.disciplinesGroupAccessService.create({ disciplineID, groupID });
  }

  @Delete()
  async deleteDisciplinesGroupAccess(
    @QueryAndAuthorizationHeader(TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Query('groupID') groupID: number,
    @Query('disciplineID') disciplineID: number,
  ): Promise<void> {
    if (!privileges.groupAdder)
      throw new UnauthorizedException("You don't have rights to do it");
    return this.disciplinesGroupAccessService.delete({ groupID, disciplineID });
  }
}

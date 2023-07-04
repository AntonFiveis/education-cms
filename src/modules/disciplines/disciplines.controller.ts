import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomHeaders } from 'src/decorators/custom-headers.decorator';
import {
  TokensValidationPipe,
  TokensValidationPipeOutput,
} from '../../pipes/tokens-validation.pipe';
import { Discipline, ExtendedDiscipline } from './discipline.entity';
import { DisciplinesService } from './disciplines.service';
import { DisciplineUpdates } from './dto/discipline.dto';
import {
  GetPrivilegesPipe,
  GetPrivilegesPipeOutput,
} from '../../pipes/get-privileges.pipe';
import {
  GetTeacherAccessPipe,
  GetTeacherAccessPipeOutput,
} from '../../pipes/get-teacher-access.pipe';
import { QueryAndAuthorizationHeader } from '../../decorators/query-and-authorization-header.decorator';
import {
  GetGroupAccessPipe,
  GetGroupAccessPipeProps,
} from '../../pipes/get-group-access.pipe';
import GetStudentGroupPipe from '../../pipes/get-student-group.pipe';
import { Group } from '../groups/group.entity';
import { UserProfile } from '../users/user.entity';
import { DisciplinesAnnotationService } from '../disciplines-annotation/disciplines-annotation.service';
import { DisciplineAnnotation } from '../disciplines-annotation/disciplines-annotation.entity';
import { DisciplinesInformation } from '../disciplines-information/disciplines-information.entity';
import { DisciplinesInformationService } from '../disciplines-information/disciplines-information.service';

@Controller('disciplines')
export class DisciplinesController {
  constructor(
    private disciplineService: DisciplinesService,
    private disciplinesAnnotationService: DisciplinesAnnotationService,
    private disciplinesInformationService: DisciplinesInformationService,
  ) {}

  // @Get('/all')
  // async getAllDisciplines(
  //     @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe) {privileges}: GetPrivilegesPipeOutput,
  // ): Promise<Discipline[]> {
  //     const disciplineAccess: boolean = privileges.find((privilege: RolesPrivileges) => privilege.disciplinesAdder) !== undefined
  //     if (!disciplineAccess) throw new UnauthorizedException("You don't have rights to do it")
  //     return this.disciplineService.findAll()
  // }

  @Get()
  async getMyDisciplines(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges, token }: GetPrivilegesPipeOutput,
  ): Promise<Discipline[]> {
    return this.disciplineService.getMyDisciplines(token.userID, privileges);
  }

  @Get('/:disciplineID')
  async getDisciplineByID(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetPrivilegesPipe,
      GetTeacherAccessPipe,
      GetStudentGroupPipe,
      GetGroupAccessPipe,
    )
    { token, privileges, teacherPrivileges, access }: GetGroupAccessPipeProps,
    // @CustomHeaders('authorization', TokensValidationPipe) {token}: {token: Token},
    @Param('disciplineID') id: number,
  ): Promise<ExtendedDiscipline> {
    if (!privileges.disciplinesAccepter && !access && !teacherPrivileges)
      throw new UnauthorizedException("You don't have rights to do it");
    const disciplineWithPrivileges: ExtendedDiscipline = await this.disciplineService.findOneById(
      id,
      token.userID,
    );
    const disciplineAnnotation: DisciplineAnnotation = await this.disciplinesAnnotationService.findOneByDisciplineID(
      id,
    );
    const disciplineInformation: DisciplinesInformation = await this.disciplinesInformationService.findOneByDisciplineID(
      id,
    );
    return {
      ...disciplineWithPrivileges,
      annotation: disciplineAnnotation,
      info: disciplineInformation,
      privileges: privileges,
    };
  }

  @Get('/teachers/:disciplineID')
  async getTeachersOfDiscipline(
    @QueryAndAuthorizationHeader(TokensValidationPipe, GetTeacherAccessPipe)
    { teacherPrivileges }: GetTeacherAccessPipeOutput,
    @Param('disciplineID') disciplineID: number,
  ): Promise<UserProfile[]> {
    if (!teacherPrivileges) throw new BadRequestException();

    return this.disciplineService.getTeachersOfDiscipline(disciplineID);
  }

  @Get('/groups/:disciplineID')
  async getGroupsOfDiscipline(
    @QueryAndAuthorizationHeader(TokensValidationPipe, GetTeacherAccessPipe)
    { teacherPrivileges }: GetTeacherAccessPipeOutput,
    @Param('disciplineID') disciplineID: number,
  ): Promise<Group[]> {
    if (!teacherPrivileges) throw new BadRequestException();

    return this.disciplineService.getGroupsOfDiscipline(disciplineID);
  }

  @Post()
  async createDiscipline(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges, token }: GetPrivilegesPipeOutput,
    @Body('disciplineName') disciplineName: string,
  ): Promise<{ disciplineID: number }> {
    if (!privileges.disciplinesAdder)
      throw new UnauthorizedException("You don't have rights to do it");

    return {
      disciplineID: await this.disciplineService.create({
        disciplineName,
        ownerID: token.userID,
      }),
    };
  }

  @Delete('/:disciplineID')
  async deleteDiscipline(
    @QueryAndAuthorizationHeader(TokensValidationPipe, GetTeacherAccessPipe)
    { teacherPrivileges, primaryKey }: GetTeacherAccessPipeOutput,
  ): Promise<void> {
    if (!teacherPrivileges.remover)
      throw new UnauthorizedException("You don't have rights to do it");
    return this.disciplineService.delete(primaryKey.disciplineID);
  }

  @Patch('/:id')
  async updateDisciplineContent(
    @QueryAndAuthorizationHeader(TokensValidationPipe)
    { token }: TokensValidationPipeOutput,
    @Body() updates: DisciplineUpdates,
    @Param('id') id: number,
  ): Promise<void> {
    const disciplineWithPriveleges = await this.disciplineService.findOneById(
      id,
      token.userID,
    );
    if (!disciplineWithPriveleges.editor)
      throw new UnauthorizedException("You don't have rights to do it");
    return this.disciplineService.update(id, updates);
  }
}

import {
  Body,
  Controller,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { DisciplinesAnnotationService } from './disciplines-annotation.service';
import { QueryAndAuthorizationHeader } from '../../decorators/query-and-authorization-header.decorator';
import { TokensValidationPipe } from '../../pipes/tokens-validation.pipe';
import {
  GetOwnerAccessPipe,
  GetOwnerAccessPipeOutput,
} from '../../pipes/get-owner-access.pipe';
import { DisciplineAnnotation } from './disciplines-annotation.entity';
import { DisciplineAnnotationDTO } from './dto/discipline-annotation.dto';
import { CustomHeaders } from '../../decorators/custom-headers.decorator';
import {
  GetPrivilegesPipe,
  GetPrivilegesPipeOutput,
} from '../../pipes/get-privileges.pipe';
import { UsersService } from '../users/services/users.service';

interface PrivilegesAndOwnerPipeOut
  extends GetPrivilegesPipeOutput,
    GetOwnerAccessPipeOutput {}

@Controller('disciplines-annotation')
export class DisciplinesAnnotationController {
  constructor(
    private disciplinesAnnotationService: DisciplinesAnnotationService,
    private usersService: UsersService,
  ) {}

  @Post()
  async createDisciplineAnnotation(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetPrivilegesPipe,
      GetOwnerAccessPipe,
    )
    { isOwner, privileges, token }: PrivilegesAndOwnerPipeOut,
    @Query('disciplineID') disciplineID: number,
  ): Promise<DisciplineAnnotationDTO> {
    const cathedra = (await this.usersService.getUserById(token.userID))
      .cathedra;
    const defaultAnnotation: DisciplineAnnotationDTO = {
      electoral: false,
      level: '1',
      course: 1,
      amount: 5,
      language: '',
      cathedra,
      requirements: '',
      courseProgram: '',
      reasonsToStudy: '',
      studyResult: '',
      usages: '',
      materials: '',
      formOfConducting: '',
      semesterControl: '',
      minStudents: 10,
      maxStudents: 100,
      maxContracts: 50,
    };

    if (!isOwner && !privileges.disciplinesAccepter)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.disciplinesAnnotationService.createDisciplinesAnnotation(
      defaultAnnotation,
      disciplineID,
    );
    return defaultAnnotation;
  }
  @Patch()
  async updateDisciplineAnnotation(
    @QueryAndAuthorizationHeader(TokensValidationPipe, GetOwnerAccessPipe)
    { isOwner, query }: GetOwnerAccessPipeOutput,
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Body('annotation') annotation: DisciplineAnnotation,
  ): Promise<void> {
    const {
      electoral,
      level,
      amount,
      course,
      language,
      cathedra,
      requirements,
      courseProgram,
      reasonsToStudy,
      studyResult,
      usages,
      materials,
      formOfConducting,
      semesterControl,
      minStudents,
      maxStudents,
      maxContracts,
    } = annotation;

    if (!isOwner && !privileges.disciplinesAccepter)
      throw new UnauthorizedException("You don't have rights to do it");
    this.disciplinesAnnotationService.updateDisciplineAnnotation(
      {
        electoral,
        level,
        amount,
        course,
        language,
        cathedra,
        requirements,
        courseProgram,
        reasonsToStudy,
        studyResult,
        usages,
        materials,
        formOfConducting,
        semesterControl,
        minStudents,
        maxStudents,
        maxContracts,
      },
      query.disciplineID,
    );
  }
  @Patch('/accept')
  async acceptDisciplineAnnotation(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Query('disciplineID') disciplineID: number,
    @Body('confirmed') confirmed: boolean,
  ): Promise<void> {
    if (!privileges.disciplinesAccepter)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.disciplinesAnnotationService.acceptDisciplineAnnotation(
      confirmed,
      disciplineID,
    );
  }
}

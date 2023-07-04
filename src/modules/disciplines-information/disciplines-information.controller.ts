import {
  Body,
  Controller,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { DisciplinesInformationService } from './disciplines-information.service';
import { QueryAndAuthorizationHeader } from '../../decorators/query-and-authorization-header.decorator';
import { TokensValidationPipe } from '../../pipes/tokens-validation.pipe';
import {
  GetOwnerAccessPipe,
  GetOwnerAccessPipeOutput,
} from '../../pipes/get-owner-access.pipe';
import { DisciplinesInformationDTO } from './dto/disciplines-information.dto';
import {
  GetPrivilegesPipe,
  GetPrivilegesPipeOutput,
} from 'src/pipes/get-privileges.pipe';
import { CustomHeaders } from 'src/decorators/custom-headers.decorator';

@Controller('disciplines-information')
export class DisciplinesInformationController {
  constructor(
    private disciplinesInformationService: DisciplinesInformationService,
  ) {}

  @Post()
  async createDisciplineInformation(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetPrivilegesPipe,
      GetOwnerAccessPipe,
    )
    { isOwner }: GetOwnerAccessPipeOutput,
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Query('disciplineID') disciplineID: number,
  ): Promise<DisciplinesInformationDTO> {
    if (!isOwner && !privileges.disciplinesAccepter)
      throw new UnauthorizedException("You don't have rights to do it");
    const defaultInformation: DisciplinesInformationDTO = {
      hours: 0,
      lections: 0,
      lectionsIndividual: 0,
      practices: 0,
      practicesIndividual: 0,
      labs: 0,
      labsIndividual: 0,
      individuals: 0,
      independentWorks: 0,
      exam: false,
      moduleControlWorks: 0,
      computerPractice: 0,
      controlWorks: 0,
      settlementWork: 0,
      homeControlWork: 0,
      essay: 0,
    };
    await this.disciplinesInformationService.createDisciplinesInformation(
      defaultInformation,
      disciplineID,
    );
    return defaultInformation;
  }

  @Patch()
  async updateDisciplineInformation(
    @QueryAndAuthorizationHeader(TokensValidationPipe, GetOwnerAccessPipe)
    { isOwner, query }: GetOwnerAccessPipeOutput,
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Body('info')
    disciplineInformation: DisciplinesInformationDTO,
  ): Promise<void> {
    if (!isOwner && !privileges.disciplinesAccepter)
      throw new UnauthorizedException("You don't have rights to do it");
    await this.disciplinesInformationService.updateDisciplineInformation(
      disciplineInformation,
      query.disciplineID,
    );
  }
}

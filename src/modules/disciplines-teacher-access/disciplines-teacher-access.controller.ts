import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { DisciplinesTeacherAccess } from './disciplines-teacher-access.entity';
import { DisciplinesTeacherAccessService } from './disciplines-teacher-access.service';
import {
  DisciplinesTeacherAccessPrimaryKey,
  DisciplinesTeacherAccessUpdates,
} from './dto/disciplines-teacher-access.dto';
import { QueryAndAuthorizationHeader } from '../../decorators/query-and-authorization-header.decorator';
import {
  TokensValidationPipe,
  TokensValidationPipeOutput,
} from '../../pipes/tokens-validation.pipe';
import { CustomHeaders } from '../../decorators/custom-headers.decorator';
import {
  GetOwnerAccessPipe,
  GetOwnerAccessPipeOutput,
} from '../../pipes/get-owner-access.pipe';
import { UsersService } from '../users/services/users.service';
import { UserProfileWithPrivileges } from '../users/user.entity';
import { GetTeacherAccessPipe } from 'src/pipes/get-teacher-access.pipe';
import { GetOwnerAndTeacherAccessPipesOutput } from '../activity-content/activity-content.controller';
import {
  GetPrivilegesPipe,
  GetPrivilegesPipeOutput,
} from 'src/pipes/get-privileges.pipe';
import { DisciplinesService } from '../disciplines/disciplines.service';
import { RolesPrivilegesService } from '../roles-privileges/roles-privileges.service';

@Controller('disciplines-teacher-access')
export class DisciplinesTeacherAccessController {
  constructor(
    private disciplinesTeacherAccessService: DisciplinesTeacherAccessService,
    private usersService: UsersService,
    private disciplinesService: DisciplinesService,
    private rolesPrivilegesService: RolesPrivilegesService,
  ) {}

  @Get()
  async getDisciplinesTeacherAccessByPrimaryKey(
    @QueryAndAuthorizationHeader(TokensValidationPipe, GetOwnerAccessPipe)
    { isOwner, token }: GetOwnerAccessPipeOutput,
    @Query() primaryKey: DisciplinesTeacherAccessPrimaryKey,
  ): Promise<DisciplinesTeacherAccess> {
    if (!(isOwner || token.userID == primaryKey.teacherID))
      throw new UnauthorizedException("You don't have rights to do it");
    return this.disciplinesTeacherAccessService.findOne(primaryKey);
  }

  @Post()
  async createDisciplinesTeacherAccess(
    @QueryAndAuthorizationHeader(TokensValidationPipe)
    { token }: TokensValidationPipeOutput,
    @Body('email') email: string,
    @Body('disciplineID') disciplineID: number,
  ): Promise<UserProfileWithPrivileges> {
    const privileges: DisciplinesTeacherAccess = await this.disciplinesTeacherAccessService.findOne(
      { disciplineID, teacherID: token.userID },
    );
    if (!privileges.adder)
      throw new UnauthorizedException("You don't have rights to do it");

    const user = await this.usersService.getUserByEmail(email);
    await this.disciplinesTeacherAccessService.create({
      disciplineID,
      teacherID: user.userID,
      editor: true,
      adder: true,
      remover: true,
    });

    return { ...user, editor: true, remover: true, adder: true };
  }

  @Delete()
  async deleteDisciplinesTeacherAccess(
    @QueryAndAuthorizationHeader(TokensValidationPipe)
    { token }: TokensValidationPipeOutput,
    @Query('disciplineID') disciplineID: number,
    @Query('teacherID') teacherID: number,
  ): Promise<void> {
    const teacherPrivileges: DisciplinesTeacherAccess = await this.disciplinesTeacherAccessService.findOne(
      { disciplineID, teacherID: token.userID },
    );
    const isScientificSecretary = await this.rolesPrivilegesService.checkScientificSecretary(
      teacherID,
    );

    if (!teacherPrivileges.remover || isScientificSecretary)
      throw new UnauthorizedException("You don't have rights to do it");

    return this.disciplinesTeacherAccessService.delete({
      disciplineID,
      teacherID,
    });
  }

  @Patch()
  async updateDisciplinesTeacherAccessContent(
    @CustomHeaders('authorization', TokensValidationPipe)
    { token }: TokensValidationPipeOutput,
    @Body('body') allUpdates: string,
  ): Promise<void> {
    const updates = JSON.parse(allUpdates) as DisciplinesTeacherAccessUpdates[];
    const privileges: DisciplinesTeacherAccess = await this.disciplinesTeacherAccessService.findOne(
      { disciplineID: updates[0].disciplineID, teacherID: token.userID },
    );
    if (!privileges.editor)
      throw new UnauthorizedException("You don't have rights to do it");
    return this.disciplinesTeacherAccessService.update(updates);
  }

  @Patch('/main-teacher')
  async setMainTeacher(
    @QueryAndAuthorizationHeader(
      TokensValidationPipe,
      GetTeacherAccessPipe,
      GetOwnerAccessPipe,
    )
    { teacherPrivileges, isOwner }: GetOwnerAndTeacherAccessPipesOutput,
    @QueryAndAuthorizationHeader(TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Query('disciplineID') disciplineID: number,
    @Query('teacherID') teacherID: number,
  ): Promise<void> {
    if (
      !teacherPrivileges.editor &&
      !isOwner &&
      !privileges.disciplinesAccepter
    )
      throw new UnauthorizedException("You don't have rights to do it");

    await this.disciplinesService.setMainTeacher(disciplineID, teacherID);
  }
}

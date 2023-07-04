import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { RolesPrivilegesService } from './roles-privileges.service';
import {
  RolesPrivileges,
  RolesPrivilegesUpdates,
} from './roles-privileges.entity';
import { RolePrivilegeDto } from './dto/role-privilege.dto';
import { CustomHeaders } from '../../decorators/custom-headers.decorator';
import { TokensValidationPipe } from '../../pipes/tokens-validation.pipe';
import {
  GetPrivilegesPipe,
  GetPrivilegesPipeOutput,
} from '../../pipes/get-privileges.pipe';
import { User } from '../users/user.entity';

@Controller('roles-privileges')
export class RolesPrivilegesController {
  constructor(private rolesPrivilegesService: RolesPrivilegesService) {}
  standartRoles: string[] = ['student', 'teacher', 'editor'];
  @Post()
  async createRolePrivilege(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Body() rolePrivilegeDto: RolePrivilegeDto,
  ): Promise<void> {
    if (!privileges.rolesChanger)
      throw new UnauthorizedException("You don't have rights to do it");
    return this.rolesPrivilegesService.createRolePrivilege(rolePrivilegeDto);
  }

  @Get('/my')
  async getMyPrivileges(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
  ): Promise<RolesPrivileges> {
    return privileges;
  }

  @Get('/all')
  async getAllRolesPrivileges(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
  ): Promise<RolesPrivileges[]> {
    if (!privileges.rolesChanger)
      throw new UnauthorizedException("You don't have rights to do it");
    return this.rolesPrivilegesService.getAllRolesPrivileges();
  }

  @Get()
  async getSingleRole(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Query('roleID') roleID: number,
  ): Promise<{ role: RolesPrivileges; users: User[] }> {
    if (!privileges.rolesChanger)
      throw new UnauthorizedException("You don't have rights to do it");
    const role = await this.rolesPrivilegesService.getRolePrivilegesByRoleId(
      roleID,
    );
    const users = await this.rolesPrivilegesService.getUsersOfRole(roleID);
    return { role, users };
  }

  @Patch()
  async updateRolePrivileges(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Body('allUpdates') updates: RolesPrivilegesUpdates[],
  ): Promise<void> {
    if (!privileges.rolesChanger)
      throw new UnauthorizedException("You don't have rights to do it");
    return this.rolesPrivilegesService.updateRolePrivileges(updates);
  }

  @Delete('/:id')
  async deleteRolePrivilege(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Param('id') id: number,
  ): Promise<void> {
    if (!privileges.rolesChanger)
      throw new UnauthorizedException("You don't have rights to do it");
    const role: RolesPrivileges = await this.rolesPrivilegesService.getRolePrivilegesByRoleId(
      id,
    );
    if (!this.standartRoles.includes(role.roleName))
      return this.rolesPrivilegesService.deleteRolePrivilege(id);
    else
      throw new BadRequestException(
        `You can't delete standart role ${role.roleName}`,
      );
  }
}

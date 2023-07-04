import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRolesService } from './users-roles.service';
import { UsersRoles } from './users-roles.entity';
import { UsersRolesDto } from './dto/users-roles.dto';
import { CustomHeaders } from '../../decorators/custom-headers.decorator';
import { TokensValidationPipe } from '../../pipes/tokens-validation.pipe';
import {
  GetPrivilegesPipe,
  GetPrivilegesPipeOutput,
} from '../../pipes/get-privileges.pipe';
@Controller('users-roles')
export class UsersRolesController {
  constructor(private usersRolesService: UsersRolesService) {}

  @Get('/:id')
  async getUserRolesByUserID(
    @Param('id') userID: number,
  ): Promise<UsersRoles[]> {
    return await this.usersRolesService.getUserRolesByUserID(userID);
  }

  @Delete()
  async deleteUserRoleByDTO(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Query() usersRolesDto: UsersRolesDto,
  ): Promise<void> {
    if (!privileges.rolesChanger)
      throw new UnauthorizedException("You don't have rights to do it");

    return this.usersRolesService.deleteUserRoleByUsersRolesDTO(usersRolesDto);
  }

  @Post()
  async addUsersRoles(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Body() usersRolesDto: UsersRolesDto,
  ): Promise<void> {
    if (!privileges.rolesChanger)
      throw new UnauthorizedException("You don't have rights to do it");
    return this.usersRolesService.addUsersRoles(usersRolesDto);
  }
}

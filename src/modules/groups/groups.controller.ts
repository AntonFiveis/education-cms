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
import { Group } from './group.entity';
import { GroupsService } from './groups.service';
import { TokensValidationPipe } from '../../pipes/tokens-validation.pipe';
import {
  GetPrivilegesPipe,
  GetPrivilegesPipeOutput,
} from '../../pipes/get-privileges.pipe';
import { CustomHeaders } from '../../decorators/custom-headers.decorator';
@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {}
  @Get()
  async getGroupsOnSearch(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Query('search') search: string,
  ): Promise<Group[]> {
    if (
      !privileges.groupMemberAdder &&
      !privileges.groupMemberRemover &&
      !privileges.disciplinesAdder
    )
      throw new UnauthorizedException("You don't have rights to do it");
    return this.groupsService.findOnSearch(search);
  }

  @Get('/:id')
  async getGroupById(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Param('id') id: number,
  ): Promise<Group> {
    if (
      !privileges.groupMemberAdder &&
      !privileges.groupMemberRemover &&
      !privileges.disciplinesAdder
    )
      throw new UnauthorizedException("You don't have rights to do it");

    return this.groupsService.findOneById(id);
  }

  @Post()
  async createGroup(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Body('groupName') groupName: string,
  ): Promise<{ groupID: number }> {
    if (!privileges.groupAdder)
      throw new UnauthorizedException("You don't have rights to do it");
    return { groupID: await this.groupsService.create(groupName) };
  }

  @Delete('/:id')
  async deleteGroup(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Param('id') id: string,
  ): Promise<void> {
    if (!privileges.groupRemover)
      throw new UnauthorizedException("You don't have rights to do it");
    return this.groupsService.delete(id);
  }
}

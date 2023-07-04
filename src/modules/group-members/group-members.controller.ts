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
import { CustomHeaders } from 'src/decorators/custom-headers.decorator';
import { Group } from '../groups/group.entity';
import { TokensValidationPipe } from '../../pipes/tokens-validation.pipe';
import { Token } from '../tokens/tokens.entity';
import { GroupMembersService } from './group-members.service';
import {
  GetPrivilegesPipe,
  GetPrivilegesPipeOutput,
} from '../../pipes/get-privileges.pipe';
import { User } from '../users/user.entity';
import { UsersService } from '../users/services/users.service';
import { GroupsService } from '../groups/groups.service';

@Controller('group-members')
export class GroupMembersController {
  constructor(
    private groupMembersService: GroupMembersService,
    private groupsService: GroupsService,
    private usersService: UsersService,
  ) {}

  // @Get('/:id')
  // async getUserById(@Query('groupID') groupID: number): Promise<GroupMember[]> {
  //     return this.groupMembersService.getStudentsOfTheGroup(groupID);
  // }

  @Get()
  async getMyGroup(
    @CustomHeaders('authorization', TokensValidationPipe)
    { token }: { token: Token },
  ): Promise<Group[]> {
    return this.groupsService.getStudentGroupsById(token.userID);
  }

  @Get('/:id')
  async getMembersOfTheGroup(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Param('id') id: number,
  ): Promise<User[]> {
    const groupMembersModifier: boolean =
      privileges.groupMemberAdder || privileges.groupMemberRemover;
    if (!groupMembersModifier)
      throw new UnauthorizedException("You don't have rights to do it");
    return this.groupMembersService.getStudentsOfTheGroup(id);
  }

  @Post()
  async insertStudents(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Body('email') email: string,
    @Body('groupID') groupID: number,
  ): Promise<User> {
    if (!privileges.groupMemberAdder)
      throw new UnauthorizedException("You don't have rights to do it");

    const user = await this.usersService.getUserByEmail(email);
    await this.groupMembersService.insertStudents({
      groupID,
      studentID: user.userID,
    });
    return user;
  }

  @Delete()
  async removeStudent(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Query('studentID') studentID: number,
  ): Promise<void> {
    if (!privileges.groupMemberRemover)
      throw new UnauthorizedException("You don't have rights to do it");
    this.groupMembersService.removeStudent(studentID);
  }
}

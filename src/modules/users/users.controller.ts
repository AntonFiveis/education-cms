import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
  UnauthorizedException,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';

import {
  UserProfile,
  UserInfoUpdates,
  UserPasswordUpdates,
  User,
} from './user.entity';

import { UsersService } from './services/users.service';
import { UsersDto } from './dto/users.dto';
import { CredentialsDto } from './dto/credentials.dto';
import { Token } from '../tokens/tokens.entity';
import {
  TokensValidationPipe,
  TokensValidationPipeOutput,
} from '../../pipes/tokens-validation.pipe';
import { CustomHeaders } from 'src/decorators/custom-headers.decorator';
import { UserClientDto } from './dto/user-client.dto';
import {
  GetPrivilegesPipe,
  GetPrivilegesPipeOutput,
} from 'src/pipes/get-privileges.pipe';
import { QueryAndAuthorizationHeader } from '../../decorators/query-and-authorization-header.decorator';
import { RolesPrivilegesService } from '../roles-privileges/roles-privileges.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersPasswordsService } from './services/users-passwords.service';
import { Response } from 'express';
@Controller('users')
export class UsersController {
  constructor(
    private userService: UsersService,
    private usersPasswordsService: UsersPasswordsService,
    private rolesPrivilegesService: RolesPrivilegesService,
  ) {}

  @Get('/me')
  async getUserProfile(
    @CustomHeaders('authorization', TokensValidationPipe)
    { token }: { token: Token },
  ): Promise<UserProfile> {
    const {
      firstName,
      lastName,
      patronymic,
      email,
      cathedra,
      faculty,
      contract,
    } = await this.userService.getUserById(token.userID);
    return {
      firstName,
      lastName,
      patronymic,
      email,
      cathedra,
      faculty,
      contract,
    };
  }

  @Get()
  async getSingleUser(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Query('email') userEmail: string,
  ): Promise<UserProfile> {
    if (!privileges.rolesChanger)
      throw new UnauthorizedException("You don't have rights to do it");

    const {
      userID,
      firstName,
      lastName,
      patronymic,
      email,
      cathedra,
      faculty,
      contract,
    } = await this.userService.getUserByEmail(userEmail);
    return {
      userID,
      firstName,
      lastName,
      patronymic,
      email,
      cathedra,
      faculty,
      contract,
    };
  }

  @Post()
  async createUser(@Body(ValidationPipe) userDto: UsersDto): Promise<Token> {
    return this.userService.createUser(userDto);
  }

  @Get('/group')
  async getGroupPasswords(
    @QueryAndAuthorizationHeader(TokensValidationPipe)
    { token }: TokensValidationPipeOutput,
    @Query('groupID') groupID: number,
  ): Promise<User[]> {
    const isScientificSecretary = await this.rolesPrivilegesService.checkScientificSecretary(
      token.userID,
    );
    if (!isScientificSecretary)
      throw new UnauthorizedException("You don't have rights to do it");
    return this.usersPasswordsService.getUsersPasswordsOfGroup(groupID);
  }
  @Get('/group/csv')
  async getGroupPasswordsCsv(
    @QueryAndAuthorizationHeader(TokensValidationPipe)
    { token }: TokensValidationPipeOutput,
    @Query('groupID') groupID: number,
    @Res() res: Response,
  ): Promise<void> {
    const isScientificSecretary = await this.rolesPrivilegesService.checkScientificSecretary(
      token.userID,
    );
    if (!isScientificSecretary)
      throw new UnauthorizedException("You don't have rights to do it");

    const stream = await this.usersPasswordsService.generateCSVUsersPasswordsOfGroup(
      groupID,
    );
    res.attachment(`group-${groupID}.csv`);
    stream.pipe(res);
  }
  @Post('/group')
  @UseInterceptors(FileInterceptor('file'))
  async registerGroup(
    @QueryAndAuthorizationHeader(TokensValidationPipe)
    { token }: TokensValidationPipeOutput,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    const isScientificSecretary = await this.rolesPrivilegesService.checkScientificSecretary(
      token.userID,
    );
    if (!isScientificSecretary)
      throw new UnauthorizedException("You don't have rights to do it");
    return this.userService.registerGroup(file);
  }
  // @Patch()
  // async updateUser(
  //   @CustomHeaders('authorization', TokensValidationPipe)
  //   { token }: { token: Token },
  //   @Body() userUpdates: UserInfoUpdates,
  // ): Promise<void> {
  //
  //   return this.userService.updateUserInfoById(token.userID, userUpdates);
  // }

  @Delete()
  async deleteUser(
    @CustomHeaders('authorization', TokensValidationPipe)
    { token }: { token: Token },
  ): Promise<void> {
    return this.userService.deleteUser(token.userID);
  }

  @Post('/signIn')
  async signIn(@Body() credentialsDto: CredentialsDto): Promise<UserClientDto> {
    return this.userService.signIn(credentialsDto);
  }

  @Post('/signOut')
  async signOut(
    @CustomHeaders('authorization', TokensValidationPipe)
    { token }: { token: Token },
  ): Promise<void> {
    return this.userService.signOut(token.token);
  }

  @Get('check/:token')
  async checkUser(@Param('token') token: string): Promise<string> {
    return this.userService.checkUser(token);
  }

  @Patch('/password')
  async updatePassword(
    @CustomHeaders('authorization', TokensValidationPipe)
    { token }: { token: Token },
    @Body() { oldPassword, newPassword }: UserPasswordUpdates,
  ): Promise<void> {
    return await this.userService.updateUserPasswordById(
      token.userID,
      oldPassword,
      newPassword,
    );
  }
}

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PgService } from '../../pg/pg.service';
import { User, UserInfoUpdates } from '../user.entity';
import { GroupUsersDro, UsersDto } from '../dto/users.dto';
import * as bcrypt from 'bcrypt';
import { CredentialsDto } from '../dto/credentials.dto';
import { validatePassword } from '../user.entity';
import { TokensService } from '../../tokens/tokens.service';
import { Token } from '../../tokens/tokens.entity';
import { UserClientDto } from '../dto/user-client.dto';
import { GroupsService } from '../../groups/groups.service';
import { GroupMembersService } from '../../group-members/group-members.service';
import { UsersPasswordsService } from './users-passwords.service';
import * as fs from 'fs';
import * as iconv from 'iconv-lite';
import { UsersControlComponentsAnswersService } from '../../control-components-tasks/services/users-control-components-answers.service';
@Injectable()
export class UsersService {
  constructor(
    private pgService: PgService,
    private usersPasswordsService: UsersPasswordsService,
    private tokensService: TokensService,
    private groupsService: GroupsService,
    private groupMembersService: GroupMembersService,
  ) {}
  private addFunction = 'AddUser';
  private updateInfoFunction = 'UpdateUserInfo';
  private updatePasswordFunction = 'UpdateUserPassword';
  private deleteFunction = 'DeleteUser';

  async getUserById(userID: number): Promise<User> {
    const res = await this.pgService.findOne<User>({
      tableName: User.tableName,
      where: { userID },
    });
    return res;
  }

  async getUserByEmail(email: string): Promise<User> {
    const res = await this.pgService.findOne<User>({
      tableName: User.tableName,
      where: { email },
    });
    return res;
  }

  async updateUserInfoById(
    id: number,
    { firstName, lastName, patronymic }: UserInfoUpdates,
  ): Promise<void> {
    await this.pgService.useQuery(
      `SELECT "${this.updateInfoFunction}" (${id}, '${firstName}', '${lastName}', '${patronymic}')`,
    );
  }

  async updateUserPasswordById(
    id: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.getUserById(id);
    await validatePassword(oldPassword, user);

    const salt = await bcrypt.genSalt();
    const pass = await bcrypt.hash(newPassword, salt);
    await this.pgService.useQuery(
      `SELECT "${this.updatePasswordFunction}" (${id}, '${pass}', '${salt}')`,
    );
    try {
      await this.usersPasswordsService.setUserPasswordChanged(id);
    } catch (e) {
      console.log(e);
    }
    // const newToken = await this.tokensService.postToken({ userID: id });
    // return newToken.token;
  }

  async updateUserAvatarInfo(userID: number, avatar: string): Promise<void> {
    await this.pgService.update({
      tableName: User.tableName,
      updates: { avatar },
      where: { userID },
    });
  }

  async createUser({
    firstName,
    lastName,
    patronymic,
    email,
    password,
    cathedra = 'АСОІУ',
    faculty = 'ФІОТ',
  }: UsersDto): Promise<Token> {
    const salt = await bcrypt.genSalt();
    const pass = await bcrypt.hash(password, salt);
    try {
      await this.pgService.useQuery(`BEGIN;`);
      const res = await this.pgService.useQuery(
        `SELECT "${this.addFunction}" ('${firstName}', '${lastName}', '${patronymic}', '${email}', '${cathedra}', '${faculty}','${pass}', '${salt}');`,
      );
      const token = await this.tokensService.postToken({
        userID: res.rows[0][this.addFunction],
      });
      await this.pgService.useQuery('COMMIT');
      return token;
    } catch (error) {
      await this.pgService.useQuery('ROLLBACK');
      return error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.getUserById(id);
    if (user.avatar) {
      if (fs.existsSync(`./avatars/${user.avatar}`))
        fs.unlinkSync(`./avatars/${user.avatar}`);
      if (fs.existsSync(`./pictograms/${user.avatar}`))
        fs.unlinkSync(`./pictograms/${user.avatar}`);
    }
    await this.pgService.useQuery(`SELECT ${this.deleteFunction} (${id})`);
  }

  async signIn({ email, password }: CredentialsDto): Promise<UserClientDto> {
    const loginDetails: User = await this.pgService.findOne<User>({
      tableName: User.tableName,
      where: { email },
    });
    if (loginDetails && (await validatePassword(password, loginDetails))) {
      const {
        firstName,
        lastName,
        patronymic,
        avatar,
        cathedra,
        faculty,
        contract,
      } = loginDetails;
      const tokenDetails = await this.tokensService.postToken({
        userID: loginDetails.userID,
      });
      return {
        email,
        firstName,
        lastName,
        patronymic,
        token: tokenDetails.token,
        avatar,
        cathedra,
        faculty,
        contract,
      };
    } else throw new BadRequestException('Invalid email or password');
  }

  async checkToken(bearer: string): Promise<Token> {
    const tokenString = bearer.split('Bearer ')[1];
    const token = await this.tokensService.verifyToken(tokenString);
    if (!token) {
      throw new BadRequestException('Invalid token');
    }
    return token;
  }

  async checkUser(tokenStr: string): Promise<string> {
    const token = await this.tokensService.verifyToken(tokenStr);
    if (!token) throw new UnauthorizedException('Token is invalid');

    return token.token;
  }

  async signOut(tokenStr: string): Promise<void> {
    return this.tokensService.deleteToken(tokenStr);
  }

  async registerGroup(file: Express.Multer.File): Promise<void> {
    const data = iconv.decode(file.buffer, 'win1251');
    const array = this.csvToArray(data, ';');
    for (const st of array.filter((s) => s.email != undefined)) {
      const password = Array.from({ length: 8 }, () =>
        Math.round(Math.random() * 16).toString(16),
      ).join('');
      const user = await this.getUserByEmail(st.email);
      let token;
      if (!user) {
        token = await this.createUser({
          email: st.email,
          firstName: st.firstName,
          lastName: st.lastName,
          patronymic: st.patronymic,
          password,
          cathedra: st.cathedra,
          faculty: st.faculty,
        });
      }
      await this.usersPasswordsService.addUserPassword({
        userID: user ? user.userID : token.userID,
        password,
      });

      const userGroups = await this.groupsService.getStudentGroupsById(
        user ? user.userID : token.userID,
      );
      let groups = await this.groupsService.findOnSearch(st.group);
      if (groups.length == 0) {
        await this.groupsService.create(st.group);
        groups = await this.groupsService.findOnSearch(st.group);
      }
      for (const group of groups) {
        if (!userGroups.find((g) => g.groupID == group.groupID))
          await this.groupMembersService.insertStudents({
            groupID: group.groupID,
            studentID: user ? user.userID : token.userID,
          });
      }
    }
  }

  csvToArray(str: string, delimiter = ','): GroupUsersDro[] {
    const headers = [
      'lastName',
      'firstName',
      'patronymic',
      'faculty',
      'cathedra',
      'group',
      'email',
    ];
    // const headers = str
    //   .slice(0, str.indexOf('\r\n'))
    //   .split(delimiter)
    //   .map((header, index) => {
    //     return dictionary[index];
    //   });

    const rows = str.slice(str.indexOf('\n') + 1).split('\r\n');

    const arr = rows
      .filter((r) => r.length > 0)
      .map((row) => {
        const values = row.split(delimiter);
        const el = headers.reduce((object, header, index) => {
          object[header] = values[index].trim().replace(`'`, `''`);
          return object;
        }, {});
        return el;
      });
    return arr as GroupUsersDro[];
  }
}

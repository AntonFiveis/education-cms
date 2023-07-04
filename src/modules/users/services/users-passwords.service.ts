import { Injectable } from '@nestjs/common';
import { PgService } from '../../pg/pg.service';
import { User } from '../user.entity';
import { GroupMembersService } from '../../group-members/group-members.service';
import UsersPasswordsDTO from '../dto/users-passwords.dto';
import { Readable } from 'stream';

@Injectable()
export class UsersPasswordsService {
  constructor(
    private pgService: PgService,
    private groupMembersService: GroupMembersService,
  ) {}
  private tableName = 'UsersPasswords';
  async getUsersPasswordsOfGroup(groupID: number): Promise<User[]> {
    const users = await this.groupMembersService.getStudentsOfTheGroup(groupID);
    return (
      await Promise.all(
        users.map(async (u) => {
          const userPassword = await this.getUserPassword(u.userID);
          return {
            ...u,
            password: userPassword?.password ?? undefined,
          } as User;
        }),
      )
    ).sort((a, b) =>
      (a.lastName + a.firstName + a.patronymic).localeCompare(
        b.lastName + b.firstName + b.patronymic,
      ),
    );
  }
  async getUserPassword(userID: number): Promise<UsersPasswordsDTO> {
    return this.pgService.findOne({
      tableName: this.tableName,
      where: { userID },
    });
  }
  async generateCSVUsersPasswordsOfGroup(groupID: number): Promise<Readable> {
    const usersWithPasswords = await this.getUsersPasswordsOfGroup(groupID);
    let data = [];
    if (usersWithPasswords.length != 0) {
      data = [
        Object.keys(usersWithPasswords[0])
          .map((k) => k)
          .join(',') + '\r\n',
        ...usersWithPasswords.map((uwp) => {
          return (
            Object.keys(uwp)
              .map((k) => String(uwp[k]))
              .join(',') + '\r\n'
          );
        }),
      ];
    }

    const usersWithPasswordsBuffer = Buffer.from(data.join(''));
    const stream = new Readable();
    stream.push(usersWithPasswordsBuffer);
    stream.push(null);
    return stream;
  }

  async addUserPassword(usersPasswordsDTO: UsersPasswordsDTO): Promise<void> {
    await this.pgService.create({
      tableName: this.tableName,
      values: [usersPasswordsDTO],
    });
  }
  async setUserPasswordChanged(userID: number): Promise<void> {
    await this.pgService.update({
      tableName: this.tableName,
      updates: { password: '********' },
      where: { userID },
    });
  }
}

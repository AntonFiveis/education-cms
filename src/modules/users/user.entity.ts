import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
export class User {
  userID: number;
  firstName: string;
  lastName: string;
  patronymic: string;
  email: string;
  password: string;
  salt: string;
  static tableName = 'Users';
  avatar?: string;
  cathedra: string;
  faculty: string;
  contract: boolean;
}

export class UserInfoUpdates {
  firstName: string;
  lastName: string;
  patronymic: string;
}

export interface UserPasswordUpdates {
  oldPassword: string;
  newPassword: string;
}
export class UserProfile {
  userID?: number;
  firstName: string;
  lastName: string;
  patronymic: string;
  email: string;
  cathedra: string;
  faculty: string;
  contract: boolean;
}
export interface ShortProfile {
  userID?: number;
  firstName: string;
  lastName: string;
  patronymic: string;
  email: string;
}

export interface UserProfileWithPrivileges extends UserProfile {
  adder: boolean;
  editor: boolean;
  remover: boolean;
}

export async function validatePassword(
  password: string,
  loginDetails: User,
): Promise<boolean> {
  if (
    (await bcrypt.hash(password, loginDetails.salt)) === loginDetails.password
  ) {
    return true;
  } else {
    throw new UnauthorizedException('Incorrect credentials');
  }
}

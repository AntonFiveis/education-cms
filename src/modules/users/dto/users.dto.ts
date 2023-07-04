import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
export class UsersDto {
  firstName: string;
  lastName: string;
  patronymic: string;
  cathedra?: string;
  faculty?: string;
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message:"password too weak"})
  password: string;
}

export class GroupUsersDro {
  lastName: string;
  firstName: string;
  patronymic: string;
  faculty: string;
  cathedra: string;
  @IsString()
  @IsNotEmpty()
  group: string;
  @IsString()
  @IsNotEmpty()
  email: string;
}

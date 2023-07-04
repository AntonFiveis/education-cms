export interface UserClientDto {
  email: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  token: string;
  avatar?: string;
  cathedra?: string;
  faculty?: string;
  contract: boolean;
}

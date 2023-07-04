import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { DisciplinesTeacherAccessService } from '../modules/disciplines-teacher-access/disciplines-teacher-access.service';
import { DisciplinesTeacherAccessPrimaryKey } from '../modules/disciplines-teacher-access/dto/disciplines-teacher-access.dto';
import { DisciplinesTeacherAccess } from '../modules/disciplines-teacher-access/disciplines-teacher-access.entity';
import { TokensValidationPipeOutput } from './tokens-validation.pipe';
import { Token } from 'src/modules/tokens/tokens.entity';
import { GetOwnerAccessPipeOutput } from './get-owner-access.pipe';

@Injectable()
export class GetTeacherAccessPipe implements PipeTransform {
  constructor(
    private disciplinesTeacherAccessService: DisciplinesTeacherAccessService,
  ) {}

  async transform(data: {
    token: Token;
    params: { disciplineID?: number };
    isOwner: boolean;
    query: { disciplineID?: number };
  }): Promise<GetTeacherAccessPipeOutput> {
    try {
      // if(data.isOwner){
      //     return {...data,privileges:{remover:true,adder:true,editor:true}, primaryKey:{teacherID:data.token.userID,disciplineID:data.query.disciplineID}}
      // }
      // console.log(data)
      const teacherID: number = data.token.userID;
      const primaryKey: DisciplinesTeacherAccessPrimaryKey = {
        disciplineID: data.params.disciplineID || data.query.disciplineID,
        teacherID,
      };
      const teacherPrivileges: DisciplinesTeacherAccess = await this.disciplinesTeacherAccessService.findOne(
        primaryKey,
      );
      return {
        ...data,
        teacherPrivileges,
        primaryKey,
      } as GetTeacherAccessPipeOutput;
    } catch (err) {
      throw new BadRequestException('Bad Request');
    }
  }
}

export interface GetTeacherAccessPipeOutput
  extends TokensValidationPipeOutput,
    GetOwnerAccessPipeOutput {
  teacherPrivileges: DisciplinesTeacherAccess;
  primaryKey: DisciplinesTeacherAccessPrimaryKey;
}

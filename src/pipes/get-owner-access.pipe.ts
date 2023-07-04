import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { DisciplinesService } from '../modules/disciplines/disciplines.service';
import { Token } from '../modules/tokens/tokens.entity';

interface GetOwnerAccessPipeProps {
  token: Token;
  query: { disciplineID: number };
  params?: { disciplineID: number };
}
@Injectable()
export class GetOwnerAccessPipe implements PipeTransform {
  constructor(private disciplinesService: DisciplinesService) {}

  async transform(
    data: GetOwnerAccessPipeProps,
  ): Promise<GetOwnerAccessPipeOutput> {
    const { token, query, params } = data;
    try {
      const discipline = await this.disciplinesService.findOneWithoutPrivileges(
        query.disciplineID || params.disciplineID,
      );
      const isOwner = token.userID === discipline.ownerID;
      return { ...data, isOwner, token, query, params };
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Bad Request');
    }
  }
}
export interface GetOwnerAccessPipeOutput extends GetOwnerAccessPipeProps {
  isOwner: boolean;
}

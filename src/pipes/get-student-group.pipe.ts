import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { GroupsService } from 'src/modules/groups/groups.service';
import { Token } from 'src/modules/tokens/tokens.entity';

@Injectable()
export default class GetStudentGroupPipe implements PipeTransform {
  constructor(private groupsService: GroupsService) {}
  async transform(data: { token: Token }): Promise<GetStudentGroupPipeOutput> {
    try {
      const groups = await this.groupsService.getStudentGroupsById(
        data.token.userID,
      );
      return { ...data, groupIDs: groups.map((g) => g.groupID) };
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Bad Request');
    }
  }
}

export interface GetStudentGroupPipeOutput {
  token: Token;
  groupIDs: number[];
}

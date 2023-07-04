import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { DisciplinesGroupAccessService } from '../modules/disciplines-group-access/disciplines-group-access.service';
import { DisciplinesGroupAccess } from '../modules/disciplines-group-access/disciplines-group-access.entity';
import { RolesPrivileges } from 'src/modules/roles-privileges/roles-privileges.entity';
import { Token } from 'src/modules/tokens/tokens.entity';
import { DisciplinesTeacherAccess } from 'src/modules/disciplines-teacher-access/disciplines-teacher-access.entity';

export interface GetGroupAccessPipeProps {
  params: {
    disciplineID: number;
  };
  access: boolean;
  privileges: RolesPrivileges;
  teacherPrivileges?: DisciplinesTeacherAccess;
  groupIDs: number[];
  token: Token;
}
@Injectable()
export class GetGroupAccessPipe implements PipeTransform {
  constructor(
    private disciplinesGroupAccessService: DisciplinesGroupAccessService,
  ) {}
  async transform(
    data: GetGroupAccessPipeProps,
  ): Promise<GetGroupAccessPipeProps> {
    try {
      if (data.access || data.privileges?.disciplinesAccepter) {
        return data;
      }
      for (let i = 0; i < data.groupIDs.length; i++) {
        const groupAccess: DisciplinesGroupAccess = await this.disciplinesGroupAccessService.findOne(
          { groupID: data.groupIDs[i], disciplineID: data.params.disciplineID },
        );
        if (groupAccess) {
          return { ...data, access: true };
        }
      }
      return data;
    } catch (err) {
      throw new BadRequestException();
    }
  }
}

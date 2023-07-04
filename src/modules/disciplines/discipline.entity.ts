import { DisciplineAnnotation } from '../disciplines-annotation/disciplines-annotation.entity';
import { DisciplinesInformation } from '../disciplines-information/disciplines-information.entity';
import { RolesPrivileges } from '../roles-privileges/roles-privileges.entity';

export class Discipline {
  disciplineID: number;
  disciplineName: string;
  ownerID: number;
  content: string;
}
export class DisciplineWithAttestation extends Discipline {
  firstAttestation: number;
  secondAttestation: number;
}
export class ExtendedDiscipline extends Discipline {
  ownerName: number;
  adder: boolean;
  editor: boolean;
  remover: boolean;
  annotation?: DisciplineAnnotation;
  info?: DisciplinesInformation;
  privileges?: RolesPrivileges;
}

export class DisciplinesTeacherAccessDto {
  disciplineID: number;
  teacherID: number;
  editor: boolean;
  adder: boolean;
  remover: boolean;
}

export interface DisciplinesTeacherAccessUpdates {
  disciplineID: number;
  teacherID: number;
  editor?: boolean;
  adder?: boolean;
  remover?: boolean;
}

export interface DisciplinesTeacherAccessPrimaryKey {
  disciplineID: number;
  teacherID: number;
}

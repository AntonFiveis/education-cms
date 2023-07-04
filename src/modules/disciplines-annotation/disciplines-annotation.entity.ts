export interface DisciplineAnnotation {
  disciplineAnnotationID: number;
  electoral: boolean;
  level: string;
  amount: number;
  course: number;
  language: string;
  cathedra: string;
  requirements: string;
  courseProgram: string;
  reasonsToStudy: string;
  studyResult: string;
  usages: string;
  materials: string;
  formOfConducting: string;
  semesterControl: string;
  confirmed: boolean;
  minStudents: number;
  maxStudents: number;
  maxContracts: number;
}

export interface DisciplinesInformation {
  disciplineInformationID: number;
  // годин
  hours: number;
  // лекції
  lections: number;
  // лекціїІЗ
  lectionsIndividual: number;
  //практ
  practices: number;
  // практІЗ
  practicesIndividual: number;
  //лаб
  labs: number;
  // лабІЗ
  labsIndividual: number;
  // ІЗ
  individuals: number;
  // СРС
  independentWorks: number;
  // Екзамен
  exam: boolean;
  // МКР
  moduleControlWorks: number;
  // КП
  computerPractice: number;
  // КР
  controlWorks: number;
  // розрахункова
  settlementWork: number;
  // ДКР
  homeControlWork: number;
  // реферат
  essay: number;
}

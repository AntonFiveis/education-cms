export type SelectionType = 'shuffle' | 'unique' | 'byIndex';

export interface ControlComponents {
  controlComponentID: number;
  maxPoint: number;
  type: string;
  extraPoints: number;
  mandatory: boolean;
  triesCount: number;
  autocheck: boolean;
  hasPenalty: boolean;
  threshold: number;
  penaltyPercentage: number;
  penaltyDimension: string;
  minPoint: number;
  penaltyComment: string;
  startDate: Date;
  deadlineDate: Date;
  finalDate: Date;
  timeLimit: number;
  isTeacher: boolean;
  tryPenalty: number;
  taskCountNOfM: number;
  showStudentCorrectAnswer: boolean;
  canGoPrev: boolean;
  sortRandomly: boolean;
}

export interface ControlComponentsDTO {
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
  taskCountNOfM: number;
  showStudentCorrectAnswer: boolean;
}

export interface ControlComponentsUpdates {
  name?: string;
  type?: string;
  maxPoint?: string;
  extraPoints?: number;
  mandatory?: boolean;
  triesCount?: number;
  autocheck?: boolean;
  hasPenalty?: boolean;
  threshold?: number;
  penaltyPercentage?: number;
  penaltyDimension?: string;
  minPoint?: number;
  penaltyComment?: string;
  startDate?: Date;
  deadlineDate?: Date;
  finalDate?: Date;
  timeLimit?: number;
  tryPenalty?: number;
  taskCountNOfM?: number;
  showStudentCorrectAnswer?: boolean;
}

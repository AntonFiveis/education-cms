export interface ControlComponentsTasksDTO {
  index: number;
  controlComponentID: number;
  maxPoint: number;
  choosingType: string;
  type: string;
}
export interface ControlComponentsTasksUpdates {
  index?: number;
  maxPoint?: number;
  choosingType?: string;
  type?: string;
}

export interface ActivityComponentDto {
  activityID: number;
  type: string;
  name: string;
  index: number;
}

export interface ActivityComponentUpdates {
  name?: string;
  index?: number;
}

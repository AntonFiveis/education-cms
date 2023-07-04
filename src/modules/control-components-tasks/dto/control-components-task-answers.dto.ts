export interface ControlComponentsTaskAnswersDTO {
  variantID: number;
  correct: boolean;
  text: string;
}
export interface ControlComponentsTaskAnswersUpdates {
  correct?: boolean;
  text?: string;
}

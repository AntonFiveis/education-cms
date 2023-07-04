export class AbstractPostDto {
  readonly title: string;
  readonly content: string;
  readonly ownerID: number;
}

export interface AbstractPostUpdates {
  title: string;
  content: string;
}

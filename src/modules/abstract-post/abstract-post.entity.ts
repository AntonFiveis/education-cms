export class AbstractPost {
  id: number;
  title: string;
  content: string;
  ownerID: number;
  translit: string;
  // createdAt?: Date;
  // updatedAt?: Date;
}

export class AbstractPostClient {
  title: string;
  content: string;
  ownerName: string;
  translit: string;
}

export interface AbstractPostSearchOutput {
  id: number;
  title: string;
  translit: string;
  type: string;
}

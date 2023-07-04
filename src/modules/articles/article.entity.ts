import { AbstractPost } from '../abstract-post/abstract-post.entity';

export class Article extends AbstractPost {
  parentID: number;
}

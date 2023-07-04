import { AbstractPostDto } from 'src/modules/abstract-post/dto/abstract-post.dto';

export class ArticleDto extends AbstractPostDto {
  parentID: number;
}

import { Injectable } from '@nestjs/common';
import { AbstractPostService } from '../abstract-post/abstract-post.service';

@Injectable()
export class NewsService extends AbstractPostService {
  protected tableName = 'News';
  protected addFunction = 'AddNews';
  protected updateFunction = 'UpdateNews';
  protected deleteFunction = 'DeleteNews';
  protected type = 'news';
}

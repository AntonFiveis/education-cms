import { Injectable } from '@nestjs/common';
import { getTranslitToLat } from 'src/helpers/translit';
import { AbstractPostService } from '../abstract-post/abstract-post.service';
import { AbstractPostUpdates } from '../abstract-post/dto/abstract-post.dto';
import { PgService } from '../pg/pg.service';
import { Article } from './article.entity';
import { ArticleDto } from './dto/article.dto';

@Injectable()
export class ArticlesService extends AbstractPostService {
  protected tableName = 'Articles';
  protected addFunction = 'AddArticle';
  protected updateFunction = 'UpdateArticle';
  protected deleteFunction = 'DeleteArticle';
  protected type = 'article';

  constructor(protected pgService: PgService) {
    super(pgService);
  }

  async create(articleDto: ArticleDto): Promise<{ translit: string }> {
    const getRepeatedPosts = await this.pgService.find({
      tableName: this.tableName,
      where: { title: articleDto.title },
    });
    const translit =
      getTranslitToLat(articleDto.title) +
      (getRepeatedPosts.length !== 0 ? `(${getRepeatedPosts.length})` : '');

    const { title, content, ownerID, parentID } = articleDto;

    await this.pgService.useQuery(
      `SELECT "${this.addFunction}" ($1, $2, $3, $4, $5)`,
      [title, content, translit, ownerID, parentID],
    );
    return { translit };
  }

  async getMainMenu(): Promise<Article[]> {
    const res = await this.pgService.useQuery(`SELECT * FROM "MainMenu"`);
    return res.rows;
  }

  async delete(id: string): Promise<void> {
    this.pgService.useQuery(`SELECT "${this.deleteFunction}" (${id})`);
  }

  async update(id: string, updates: AbstractPostUpdates): Promise<string> {
    const { title, content } = updates;
    const getRepeatedPosts = await this.pgService.find({
      tableName: this.tableName,
      where: { title },
    });
    const translit =
      getTranslitToLat(title) +
      (getRepeatedPosts.length > 1 ? `(${getRepeatedPosts.length})` : '');

    await this.pgService.useQuery(
      `SELECT "${this.updateFunction}" (${id}, $1, $2, $3)`,
      [id, title, content, translit],
    );
    return translit;
  }
}

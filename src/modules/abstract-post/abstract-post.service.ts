import { Injectable } from '@nestjs/common';
import { getTranslitToLat } from 'src/helpers/translit';
import { PgService } from '../pg/pg.service';
import { AbstractPost, AbstractPostSearchOutput } from './abstract-post.entity';
import { AbstractPostDto, AbstractPostUpdates } from './dto/abstract-post.dto';

@Injectable()
export class AbstractPostService {
  constructor(protected pgService: PgService) {}
  protected tableName: string;
  protected addFunction: string;
  protected updateFunction: string;
  protected deleteFunction: string;
  protected getFunction = 'GetAbstractPostByTranslit';
  protected type: string;

  async create(
    abstractPostDto: AbstractPostDto,
  ): Promise<{ translit: string }> {
    const getRepeatedPosts = await this.pgService.find({
      tableName: this.tableName,
      where: { title: abstractPostDto.title },
    });
    const translit =
      getTranslitToLat(abstractPostDto.title) +
      (getRepeatedPosts.length !== 0 ? `(${getRepeatedPosts.length})` : '');

    const { title, content, ownerID } = abstractPostDto;
    await this.pgService.useQuery(
      `SELECT "${this.addFunction}" ('${title}', '${content}', '${translit}', ${ownerID})`,
    );
    return { translit };
  }

  async findOneByTranslit(translit: string): Promise<AbstractPost> {
    const res = await this.pgService.useQuery(
      `SELECT * FROM "${this.getFunction}"('${this.type}', $1)`,
      [translit],
    );
    return res.rows[0] as AbstractPost;
  }

  async findAll(): Promise<AbstractPost[]> {
    return this.pgService.find<AbstractPost>({ tableName: this.tableName });
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
      `SELECT "${this.updateFunction}" ($1, $2, $3, $4)`,
      [id, title, content, translit],
    );
    return translit;
  }
  async getPostsBySearch(search: string): Promise<AbstractPostSearchOutput[]> {
    const res = await this.pgService.useQuery(
      `SELECT * FROM "GetAllPostsBySearch"($1)`,
      [search],
    );
    return res.rows as AbstractPostSearchOutput[];
  }
}

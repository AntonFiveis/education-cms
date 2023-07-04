import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomHeaders } from 'src/decorators/custom-headers.decorator';
import { AbstractPost } from '../abstract-post/abstract-post.entity';
import { AbstractPostUpdates } from '../abstract-post/dto/abstract-post.dto';
import {
  GetPrivilegesPipe,
  GetPrivilegesPipeOutput,
} from '../../pipes/get-privileges.pipe';
import { TokensValidationPipe } from '../../pipes/tokens-validation.pipe';
import { ArticlesService } from './articles.service';
import { ArticleDto } from './dto/article.dto';
import { Article } from './article.entity';

@Controller('articles')
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @Get('/:translit')
  async getArticleByTranslit(
    @Param('translit') translit: string,
  ): Promise<AbstractPost> {
    return this.articlesService.findOneByTranslit(translit);
  }

  @Get('/main-menu/all')
  async getMainMenu(): Promise<Article[]> {
    return this.articlesService.getMainMenu();
  }

  @Post()
  async createArticle(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges, token }: GetPrivilegesPipeOutput,
    @Body() articleDto: ArticleDto,
  ): Promise<{ translit: string }> {
    if (!privileges.articlesAdder)
      throw new UnauthorizedException("You don't have rights to do it");

    return this.articlesService.create({
      ...articleDto,
      ownerID: token.userID,
    });
  }

  @Delete('/:id')
  async deleteArticle(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Param('id') id: string,
  ): Promise<void> {
    if (!privileges.articlesRemover)
      throw new UnauthorizedException("You don't have rights to do it");

    return this.articlesService.delete(id);
  }

  @Patch('/:id')
  async updateArticleContent(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Param('id') id: string,
    @Body() updates: AbstractPostUpdates,
  ): Promise<{ translit: string }> {
    if (!privileges.articlesUpdater)
      throw new UnauthorizedException("You don't have rights to do it");

    return { translit: await this.articlesService.update(id, updates) };
  }
}

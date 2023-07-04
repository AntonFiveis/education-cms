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
import {
  AbstractPostDto,
  AbstractPostUpdates,
} from '../abstract-post/dto/abstract-post.dto';
import {
  GetPrivilegesPipe,
  GetPrivilegesPipeOutput,
} from '../../pipes/get-privileges.pipe';
import { TokensValidationPipe } from '../../pipes/tokens-validation.pipe';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  @Get()
  async getAllNews(): Promise<AbstractPost[]> {
    return this.newsService.findAll();
  }

  @Get('/:translit')
  async getNewsById(
    @Param('translit') translit: string,
  ): Promise<AbstractPost> {
    return this.newsService.findOneByTranslit(translit);
  }

  @Post()
  async createNews(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges, token }: GetPrivilegesPipeOutput,
    @Body() newsDto: AbstractPostDto,
  ): Promise<{ translit: string }> {
    if (!privileges.newsAdder)
      throw new UnauthorizedException("You don't have rights to do it");

    return this.newsService.create({ ...newsDto, ownerID: token.userID });
  }

  @Delete('/:id')
  async deleteNews(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Param('id') id: string,
  ): Promise<void> {
    if (!privileges.newsRemover)
      throw new UnauthorizedException("You don't have rights to do it");

    return this.newsService.delete(id);
  }

  @Patch('/:id')
  async updateNewsContent(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Param('id') id: string,
    @Body() updates: AbstractPostUpdates,
  ): Promise<{ translit: string }> {
    if (!privileges.newsUpdater)
      throw new UnauthorizedException("You don't have rights to do it");
    return { translit: await this.newsService.update(id, updates) };
  }
}

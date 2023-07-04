import { Controller, Get, Query } from '@nestjs/common';
import { AbstractPostSearchOutput } from './abstract-post.entity';
import { AbstractPostService } from './abstract-post.service';

@Controller('abstract-post')
export class AbstractPostController {
  constructor(private abstractPostService: AbstractPostService) {}
  @Get()
  async getPostsBySearch(
    @Query('search') search: string,
  ): Promise<AbstractPostSearchOutput[]> {
    return this.abstractPostService.getPostsBySearch(search);
  }
}

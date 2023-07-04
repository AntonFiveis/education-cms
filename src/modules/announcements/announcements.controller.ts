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
import { AnnouncementsService } from './announcements.service';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  @Get()
  async getAllAnnouncements(): Promise<AbstractPost[]> {
    return this.announcementsService.findAll();
  }

  @Get('/:translit')
  async getAnnouncementById(
    @Param('translit') translit: string,
  ): Promise<AbstractPost> {
    return this.announcementsService.findOneByTranslit(translit);
  }

  @Post()
  async createAnnouncement(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges, token }: GetPrivilegesPipeOutput,
    @Body() announcementDto: AbstractPostDto,
  ): Promise<{ translit: string }> {
    if (!privileges.announcementsAdder)
      throw new UnauthorizedException("You don't have rights to do it");

    return this.announcementsService.create({
      ...announcementDto,
      ownerID: token.userID,
    });
  }

  @Delete('/:id')
  async deleteAnnouncement(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Param('id') id: string,
  ): Promise<void> {
    if (!privileges.announcementsRemover)
      throw new UnauthorizedException("You don't have rights to do it");

    return this.announcementsService.delete(id);
  }

  @Patch('/:id')
  async updateAnnouncementContent(
    @CustomHeaders('authorization', TokensValidationPipe, GetPrivilegesPipe)
    { privileges }: GetPrivilegesPipeOutput,
    @Param('id') id: string,
    @Body() updates: AbstractPostUpdates,
  ): Promise<{ translit: string }> {
    if (!privileges.announcementsUpdater)
      throw new UnauthorizedException("You don't have rights to do it");
    return { translit: await this.announcementsService.update(id, updates) };
  }
}

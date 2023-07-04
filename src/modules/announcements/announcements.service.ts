import { Injectable } from '@nestjs/common';
import { AbstractPostService } from '../abstract-post/abstract-post.service';

@Injectable()
export class AnnouncementsService extends AbstractPostService {
  protected tableName = 'Announcements';
  protected addFunction = 'AddAnnouncement';
  protected updateFunction = 'UpdateAnnouncement';
  protected deleteFunction = 'DeleteAnnouncement';
  protected type = 'announcement';
}

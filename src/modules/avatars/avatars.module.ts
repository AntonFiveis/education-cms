import { Module } from '@nestjs/common';
import { AvatarsService } from './avatars.service';
import { AvatarsController } from './avatars.controller';
import { MulterModule } from '@nestjs/platform-express';
import { UsersService } from '../users/services/users.service';
import { GroupsService } from '../groups/groups.service';
import { GroupMembersService } from '../group-members/group-members.service';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 10485760, //1024 * 1024 * 10 === 10mb
      },
      // storage: diskStorage({
      //       destination: './files',
      //       filename: editFileName
      // })
    }),
  ],
  providers: [AvatarsService, UsersService, GroupsService, GroupMembersService],
  controllers: [AvatarsController],
})
export class AvatarsModule {}

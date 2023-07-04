import { Module } from '@nestjs/common';
import { UsersTaskSetsService } from './users-task-sets.service';

@Module({
  providers: [UsersTaskSetsService],
})
export class UsersTaskSetsModule {}

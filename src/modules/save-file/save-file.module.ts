import { Module } from '@nestjs/common';
import { SaveFileController } from './save-file.controller';
import { SaveFileService } from './save-file.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 10485760, //1024 * 1024 * 10 === 10mb
      },
    }),
  ],
  controllers: [SaveFileController],
  providers: [SaveFileService],
})
export class SaveFileModule {}

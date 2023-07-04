import { Global, Module } from '@nestjs/common';
import { ImageMinService } from './image-min.service';
@Global()
@Module({
  providers: [ImageMinService],
  exports: [ImageMinService],
})
export class ImageMinModule {}

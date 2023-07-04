import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SaveFileService } from './save-file.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('save-file')
export class SaveFileController {
  constructor(private saveFileService: SaveFileService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('image')) //, //{
  // storage: diskStorage({
  //     destination: './files',
  //     filename: editFileName
  // }),

  //}))
  uploadFile(
    @UploadedFile() image: Express.Multer.File,
  ): { originalname: string; filename: string } {
    const response = {
      originalname: image.originalname,
      filename: image.filename,
    };

    return response;
  }
}

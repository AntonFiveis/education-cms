import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CustomHeaders } from 'src/decorators/custom-headers.decorator';
import { JsonParsePipe } from 'src/pipes/json-parse.pipe';
import {
  TokensValidationPipe,
  TokensValidationPipeOutput,
} from 'src/pipes/tokens-validation.pipe';
import { AvatarsService } from './avatars.service';
import Crop from './interfaces/crop';

@Controller('avatars')
export class AvatarsController {
  constructor(private avatarsService: AvatarsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async uploadAvatar(
    @CustomHeaders('authorization', TokensValidationPipe)
    { token }: TokensValidationPipeOutput,
    @UploadedFile() image: Express.Multer.File,
    @Body('crop', JsonParsePipe) crop: Crop,
  ): Promise<string> {
    return await this.avatarsService.saveAvatar(image, crop, token);
  }

  @Get('/:filename')
  async getAvatar(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const stream = await this.avatarsService.getAvatar((filename));
    stream.pipe(res);
  }

  @Get('/pictogram/:filename')
  async getPictogram(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const stream = await this.avatarsService.getPictogram((filename));
    stream.pipe(res);
  }
}

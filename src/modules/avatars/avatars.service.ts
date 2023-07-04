import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Readable } from 'stream';
import { ImageMinService } from '../image-min/image-min.service';
import { Token } from '../tokens/tokens.entity';
import { UsersService } from '../users/services/users.service';
import Crop from './interfaces/crop';

@Injectable()
export class AvatarsService {
  constructor(
    private imageMinService: ImageMinService,
    private usersService: UsersService,
  ) {}

  async saveAvatar(
    image: Express.Multer.File,
    crop: Crop,
    token: Token,
  ): Promise<string> {
    const user = await this.usersService.getUserById(token.userID);
    const maxSize = 5000000; // 5mb
    const quality =
      image.size < maxSize ? 100 : Math.floor((maxSize / image.size) * 100);
    const destinationPath = './avatars',
      pictogramsPath = './pictograms';

    this.createDirIfNeeded(destinationPath);
    this.createDirIfNeeded(pictogramsPath);

    const name = this.imageMinService.editFileName(image);

    await Promise.all([
      this.imageMinService.minimizeImage(image, destinationPath, quality, name),
      this.imageMinService.makePictogram(image, pictogramsPath, crop, name),
      this.usersService.updateUserAvatarInfo(token.userID, name),
    ]);

    if (user.avatar) {
      if (fs.existsSync(`./avatars/${user.avatar}`))
        fs.unlinkSync(`./avatars/${user.avatar}`);
      if (fs.existsSync(`./pictograms/${user.avatar}`))
        fs.unlinkSync(`./pictograms/${user.avatar}`);
    }

    return name;
  }

  async getAvatar(filename: string): Promise<Readable> {
    return this.getPicture(`./avatars/${filename}`);
  }

  async getPictogram(filename: string): Promise<Readable> {
    return this.getPicture(`./pictograms/${filename}`);
  }

  async getPicture(path: string): Promise<Readable> {
    return new Promise((resolve, reject) => {
      fs.readFile(path, null, (err, data) => {
        if (err) reject();

        const stream = new Readable();
        stream.push(data);
        stream.push(null);
        resolve(stream);
      });
    });
  }

  private createDirIfNeeded(path: string): void {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }
}

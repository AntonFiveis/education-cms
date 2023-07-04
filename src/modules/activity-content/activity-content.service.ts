import { BadRequestException, Injectable } from '@nestjs/common';
import { PgService } from '../pg/pg.service';
import {
  ActivityContentDTO,
  ActivityContentUpdates,
} from './dto/activity-content.dto';
import { ImageMinService } from '../image-min/image-min.service';
import * as fs from 'fs';
import { ActivityContent } from './activity-content.entity';
import { Readable, Stream } from 'stream';
import { extname } from 'path';
import { createWriteStream } from 'fs';
@Injectable()
export class ActivityContentService {
  constructor(
    private pgService: PgService,
    private imageMinService: ImageMinService,
  ) {}
  private createDirIfNeeded(path: string): void {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }

  async getActivityContentsOfComponent(
    activityComponentID: number,
  ): Promise<ActivityContent[]> {
    return await this.pgService.find({
      tableName: 'ActivityContent',
      where: { activityComponentID },
    });
  }
  async getActivityContent(
    activityContentID: number,
  ): Promise<ActivityContent> {
    return this.pgService.findOne({
      tableName: 'ActivityContent',
      where: { activityContentID },
    });
  }

  async getFile(path: string): Promise<Stream> {
    const ext = extname(path);
    const dir =
      ext == '.jpg' || ext == '.png' || ext == 'gif' || ext == '.jpeg'
        ? 'images'
        : 'files';
    return new Promise((resolve, reject) => {
      fs.readFile(`${dir}/${path}`, null, (err, data) => {
        if (err) reject();
        const stream = new Readable();
        stream.push(data);
        stream.push(null);
        resolve(stream);
      });
    });
  }
  async getImagePictogram(path: string): Promise<Stream> {
    return new Promise((resolve, reject) => {
      fs.readFile(`images/${path}`, null, async (err, data) => {
        if (err) reject();
        const buffer = await this.imageMinService.resizeToBuffer(data);
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);
        resolve(stream);
      });
    });
  }

  async saveActivityContent({
    name,
    activityComponentID,
    content,
  }: ActivityContentDTO): Promise<number> {
    const count = (
      await this.pgService.useQuery(
        `SELECT COUNT(*) as count FROM "ActivityContent" WHERE "activityComponentID" = ${activityComponentID}`,
      )
    ).rows[0].count;
    const activityComponentType = (
      await this.pgService.useQuery(
        `SELECT "type" FROM "ActivityComponent" WHERE "activityComponentID" = ${activityComponentID}`,
      )
    ).rows[0].type;

    if (
      (Number(count) > 15 && activityComponentType == 'photos') ||
      (activityComponentType == 'videoset' && Number(count) > 50)
    )
      throw new BadRequestException('Limit has been exceeded');
    return await this.pgService
      .create({
        tableName: 'ActivityContent',
        values: [{ name, activityComponentID, content }],
        returning: 'activityContentID',
      })
      .then((res) => res.rows[0].activityContentID);
  }

  async saveActivityContentWithFile(
    file: Express.Multer.File,
    { name, activityComponentID }: ActivityContentDTO,
  ): Promise<{ activityContentID: number; path: string }> {
    let path;
    const ext = extname(file.originalname);
    if (ext == '.jpg' || ext == '.png' || ext == 'gif' || ext == '.jpeg')
      path = await this.saveImage(file);
    else path = await this.saveFile(file);
    const activityContentID = await this.saveActivityContent({
      name,
      activityComponentID,
      content: path,
    });
    return { activityContentID, path };
  }

  private async saveFile(file: Express.Multer.File): Promise<string> {
    const maxSize = 5000000; // 5mb
    if (file.size > maxSize) throw new Error('File is too big');
    const destinationPath = './files';

    this.createDirIfNeeded(destinationPath);
    const fileName = this.imageMinService.editFileName(file);
    const ws = createWriteStream(`./files/${fileName}`);
    const buffer = file.buffer;
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(ws);
    return fileName;
  }
  private async saveImage(
    image: Express.Multer.File,
    path: string = undefined,
  ): Promise<string> {
    const validImage = this.imageMinService.checkValidImage(image);
    if (!validImage) throw new BadRequestException('Image is not valid.');
    const maxSize = 5000000; // 5mb
    const quality =
      image.size < maxSize ? 100 : Math.floor((maxSize / image.size) * 100);
    const destinationPath = './images';

    this.createDirIfNeeded(destinationPath);

    const imageName = this.imageMinService.editFileName(image);

    await this.imageMinService.minimizeImage(
      image,
      destinationPath,
      quality,
      imageName,
    );

    if (path != '' && fs.existsSync(`images/${path}`)) {
      fs.unlinkSync(`images/${path}`);
    }

    return imageName;
  }

  async updateActivityContentWithImage(
    image: Express.Multer.File,
    activityContentUpdates: ActivityContentUpdates,
    activityContentID: number,
  ): Promise<void> {
    const path = await this.saveImage(image, activityContentUpdates.content);
    await this.pgService.update({
      tableName: 'ActivityContent',
      updates: { ...activityContentUpdates, content: path },
      where: { activityContentID },
    });
  }
  async updateActivityContent(
    activityContentUpdates: ActivityContentUpdates,
    activityContentID: number,
  ): Promise<void> {
    await this.pgService.update({
      tableName: 'ActivityContent',
      updates: activityContentUpdates as Record<string, unknown>,
      where: { activityContentID },
    });
  }

  async deleteActivityContent(activityContentID: number): Promise<void> {
    const path = (
      await this.pgService.delete({
        tableName: 'ActivityContent',
        returning: 'content',
        where: { activityContentID },
      })
    ).rows[0].content;
    if (path.length != 0 && fs.existsSync(`images/${path}`)) {
      fs.unlinkSync(`images/${path}`);
    }
    if (path.length != 0 && fs.existsSync(`files/${path}`)) {
      fs.unlinkSync(`files/${path}`);
    }
  }
}

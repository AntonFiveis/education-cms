import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class JsonParsePipe implements PipeTransform {
  transform(data: string): unknown {
    return JSON.parse(data);
  }
}

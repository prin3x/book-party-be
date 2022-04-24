import { Injectable } from '@nestjs/common';
import * as cloudinary from 'cloudinary';
import { Readable } from 'stream';
import { ICloundModel } from './cloudinary.interface';
@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File): Promise<ICloundModel> {
    return new Promise((resolve, reject) => {
      const upload = (cloudinary as any).v2.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      const stream = Readable.from(file.buffer);
      stream.pipe(upload);
    });
  }
}

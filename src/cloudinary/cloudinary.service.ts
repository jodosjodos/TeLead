import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { CloudinaryResponse } from './dto/cloudinary.response';
@Injectable()
// cloudinary services
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    fileName: string,
  ): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'TeLead_profile', public_id: fileName },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        },
      );

      //   convert file to buffer
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  // upload video
  async uploadVideo(
    file: Express.Multer.File,
    fileName: string,
  ): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_chunked_stream(
        {
          folder: 'TeLead_chapter',
          public_id: fileName,
          resource_type: 'video',
          chunk_size: 10 * 1024 * 1024,
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}

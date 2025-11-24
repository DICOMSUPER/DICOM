import { Injectable } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
const streamifier = require('streamifier');
import { Multer } from 'multer';

@Injectable()
export class CloudinaryService {
  async uploadImageFromCloudinary(
    file: Express.Multer.File,
    options: { folder: string }
  ): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        options,
        (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
          if (error) return reject(error);
          resolve(result);
          if (!result) {
            return reject(new Error('Upload failed: No result received'));
          }
        }
      );

      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }

  async uploadBase64ToCloudinary(
    dataURI: string,
    options: {
      folder: string;
      public_id?: string;
      resource_type?: 'image' | 'video' | 'raw' | 'auto';
    }
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          ...options,
          resource_type: options.resource_type || 'auto', // Auto detect type
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) {
            return reject(new Error('Upload failed: No result received'));
          }
          resolve(result);
        }
      );
    });
  }

  async deleteImageFromCloudinary(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,

        (error: any, result: any) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
    });
  }
  isValidBase64URI(dataURI: string): boolean {
    const base64Regex = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/;
    return base64Regex.test(dataURI);
  }
}

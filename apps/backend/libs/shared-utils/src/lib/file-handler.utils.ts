import { Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Express } from 'express';
import { Multer } from 'multer';
const logger = new Logger('SharedUtils - FileHandler');

export type CloudinaryConfig = {
  cloud_name: string;
  api_key: string;
  api_secret: string;
  secure_distribution?: string;
  upload_prefix?: string;
};
export const uploadFileToCloudinary = async (
  cloudinaryConfig: CloudinaryConfig,
  file: Express.Multer.File,
  folder: string
) => {
  logger.log('Uploading file to Cloudinary');
  cloudinary.config(cloudinaryConfig);

  try {
    // Use the stream upload approach for better memory efficiency
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: folder,
          public_id: `dicom_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2)}.DCM`,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result?.secure_url) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Upload failed: No result returned'));
          }
        }
      );

      // Create a readable stream from the buffer and pipe to Cloudinary
      const { Readable } = require('stream');
      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  } catch (error) {
    logger.error(`Failed to upload file to Cloudinary: `, error);
    throw new Error(
      `Cloudinary upload failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

export const removeFileFromCloudinary = async (
  cloudinaryConfig: CloudinaryConfig,
  path: string
) => {
  logger.log('Removing file from Cloudinary');
  cloudinary.config(cloudinaryConfig);

  // Extract public_id from the secure_url
  const publicId = path.split('/').pop()?.split('.')[0] || '';

  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    logger.error(`Failed to remove file from Cloudinary: `, error);
    throw new Error(
      `Cloudinary deletion failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

export default {
  uploadFileToCloudinary,
  removeFileFromCloudinary,
};

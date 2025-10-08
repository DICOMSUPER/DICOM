import { Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

const logger = new Logger('SharedUtils - FileHandler');
export type CloudinaryConfig = {
  cloud_name: string;
  api_key: string;
  api_password: string;
  secure_distribution?: string;
  upload_prefix?: string;
};

export const uploadFileToCloudinary = async (
  cloudinaryConfig: CloudinaryConfig,
  file: string
) => {
  logger.log('Uploading file to cloudinary');
  cloudinary.config(cloudinaryConfig);
  const result = await cloudinary.uploader.upload(file);

  return result.secure_url;
};

export const removeFileFromCloudinary = async (
  cloudinaryConfig: CloudinaryConfig,
  path: string
) => {
  logger.log('Removing file from cloudinary');
  cloudinary.config(cloudinaryConfig);

  //extract public id from path
  const publicId = '';

  await cloudinary.uploader.destroy(publicId);
  return true;
};

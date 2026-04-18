import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import logger from '../config/logger.js';
import { env } from '../config/env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Detects if it's image, video, etc.
      folder: "binit-categories", // Optional: Organize in a folder
    });

    // Remove the locally saved temporary file after upload
    fs.unlinkSync(localFilePath);

    return response.secure_url; // Return the hosted image URL
  } catch (error) {
    // Attempt to delete local file if upload fails
    try {
      fs.unlinkSync(localFilePath); 
    } catch (e) { 
      logger.error(`Cloudinary Utils: Failed to cleanup local file: ${e.message}`);
    }
    logger.error(`Cloudinary Upload Failed: ${error.message}`, { stack: error.stack });

    throw new Error(`Image upload failed: ${error.message}`);
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    // Destroy expects public_id
    const response = await cloudinary.uploader.destroy(publicId);
    
    return response;
  } catch (error) {
    logger.error(`Cloudinary Delete Failed: ${error.message}`);
    return null;
  }
};
export const extractPublicIdFromUrl = (url) => {
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/binit-categories/image.jpg
    // We want: binit-categories/image
    try {
        const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
        const match = url.match(regex);
        return match ? match[1] : null;
    } catch (error) {
        logger.error(`Error extracting public ID: ${error.message}`);
        return null;
    }
}
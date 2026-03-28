import { v2 as cloudinary, type UploadApiOptions } from "cloudinary";
import { getCloudinaryConfig } from "@/lib/env";

const { cloudName, apiKey, apiSecret, folder } = getCloudinaryConfig();

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export { cloudinary };

export async function uploadImage(
  file: string,
  options: UploadApiOptions = {}
) {
  return cloudinary.uploader.upload(file, {
    folder,
    resource_type: "image",
    ...options,
  });
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: "image",
  });
}

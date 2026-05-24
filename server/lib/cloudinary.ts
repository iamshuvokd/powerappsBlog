import { v2 as cloudinary } from "cloudinary";
import { env, isCloudinaryConfigured } from "../env";

let configured = false;

// Lazily configure the Cloudinary SDK the first time it is needed.
export function getCloudinary() {
  if (isCloudinaryConfigured() && !configured) {
    cloudinary.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret,
    });
    configured = true;
  }
  return cloudinary;
}

export { isCloudinaryConfigured };

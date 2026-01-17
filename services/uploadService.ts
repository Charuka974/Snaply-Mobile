import { Platform } from "react-native";

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_UPLOAD_PRESET!;

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
}

/**
 * Upload a single file (image or video) to Cloudinary
 */
export const uploadToCloudinary = async (
  file: string | File,
  folder?: string,
  type: MediaType = MediaType.IMAGE
): Promise<string> => {
  try {
    const formData = new FormData();

    // Detect platform
    if (Platform.OS === "web") {
      formData.append("file", file as File);
    } else {
      // Native: infer mimeType & fileName from extension
      let mimeType = "image/jpeg";
      let fileName = "upload.jpg";

      if (typeof file === "string") {
        const ext = file.split(".").pop()?.toLowerCase();
        if (type === MediaType.VIDEO) {
          mimeType =
            ext === "mov"
              ? "video/quicktime"
              : ext === "avi"
              ? "video/x-msvideo"
              : "video/mp4";
          fileName = `upload.${ext || "mp4"}`;
        } else {
          mimeType =
            ext === "png"
              ? "image/png"
              : ext === "webp"
              ? "image/webp"
              : "image/jpeg";
          fileName = `upload.${ext || "jpg"}`;
        }
      }

      formData.append("file", {
        uri: file,
        type: mimeType,
        name: fileName,
      } as any);
    }

    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", folder ? `snaply/${folder}` : "snaply");

    const endpoint =
      type === MediaType.IMAGE
        ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
        : `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

    const response = await fetch(endpoint, { method: "POST", body: formData });
    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudinary error:", data);
      throw new Error(data.error?.message || "Failed to upload media");
    }

    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload media");
  }
};

/** Upload helpers */
export const uploadUserAvatar = (file: string | File) =>
  uploadToCloudinary(file, "avatars", MediaType.IMAGE);

export const uploadPostImage = (file: string | File) =>
  uploadToCloudinary(file, "posts", MediaType.IMAGE);

export const uploadPostVideo = async (file: string | File) => {
  if (Platform.OS === "web" && typeof file === "string" && file.startsWith("blob:")) {
    // Convert blob URL to File object
    const blob = await fetch(file).then((r) => r.blob());
    const fileObj = new File([blob], "video.mp4", { type: blob.type });
    return uploadToCloudinary(fileObj, "posts", MediaType.VIDEO);
  }

  return uploadToCloudinary(file, "posts", MediaType.VIDEO);
};

/**
 * Upload multiple images or a single video for a post
 */
export const uploadPostMedia = async (
  files: (string | File)[],
  type: MediaType
) => {
  if (!files.length) return [];

  if (type === MediaType.IMAGE) {
    const urls = await Promise.all(files.map(uploadPostImage));
    return urls.map((url) => ({ uri: url, type: MediaType.IMAGE }));
  } else {
    // Only one video per post
    const url = await uploadPostVideo(files[0]);
    return [{ uri: url, type: MediaType.VIDEO }];
  }
};

import { Platform } from "react-native";

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_UPLOAD_PRESET!;

export const uploadToCloudinary = async (file: string | File, folder?: string): Promise<string> => {
  try {
    const formData = new FormData();

    if (Platform.OS === "web") {
      // Web: file is already a File object
      formData.append("file", file as File);
    } else {
      // Native: file is local URI
      formData.append("file", {
        uri: file,
        type: "image/jpeg",
        name: "upload.jpg",
      } as any);
    }

    formData.append("upload_preset", UPLOAD_PRESET);

    // Add folder under 'snaply'
    formData.append("folder", folder ? `snaply/${folder}` : "snaply");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudinary error:", data);
      throw new Error(data.error?.message || "Failed to upload image");
    }

    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
};

// Upload avatar
export const uploadUserAvatar = (file: string | File) => uploadToCloudinary(file, "avatars");

// Upload post image
export const uploadPostImage = (file: string | File) => uploadToCloudinary(file, "posts");

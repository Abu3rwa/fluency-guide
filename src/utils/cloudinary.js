import axios from "axios";

const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

export const uploadToCloudinary = async (file, folder = "general") => {
  try {
    // If file is a base64 string
    if (typeof file === "string" && file.startsWith("data:")) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", folder);

      const response = await axios.post(CLOUDINARY_API_URL, formData);
      return {
        secure_url: response.data.secure_url,
        public_id: response.data.public_id,
      };
    }

    // If file is a File object
    if (file instanceof File) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", folder);

      const response = await axios.post(CLOUDINARY_API_URL, formData);
      return {
        secure_url: response.data.secure_url,
        public_id: response.data.public_id,
      };
    }

    throw new Error("Invalid file format");
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await axios.post(`/api/cloudinary/delete`, { publicId });
    return response.data;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

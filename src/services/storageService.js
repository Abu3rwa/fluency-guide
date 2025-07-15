import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://mr-abdulhafeez.web.app"
    : "http://localhost:3000";

const storage = getStorage();

const storageService = {
  // Upload a single file (simplified without auth)
  async uploadFile(file, path) {
    try {
      const fileExtension = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const fullPath = `${path}/${fileName}`;
      const storageRef = ref(storage, fullPath);

      console.log("Uploading file to path:", fullPath);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log("File uploaded successfully:", downloadURL);

      return {
        name: file.name,
        url: downloadURL,
        path: fullPath,
        type: file.type,
        size: file.size,
      };
    } catch (error) {
      console.error("Error uploading file:", error);

      // Provide more specific error messages
      if (error.code === "storage/unauthorized") {
        throw new Error(
          "Permission denied. Please check Firebase Storage rules."
        );
      } else if (error.code === "storage/quota-exceeded") {
        throw new Error("Storage quota exceeded. Please try a smaller file.");
      } else if (error.code === "storage/unauthenticated") {
        throw new Error(
          "Authentication required. Please check Firebase configuration."
        );
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    }
  },

  // Upload multiple files
  async uploadMultipleFiles(files, path) {
    try {
      const uploadPromises = files.map((file) => this.uploadFile(file, path));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading multiple files:", error);
      throw new Error("Failed to upload files");
    }
  },

  // Upload from URL
  async uploadFromURL(url, path) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = url.split("/").pop();
      const file = new File([blob], fileName, { type: blob.type });
      return await this.uploadFile(file, path);
    } catch (error) {
      console.error("Error uploading from URL:", error);
      throw new Error("Failed to upload from URL");
    }
  },

  // Get file extension from URL
  getFileExtension(url) {
    try {
      const extension = url.split(".").pop().split("?")[0];
      return extension.toLowerCase();
    } catch {
      return "";
    }
  },

  // Check if URL is valid
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Get file type from extension
  getFileType(extension) {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const videoExtensions = ["mp4", "webm", "ogg"];
    const audioExtensions = ["mp3", "wav", "ogg"];
    const documentExtensions = ["pdf", "doc", "docx", "txt"];

    if (imageExtensions.includes(extension)) return "image";
    if (videoExtensions.includes(extension)) return "video";
    if (audioExtensions.includes(extension)) return "audio";
    if (documentExtensions.includes(extension)) return "document";
    return "other";
  },
};

export default storageService;

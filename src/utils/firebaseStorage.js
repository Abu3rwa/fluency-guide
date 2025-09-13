
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage, auth } from "../firebase";

export const uploadToStorage = async (file, folder = "general") => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.warn("🔒 No authenticated user for upload, attempting anonymous upload");
    } else {
      console.log("🔒 User authenticated for upload:", auth.currentUser.uid);
    }

    let fileToUpload;

    // If file is a base64 string
    if (typeof file === "string" && file.startsWith("data:")) {
      console.log("📄 Converting base64 to blob");
      // Convert base64 to blob
      const response = await fetch(file);
      fileToUpload = await response.blob();
    } else if (file instanceof File) {
      console.log("📄 Using File object directly");
      fileToUpload = file;
    } else {
      throw new Error("Invalid file format - expected File object or base64 string");
    }

    // Generate a unique filename
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const fullPath = `${folder}/${filename}`;
    
    console.log("📦 Uploading to Firebase Storage:", {
      folder,
      filename,
      fullPath,
      fileSize: fileToUpload.size,
      fileType: fileToUpload.type
    });
    
    const storageRef = ref(storage, fullPath);

    // Upload file
    const snapshot = await uploadBytes(storageRef, fileToUpload);
    console.log("📦 Upload completed, getting download URL");
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log("📦 Upload successful:", {
      url: downloadURL,
      path: fullPath
    });

    return {
      url: downloadURL,
      path: fullPath,
    };
  } catch (error) {
    console.error("📦 Error uploading to Firebase Storage:", error);
    
    // Enhanced error messages
    if (error.code === "storage/unauthorized") {
      throw new Error("Permission denied. Please check Firebase Storage rules and user authentication.");
    } else if (error.code === "storage/quota-exceeded") {
      throw new Error("Storage quota exceeded. Please try a smaller file.");
    } else if (error.code === "storage/unauthenticated") {
      throw new Error("Authentication required. Please sign in and try again.");
    } else if (error.code === "storage/invalid-format") {
      throw new Error("Invalid file format. Please check the file type.");
    } else if (error.code === "storage/invalid-argument") {
      throw new Error("Invalid file or storage reference.");
    } else {
      throw new Error(`Upload failed: ${error.message || error.code || 'Unknown error'}`);
    }
  }
};

export const deleteFromStorage = async (path) => {
  try {
    if (!path) return;

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error("Error deleting from Firebase Storage:", error);
    throw error;
  }
};

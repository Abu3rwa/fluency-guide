import storageService from "./storageService";

class HybridStorageService {
  constructor() {
    this.provider = "firebase";
  }

  // Upload a single file
  async uploadFile(file, path, metadata = {}) {
    try {
      return await storageService.uploadFile(file, path);
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files, path, metadata = {}) {
    try {
      return await storageService.uploadMultipleFiles(files, path);
    } catch (error) {
      console.error("Error uploading multiple files:", error);
      throw new Error(`Failed to upload files: ${error.message}`);
    }
  }

  // Upload from URL
  async uploadFromURL(url, path, metadata = {}) {
    try {
      return await storageService.uploadFromURL(url, path);
    } catch (error) {
      console.error("Error uploading from URL:", error);
      throw new Error(`Failed to upload from URL: ${error.message}`);
    }
  }

  // Get file extension from URL
  getFileExtension(url) {
    return storageService.getFileExtension(url);
  }

  // Check if URL is valid
  isValidUrl(url) {
    return storageService.isValidUrl(url);
  }

  // Get file type from extension
  getFileType(extension) {
    return storageService.getFileType(extension);
  }

  // Get current storage provider
  getProvider() {
    return this.provider;
  }

  // Set storage provider (only firebase supported now)
  setProvider(provider) {
    if (["firebase"].includes(provider)) {
      this.provider = provider;
    } else {
      throw new Error(
        'Invalid storage provider. Only "firebase" is supported.'
      );
    }
  }
}

// Create singleton instance
const hybridStorageService = new HybridStorageService();

export default hybridStorageService;

// React hook for using the hybrid storage service
export const useHybridStorage = () => {
  return {
    uploadFile: async (file, path, metadata = {}) => {
      return await hybridStorageService.uploadFile(file, path, metadata);
    },

    uploadMultipleFiles: async (files, path, metadata = {}) => {
      return await hybridStorageService.uploadMultipleFiles(
        files,
        path,
        metadata
      );
    },

    uploadFromURL: async (url, path, metadata = {}) => {
      return await hybridStorageService.uploadFromURL(url, path, metadata);
    },

    getProvider: () => hybridStorageService.getProvider(),
    setProvider: (provider) => hybridStorageService.setProvider(provider),

    // Utility methods
    getFileExtension:
      hybridStorageService.getFileExtension.bind(hybridStorageService),
    isValidUrl: hybridStorageService.isValidUrl.bind(hybridStorageService),
    getFileType: hybridStorageService.getFileType.bind(hybridStorageService),
  };
};

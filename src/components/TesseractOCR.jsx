import React, { useState, useRef } from "react";
import { createWorker } from "tesseract.js";
import { Upload, FileText, Loader2, X, Eye } from "lucide-react";

const TesseractOCR = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setError("");
      setExtractedText("");

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setError("Please select a valid image file");
    }
  };

  const processImage = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    setError("");
    setProgress(0);
    let worker = null;
    let timeoutId = null;
    try {
      // Set up timeout to prevent infinite processing
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("OCR processing timed out after 60 seconds"));
        }, 60000); // 60 second timeout
      });
      // Create processing promise using correct Tesseract.js v5/v6 API
      const processingPromise = async () => {
        // Create worker with local paths to avoid CDN/CSP issues
        worker = createWorker({
          workerPath: process.env.PUBLIC_URL + "/tesseract/worker.min.js",
          corePath: process.env.PUBLIC_URL + "/tesseract/",
          langPath: process.env.PUBLIC_URL + "/tesseract/lang-data/",
          logger: (m) => {
            // Update progress based on Tesseract's progress reports
            if (m.status === "recognizing text") {
              const progressValue = Math.round(m.progress * 100);
              setProgress(Math.max(20, progressValue));
            } else if (m.status === "loading tesseract core") {
              setProgress(15);
            } else if (m.status === "initializing tesseract") {
              setProgress(20);
            }
          },
        });
        await worker.load();
        await worker.loadLanguage("eng");
        await worker.initialize("eng");
        // Recognize text
        const {
          data: { text },
        } = await worker.recognize(selectedImage);
        setProgress(100);
        return text;
      };
      // Race between processing and timeout
      const text = await Promise.race([processingPromise(), timeoutPromise]);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setExtractedText(text);
      console.log("Extracted OCR text:", text); // Log the extracted data for validation
    } catch (err) {
      console.error("OCR processing error:", err);
      setError("Failed to extract text: " + err.message);
    } finally {
      // Clean up timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Clean up worker
      if (worker) {
        try {
          await worker.terminate();
          console.log("Worker terminated successfully");
        } catch (terminateErr) {
          console.warn("Error terminating worker:", terminateErr);
        }
      }
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const clearAll = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setExtractedText("");
    setError("");
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          OCR Text Extractor
        </h1>
        <p className="text-gray-600">
          Upload an image to extract text using Tesseract.js
        </p>
      </div>

      {/* Upload Section */}
      <div className="mb-6">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg text-gray-600 mb-2">
            Click to upload an image or drag and drop
          </p>
          <p className="text-sm text-gray-500">
            Supports PNG, JPG, JPEG, GIF, WebP
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Image Preview and Controls */}
      {imagePreview && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Eye className="mr-2" size={20} />
              Image Preview
            </h3>
            <div className="space-x-2">
              <button
                onClick={processImage}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Extract Text
                  </>
                )}
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center"
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-full h-auto max-h-96 mx-auto block"
            />
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Processing image...</span>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Extracted Text */}
      {extractedText && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Extracted Text
            </h3>
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Copy Text
            </button>
          </div>
          <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {extractedText}
            </pre>
          </div>
        </div>
      )}

      {/* Implementation Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">
          Real Implementation Instructions:
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            1. Install Tesseract.js:{" "}
            <code className="bg-blue-100 px-1 rounded">
              npm install tesseract.js
            </code>
          </p>
          <p>
            2. Replace the simulateOCR function with actual Tesseract.js code
          </p>
          <p>
            3. Import:{" "}
            <code className="bg-blue-100 px-1 rounded">
              {"import {createWorker} from 'tesseract.js';"}
            </code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TesseractOCR;

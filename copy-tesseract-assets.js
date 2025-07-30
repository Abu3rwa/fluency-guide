const fs = require("fs");
const path = require("path");
const https = require("https");

const sourceDir = "node_modules/tesseract.js-core";
const targetDir = "public/tesseract";

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log("Created target directory:", targetDir);
}

// Core files to copy
const coreFiles = [
  "tesseract-core.wasm",
  "tesseract-core.wasm.js",
  "tesseract-core-simd.wasm",
  "tesseract-core-simd.wasm.js",
  "tesseract-core-simd-lstm.wasm",
  "tesseract-core-simd-lstm.wasm.js",
];

// Copy worker file from tesseract.js dist
const workerSourceDir = "node_modules/tesseract.js/dist";
const workerFiles = ["worker.min.js"];

// Language data URLs
const langDataFiles = [
  {
    name: "eng.traineddata",
    url: "https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0/eng.traineddata",
  },
];

// Function to download file
const downloadFile = (url, destinationPath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destinationPath);
    console.log(`📥 Downloading: ${path.basename(destinationPath)}...`);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to download ${url}: ${response.statusCode}`)
          );
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          console.log(`✅ Downloaded: ${path.basename(destinationPath)}`);
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(destinationPath, () => {}); // Delete the file on error
        reject(err);
      });
  });
};

console.log("🔄 Copying Tesseract.js assets...\n");

// Main async function
const setupTesseractAssets = async () => {
  // Copy core files
  console.log("📁 Copying core files...");
  coreFiles.forEach((file) => {
    const source = path.join(sourceDir, file);
    const target = path.join(targetDir, file);

    if (fs.existsSync(source)) {
      try {
        fs.copyFileSync(source, target);
        console.log(`✅ Copied: ${file}`);
      } catch (error) {
        console.error(`❌ Failed to copy ${file}:`, error.message);
      }
    } else {
      console.warn(`⚠️  Source file not found: ${file}`);
    }
  });

  // Copy worker files
  console.log("\n📁 Copying worker files...");
  workerFiles.forEach((file) => {
    const source = path.join(workerSourceDir, file);
    const target = path.join(targetDir, file);

    if (fs.existsSync(source)) {
      try {
        fs.copyFileSync(source, target);
        console.log(`✅ Copied: ${file}`);
      } catch (error) {
        console.error(`❌ Failed to copy ${file}:`, error.message);
      }
    } else {
      console.warn(`⚠️  Source file not found: ${file}`);
    }
  });
  // Create lang-data directory if it doesn't exist
  const langDataDir = path.join(targetDir, "lang-data");
  if (!fs.existsSync(langDataDir)) {
    fs.mkdirSync(langDataDir, { recursive: true });
    console.log("✅ Created lang-data directory");
  }

  // Download language data files
  console.log("\n📥 Downloading language data...");
  try {
    for (const langFile of langDataFiles) {
      const destinationPath = path.join(langDataDir, langFile.name);

      // Skip if file already exists
      if (fs.existsSync(destinationPath)) {
        console.log(`⏭️  Skipped: ${langFile.name} (already exists)`);
        continue;
      }

      await downloadFile(langFile.url, destinationPath);
    }
  } catch (error) {
    console.error("❌ Failed to download language data:", error.message);
    console.log("\n⚠️  You may need to manually download the language files:");
    langDataFiles.forEach((file) => {
      console.log(`   ${file.name}: ${file.url}`);
    });
  }

  console.log("\n🎉 Tesseract.js assets setup completed!");
  console.log(`📁 Files copied to: ${targetDir}`);
  console.log("\n📝 Next steps:");
  console.log("1. Configure your OCR component to use local files");
  console.log("2. Set workerPath, corePath in createWorker options");
  console.log("3. Test the OCR functionality");
};

// Run the setup
setupTesseractAssets().catch(console.error);

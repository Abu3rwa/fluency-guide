import React, { useState, useEffect, useRef } from "react";
import { createWorker } from "tesseract.js";
import Tesseract from "tesseract.js";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Chip,
  Grid,
  AlertTitle,
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import paymentService from "../services/paymentService";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const DuplicateWarning = ({ warnings, onViewExisting, t }) => {
  if (warnings.length === 0) return null;

  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      <AlertTitle>{t("duplicateWarningTitle")}</AlertTitle>
      {warnings.map((warning, index) => (
        <Box key={index} sx={{ mt: 1 }}>
          <Typography variant="body2">{warning.message}</Typography>
          {warning.existingPayment && (
            <Button
              size="small"
              onClick={() => onViewExisting(warning.existingPayment)}
              sx={{ mt: 1 }}
            >
              {t("viewExistingPayment")}
            </Button>
          )}
        </Box>
      ))}
    </Alert>
  );
};

const PaymentDialog = ({
  open,
  onClose,
  course,
  onPaymentComplete,
  userData,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionTimeout, setSubmissionTimeout] = useState(null);
  const [duplicateWarnings, setDuplicateWarnings] = useState([]);

  // OCR States
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrError, setOcrError] = useState("");
  const fileInputRef = useRef(null);

  // Bank of Khartoum payment information
  const bankInfo = {
    bankName: "Bank of Khartoum",
    accountName: "Abdulhafeez Ismael Alameen",
    accountNumber: "2809655",
    branch: "Huria branch",
    reference: "Course Enrollment",
  };

  const checkReferenceNumberRealTime = async (referenceNumber) => {
    if (referenceNumber.length < 3) return;

    try {
      const duplicates = await paymentService.checkDuplicateReferenceNumber(
        referenceNumber,
        userData.uid
      );
      if (duplicates.length > 0) {
        setDuplicateWarnings([
          {
            type: "referenceNumber",
            message: t("duplicateWarningMessage"),
            existingPayment: duplicates[0],
          },
        ]);
      } else {
        setDuplicateWarnings((prev) =>
          prev.filter((w) => w.type !== "referenceNumber")
        );
      }
    } catch (error) {
      console.error("Real-time check failed:", error);
    }
  };

  useEffect(() => {
    if (referenceNumber.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkReferenceNumberRealTime(referenceNumber);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [referenceNumber]);

  // OCR: Handle image upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setOcrError("");
      setExtractedText("");
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setOcrError("Please select a valid image file");
    }
  };
  // OCR: Process image with Tesseract.js
  const processImage = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    setOcrError("");
    setProgress(0);
    let worker = null;
    let timeoutId = null;
    try {
      // Timeout to prevent infinite processing
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("OCR processing timed out after 60 seconds"));
        }, 60000);
      });
      // Use self-hosted worker and language data
      const processingPromise = async () => {
        worker = createWorker({
          workerPath: process.env.PUBLIC_URL + "/tesseract/worker.min.js",
          corePath: process.env.PUBLIC_URL + "/tesseract/",
          langPath: process.env.PUBLIC_URL + "/tesseract/lang-data/",
          logger: (m) => {
            if (m.status === "recognizing text") {
              setProgress(Math.round(m.progress * 100));
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
        const {
          data: { text },
        } = await worker.recognize(selectedImage);
        setProgress(100);
        return text;
      };
      const text = await Promise.race([processingPromise(), timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);
      setExtractedText(text);
      console.log("Extracted OCR text:", text); // Log the extracted data for validation
    } catch (err) {
      setOcrError("Failed to extract text: " + err.message);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      if (worker) {
        try {
          await worker.terminate();
        } catch (err) {
          // Worker termination failed, but it's safe to ignore here.
        }
      }
      setIsProcessing(false);
      setProgress(0);
    }
  };
  // OCR: Clear all
  const clearAll = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setExtractedText("");
    setOcrError("");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  // OCR: Copy extracted text
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
    } catch (err) {
      // Clipboard copy failed, ignore for now.
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      setError("Please wait, submission in progress...");
      return;
    }

    if (!referenceNumber.trim()) {
      setError("Please enter the reference number");
      return;
    }

    if (!selectedImage) {
      setError("Please upload the payment receipt image");
      return;
    }

    if (!extractedText.trim()) {
      setError("Please extract text from the receipt image");
      return;
    }

    setLoading(true);
    setIsSubmitting(true);
    setError("");
    setSubmissionTimeout(setTimeout(() => setIsSubmitting(false), 10000)); // 10 second timeout

    try {
      const paymentData = {
        courseId: course?.id,
        courseTitle: course?.title,
        studentId: userData?.uid || userData?.id,
        studentName: userData?.displayName || userData?.name || userData?.email,
        amount: course?.price || 0,
        referenceNumber: referenceNumber.trim(),
        receiptFile: selectedImage, // OCR IMAGE
        bankInfo,
        sessionId: sessionStorage.getItem("sessionId"),
        extractedText, // OCR EXTRACTED TEXT
      };

      const result = await paymentService.submitPayment(paymentData);

      setSuccess(
        "Payment submitted successfully! Your enrollment will be reviewed shortly."
      );

      // Close dialog after 2 seconds
      setTimeout(() => {
        onPaymentComplete && onPaymentComplete(result);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to submit payment. Please try again.");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
      if (submissionTimeout) clearTimeout(submissionTimeout);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError("");
      setSuccess("");
      clearAll(); // OCR CLEAR FUNCTION
      setReferenceNumber("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          padding: 0,
          borderRadius: 2,
          minHeight: "60vh",
        },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <BankIcon color="primary" />
            {t("coursePayment")}
          </Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {success ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CheckCircleIcon
              sx={{ fontSize: 64, color: "success.main", mb: 2 }}
            />
            <Typography variant="h6" color="success.main" gutterBottom>
              {t("paymentSubmittedSuccessfully")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("enrollmentReviewed")}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Course Information */}
            <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
              <Typography variant="h6" gutterBottom>
                {t("course")}: {course?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("price")}: ${course?.price || t("free")}
              </Typography>
            </Paper>
            {/* Bank Information */}
            <Paper
              sx={{ p: 3, border: "2px dashed", borderColor: "primary.main" }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <BankIcon color="primary" />
                {t("bankTransferDetails")}
              </Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t("bankName")}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {bankInfo.bankName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t("accountName")}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {bankInfo.accountName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t("accountNumber")}
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{ fontFamily: "monospace" }}
                  >
                    {bankInfo.accountNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t("branch")}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {bankInfo.branch}
                  </Typography>
                </Grid>
              </Grid>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>{t("important")}:</strong> {t("includeNameAndCourse")}
                </Typography>
              </Alert>
            </Paper>
            <Divider />
            {/* Payment Details Form */}
            <Box>
              <TextField
                fullWidth
                label={t("referenceNumber")}
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder={t("enterReferenceNumber")}
                sx={{ mb: 2 }}
                required
              />
              <DuplicateWarning warnings={duplicateWarnings} t={t} />
              {/* OCR Upload Section */}
              <Box sx={{ mb: 2 }}>
                <Paper
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    borderStyle: "dashed",
                    p: 4,
                    textAlign: "center",
                    cursor: "pointer",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  <CloudUploadIcon
                    sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    Click to upload an image or drag and drop
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports PNG, JPG, JPEG, GIF, WebP
                  </Typography>
                  <VisuallyHiddenInput
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </Paper>
              </Box>
              {/* OCR Error Display */}
              {ocrError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {ocrError}
                </Alert>
              )}
              {/* Image Preview and Controls */}
              {imagePreview && (
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Image Preview</Typography>
                    <Box>
                      <Button
                        onClick={processImage}
                        disabled={isProcessing}
                        variant="contained"
                        startIcon={
                          isProcessing ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <ReceiptIcon />
                          )
                        }
                        sx={{ mr: 1 }}
                      >
                        {isProcessing ? "Processing..." : "Extract Text"}
                      </Button>
                      <Button
                        onClick={clearAll}
                        variant="outlined"
                        color="secondary"
                        startIcon={<CloseIcon />}
                      >
                        Clear
                      </Button>
                    </Box>
                  </Box>
                  <Paper variant="outlined" sx={{ p: 1 }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "300px",
                        display: "block",
                        margin: "auto",
                      }}
                    />
                  </Paper>
                </Box>
              )}
              {/* Progress Bar */}
              {isProcessing && (
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Processing image...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {progress}%
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      bgcolor: "grey.300",
                      borderRadius: 1,
                      height: 8,
                    }}
                  >
                    <Box
                      sx={{
                        width: `${progress}%`,
                        bgcolor: "primary.main",
                        borderRadius: 1,
                        height: 8,
                        transition: "width 0.3s ease-in-out",
                      }}
                    />
                  </Box>
                </Box>
              )}
              {/* Extracted Text */}
              {extractedText && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Extracted Text</Typography>
                    <Button onClick={copyToClipboard} size="small">
                      Copy Text
                    </Button>
                  </Box>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, maxHeight: 200, overflowY: "auto" }}
                  >
                    <Typography
                      component="pre"
                      sx={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        fontFamily: "monospace",
                      }}
                    >
                      {extractedText}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
            {/* Error/Success Messages */}
            {error && (
              <Alert severity="error" onClose={() => setError("")}>
                {" "}
                {error}{" "}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      {!success && (
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              loading ||
              !referenceNumber.trim() ||
              !selectedImage ||
              !extractedText.trim() ||
              isProcessing
            }
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? t("submitting") : t("submitPayment")}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default PaymentDialog;

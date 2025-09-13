import React, { useState, useEffect, useRef } from "react";

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
  Grid,
  AlertTitle,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Checkbox,
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  AccountBalance as BankIcon,
  CheckCircle as CheckCircleIcon,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionTimeout, setSubmissionTimeout] = useState(null);
  const [duplicateWarnings, setDuplicateWarnings] = useState([]);
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("online"); // "online" or "in_person"
  const [skipReceiptUpload, setSkipReceiptUpload] = useState(false);

  // User information state
  const [userInfo, setUserInfo] = useState({
    name: userData?.displayName || userData?.name || "",
    phone: userData?.phoneNumber || "",
    gender: "",
    age: ""
  });

  // Image upload state
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Bank of Khartoum payment information
  const bankInfo = {
    bankName: "Bank of Khartoum",
    accountName: "Abdulhafeez Ismael Alameen",
    accountNumber: "2809655",
    branch: "Huria branch",
    reference: "Course Enrollment",
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      setError("Please wait, submission in progress...");
      return;
    }

    // Validate user information
    if (!userInfo.name.trim()) {
      setError(t("validation.nameRequired", "Please enter your name."));
      return;
    }

    if (!userInfo.phone.trim()) {
      setError(t("validation.phoneRequired", "Please enter your phone/WhatsApp number."));
      return;
    }

    if (!userInfo.gender) {
      setError(t("validation.genderRequired", "Please select your gender."));
      return;
    }

    if (!userInfo.age || parseInt(userInfo.age) < 13 || parseInt(userInfo.age) > 99) {
      setError(t("validation.ageRequired", "Please enter a valid age (13-99)."));
      return;
    }

    // Receipt is required for online payments, optional for in-person payments
    if (paymentMethod === "online" && !selectedImage && !skipReceiptUpload) {
      setError(t("validation.receiptRequired", "Please upload a receipt image or check 'Admin will upload receipt'."));
      return;
    }

    setLoading(true);
    setIsSubmitting(true);
    setError("");
    setSubmissionTimeout(setTimeout(() => setIsSubmitting(false), 10000)); // 10 second timeout

    try {
      const paymentData = {
        courseId: course?.id,
        courseTitle: course?.title, // Automatically handled from course prop
        studentId: userData?.uid || userData?.id,
        // Use form data instead of userData for user information
        studentName: userInfo.name.trim(),
        studentPhone: userInfo.phone.trim(),
        studentGender: userInfo.gender,
        studentAge: parseInt(userInfo.age),
        amount: course?.price || 0,
        bankInfo,
        paymentMethod: paymentMethod,
        receiptImage: selectedImage, // May be null for in-person payments
        skipReceiptUpload: skipReceiptUpload,
        sessionId: sessionStorage.getItem("sessionId"),
      };

      const result = await paymentService.submitPayment(paymentData);

      setSuccess(
        paymentMethod === "online" 
          ? t("payment.successOnline", "Payment submitted successfully! Your enrollment will be reviewed shortly.")
          : t("payment.successInPerson", "Registration submitted successfully! Please complete payment in person as discussed.")
      );

      // Close dialog after 3 seconds
      setTimeout(() => {
        onPaymentComplete && onPaymentComplete(result);
        onClose();
      }, 3000);
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
      setPaymentMethod("online");
      setSkipReceiptUpload(false);
      setUserInfo({
        name: userData?.displayName || userData?.name || "",
        phone: userData?.phoneNumber || "",
        gender: "",
        age: ""
      });
      clearImage();
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
                  <strong>{t("important")}:</strong> {t("bankTransfer.note", "Please include your name and course title when making the bank transfer.")}
                </Typography>
              </Alert>
            </Paper>
            
            <Divider />
            
            {/* Payment Method Selection */}
            <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                  {t("paymentMethod.title", "Payment Method")}
                </FormLabel>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  sx={{ mb: 2 }}
                >
                  <FormControlLabel
                    value="online"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {t("paymentMethod.online", "Online Bank Transfer")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t("paymentMethod.onlineDesc", "Pay online and upload receipt")}
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="in_person"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {t("paymentMethod.inPerson", "In-Person Payment")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t("paymentMethod.inPersonDesc", "Pay in person - admin will process")}
                        </Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
                
                {paymentMethod === "in_person" && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      {t("paymentMethod.inPersonNote", "Please contact the admin to arrange in-person payment. Your registration will be processed once payment is confirmed.")}
                    </Typography>
                  </Alert>
                )}
              </FormControl>
            </Paper>
            
            <Divider />
            
            {/* User Information Section */}
            <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                {t("userInfo.title", "Personal Information")}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t("userInfo.name", "Full Name")} 
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                    placeholder={t("userInfo.namePlaceholder", "Enter your full name")}
                    required
                    error={!userInfo.name.trim()}
                    helperText={!userInfo.name.trim() ? t("validation.nameRequired", "Name is required") : ""}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t("userInfo.phone", "Phone/WhatsApp Number")}
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                    placeholder={t("userInfo.phonePlaceholder", "e.g., +249123456789")}
                    required
                    error={!userInfo.phone.trim()}
                    helperText={!userInfo.phone.trim() ? t("validation.phoneRequired", "Phone number is required") : ""}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!userInfo.gender}>
                    <FormLabel component="legend" sx={{ mb: 1 }}>
                      {t("userInfo.gender", "Gender")}
                    </FormLabel>
                    <RadioGroup
                      value={userInfo.gender}
                      onChange={(e) => setUserInfo({...userInfo, gender: e.target.value})}
                      row
                    >
                      <FormControlLabel
                        value="male"
                        control={<Radio />}
                        label={t("userInfo.male", "Male")}
                      />
                      <FormControlLabel
                        value="female"
                        control={<Radio />}
                        label={t("userInfo.female", "Female")}
                      />
                    </RadioGroup>
                    {!userInfo.gender && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {t("validation.genderRequired", "Gender is required")}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t("userInfo.age", "Age")}
                    value={userInfo.age}
                    onChange={(e) => setUserInfo({...userInfo, age: e.target.value})}
                    placeholder={t("userInfo.agePlaceholder", "Enter your age")}
                    required
                    inputProps={{ min: 13, max: 99 }}
                    error={!userInfo.age || parseInt(userInfo.age) < 13 || parseInt(userInfo.age) > 99}
                    helperText={(!userInfo.age || parseInt(userInfo.age) < 13 || parseInt(userInfo.age) > 99) ? t("validation.ageRequired", "Age must be between 13-99") : ""}
                  />
                </Grid>
              </Grid>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>{t("userInfo.note", "Note:")}:</strong> {t("userInfo.noteText", "This information is required for course enrollment and will be used for communication purposes.")}
                </Typography>
              </Alert>
            </Paper>
            
            <Divider />
            {/* Payment Details Form */}
            <Box>
              <DuplicateWarning warnings={duplicateWarnings} t={t} />
              
              {/* Receipt Upload Section - Only for online payments */}
              {paymentMethod === "online" && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t("receipt.upload", "Upload Receipt")}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={skipReceiptUpload}
                          onChange={(e) => setSkipReceiptUpload(e.target.checked)}
                        />
                      }
                      label={t("receipt.adminWillUpload", "Admin will upload receipt")}
                      sx={{ fontSize: '0.875rem' }}
                    />
                  </Box>
                  
                  {!skipReceiptUpload && (
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
                        {t("receipt.clickToUpload", "Click to upload receipt or drag and drop")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("receipt.supportedFormats", "Supports PNG, JPG, JPEG")}
                      </Typography>
                      <VisuallyHiddenInput
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileUpload}
                      />
                    </Paper>
                  )}
                </Box>
              )}
              
              {/* In-Person Payment Note */}
              {/* {paymentMethod === "in_person" && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>{t("payment.inPersonNote", "Important:")}</strong> {t("payment.inPersonInstructions", "Please bring your reference number when making the in-person payment. The admin will upload the receipt on your behalf.")}
                  </Typography>
                </Alert>
              )} */}

              {/* Image Preview - Only for online payments with uploaded receipt */}
              {paymentMethod === "online" && imagePreview && (
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">
                      {t("receipt.preview", "Receipt Preview")}
                    </Typography>
                    <Button
                      onClick={clearImage}
                      variant="outlined"
                      color="secondary"
                      startIcon={<CloseIcon />}
                    >
                      {t("common.clear", "Clear")}
                    </Button>
                  </Box>
                  <Paper variant="outlined" sx={{ p: 1 }}>
                    <img
                      src={imagePreview}
                      alt={t("receipt.previewAlt", "Receipt Preview")}
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
            </Box>
            {/* Error/Success Messages */}
            {error && (
              <Alert severity="error" onClose={() => setError("")}>
                {error}
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
              !userInfo.name.trim() ||
              !userInfo.phone.trim() ||
              !userInfo.gender ||
              !userInfo.age ||
              parseInt(userInfo.age) < 13 ||
              parseInt(userInfo.age) > 99 ||
              (paymentMethod === "online" && !skipReceiptUpload && !selectedImage)
            }
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading 
              ? t("common.submitting", "Submitting...") 
              : paymentMethod === "online"
                ? t("payment.submitPayment", "Submit Payment")
                : t("payment.submitRegistration", "Submit Registration")
            }
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default PaymentDialog;

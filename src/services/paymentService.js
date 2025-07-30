import { db, storage } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const PAYMENTS_COLLECTION = "payments";
const ENROLLMENTS_COLLECTION = "enrollments";
const DUPLICATE_DETECTION_COLLECTION = "duplicate_detections";

// Function to calculate file hash
const calculateFileHash = async (file) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

// Function to check for duplicate file hash
const checkDuplicateFile = async (fileHash, studentId) => {
  const existingPayment = await getDocs(
    query(
      collection(db, PAYMENTS_COLLECTION),
      where("fileHash", "==", fileHash),
      where("studentId", "==", studentId)
    )
  );
  return !existingPayment.empty;
};

const recordDuplicateAttempt = async (
  paymentData,
  duplicateType,
  existingPayment
) => {
  await addDoc(collection(db, DUPLICATE_DETECTION_COLLECTION), {
    studentId: paymentData.studentId,
    courseId: paymentData.courseId,
    duplicateType, // 'transactionId', 'referenceNumber', 'fileHash', etc.
    existingPaymentId: existingPayment.id,
    attemptedAt: serverTimestamp(),
    userAgent: navigator.userAgent,
    ipAddress: null, // Could be added if needed
    sessionId: sessionStorage.getItem("sessionId"),
  });
};

const paymentService = {
  async checkDuplicateReferenceNumber(referenceNumber, studentId) {
    const existingPayment = await getDocs(
      query(
        collection(db, PAYMENTS_COLLECTION),
        where("referenceNumber", "==", referenceNumber),
        where("studentId", "==", studentId)
      )
    );
    return existingPayment.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  // Submit payment with receipt
  async submitPayment(paymentData) {
    try {
      const {
        courseId,
        courseTitle,
        studentId,
        studentName,
        amount,
        referenceNumber,
        receiptFile,
        bankInfo,
        sessionId,
        extractedText,
      } = paymentData;

      // Check for duplicate reference number
      if (referenceNumber) {
        const existingPayment = await getDocs(
          query(
            collection(db, PAYMENTS_COLLECTION),
            where("referenceNumber", "==", referenceNumber),
            where("studentId", "==", studentId)
          )
        );

        if (!existingPayment.empty) {
          await recordDuplicateAttempt(
            paymentData,
            "referenceNumber",
            existingPayment.docs[0]
          );
          throw new Error(
            "This reference number has already been submitted. Please check your payment status."
          );
        }
      }

      // 1. Upload receipt file to Firebase Storage and calculate hash
      let receiptUrl = null;
      let fileHash = null;
      if (receiptFile) {
        fileHash = await calculateFileHash(receiptFile);
        const isDuplicateFile = await checkDuplicateFile(fileHash, studentId);
        if (isDuplicateFile) {
          throw new Error("This receipt has already been uploaded.");
        }

        const fileName = `receipts/${studentId}/${Date.now()}_${
          receiptFile.name
        }`;
        const storageRef = ref(storage, fileName);
        const snapshot = await uploadBytes(storageRef, receiptFile);
        receiptUrl = await getDownloadURL(snapshot.ref);
      }

      // 2. Create payment record in Firestore
      const paymentRecord = {
        courseId,
        courseTitle,
        studentId,
        studentName,
        amount,
        referenceNumber,
        receiptUrl,
        bankInfo,
        status: "pending", // pending, approved, rejected
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        paymentMethod: "bank_transfer",
        currency: "SDG",

        // Enhanced duplicate prevention fields
        fileHash,
        fileSize: receiptFile.size,
        fileType: receiptFile.type,

        // Full OCR text
        ocrText: extractedText || null,
        sessionId: sessionId || null,

        // Additional metadata
        ipAddress: null, // Could be added if needed
        userAgent: navigator.userAgent,
        submissionMethod: "web_form",
        validationStatus: "pending",
        validationChecks: {
          fileHashValid: true,
          ocrExtractionSuccess: null,
          duplicateCheckPassed: true,
          rateLimitPassed: true,
        },
      };

      const paymentDoc = await addDoc(
        collection(db, PAYMENTS_COLLECTION),
        paymentRecord
      );

      // 3. Create or update enrollment record
      const enrollmentData = {
        courseId,
        studentId,
        paymentId: paymentDoc.id,
        status: "pending", // pending, active, rejected
        enrolledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Check if enrollment already exists
      const enrollmentsRef = collection(db, ENROLLMENTS_COLLECTION);
      const existingEnrollment = await getDocs(
        query(
          enrollmentsRef,
          where("courseId", "==", courseId),
          where("studentId", "==", studentId)
        )
      );

      if (existingEnrollment.empty) {
        // Create new enrollment
        const newEnrollment = await addDoc(
          collection(db, ENROLLMENTS_COLLECTION),
          enrollmentData
        );
        await updateDoc(paymentDoc.ref, { enrollmentId: newEnrollment.id });
      } else {
        // Update existing enrollment
        const enrollmentDoc = existingEnrollment.docs[0];
        await updateDoc(doc(db, ENROLLMENTS_COLLECTION, enrollmentDoc.id), {
          paymentId: paymentDoc.id,
          status: "pending",
          updatedAt: serverTimestamp(),
        });
        await updateDoc(paymentDoc.ref, { enrollmentId: enrollmentDoc.id });
      }

      return {
        paymentId: paymentDoc.id,
        success: true,
        message: "Payment submitted successfully",
      };
    } catch (error) {
      console.error("Error submitting payment:", error);
      throw new Error("Failed to submit payment. Please try again.");
    }
  },

  // Get payment by ID
  async getPaymentById(paymentId) {
    try {
      const paymentDoc = await getDoc(doc(db, PAYMENTS_COLLECTION, paymentId));
      if (paymentDoc.exists()) {
        return {
          id: paymentDoc.id,
          ...paymentDoc.data(),
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting payment:", error);
      throw error;
    }
  },

  // Get payments by student
  async getPaymentsByStudent(studentId) {
    try {
      const paymentsQuery = query(
        collection(db, PAYMENTS_COLLECTION),
        where("studentId", "==", studentId),
        orderBy("submittedAt", "desc")
      );

      const snapshot = await getDocs(paymentsQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting student payments:", error);
      throw error;
    }
  },

  // Update payment status (admin function)
  async updatePaymentStatus(paymentId, status, adminNotes = "") {
    try {
      const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
      const updateData = {
        status,
        adminNotes,
        updatedAt: serverTimestamp(),
      };

      if (status === "approved") {
        updateData.approvedAt = serverTimestamp();
      } else if (status === "rejected") {
        updateData.rejectedAt = serverTimestamp();
      }

      await updateDoc(paymentRef, updateData);

      return { success: true };
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  },

  // Get all pending payments (admin function)
  async getPendingPayments() {
    try {
      const paymentsQuery = query(
        collection(db, PAYMENTS_COLLECTION),
        where("status", "==", "pending"),
        orderBy("submittedAt", "desc")
      );

      const snapshot = await getDocs(paymentsQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting pending payments:", error);
      throw error;
    }
  },

  // Get all payments (admin function) - for debugging
  async getAllPayments() {
    try {
      const paymentsQuery = query(
        collection(db, PAYMENTS_COLLECTION),
        orderBy("submittedAt", "desc")
      );

      const snapshot = await getDocs(paymentsQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting all payments:", error);
      throw error;
    }
  },
};

export default paymentService;

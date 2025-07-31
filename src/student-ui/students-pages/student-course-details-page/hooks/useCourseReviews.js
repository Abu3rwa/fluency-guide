import { useState, useCallback } from "react";
import { useUser } from "../../../../contexts/UserContext";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../firebase";
import { useTranslation } from "react-i18next";

export const useCourseReviews = (courseId) => {
  const { t } = useTranslation();
  const { userData } = useUser();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch reviews from Firestore
  const fetchReviews = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);
    setError(null);

    try {
      const reviewsQuery = query(
        collection(db, "courseReviews"),
        where("courseId", "==", courseId)
      );
      const snapshot = await getDocs(reviewsQuery);
      const reviewsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(reviewsData);
    } catch (e) {
      setError(t("studentCourseDetails.page.fetchReviewsError"));
    } finally {
      setLoading(false);
    }
  }, [courseId, t]);

  // Submit a new review
  const submitReview = useCallback(
    async (rating, reviewText) => {
      if (!userData || !courseId) return;

      setLoading(true);
      setError(null);

      try {
        await addDoc(collection(db, "courseReviews"), {
          studentId: userData.uid || userData.id,
          courseId,
          rating,
          review: reviewText,
          userName:
            userData.displayName ||
            userData.name ||
            t("studentCourseDetails.reviews.student"),
          createdAt: serverTimestamp(),
        });

        // Refresh reviews after submission
        await fetchReviews();
      } catch (e) {
        setError(t("studentCourseDetails.page.reviewError"));
      } finally {
        setLoading(false);
      }
    },
    [courseId, userData, fetchReviews, t]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    submitReview,
    clearError,
  };
};

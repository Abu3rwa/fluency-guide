import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";

// Lesson operations
export const createLesson = async (lessonData) => {
  try {
    console.log("Creating lesson with data:", lessonData);

    // Validate required fields
    if (!lessonData.courseId || !lessonData.moduleId || !lessonData.title) {
      throw new Error(
        "Missing required fields: courseId, moduleId, and title are required"
      );
    }

    // Accept all recommended fields for a lesson
    const {
      moduleId,
      courseId,
      title,
      description,
      content,
      order,
      objectives = [],
      resources = [],
      videoUrl = "",
      attachments = [],
      quizId = "",
      taskId = "",
      duration = 0,
      status = "draft",
      prerequisites = [],
      coverImageUrl = "",
      authorId = "",
      discussionId = "",
      tags = [],
      isFreePreview = false,
      visibility = "enrolledOnly",
      vocabulary = [],
      grammarFocus = [],
      skills = [],
      assessment = "",
      keyActivities = [],
    } = lessonData;
    const lessonRef = await addDoc(collection(db, "lessons"), {
      moduleId,
      courseId,
      title,
      description,
      content,
      order,
      objectives,
      resources,
      videoUrl,
      attachments,
      quizId,
      taskId,
      duration,
      status,
      prerequisites,
      coverImageUrl,
      authorId,
      discussionId,
      tags,
      isFreePreview,
      visibility,
      vocabulary,
      grammarFocus,
      skills,
      assessment,
      keyActivities,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("Lesson created successfully with ID:", lessonRef.id);
    return { id: lessonRef.id, ...lessonData };
  } catch (error) {
    console.error("Error in createLesson:", error);
    throw new Error(`Failed to create lesson: ${error.message}`);
  }
};

export const updateLesson = async (lessonId, lessonData) => {
  try {
    // Validate required fields
    if (!lessonData.title) {
      throw new Error("Title is required");
    }

    const lessonRef = doc(db, "lessons", lessonId);

    // First check if lesson exists
    const lessonDoc = await getDoc(lessonRef);
    if (!lessonDoc.exists()) {
      throw new Error("Lesson not found");
    }

    // Update the lesson
    await updateDoc(lessonRef, {
      ...lessonData,
      updatedAt: serverTimestamp(),
    });

    // Get the updated lesson
    const updatedLessonDoc = await getDoc(lessonRef);
    return { id: lessonId, ...updatedLessonDoc.data() };
  } catch (error) {
    console.error("Error in updateLesson:", error);
    throw new Error(`Failed to update lesson: ${error.message}`);
  }
};

export const deleteLesson = async (lessonId) => {
  try {
    const lessonRef = doc(db, "lessons", lessonId);

    // First check if lesson exists
    const lessonDoc = await getDoc(lessonRef);
    if (!lessonDoc.exists()) {
      throw new Error("Lesson not found");
    }

    // Use a transaction to ensure atomicity
    await runTransaction(db, async (transaction) => {
      // Delete the lesson
      transaction.delete(lessonRef);

      // If the lesson has a quiz, delete it
      const lessonData = lessonDoc.data();
      if (lessonData.quizId) {
        const quizRef = doc(db, "quizzes", lessonData.quizId);
        transaction.delete(quizRef);
      }

      // If the lesson has a task, delete it
      if (lessonData.taskId) {
        const taskRef = doc(db, "tasks", lessonData.taskId);
        transaction.delete(taskRef);
      }

      // If the lesson has a discussion, delete it
      if (lessonData.discussionId) {
        const discussionRef = doc(db, "discussions", lessonData.discussionId);
        transaction.delete(discussionRef);
      }
    });

    return true;
  } catch (error) {
    console.error("Error in deleteLesson:", error);
    throw new Error(`Failed to delete lesson: ${error.message}`);
  }
};

export const getLesson = async (lessonId) => {
  try {
    const lessonDoc = await getDoc(doc(db, "lessons", lessonId));
    if (!lessonDoc.exists()) {
      throw new Error("Lesson not found");
    }
    return { id: lessonDoc.id, ...lessonDoc.data() };
  } catch (error) {
    throw new Error("Failed to get lesson: " + error.message);
  }
};

export const getLessonsByCourseAndModule = async (courseId, moduleId) => {
  try {
    const lessonsQuery = query(
      collection(db, "lessons"),
      where("courseId", "==", courseId),
      where("moduleId", "==", moduleId),
      where("type", "==", "lesson")
    );
    const snapshot = await getDocs(lessonsQuery);
    const lessons = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // Sort lessons by createdAt in memory
    return lessons.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateA - dateB;
    });
  } catch (error) {
    throw new Error("Failed to get lessons: " + error.message);
  }
};

export const getLessonsByCourse = async (courseId) => {
  try {
    const lessonsQuery = query(
      collection(db, "lessons"),
      where("courseId", "==", courseId),
      where("type", "==", "lesson")
    );
    const snapshot = await getDocs(lessonsQuery);
    const lessons = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // Sort lessons by createdAt in memory
    return lessons.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateA - dateB;
    });
  } catch (error) {
    throw new Error("Failed to get lessons: " + error.message);
  }
};

// Quiz operations
export const createQuiz = async (quizData) => {
  try {
    const quizRef = await addDoc(collection(db, "english_lessons"), {
      ...quizData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      type: "quiz",
    });
    return { id: quizRef.id, ...quizData };
  } catch (error) {
    throw new Error("Failed to create quiz: " + error.message);
  }
};

export const updateQuiz = async (quizId, quizData) => {
  try {
    const quizRef = doc(db, "english_lessons", quizId);
    await updateDoc(quizRef, {
      ...quizData,
      updatedAt: serverTimestamp(),
    });
    return { id: quizId, ...quizData };
  } catch (error) {
    throw new Error("Failed to update quiz: " + error.message);
  }
};

export const deleteQuiz = async (quizId) => {
  try {
    await deleteDoc(doc(db, "english_lessons", quizId));
    return true;
  } catch (error) {
    throw new Error("Failed to delete quiz: " + error.message);
  }
};

export const getQuiz = async (quizId) => {
  try {
    const quizDoc = await getDoc(doc(db, "english_lessons", quizId));
    if (!quizDoc.exists()) {
      throw new Error("Quiz not found");
    }
    return { id: quizDoc.id, ...quizDoc.data() };
  } catch (error) {
    throw new Error("Failed to get quiz: " + error.message);
  }
};

export const getQuizzesByCourse = async (courseId) => {
  try {
    const quizzesQuery = query(
      collection(db, "english_lessons"),
      where("courseId", "==", courseId),
      where("type", "==", "quiz"),
      orderBy("createdAt", "asc")
    );
    const snapshot = await getDocs(quizzesQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error("Failed to get quizzes: " + error.message);
  }
};

export const getLessonsByModuleId = async (moduleId) => {
  try {
    const lessonsRef = collection(db, "lessons");
    const q = query(
      lessonsRef,
      where("moduleId", "==", moduleId),
      orderBy("order")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error("Failed to fetch lessons");
  }
};

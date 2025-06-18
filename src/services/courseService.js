import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  writeBatch,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../firebase";
import { storage } from "../config/firebase";
import moduleService from "./moduleService";

const COURSE_DRAFT_KEY = "course_draft";

const courseService = {
  // Save course draft to local storage
  saveDraft(courseData) {
    localStorage.setItem(COURSE_DRAFT_KEY, JSON.stringify(courseData));
  },

  // Get course draft from local storage
  getDraft() {
    const draft = localStorage.getItem(COURSE_DRAFT_KEY);
    return draft ? JSON.parse(draft) : null;
  },

  // Clear course draft from local storage
  clearDraft() {
    localStorage.removeItem(COURSE_DRAFT_KEY);
  },

  // Create a new course
  async createCourse(courseData) {
    try {
      let thumbnailUrl = courseData.thumbnail;
      if (courseData.thumbnailFile) {
        const storageRef = ref(
          storage,
          `courses/${Date.now()}_${courseData.thumbnailFile.name}`
        );
        await uploadBytes(storageRef, courseData.thumbnailFile);
        thumbnailUrl = await getDownloadURL(storageRef);
      }

      const courseToSave = {
        ...courseData,
        thumbnail: thumbnailUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        enrolledStudents: 0,
        rating: 0,
        totalRatings: 0,
        reviews: [],
      };

      const docRef = await addDoc(collection(db, "courses"), courseToSave);
      return { id: docRef.id, ...courseToSave };
    } catch (error) {
      throw new Error(`Failed to create course: ${error.message}`);
    }
  },

  // Get all courses
  async getAllCourses() {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }
  },

  // Update a course
  async updateCourse(courseId, courseData) {
    try {
      const courseRef = doc(db, "courses", courseId);
      await updateDoc(courseRef, {
        ...courseData,
        updatedAt: serverTimestamp(),
      });
      return { id: courseId, ...courseData };
    } catch (error) {
      throw new Error(`Failed to update course: ${error.message}`);
    }
  },

  // Delete a course
  async deleteCourse(courseId) {
    try {
      await deleteDoc(doc(db, "courses", courseId));
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete course: ${error.message}`);
    }
  },

  // Get a course by ID
  async getCourseById(courseId) {
    try {
      console.log("Fetching course with ID:", courseId);
      const docRef = doc(db, "courses", courseId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log("Course not found:", courseId);
        throw new Error("Course not found");
      }

      const courseData = { id: docSnap.id, ...docSnap.data() };
      console.log("Course data retrieved:", courseData);
      return courseData;
    } catch (error) {
      console.error("Error in getCourseById:", error);
      if (error.message === "Course not found") {
        throw error;
      }
      throw new Error(`Failed to fetch course: ${error.message}`);
    }
  },

  // Get courses by category
  async getCoursesByCategory(category) {
    try {
      const q = query(
        collection(db, "courses"),
        where("category", "==", category)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch courses by category: ${error.message}`);
    }
  },

  // Get courses by level
  async getCoursesByLevel(level) {
    try {
      const q = query(collection(db, "courses"), where("level", "==", level));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch courses by level: ${error.message}`);
    }
  },

  // Create a new lesson
  async createLesson(lessonData) {
    try {
      const lessonToSave = {
        ...lessonData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "lessons"), lessonToSave);
      return { id: docRef.id, ...lessonToSave };
    } catch (error) {
      throw new Error(`Failed to create lesson: ${error.message}`);
    }
  },

  // Get course modules
  async getCourseModules(courseId) {
    try {
      return await moduleService.getModulesByCourseId(courseId);
    } catch (error) {
      throw new Error(`Failed to fetch course modules: ${error.message}`);
    }
  },

  // Create module
  async createModule(courseId, moduleData) {
    try {
      return await moduleService.createModule(courseId, moduleData);
    } catch (error) {
      throw new Error(`Failed to create module: ${error.message}`);
    }
  },

  // Update module
  async updateModule(moduleId, moduleData) {
    try {
      return await moduleService.updateModule(moduleId, moduleData);
    } catch (error) {
      throw new Error(`Failed to update module: ${error.message}`);
    }
  },

  // Delete module
  async deleteModule(courseId, moduleId) {
    try {
      return await moduleService.deleteModule(moduleId);
    } catch (error) {
      throw new Error(`Failed to delete module: ${error.message}`);
    }
  },

  // Update module order
  async updateModuleOrder(courseId, moduleIds) {
    try {
      return await moduleService.updateModuleOrder(courseId, moduleIds);
    } catch (error) {
      throw new Error(`Failed to update module order: ${error.message}`);
    }
  },

  // Get course analytics
  async getCourseAnalytics(courseId) {
    try {
      // Get enrolled students count
      const enrollmentsQuery = query(
        collection(db, "enrollments"),
        where("courseId", "==", courseId)
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const totalEnrolled = enrollmentsSnapshot.size;

      // Get all course progress data
      const progressQuery = query(
        collection(db, "courseProgress"),
        where("courseId", "==", courseId)
      );
      const progressSnapshot = await getDocs(progressQuery);

      // Calculate active students (in memory)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeStudents = progressSnapshot.docs.filter((doc) => {
        const data = doc.data();
        return data.lastAccessed && data.lastAccessed.toDate() >= thirtyDaysAgo;
      }).length;

      // Calculate completion rate
      const completedCount = progressSnapshot.docs.filter(
        (doc) => doc.data().isCompleted === true
      ).length;
      const completionRate =
        totalEnrolled > 0 ? (completedCount / totalEnrolled) * 100 : 0;

      // Calculate average score and time spent
      let totalScore = 0;
      let scoreCount = 0;
      let totalTimeSpent = 0;
      let timeCount = 0;

      progressSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.averageScore) {
          totalScore += data.averageScore;
          scoreCount++;
        }
        if (data.totalTimeSpent) {
          totalTimeSpent += data.totalTimeSpent;
          timeCount++;
        }
      });

      const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;
      const averageTimeSpent = timeCount > 0 ? totalTimeSpent / timeCount : 0;

      // Calculate satisfaction rate from reviews
      const reviewsQuery = query(
        collection(db, "courseReviews"),
        where("courseId", "==", courseId)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      let totalRating = 0;
      let reviewCount = 0;

      reviewsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.rating) {
          totalRating += data.rating;
          reviewCount++;
        }
      });

      const satisfactionRate =
        reviewCount > 0 ? (totalRating / (reviewCount * 5)) * 100 : 0;

      return {
        completionRate: Math.round(completionRate),
        averageScore: Math.round(averageScore),
        activeStudents,
        totalEnrolled,
        averageTimeSpent: Math.round(averageTimeSpent),
        satisfactionRate: Math.round(satisfactionRate),
      };
    } catch (error) {
      throw new Error(`Failed to fetch course analytics: ${error.message}`);
    }
  },

  // Get student progress for a course
  async getStudentProgress(courseId) {
    try {
      // Get all course progress data
      const progressQuery = query(
        collection(db, "courseProgress"),
        where("courseId", "==", courseId)
      );
      const progressSnapshot = await getDocs(progressQuery);

      // Get user data for each progress record
      const progressData = await Promise.all(
        progressSnapshot.docs.map(async (doc) => {
          const progress = doc.data();
          const userRef = doc(db, "users", progress.userId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : null;

          return {
            id: doc.id,
            userId: progress.userId,
            name: userData
              ? `${userData.firstName} ${userData.lastName}`
              : "Unknown User",
            email: userData?.email || "No email",
            completionRate: progress.completionRate || 0,
            lastActivity: progress.lastAccessed
              ? progress.lastAccessed.toDate().toLocaleDateString()
              : "Never",
            averageScore: progress.averageScore || 0,
            totalTimeSpent: progress.totalTimeSpent || 0,
            isCompleted: progress.isCompleted || false,
            lastModule: progress.lastModule || "Not started",
            lastLesson: progress.lastLesson || "Not started",
          };
        })
      );

      // Sort by last activity (most recent first)
      return progressData.sort((a, b) => {
        if (a.lastActivity === "Never") return 1;
        if (b.lastActivity === "Never") return -1;
        return new Date(b.lastActivity) - new Date(a.lastActivity);
      });
    } catch (error) {
      throw new Error(`Failed to fetch student progress: ${error.message}`);
    }
  },
};

export default courseService;

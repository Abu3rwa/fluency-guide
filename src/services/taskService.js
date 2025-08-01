import { db } from "../firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const COLLECTION_NAME = "tasks";

// Utility to normalize task data to match Flutter Task model
function normalizeTaskData(data, includeId = false) {
  const normalizedData = {
    title: data.title || "",
    instructions: data.instructions || "",
    type: data.type || "multipleChoice",
    timeLimit: typeof data.timeLimit === "number" ? data.timeLimit : 0,
    passingScore:
      typeof data.passingScore === "number" ? data.passingScore : 70,
    attemptsAllowed:
      typeof data.attemptsAllowed === "number" ? data.attemptsAllowed : 1,
    difficulty: data.difficulty || "medium",
    tags: Array.isArray(data.tags) ? data.tags : [],
    isPublished:
      typeof data.isPublished === "boolean" ? data.isPublished : false,
    showFeedback:
      typeof data.showFeedback === "boolean" ? data.showFeedback : true,
    randomizeQuestions:
      typeof data.randomizeQuestions === "boolean"
        ? data.randomizeQuestions
        : false,
    showCorrectAnswers:
      typeof data.showCorrectAnswers === "boolean"
        ? data.showCorrectAnswers
        : true,
    allowReview:
      typeof data.allowReview === "boolean" ? data.allowReview : true,
    pointsPerQuestion:
      typeof data.pointsPerQuestion === "number" ? data.pointsPerQuestion : 1,
    totalPoints: typeof data.totalPoints === "number" ? data.totalPoints : 0,
    questions: Array.isArray(data.questions) ? data.questions : [],
    lessonId: data.lessonId || "",
    courseId: data.courseId || "",
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    status: data.status || "draft",
    metadata:
      typeof data.metadata === "object" && data.metadata !== null
        ? data.metadata
        : {},
  };

  // Only include ID if explicitly requested (for updates)
  if (includeId && data.id) {
    normalizedData.id = data.id;
  }

  return normalizedData;
}

export const createTask = async (courseId, lessonId, taskData) => {
  try {
    const normalizedTask = normalizeTaskData(
      {
        ...taskData,
        courseId,
        lessonId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      false
    ); // Don't include ID for new tasks

    const taskRef = await addDoc(
      collection(db, COLLECTION_NAME),
      normalizedTask
    );
    return {
      id: taskRef.id,
      ...normalizedTask,
    };
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

export const updateTask = async (courseId, lessonId, taskId, taskData) => {
  try {
    const normalizedTask = normalizeTaskData(
      {
        ...taskData,
        id: taskId, // Include the task ID for updates
        courseId,
        lessonId,
        updatedAt: new Date(),
      },
      true
    ); // Include ID for updates

    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await updateDoc(taskRef, normalizedTask);
    return {
      id: taskId,
      ...normalizedTask,
    };
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const deleteTask = async (courseId, lessonId, taskId) => {
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export const getTask = async (taskId) => {
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      throw new Error("Task not found");
    }

    const taskData = taskDoc.data();
    return {
      ...taskData,
      // Always use Firebase document ID as the task ID
      id: taskDoc.id,
    };
  } catch (error) {
    console.error("Error getting task:", error);
    throw error;
  }
};

export const getTasksByLesson = async (courseId, lessonId) => {
  try {
    const tasksQuery = query(
      collection(db, COLLECTION_NAME),
      where("courseId", "==", courseId),
      where("lessonId", "==", lessonId)
    );

    const querySnapshot = await getDocs(tasksQuery);
    return querySnapshot.docs.map((doc) => {
      const taskData = doc.data();
      return {
        ...taskData,
        // Always use Firebase document ID as the task ID
        id: doc.id,
      };
    });
  } catch (error) {
    console.error("Error getting tasks:", error);
    throw error;
  }
};

export const getAllTasks = async () => {
  try {
    const tasksQuery = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(tasksQuery);
    return querySnapshot.docs.map((doc) => {
      const taskData = doc.data();
      return {
        ...taskData,
        // Always use Firebase document ID as the task ID
        id: doc.id,
      };
    });
  } catch (error) {
    console.error("Error getting all tasks:", error);
    throw error;
  }
};

// Helper function to identify tasks with empty IDs in their original data
export const getTasksWithEmptyIds = async () => {
  try {
    const tasksQuery = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(tasksQuery);
    return querySnapshot.docs
      .map((doc) => {
        const taskData = doc.data();
        return {
          ...taskData,
          // Always use Firebase document ID as the task ID
          id: doc.id,
          // Store original data for comparison
          _originalData: taskData,
        };
      })
      .filter((task) => {
        // Check if the original data had an empty ID field
        const originalData = task._originalData || {};
        return !originalData.id || originalData.id.trim() === "";
      });
  } catch (error) {
    console.error("Error getting tasks with empty IDs:", error);
    throw error;
  }
};

export const publishTask = async (courseId, lessonId, taskId) => {
  try {
    console.log("Publishing task:", { courseId, lessonId, taskId });

    // Validate taskId
    if (!taskId || taskId.trim() === "") {
      throw new Error("Invalid task ID");
    }

    const taskRef = doc(db, COLLECTION_NAME, taskId);

    // First check if task exists
    const taskDoc = await getDoc(taskRef);
    if (!taskDoc.exists()) {
      throw new Error("Task not found");
    }

    await updateDoc(taskRef, {
      status: "published",
      updatedAt: new Date(),
    });

    console.log("Task published successfully:", taskId);
    return {
      id: taskId,
      status: "published",
    };
  } catch (error) {
    console.error("Error publishing task:", error);
    throw error;
  }
};

export const archiveTask = async (courseId, lessonId, taskId) => {
  try {
    console.log("Archiving task:", { courseId, lessonId, taskId });

    // Validate taskId
    if (!taskId || taskId.trim() === "") {
      throw new Error("Invalid task ID");
    }

    const taskRef = doc(db, COLLECTION_NAME, taskId);

    // First check if task exists
    const taskDoc = await getDoc(taskRef);
    if (!taskDoc.exists()) {
      throw new Error("Task not found");
    }

    await updateDoc(taskRef, {
      status: "archived",
      updatedAt: new Date(),
    });

    console.log("Task archived successfully:", taskId);
    return {
      id: taskId,
      status: "archived",
    };
  } catch (error) {
    console.error("Error archiving task:", error);
    throw error;
  }
};

export const draftTask = async (courseId, lessonId, taskId) => {
  try {
    console.log("Setting task to draft:", { courseId, lessonId, taskId });

    // Validate taskId
    if (!taskId || taskId.trim() === "") {
      throw new Error("Invalid task ID");
    }

    const taskRef = doc(db, COLLECTION_NAME, taskId);

    // First check if task exists
    const taskDoc = await getDoc(taskRef);
    if (!taskDoc.exists()) {
      throw new Error("Task not found");
    }

    await updateDoc(taskRef, {
      status: "draft",
      updatedAt: new Date(),
    });

    console.log("Task set to draft successfully:", taskId);
    return {
      id: taskId,
      status: "draft",
    };
  } catch (error) {
    console.error("Error setting task to draft:", error);
    throw error;
  }
};

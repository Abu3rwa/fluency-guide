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

export const createTask = async (courseId, lessonId, taskData) => {
  try {
    const taskRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...taskData,
      courseId,
      lessonId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      id: taskRef.id,
      ...taskData,
      courseId,
      lessonId,
    };
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

export const updateTask = async (courseId, lessonId, taskId, taskData) => {
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await updateDoc(taskRef, {
      ...taskData,
      updatedAt: new Date(),
    });

    return {
      id: taskId,
      ...taskData,
      courseId,
      lessonId,
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

    return {
      id: taskDoc.id,
      ...taskDoc.data(),
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
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting tasks:", error);
    throw error;
  }
};

export const publishTask = async (courseId, lessonId, taskId) => {
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await updateDoc(taskRef, {
      status: "published",
      updatedAt: new Date(),
    });

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
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await updateDoc(taskRef, {
      status: "archived",
      updatedAt: new Date(),
    });

    return {
      id: taskId,
      status: "archived",
    };
  } catch (error) {
    console.error("Error archiving task:", error);
    throw error;
  }
};

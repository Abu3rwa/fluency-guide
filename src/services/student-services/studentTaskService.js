// studentTaskService.js
// Ported from migrate/lib/services/task_service.dart
// Handles task logic and Firestore integration for students

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

const TASKS_COLLECTION = "tasks";

// Get all tasks for a lesson
export async function getTasksByLesson(lessonId) {
  try {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where("lessonId", "==", lessonId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error getting tasks by lesson:", e);
    return [];
  }
}

// Get a single task
export async function getTaskById(taskId) {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    const taskDoc = await getDoc(taskRef);
    return taskDoc.exists() ? { id: taskDoc.id, ...taskDoc.data() } : null;
  } catch (e) {
    console.error("Error getting task by ID:", e);
    return null;
  }
}

// Create a new task
export async function createTask(taskData) {
  try {
    const newTask = {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, TASKS_COLLECTION), newTask);
    return { id: docRef.id, ...newTask };
  } catch (e) {
    console.error("Error creating task:", e);
    throw e;
  }
}

// Update a task
export async function updateTask(taskId, taskData) {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    const updateData = {
      ...taskData,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(taskRef, updateData);
    return { id: taskId, ...updateData };
  } catch (e) {
    console.error("Error updating task:", e);
    throw e;
  }
}

// Delete a task
export async function deleteTask(taskId) {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await deleteDoc(taskRef);
    return true;
  } catch (e) {
    console.error("Error deleting task:", e);
    throw e;
  }
}

const studentTaskService = {
  getTasksByLesson,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};

export default studentTaskService;

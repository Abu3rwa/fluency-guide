// studentModuleService.js
// Ported from migrate/lib/services/module_service.dart
// Handles module logic and Firestore integration for students

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
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

const MODULES_COLLECTION = "modules";

// Get all modules for a course
export async function getModulesByCourse(courseId) {
  console.log("getModulesByCourse", courseId);
  try {
    const q = query(
      collection(db, MODULES_COLLECTION),
      where("courseId", "==", courseId),
      orderBy("order")
    );
    const snapshot = await getDocs(q);
    const modules = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // Debug log: show all courseIds in the result and the input courseId
    console.log("[getModulesByCourse] input courseId:", courseId);
    modules.forEach((m) =>
      console.log("[getModulesByCourse] module:", m.id, "courseId:", m.courseId)
    );
    return modules;
  } catch (e) {
    console.error("Error getting modules by course:", e);
    return [];
  }
}

// Get a single module
export async function getModuleById(moduleId) {
  try {
    const moduleRef = doc(db, MODULES_COLLECTION, moduleId);
    const moduleDoc = await getDoc(moduleRef);
    return moduleDoc.exists()
      ? { id: moduleDoc.id, ...moduleDoc.data() }
      : null;
  } catch (e) {
    console.error("Error getting module by ID:", e);
    return null;
  }
}

// Create a new module
export async function createModule(courseId, moduleData) {
  try {
    const newModule = {
      ...moduleData,
      courseId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, MODULES_COLLECTION), newModule);
    return { id: docRef.id, ...newModule };
  } catch (e) {
    console.error("Error creating module:", e);
    throw e;
  }
}

// Update a module
export async function updateModule(moduleId, moduleData) {
  try {
    const moduleRef = doc(db, MODULES_COLLECTION, moduleId);
    const updateData = {
      ...moduleData,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(moduleRef, updateData);
    return { id: moduleId, ...updateData };
  } catch (e) {
    console.error("Error updating module:", e);
    throw e;
  }
}

// Delete a module
export async function deleteModule(moduleId) {
  try {
    const moduleRef = doc(db, MODULES_COLLECTION, moduleId);
    await deleteDoc(moduleRef);
    return true;
  } catch (e) {
    console.error("Error deleting module:", e);
    throw e;
  }
}

const studentModuleService = {
  getModulesByCourse,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
};

export default studentModuleService;

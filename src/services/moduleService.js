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
import { db } from "../firebase";

const moduleService = {
  // Get all modules
  async getAllModules() {
    try {
      const modulesRef = collection(db, "modules");
      const querySnapshot = await getDocs(modulesRef);
      const modules = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return modules.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      console.error("Error getting all modules:", error);
      throw error;
    }
  },

  // Get all modules for a course
  async getModulesByCourseId(courseId) {
    try {
      const modulesRef = collection(db, "modules");
      const q = query(modulesRef, where("courseId", "==", courseId));
      const querySnapshot = await getDocs(q);
      const modules = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort in memory
      return modules.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      console.error("Error getting modules:", error);
      throw error;
    }
  },

  // Get lessons for a specific module
  async getLessonsByModule(courseId, moduleId) {
    try {
      const lessonsRef = collection(db, "lessons");
      const q = query(
        lessonsRef,
        where("courseId", "==", courseId),
        where("moduleId", "==", moduleId)
      );
      const querySnapshot = await getDocs(q);
      const lessons = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort in memory
      return lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      console.error("Error getting lessons:", error);
      throw error;
    }
  },

  // Get a single module by ID
  async getModuleById(moduleId) {
    try {
      const moduleRef = doc(db, "modules", moduleId);
      const moduleDoc = await getDoc(moduleRef);
      if (!moduleDoc.exists()) {
        throw new Error("Module not found");
      }
      return {
        id: moduleDoc.id,
        ...moduleDoc.data(),
      };
    } catch (error) {
      console.error("Error getting module:", error);
      throw error;
    }
  },

  // Create a new module
  async createModule(courseId, moduleData) {
    try {
      const modulesRef = collection(db, "modules");
      const newModule = {
        ...moduleData,
        courseId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(modulesRef, newModule);
      return {
        id: docRef.id,
        ...newModule,
      };
    } catch (error) {
      console.error("Error creating module:", error);
      throw error;
    }
  },

  // Update a module
  async updateModule(moduleId, moduleData) {
    try {
      const moduleRef = doc(db, "modules", moduleId);
      const updateData = {
        ...moduleData,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(moduleRef, updateData);
      return {
        id: moduleId,
        ...updateData,
      };
    } catch (error) {
      console.error("Error updating module:", error);
      throw error;
    }
  },

  // Delete a module
  async deleteModule(moduleId) {
    try {
      const moduleRef = doc(db, "modules", moduleId);
      await deleteDoc(moduleRef);
      return true;
    } catch (error) {
      console.error("Error deleting module:", error);
      throw error;
    }
  },

  // Reorder modules
  async reorderModules(moduleIds) {
    try {
      const batch = db.batch();
      moduleIds.forEach((moduleId, index) => {
        const moduleRef = doc(db, "modules", moduleId);
        batch.update(moduleRef, {
          order: index,
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
      return true;
    } catch (error) {
      console.error("Error reordering modules:", error);
      throw error;
    }
  },
};

export default moduleService;

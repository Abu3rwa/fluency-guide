import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '../../firebase';

const categoriesCollection = collection(db, 'categories');

/**
 * Retrieves all blog categories.
 * @returns {Promise<import('./types').BlogCategory[]>} Array of categories.
 */
export const getAllCategories = async () => {
  try {
    const querySnapshot = await getDocs(categoriesCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

/**
 * Retrieves a single category by its ID.
 * @param {string} categoryId - The ID of the category to retrieve.
 * @returns {Promise<import('./types').BlogCategory | null>} The category data or null if not found.
 */
export const getCategoryById = async (categoryId) => {
  try {
    const q = query(categoriesCollection, where('id', '==', categoryId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
};

/**
 * Creates a new blog category.
 * @param {Omit<import('./types').BlogCategory, 'id'>} categoryData - The data for the new category.
 * @returns {Promise<string>} The ID of the newly created category.
 */
export const createCategory = async (categoryData) => {
  const docRef = await addDoc(categoriesCollection, categoryData);
  return docRef.id;
};

/**
 * Retrieves a single blog category by its ID.
 * @param {string} categoryId - The ID of the category to retrieve.
 * @returns {Promise<import('./types').BlogCategory | null>} The category data or null if not found.
 */
export const getCategory = async (categoryId) => {
  const docRef = doc(db, 'categories', categoryId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

/**
 * Updates an existing blog category.
 * @param {string} categoryId - The ID of the category to update.
 * @param {Partial<import('./types').BlogCategory>} categoryData - The data to update.
 * @returns {Promise<void>}
 */
export const updateCategory = async (categoryId, categoryData) => {
  const docRef = doc(db, 'categories', categoryId);
  await updateDoc(docRef, categoryData);
};

/**
 * Deletes a blog category.
 * @param {string} categoryId - The ID of the category to delete.
 * @returns {Promise<void>}
 */
export const deleteCategory = async (categoryId) => {
  const docRef = doc(db, 'categories', categoryId);
  await deleteDoc(docRef);
};
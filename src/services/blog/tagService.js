import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

const tagsCollection = collection(db, 'tags');

/**
 * Retrieves all blog tags.
 * @returns {Promise<import('./types').BlogTag[]>} Array of tags.
 */
export const getAllTags = async () => {
  try {
    const querySnapshot = await getDocs(tagsCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

/**
 * Retrieves a single tag by its ID.
 * @param {string} tagId - The ID of the tag to retrieve.
 * @returns {Promise<import('./types').BlogTag | null>} The tag data or null if not found.
 */
export const getTagById = async (tagId) => {
  try {
    const q = query(tagsCollection, where('id', '==', tagId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching tag:', error);
    return null;
  }
};
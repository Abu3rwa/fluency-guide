import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase'; // Assuming firebase is initialized in src/firebase.js
import { sanitizeContent } from '../../utils/contentSanitization';

const blogsCollection = collection(db, 'blogs');

/**
 * Creates a new blog post.
 * @param {Omit<import('./types').BlogPost, 'id' | 'created_at' | 'updated_at'>} postData - The data for the new post.
 * @returns {Promise<string>} The ID of the newly created post.
 */
export const createPost = async (postData) => {
  const sanitizedPostData = {
    ...postData,
    content_en: sanitizeContent(postData.content_en),
    content_ar: sanitizeContent(postData.content_ar),
  };

  // Add published_at timestamp if status is published
  const timestamp = serverTimestamp();
  const docData = {
    ...sanitizedPostData,
    is_deleted: false,
    created_at: timestamp,
    updated_at: timestamp,
  };

  // Only set published_at if the post is being published
  if (postData.status === 'published') {
    docData.published_at = timestamp;
  }

  const docRef = await addDoc(blogsCollection, docData);
  return docRef.id;
};

/**
 * Retrieves a single blog post by its ID.
 * @param {string} postId - The ID of the post to retrieve.
 * @returns {Promise<import('./types').BlogPost | null>} The post data or null if not found.
 */
export const getPost = async (postId) => {
  const docRef = doc(db, 'blogs', postId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists() && !docSnap.data().is_deleted) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

/**
 * Retrieves a single blog post by its slug.
 * @param {string} slug - The slug of the post to retrieve.
 * @returns {Promise<import('./types').BlogPost | null>} The post data or null if not found.
 */
export const getPostBySlug = async (slug) => {
  const q = query(
    blogsCollection,
    where('slug', '==', slug),
    where('is_deleted', '==', false),
    limit(1)
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

/**
 * Retrieves a list of blog posts with pagination.
 * @param {object} options - Options for querying posts.
 * @param {string} [options.category] - Filter by category ID.
 * @param {string} [options.tag] - Filter by tag.
 * @param {string} [options.sortBy='published_at'] - Field to sort by.
 * @param {'asc' | 'desc'} [options.sortOrder='desc'] - Sort order.
 * @param {number} [options.pageSize=10] - Number of posts per page.
 * @param {import('firebase/firestore').DocumentSnapshot} [options.lastVisible] - The last visible document for pagination.
 * @param {boolean} [options.showDrafts=false] - Whether to show draft posts (for admin users).
 * @returns {Promise<{posts: import('./types').BlogPost[], lastVisible: import('firebase/firestore').DocumentSnapshot}>}
 */
export const getPosts = async ({
  category,
  tag,
  sortBy = 'published_at',
  sortOrder = 'desc',
  pageSize = 10,
  lastVisible,
  showDrafts = false,
}) => {
  // For draft posts, we might want to sort by created_at instead
  const effectiveSortBy = sortBy === 'published_at' ? 'created_at' : sortBy;
  
  let q = query(
    blogsCollection,
    where('is_deleted', '==', false),
    orderBy(effectiveSortBy, sortOrder),
    limit(pageSize)
  );

  // Only show published posts for regular users, but show both published and draft for admins
  if (!showDrafts) {
    q = query(q, where('status', '==', 'published'));
  } else {
    // For admins, show both published and draft posts
    q = query(q, where('status', 'in', ['published', 'draft']));
  }

  if (category) {
    q = query(q, where('category_id', '==', category));
  }

  if (tag) {
    q = query(q, where('tags', 'array-contains', tag));
  }

  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }

  const querySnapshot = await getDocs(q);
  const posts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
  return {
    posts,
    lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1],
  };
};

/**
 * Updates an existing blog post.
 * @param {string} postId - The ID of the post to update.
 * @param {Partial<import('./types').BlogPost>} postData - The data to update.
 * @returns {Promise<void>}
 */
export const updatePost = async (postId, postData) => {
  const docRef = doc(db, 'blogs', postId);
  
  const sanitizedPostData = { ...postData };
  if (postData.content_en) {
    sanitizedPostData.content_en = sanitizeContent(postData.content_en);
  }
  if (postData.content_ar) {
    sanitizedPostData.content_ar = sanitizeContent(postData.content_ar);
  }

  // Add published_at timestamp if status is changing to published
  const timestamp = serverTimestamp();
  const updateData = {
    ...sanitizedPostData,
    updated_at: timestamp,
  };

  // Only set published_at if the post is being published and it wasn't set before
  if (postData.status === 'published') {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const existingData = docSnap.data();
      // Only set published_at if it hasn't been set before
      if (!existingData.published_at) {
        updateData.published_at = timestamp;
      }
    }
  }

  await updateDoc(docRef, updateData);
};

/**
 * Soft deletes a blog post.
 * @param {string} postId - The ID of the post to delete.
 * @returns {Promise<void>}
 */
export const deletePost = async (postId) => {
  const docRef = doc(db, 'blogs', postId);
  await updateDoc(docRef, {
    is_deleted: true,
    updated_at: serverTimestamp(),
  });
};

/**
 * Recovers a soft-deleted blog post.
 * @param {string} postId - The ID of the post to recover.
 * @returns {Promise<void>}
 */
export const recoverPost = async (postId) => {
    const docRef = doc(db, 'blogs', postId);
    await updateDoc(docRef, {
      is_deleted: false,
      updated_at: serverTimestamp(),
    });
  };
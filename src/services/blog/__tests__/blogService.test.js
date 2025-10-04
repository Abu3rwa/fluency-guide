import {
  createPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
  recoverPost,
  getPostBySlug,
} from '../blogService';
import { db } from '../../../firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  limit,
  where,
} from 'firebase/firestore';

// Mock firebase
jest.mock('../../../firebase', () => ({
  db: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));

describe('Blog Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a post', async () => {
    addDoc.mockResolvedValue({ id: '123' });
    const postId = await createPost({ title_en: 'Test Post' });
    expect(addDoc).toHaveBeenCalled();
    expect(postId).toBe('123');
  });

  it('should get a post', async () => {
    const mockPost = { id: '123', title_en: 'Test Post', is_deleted: false };
    getDoc.mockResolvedValue({ exists: () => true, id: '123', data: () => mockPost });
    const post = await getPost('123');
    expect(getDoc).toHaveBeenCalled();
    expect(post).toEqual(expect.objectContaining({ title_en: 'Test Post' }));
  });

  it('should get a post by slug', async () => {
    const mockPost = { id: '123', slug: 'test-post', is_deleted: false };
    getDocs.mockResolvedValue({ empty: false, docs: [{ id: '123', data: () => mockPost }] });
    const post = await getPostBySlug('test-post');
    expect(query).toHaveBeenCalledWith(undefined, where('slug', '==', 'test-post'), where('is_deleted', '==', false), limit(1));
    expect(post).toEqual(expect.objectContaining({ slug: 'test-post' }));
  });

  it('should update a post', async () => {
    await updatePost('123', { title_en: 'Updated Post' });
    expect(updateDoc).toHaveBeenCalled();
  });

  it('should soft delete a post', async () => {
    await deletePost('123');
    expect(updateDoc).toHaveBeenCalledWith(undefined, {
      is_deleted: true,
      updated_at: expect.any(Date),
    });
  });

  it('should recover a post', async () => {
    await recoverPost('123');
    expect(updateDoc).toHaveBeenCalledWith(undefined, {
      is_deleted: false,
      updated_at: expect.any(Date),
    });
  });
});
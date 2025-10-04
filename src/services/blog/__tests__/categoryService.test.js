import {
  getAllCategories,
  getCategoryById,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} from '../categoryService';
import { db } from '../../../firebase';
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
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
}));

describe('Category Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get all categories', async () => {
    const mockCategories = [
      { id: '1', name_en: 'Education', name_ar: 'التعليم' },
      { id: '2', name_en: 'Language Tips', name_ar: 'نصائح اللغة' }
    ];
    getDocs.mockResolvedValue({
      docs: mockCategories.map(cat => ({
        id: cat.id,
        data: () => ({ ...cat })
      }))
    });
    
    const categories = await getAllCategories();
    expect(getDocs).toHaveBeenCalled();
    expect(categories).toHaveLength(2);
    expect(categories[0]).toEqual(expect.objectContaining({ name_en: 'Education' }));
  });

  it('should get a category by id', async () => {
    const mockCategory = { id: '123', name_en: 'Education', name_ar: 'التعليم' };
    getDocs.mockResolvedValue({
      empty: false,
      docs: [{ id: '123', data: () => mockCategory }]
    });
    
    const category = await getCategoryById('123');
    expect(query).toHaveBeenCalledWith(undefined, where('id', '==', '123'));
    expect(category).toEqual(expect.objectContaining({ name_en: 'Education' }));
  });

  it('should create a category', async () => {
    addDoc.mockResolvedValue({ id: '123' });
    const categoryId = await createCategory({ name_en: 'Test Category' });
    expect(addDoc).toHaveBeenCalled();
    expect(categoryId).toBe('123');
  });

  it('should get a category by document id', async () => {
    const mockCategory = { id: '123', name_en: 'Education', name_ar: 'التعليم' };
    getDoc.mockResolvedValue({ exists: () => true, id: '123', data: () => mockCategory });
    
    const category = await getCategory('123');
    expect(getDoc).toHaveBeenCalled();
    expect(category).toEqual(expect.objectContaining({ name_en: 'Education' }));
  });

  it('should update a category', async () => {
    await updateCategory('123', { name_en: 'Updated Category' });
    expect(updateDoc).toHaveBeenCalled();
  });

  it('should delete a category', async () => {
    await deleteCategory('123');
    expect(deleteDoc).toHaveBeenCalled();
  });
});
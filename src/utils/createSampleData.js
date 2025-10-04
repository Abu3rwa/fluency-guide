/**
 * Script to create sample data for the Sudanglish platform
 * This includes blog categories and sample blog posts
 */

import { createSampleCategories } from './createBlogCategories';
import { createSampleBlogPosts } from './createSampleBlogPosts';

const createAllSampleData = async () => {
  console.log('Creating sample data...');
  
  try {
    console.log('Creating sample blog categories...');
    await createSampleCategories();
    
    console.log('Creating sample blog posts...');
    await createSampleBlogPosts();
    
    console.log('All sample data created successfully!');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

// Run the function if this script is executed directly
if (typeof window === 'undefined') {
  createAllSampleData();
}

export { createAllSampleData };
#!/usr/bin/env node

/**
 * CLI script to create sample data for the Sudanglish platform
 * This script can be run from the command line to populate the database
 * with sample blog categories and posts.
 */

// Import the main function
import { createAllSampleData } from './createSampleData.js';

// Run the sample data creation
console.log('🚀 Creating sample data for Sudanglish platform...');

createAllSampleData()
  .then(() => {
    console.log('✅ Sample data creation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  });
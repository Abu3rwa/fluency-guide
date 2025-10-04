# Sample Data Creation for Sudanglish Platform

This document explains how to populate your Sudanglish platform with sample blog categories and posts for testing and development purposes.

## Overview

The sample data creation utilities include:
1. Sample blog categories (Education, Language Tips, Platform Updates, Success Stories)
2. Sample blog posts relevant to an online English learning platform
3. Scripts to easily create this data in your Firebase database

## Sample Content

### Blog Categories
- **Education** - Educational articles and learning resources
- **Language Tips** - Tips and tricks for language learning
- **Platform Updates** - News and updates about our platform
- **Success Stories** - Student success stories and testimonials

### Sample Blog Posts
1. "5 Effective Techniques for Learning English as a Second Language"
2. "Student Success Story: How Amira Achieved Fluency in 6 Months"
3. "New Feature Update: Interactive Pronunciation Practice"
4. "The Science Behind Language Learning: Why Consistency Beats Intensity"

## Usage

### Method 1: Using npm script (Recommended)

Run the following command from the project root directory:

```bash
npm run create-sample-data
```

This will create all sample categories and blog posts in your Firebase database.

### Method 2: Programmatic Usage

You can import and use the functions directly in your code:

```javascript
import { createSampleCategories } from './src/utils/createBlogCategories';
import { createSampleBlogPosts } from './src/utils/createSampleBlogPosts';
import { createAllSampleData } from './src/utils/createSampleData';

// Create only categories
await createSampleCategories();

// Create only blog posts (requires existing categories)
await createSampleBlogPosts();

// Create both categories and posts
await createAllSampleData();
```

### Method 3: Direct CLI Script

Run the CLI script directly:

```bash
node src/utils/createSampleDataCLI.js
```

## Customization

You can modify the sample data by editing the following files:
- `src/utils/createBlogCategories.js` - To change categories
- `src/utils/createSampleBlogPosts.js` - To change blog posts

## Notes

- The sample data creation functions are idempotent and can be run multiple times
- Existing data with the same slugs may be duplicated
- All sample posts are created with "published" status
- Sample posts use "Sudanglish Team" as the author
- Featured images are left empty but can be added by modifying the sample data
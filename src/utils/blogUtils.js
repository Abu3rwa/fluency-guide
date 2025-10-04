/**
 * Generates a URL-friendly slug from a string.
 * @param {string} text - The text to convert to a slug.
 * @returns {string} The generated slug.
 */
export const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-+/g, '-'); // Replace multiple - with single -
};

/**
 * Estimates the reading time for a given text.
 * @param {string} text - The text to be evaluated.
 * @param {number} wpm - Words per minute, defaults to 200.
 * @returns {number} The estimated reading time in minutes.
 */
export const estimateReadTime = (text, wpm = 200) => {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wpm);
};

/**
 * Formats a Firestore Timestamp into a more readable date string.
 * @param {import('firebase/firestore').Timestamp} timestamp - The Firestore timestamp.
 * @param {string} locale - The locale for formatting (e.g., 'en-US', 'ar-EG').
 * @returns {string} The formatted date string.
 */
export const formatDate = (timestamp, locale = 'en-US') => {
  if (!timestamp || !timestamp.toDate) return '';
  return timestamp.toDate().toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Creates sample blog categories
 * @returns {Promise<void>}
 */
export const createSampleCategories = async () => {
  const { createCategory } = await import('../services/blog/categoryService');
  
  const categories = [
    {
      name_en: "Education",
      name_ar: "التعليم",
      slug: "education",
      description_en: "Educational articles and learning resources",
      description_ar: "مقالات تعليمية وموارد التعلم"
    },
    {
      name_en: "Language Tips",
      name_ar: "نصائح اللغة",
      slug: "language-tips",
      description_en: "Tips and tricks for language learning",
      description_ar: "نصائح وحيل لتعلم اللغة"
    },
    {
      name_en: "Platform Updates",
      name_ar: "تحديثات المنصة",
      slug: "platform-updates",
      description_en: "News and updates about our platform",
      description_ar: "أخبار وتحديثات حول منصتنا"
    },
    {
      name_en: "Success Stories",
      name_ar: "قصص النجاح",
      slug: "success-stories",
      description_en: "Student success stories and testimonials",
      description_ar: "قصص نجاح الطلاب وشهاداتهم"
    }
  ];

  try {
    for (const category of categories) {
      await createCategory(category);
      console.log(`Created category: ${category.name_en}`);
    }
    console.log('All sample categories created successfully!');
  } catch (error) {
    console.error('Error creating sample categories:', error);
  }
};

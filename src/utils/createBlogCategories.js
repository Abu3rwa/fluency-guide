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
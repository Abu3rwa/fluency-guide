/**
 * Creates sample blog posts for the Sudanglish platform
 * @returns {Promise<void>}
 */
export const createSampleBlogPosts = async () => {
  const { createPost } = await import('../services/blog/blogService');
  const { getAllCategories } = await import('../services/blog/categoryService');
  
  try {
    // Get all categories to reference in posts
    const categories = await getAllCategories();
    
    // Find category IDs by name
    const educationCategory = categories.find(cat => cat.name_en === "Education");
    const languageTipsCategory = categories.find(cat => cat.name_en === "Language Tips");
    const platformUpdatesCategory = categories.find(cat => cat.name_en === "Platform Updates");
    const successStoriesCategory = categories.find(cat => cat.name_en === "Success Stories");
    
    const samplePosts = [
      {
        title_en: "5 Effective Techniques for Learning English as a Second Language",
        title_ar: "5 تقنيات فعالة لتعلم اللغة الإنجليزية كلغة ثانية",
        content_en: `
          <p>Learning English as a second language can be challenging, but with the right techniques, you can accelerate your progress significantly. Here are 5 proven methods that our students have found most effective:</p>
          
          <h4>1. Immersion Through Media</h4>
          <p>Surround yourself with English content. Watch English movies with subtitles, listen to podcasts, and read news articles. This helps train your ear and improves comprehension naturally.</p>
          
          <h4>2. Practice Speaking Daily</h4>
          <p>Consistency is key. Even 10 minutes of daily speaking practice can dramatically improve your fluency. Use our platform's speaking exercises and record yourself to track progress.</p>
          
          <h4>3. Focus on Common Vocabulary</h4>
          <p>Master the 1000 most common English words first. These words make up approximately 90% of everyday conversations. Our vocabulary builder feature helps you learn these efficiently.</p>
          
          <h4>4. Learn Grammar in Context</h4>
          <p>Instead of memorizing rules, learn grammar through real examples. Our lessons integrate grammar naturally into conversations and stories.</p>
          
          <h4>5. Set Specific Goals</h4>
          <p>Vague goals like "improve English" don't work. Set specific, measurable targets like "learn 50 new words this month" or "have a 10-minute conversation by Friday."</p>
          
          <p>Remember, everyone learns differently. Try these techniques and see which ones work best for you. Our platform adapts to your learning style and pace.</p>
        `,
        content_ar: `
          <p>يمكن أن يكون تعلم اللغة الإنجليزية كلغة ثانية أمرًا محفلاً، ولكن باستخدام التقنيات الصحيحة، يمكنك تسريع تقدمك بشكل كبير. إليك 5 طرق مثبتة وجد أنها الأكثر فعالية لدى طلابنا:</p>
          
          <h4>1. الغمر من خلال وسائل الإعلام</h4>
          <p>اطلع على محتوى باللغة الإنجليزية. شاهد الأفلام الإنجليزية مع ترجمة، واستمع إلى البودكاست، واقرأ المقالات الإخبارية. هذا يساعد على تدريب أذنك ويحسن الفهم بشكل طبيعي.</p>
          
          <h4>2. ممارسة الكلام يوميًا</h4>
          <p>الثبات هو المفتاح. حتى 10 دقائق من ممارسة الكلام يوميًا يمكن أن تحسن طلاقتك بشكل كبير. استخدم تمارين الكلام في منصتنا وسجّل نفسك لتتبع التقدم.</p>
          
          <h4>3. التركيز على المفردات الشائعة</h4>
          <p>أتقن 1000 كلمة إنجليزية شائعة أولاً. تشكل هذه الكلمات حوالي 90% من المحادثات اليومية. تساعد ميزة منشئ المفردات لدينا على تعلمها بكفاءة.</p>
          
          <h4>4. تعلم القواعد في السياق</h4>
          <p>بدلاً من حفظ القواعد، تعلم القواعد من خلال أمثلة حقيقية. دروسنا تدمج القواعد بشكل طبيعي في المحادثات والقصص.</p>
          
          <h4>5. وضع أهداف محددة</h4>
          <p>الأهداف الغامضة مثل "تحسين اللغة الإنجليزية" لا تعمل. ضع أهدافًا محددة وقابلة للقياس مثل "تعلم 50 كلمة جديدة هذا الشهر" أو "إجراء محادثة لمدة 10 دقائق بحلول يوم الجمعة."</p>
          
          <p>تذكر، يتعلم الجميع بشكل مختلف. جرب هذه التقنيات وانظر أي منها يعمل بشكل أفضل بالنسبة لك. تتكيف منصتنا مع أسلوبك وسرعتك في التعلم.</p>
        `,
        slug: "effective-english-learning-techniques",
        excerpt_en: "Discover 5 proven techniques that can dramatically improve your English learning journey.",
        excerpt_ar: "اكتشف 5 تقنيات مثبتة يمكن أن تحسن بشكل كبير رحلة تعلمك للغة الإنجليزية.",
        featured_image: "",
        category_id: languageTipsCategory?.id || "",
        tags: ["english", "learning", "techniques", "vocabulary"],
        author_id: "admin",
        author_name_en: "Sudanglish Team",
        author_name_ar: "فريق سودانغليش",
        status: "published"
      },
      {
        title_en: "Student Success Story: How Amira Achieved Fluency in 6 Months",
        title_ar: "قصة نجاح طالب: كيف حققت أميرة الطلاقة في 6 أشهر",
        content_en: `
          <p>Meet Amira, a 28-year-old teacher from Khartoum who transformed her English skills using our platform. In just 6 months, she went from basic conversational English to confidently teaching English to her own students.</p>
          
          <h4>The Challenge</h4>
          <p>Amira had been studying English for years with traditional methods but struggled with confidence and pronunciation. "I could read and write, but I was afraid to speak," she shared.</p>
          
          <h4>The Solution</h4>
          <p>Amira joined Sudanglish in March and committed to 30 minutes of daily practice. She focused on our conversation courses and used the pronunciation tool extensively.</p>
          
          <h4>The Results</h4>
          <p>By September, Amira was not only comfortable speaking English but also began teaching English to younger students at her school. Her principal noted a significant improvement in her classroom confidence.</p>
          
          <blockquote>"Sudanglish gave me the tools and confidence I needed. The daily practice made it feel achievable, not overwhelming."</blockquote>
          
          <p>Amira's story shows that with the right approach and consistent practice, dramatic improvement is possible at any age.</p>
        `,
        content_ar: `
          <p>تعرف على أميرة، معلمة تبلغ من العمر 28 عامًا من الخرطوم، حولت مهاراتها في اللغة الإنجليزية باستخدام منصتنا. في 6 أشهر فقط، انتقلت من الإنجليزية المحادثية الأساسية إلى تدريس اللغة الإنجليزية بثقة لتلاميذها.</p>
          
          <h4>التحدي</h4>
          <p>كانت أميرة قد درست اللغة الإنجليزية لسنوات باستخدام الطرق التقليدية ولكنها واجهت صعوبة في الثقة والنطق. "كنت أستطيع القراءة والكتابة، لكنني خفت من التحدث"، شاركتنا.</p>
          
          <h4>الحل</h4>
          <p>انضمت أميرة إلى سودانغليش في شهر مارس والتزمت بممارسة 30 دقيقة يوميًا. ركزت على دورات المحادثة لدينا واستخدمت أداة النطق بشكل واسع.</p>
          
          <h4>النتائج</h4>
          <p>بحلول سبتمبر، لم تكن أميرة مرتاحة فقط في التحدث باللغة الإنجليزية، بل بدأت أيضًا في تدريس اللغة الإنجليزية للطلاب الأصغر سنًا في مدرستها. لاحظ مديرها تحسنًا كبيرًا في ثقة الفصل.</p>
          
          <blockquote>"سودانغليش منحني الأدوات والثقة التي أحتاجها. جعلت الممارسة اليومية تشعر بالإنجاز، وليس بالإرهاق."</blockquote>
          
          <p>تُظهر قصة أميرة أنه باستخدام النهج الصحيح والممارسة المستمرة، يمكن تحقيق تحسن كبير في أي عمر.</p>
        `,
        slug: "student-success-amira-fluency",
        excerpt_en: "How one student transformed her English skills in just 6 months with consistent practice.",
        excerpt_ar: "كيف حولت طالبة واحدة مهاراتها في اللغة الإنجليزية في 6 أشهر فقط مع الممارسة المستمرة.",
        featured_image: "",
        category_id: successStoriesCategory?.id || "",
        tags: ["success", "fluency", "student", "motivation"],
        author_id: "admin",
        author_name_en: "Sudanglish Team",
        author_name_ar: "فريق سودانغليش",
        status: "published"
      },
      {
        title_en: "New Feature Update: Interactive Pronunciation Practice",
        title_ar: "تحديث ميزة جديدة: ممارسة النطق التفاعلية",
        content_en: `
          <p>We're excited to announce the launch of our new Interactive Pronunciation Practice feature, designed to help you master English sounds with precision.</p>
          
          <h4>What's New?</h4>
          <p>Our latest update includes:</p>
          <ul>
            <li>Real-time pronunciation feedback using AI speech recognition</li>
            <li>Over 1000 common words and phrases with audio examples</li>
            <li>Progress tracking to monitor your improvement</li>
            <li>Personalized recommendations based on your weak sounds</li>
          </ul>
          
          <h4>How It Works</h4>
          <p>Simply select a word or phrase, listen to the native pronunciation, and then record yourself. Our system will analyze your pronunciation and provide instant feedback on areas for improvement.</p>
          
          <h4>Why This Matters</h4>
          <p>Pronunciation is often the biggest barrier to confident English speaking. With this new feature, you can practice anytime and receive expert-level feedback without needing a tutor.</p>
          
          <p>We've already seen a 40% improvement in pronunciation scores among beta testers. Try it out and let us know your experience!</p>
        `,
        content_ar: `
          <p>يسعدنا الإعلان عن إطلاق ميزة ممارسة النطق التفاعلية الجديدة، والمصممة لمساعدتك على إتقان أصوات اللغة الإنجليزية بدقة.</p>
          
          <h4>ما الجديد؟</h4>
          <p>يتضمن آخر تحديث لدينا:</p>
          <ul>
            <li>ملاحظات فورية حول النطق باستخدام التعرف على الكلام بالذكاء الاصطناعي</li>
            <li>أكثر من 1000 كلمة وعبارة شائعة مع أمثلة صوتية</li>
            <li>تتبع التقدم لمراقبة تحسنك</li>
            <li>توصيات شخصية بناءً على أصواتك الضعيفة</li>
          </ul>
          
          <h4>كيف يعمل</h4>
          <p>ما عليك سوى تحديد كلمة أو عبارة، والاستماع إلى النطق الأصلي، ثم تسجيل نفسك. سيحلل نظامنا نطقك ويقدم ملاحظات فورية حول مجالات التحسين.</p>
          
          <h4>لماذا هذا مهم</h4>
          <p>النطق غالباً ما يكون أكبر عائق أمام التحدث باللغة الإنجليزية بثقة. مع هذه الميزة الجديدة، يمكنك الممارسة في أي وقت والحصول على ملاحظات على مستوى الخبير دون الحاجة إلى مدرس.</p>
          
          <p>لقد رأينا بالفعل تحسنًا بنسبة 40٪ في نتائج النطق بين المستخدمين الاختباريين. جربها وأخبرنا بتجربتك!</p>
        `,
        slug: "new-pronunciation-practice-feature",
        excerpt_en: "We've launched a new AI-powered pronunciation practice tool to help you speak English confidently.",
        excerpt_ar: "لقد أطلقنا أداة ممارسة النطق الجديدة المدعومة بالذكاء الاصطناعي لمساعدتك على التحدث باللغة الإنجليزية بثقة.",
        featured_image: "",
        category_id: platformUpdatesCategory?.id || "",
        tags: ["update", "pronunciation", "feature", "ai"],
        author_id: "admin",
        author_name_en: "Sudanglish Team",
        author_name_ar: "فريق سودانغليش",
        status: "published"
      },
      {
        title_en: "The Science Behind Language Learning: Why Consistency Beats Intensity",
        title_ar: "العلم وراء تعلم اللغة: لماذا الانتظام يتفوق على الكثافة",
        content_en: `
          <p>Research in cognitive science consistently shows that regular, spaced practice is more effective than intensive cramming sessions. Here's why this principle is crucial for language learning.</p>
          
          <h4>The Forgetting Curve</h4>
          <p>Hermann Ebbinghaus's research on memory showed that we forget up to 80% of new information within 24 hours. However, spaced repetition can dramatically improve retention.</p>
          
          <h4>How Our Platform Uses This</h4>
          <p>Our learning algorithm incorporates spaced repetition by reviewing vocabulary at optimal intervals. This ensures long-term retention without overwhelming you.</p>
          
          <h4>The 20-Minute Rule</h4>
          <p>Studies show that 20 minutes of focused daily practice is more effective than 3 hours of weekly cramming. Our lessons are designed to fit this optimal timeframe.</p>
          
          <h4>Building Habits</h4>
          <p>Consistency creates neural pathways that make language use automatic. Our streak system encourages daily practice by making progress visible and rewarding.</p>
          
          <p>Remember: 15 minutes every day for a month will yield better results than 7 hours in one weekend session.</p>
        `,
        content_ar: `
          <p>تُظهر الأبحاث في العلوم المعرفية باستمرار أن الممارسة المنتظمة والمتباعدة أكثر فعالية من جلسات الت cramming المكثفة. إليك لماذا هذا المبدأ مهم لتعلم اللغة.</p>
          
          <h4>منحنى النسيان</h4>
          <p>أظهرت أبحاث هيرمان إبينغهاوس حول الذاكرة أننا ننسى ما يصل إلى 80% من المعلومات الجديدة خلال 24 ساعة. ومع ذلك، يمكن للتكرار المتباعد أن يحسن التحفظ بشكل كبير.</p>
          
          <h4>كيف تستخدم منصتنا هذا</h4>
          <p>يتضمن خوارزمية التعلم لدينا تكرارًا متباعدًا من خلال مراجعة المفردات في فترات زمنية مثالية. هذا يضمن التحفظ طويل المدى دون إرهاقك.</p>
          
          <h4>قاعدة 20 دقيقة</h4>
          <p>تُظهر الدراسات أن 20 دقيقة من الممارسة المركزة يوميًا أكثر فعالية من 3 ساعات من الت cramming الأسبوعي. صُممت دروسنا لتناسب هذا الإطار الزمني الأمثل.</p>
          
          <h4>بناء العادات</h4>
          <p>الانتظام يخلق مسارات عصبية تجعل استخدام اللغة تلقائيًا. نظام سلسلتنا يشجع الممارسة اليومية من خلال جعل التقدم مرئيًا ومجزيًا.</p>
          
          <p>تذكر: 15 دقيقة كل يوم لمدة شهر ستحقق نتائج أفضل من 7 ساعات في جلسة واحدة في عطلة نهاية الأسبوع.</p>
        `,
        slug: "consistency-in-language-learning",
        excerpt_en: "Discover why daily practice is more effective than intensive study sessions for language learning.",
        excerpt_ar: "اكتشف لماذا الممارسة اليومية أكثر فعالية من جلسات الدراسة المكثفة لتعلم اللغة.",
        featured_image: "",
        category_id: educationCategory?.id || "",
        tags: ["science", "learning", "consistency", "habits"],
        author_id: "admin",
        author_name_en: "Sudanglish Team",
        author_name_ar: "فريق سودانغليش",
        status: "published"
      }
    ];

    // Create all sample posts
    for (const post of samplePosts) {
      await createPost(post);
      console.log(`Created post: ${post.title_en}`);
    }
    
    console.log('All sample blog posts created successfully!');
  } catch (error) {
    console.error('Error creating sample blog posts:', error);
  }
};
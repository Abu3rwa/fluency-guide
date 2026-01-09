// Example course data with bilingual (Arabic/English) fields
export const EXAMPLE_COURSE = {
  // Basic identifiers
  id: 'course-001',
  
  // Titles
  title: {
    en: 'Advanced English Business Communication',
    ar: 'مهارات التواصل في الأعمال الإنجليزية المتقدمة'
  },

  // Descriptions
  description: {
    en: 'Master professional English for international business meetings, negotiations, and presentations. Learn industry-specific vocabulary and communication strategies.',
    ar: 'أتقن اللغة الإنجليزية الاحترافية للاجتماعات التجارية والمفاوضات والعروض التقديمية. تعلم المفردات الخاصة بالصناعة واستراتيجيات التواصل.'
  },

  // Category
  category: {
    en: 'Business',
    ar: 'الأعمال'
  },

  // Level
  level: {
    en: 'Intermediate',
    ar: 'متوسط'
  },

  // Language of instruction
  language: 'en',

  // Pricing
  price: 79.99,
  currency: 'USD',

  // Course capacity
  maxStudents: 25,
  enrolledStudents: ['student-001', 'student-002', 'student-003', 'student-004'],

  // Instructor information
  instructor: {
    uid: 'instr-001',
    name: {
      en: 'Dr. James Mitchell',
      ar: 'د. جيمس ميتشل'
    },
    bio: {
      en: 'Oxford graduate with 15+ years of corporate training experience',
      ar: 'خريج جامعة أكسفورد مع أكثر من 15 سنة من خبرة التدريب الشركات'
    },
    email: 'james.mitchell@sudanglish.com'
  },

  // Schedule
  startDate: '2024-03-15',
  endDate: '2024-05-10',
  duration: {
    en: '8 weeks',
    ar: '8 أسابيع'
  },
  sessionsPerWeek: 2,
  sessionDuration: {
    en: '90 minutes',
    ar: '90 دقيقة'
  },

  // Course content details
  thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop',

  // Learning objectives
  objectives: {
    en: [
      'Write professional emails and business correspondence',
      'Deliver effective presentations and pitches',
      'Navigate complex business negotiations',
      'Use industry-specific vocabulary confidently',
      'Participate actively in team meetings',
      'Create comprehensive reports and proposals'
    ],
    ar: [
      'كتابة رسائل بريد إلكتروني احترافية والمراسلات التجارية',
      'تقديم عروض تقديمية فعالة والملاعب',
      'التنقل في المفاوضات التجارية المعقدة',
      'استخدام المفردات الخاصة بالصناعة بثقة',
      'المشاركة الفعالة في اجتماعات الفريق',
      'إنشاء تقارير وملفات اقتراحات شاملة'
    ]
  },

  // Main topics covered
  topics: {
    en: [
      'Professional Writing & Email Etiquette',
      'Presentation Skills & Public Speaking',
      'Negotiation Strategies & Conflict Resolution',
      'Business Vocabulary & Terminology',
      'Meeting Facilitation & Participation',
      'Report Writing & Data Presentation',
      'Cross-cultural Communication',
      'Telephonic & Virtual Communication'
    ],
    ar: [
      'الكتابة الاحترافية وآداب البريد الإلكتروني',
      'مهارات العرض التقديمي والخطابة العامة',
      'استراتيجيات التفاوض وحل النزاعات',
      'المفردات والمصطلحات التجارية',
      'تسهيل الاجتماعات والمشاركة',
      'كتابة التقارير وعرض البيانات',
      'التواصل عبر الثقافات',
      'الاتصالات الهاتفية والافتراضية'
    ]
  },

  // Prerequisites
  requirements: {
    en: 'Upper-Intermediate English level (CEFR B1) or equivalent. Basic understanding of business concepts.',
    ar: 'مستوى اللغة الإنجليزية المتوسط الأعلى (CEFR B1) أو ما يعادله. الفهم الأساسي للمفاهيم التجارية.'
  },

  // Course materials
  materials: {
    en: [
      'Comprehensive course manual (PDF)',
      'Weekly video lectures (HD)',
      'Practice exercises and case studies',
      'Business document templates',
      'Audio pronunciation guides',
      'Networking access to alumni community'
    ],
    ar: [
      'دليل الدورة الشامل (PDF)',
      'محاضرات فيديو أسبوعية (HD)',
      'تمارين عملية ودراسات حالة',
      'نماذج المستندات التجارية',
      'أدلة نطق صوتية',
      'الوصول إلى شبكة مجتمع الخريجين'
    ]
  },

  // Ratings and reviews
  rating: 4.8,
  reviewCount: 127,
  reviews: [
    {
      studentId: 'student-001',
      studentName: {
        en: 'Ahmed Hassan',
        ar: 'أحمد حسن'
      },
      rating: 5,
      title: {
        en: 'Excellent course, highly recommended',
        ar: 'دورة ممتازة، موصى بها بشدة'
      },
      comment: {
        en: 'This course transformed my business communication skills. The instructor is very professional and the materials are comprehensive.',
        ar: 'غيرت هذه الدورة مهارات التواصل التجاري لدي. المعلم احترافي جداً والمواد شاملة.'
      }
    },
    {
      studentId: 'student-002',
      studentName: {
        en: 'Fatima Al-Rashid',
        ar: 'فاطمة الراشد'
      },
      rating: 5,
      title: {
        en: 'Worth every penny',
        ar: 'يستحق كل ريال'
      },
      comment: {
        en: 'I got promoted at work after completing this course. The practical exercises really helped.',
        ar: 'حصلت على ترقية في العمل بعد إكمال هذه الدورة. التمارين العملية ساعدت كثيراً.'
      }
    }
  ],

  // Status
  status: 'published',

  // Timestamps
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-02-28'),

  // Additional metadata
  tags: {
    en: ['Business', 'Professional', 'Communication', 'Corporate', 'Advanced'],
    ar: ['الأعمال', 'احترافي', 'التواصل', 'شركات', 'متقدم']
  },

  // Course availability
  isAvailable: true,
  enrollmentDeadline: '2024-03-10',

  // Certification
  hasCertificate: true,
  certificateDetails: {
    en: 'Participants who complete 80% of the course and pass the final assessment receive an internationally recognized certificate.',
    ar: 'يحصل المشاركون الذين ينهون 80٪ من الدورة وينجحون في التقييم النهائي على شهادة معترف بها دولياً.'
  },

  // Support
  supportEmail: 'support@sudanglish.com',
  supportPhone: '+966-11-XXXX-XXXX',
  hasLiveSupport: true,
  supportLanguages: ['en', 'ar']
};


// Example minimal course data (for quick reference)
export const EXAMPLE_COURSE_MINIMAL = {
  title: {
    en: 'English Fundamentals',
    ar: 'أساسيات اللغة الإنجليزية'
  },
  description: {
    en: 'Master the basics of English with interactive lessons and real-world examples.',
    ar: 'أتقن أساسيات اللغة الإنجليزية مع دروس تفاعلية وأمثلة من الحياة الواقعية.'
  },
  category: {
    en: 'General English',
    ar: 'اللغة الإنجليزية العامة'
  },
  level: {
    en: 'Beginner',
    ar: 'مبتدئ'
  },
  price: 29.99,
  maxStudents: 30,
  instructor: {
    name: {
      en: 'Sarah Johnson',
      ar: 'سارة جونسون'
    }
  },
  startDate: '2024-03-01',
  duration: {
    en: '6 weeks',
    ar: '6 أسابيع'
  },
  thumbnail: 'https://images.unsplash.com/photo-1543269652-cbee6e3c6568?w=400&h=225&fit=crop',
  language: 'en',
  rating: 4.5,
  reviewCount: 89,
  status: 'published'
};


// Example course data structure documentation
export const COURSE_DATA_STRUCTURE = {
  description: 'Complete course data schema with bilingual support',
  fields: {
    id: 'Unique course identifier (string)',
    title: 'Course title { en: string, ar: string }',
    description: 'Course description { en: string, ar: string }',
    category: 'Course category { en: string, ar: string }',
    level: 'Difficulty level { en: string, ar: string }',
    language: 'Instruction language (en or ar)',
    price: 'Course price (number)',
    currency: 'Currency code (string, e.g., USD)',
    maxStudents: 'Maximum students allowed (number)',
    enrolledStudents: 'Array of student IDs (array)',
    instructor: {
      uid: 'Instructor unique ID',
      name: 'Instructor name { en: string, ar: string }',
      bio: 'Instructor biography { en: string, ar: string }',
      email: 'Instructor email'
    },
    startDate: 'Course start date (YYYY-MM-DD)',
    endDate: 'Course end date (YYYY-MM-DD)',
    duration: 'Course duration { en: string, ar: string }',
    sessionsPerWeek: 'Number of weekly sessions (number)',
    sessionDuration: 'Length of each session { en: string, ar: string }',
    thumbnail: 'Course image URL (string)',
    objectives: 'Learning objectives { en: array, ar: array }',
    topics: 'Main topics covered { en: array, ar: array }',
    requirements: 'Prerequisites { en: string, ar: string }',
    materials: 'Course materials provided { en: array, ar: array }',
    rating: 'Average rating (0-5)',
    reviewCount: 'Number of reviews (number)',
    reviews: 'Array of review objects',
    status: 'Course status (draft, published, archived)',
    createdAt: 'Creation date (Date)',
    updatedAt: 'Last update date (Date)',
    tags: 'Search tags { en: array, ar: array }',
    isAvailable: 'Availability status (boolean)',
    enrollmentDeadline: 'Enrollment deadline (YYYY-MM-DD)',
    hasCertificate: 'Certificate availability (boolean)',
    certificateDetails: 'Certificate info { en: string, ar: string }',
    supportEmail: 'Support email address (string)',
    supportPhone: 'Support phone number (string)',
    hasLiveSupport: 'Live support availability (boolean)',
    supportLanguages: 'Supported languages (array)'
  }
};

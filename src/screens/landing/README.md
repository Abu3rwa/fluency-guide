# Dynamic Landing Page - English Learning Platform

## Overview

This project implements a fully dynamic landing page for an English learning platform, where all content can be managed through a settings panel and stored in Firebase. The landing page automatically displays content from Firebase while maintaining fallback content for a seamless user experience.

## 🚀 Features

### Dynamic Content Management

- **Hero Section**: Dynamic title, subtitle, background image, and demo video
- **Statistics Banner**: Dynamic statistics with animated counters
- **Features Section**: Dynamic features with icons, titles, descriptions, and benefits
- **Testimonials Section**: Dynamic testimonials with avatars, ratings, and quotes
- **FAQ Section**: Dynamic frequently asked questions with search functionality
- **Contact Section**: Dynamic contact information and social media links

### Social Media Integration

- **WhatsApp Integration**: Smart WhatsApp chat links with prefilled messages
- **Multi-Platform Support**: Facebook, Twitter, LinkedIn, WhatsApp, TikTok
- **Smart Link Formatting**: Automatic URL formatting for each platform

### Technical Features

- **Firebase Integration**: Real-time content updates from Firestore
- **Loading States**: Smooth loading indicators and skeleton screens
- **Error Handling**: Graceful fallbacks when data is missing
- **Responsive Design**: Mobile-first responsive layout
- **Performance Optimized**: Lazy loading and memoization

## 📁 Project Structure

```
src/
├── screens/
│   ├── Landing.jsx                    # Main landing page component
│   ├── landing/
│   │   ├── HeroSection.jsx            # Dynamic hero section
│   │   ├── StatisticsBanner.jsx       # Dynamic statistics
│   │   ├── FeaturesSection.jsx        # Dynamic features
│   │   ├── TestimonialsSection.jsx    # Dynamic testimonials
│   │   ├── FAQSection.jsx             # Dynamic FAQs
│   │   ├── ContactSection.jsx         # Dynamic contact info
│   │   └── components/
│   │       ├── CoursesSection.jsx     # Course showcase
│   │       └── LandingCourseCard.jsx  # Course cards
│   └── settings/
│       ├── LandingPageSettings.jsx    # Settings panel
│       └── panels/                    # Settings panels
├── contexts/
│   └── LandingPageContext.jsx         # Global state management
├── services/
│   ├── landingPageService.js          # Service layer
│   └── landingPageFirebaseService.js  # Firebase operations
└── utils/
    └── firebaseStorage.js             # File upload utilities
```

## 🛠️ Technology Stack

- **Frontend**: React 18, Material-UI (MUI)
- **State Management**: React Context API
- **Backend**: Firebase (Firestore, Storage)
- **Animations**: Framer Motion
- **Internationalization**: react-i18next
- **Styling**: Material-UI with custom themes

## 🔧 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project setup

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Firebase Setup

1. Create a Firebase project
2. Enable Firestore Database
3. Enable Firebase Storage
4. Set up security rules
5. Add your Firebase config to the environment variables

## 📊 Data Structure

### Firebase Collections

#### `landingPage` Collection

```javascript
{
  id: "active",
  version: 1,
  heroContent: {
    title: "Master English with",
    titleHighlight: "Interactive Learning",
    subtitle: "Experience personalized English learning...",
    backgroundImage: "https://...",
    demoVideoId: "youtube_video_id"
  },
  statistics: [
    {
      id: "students",
      value: 5000,
      label: "Active Students"
    }
  ],
  features: [
    {
      id: "interactive",
      title: "Interactive Learning",
      description: "Learn through engaging activities",
      iconName: "Translate",
      benefits: ["Real-time feedback", "Gamified learning"]
    }
  ],
  testimonials: [
    {
      id: "testimonial1",
      name: "Sarah Johnson",
      role: "Student",
      quote: "Amazing learning experience!",
      rating: 5,
      avatar: "https://..."
    }
  ],
  faqs: [
    {
      id: "faq1",
      question: "How does the learning work?",
      answer: "Our platform uses..."
    }
  ],
  contactInfo: {
    email: "support@englishlearning.com",
    phone: "+1 (555) 123-4567",
    location: "123 Learning Street, Education City",
    socialLinks: {
      facebook: "https://facebook.com/...",
      twitter: "https://twitter.com/...",
      linkedin: "https://linkedin.com/...",
      whatsapp: "+1234567890",
      whatsappMessage: "Hi! I'm interested in learning English.",
      tiktok: "https://tiktok.com/@..."
    }
  }
}
```

## 🎯 Usage

### Content Management

1. Navigate to `/settings` in the admin panel
2. Use the tabs to manage different sections:
   - **Hero**: Title, subtitle, background image, demo video
   - **Statistics**: Numbers and labels
   - **Features**: Icons, titles, descriptions, benefits
   - **Testimonials**: Names, roles, quotes, ratings, avatars
   - **FAQ**: Questions and answers
   - **Contact**: Contact info and social media links

### Social Media Links

- **WhatsApp**: Enter phone number and optional prefilled message
- **Other Platforms**: Enter full URLs
- **Smart Formatting**: WhatsApp links are automatically formatted for chat

### File Uploads

- **Images**: Supported formats (JPG, PNG, WebP)
- **Automatic Optimization**: Images are optimized for web
- **Storage**: Files are stored in Firebase Storage

## 🔄 Data Flow

```
Firebase Firestore → LandingPageContext → Landing.jsx → Individual Sections
```

### Fallback Strategy

```
Dynamic Content → Translation Keys → Hardcoded Content
```

## 🎨 Customization

### Adding New Icons

1. Import the icon in `FeaturesSection.jsx`
2. Add to the `iconMap` object
3. Use the icon name in the settings panel

### Adding New Social Media Platforms

1. Import the icon in `ContactSection.jsx`
2. Add to the `platforms` array in `SocialMediaLinks`
3. Handle any special formatting in the `formatWhatsAppLink` function

### Styling

- **Theme**: Custom Material-UI theme in `ThemeContext`
- **Components**: Styled using Material-UI's `sx` prop
- **Responsive**: Mobile-first design with breakpoints

## 🧪 Testing

### Manual Testing

1. **Content Updates**: Change content in settings and verify landing page updates
2. **Social Media Links**: Test all social media links work correctly
3. **Responsive Design**: Test on mobile, tablet, and desktop
4. **Loading States**: Verify loading indicators work properly
5. **Error Handling**: Test with missing or invalid data

### Automated Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 📈 Performance

### Optimizations Implemented

- **Lazy Loading**: Non-critical sections loaded on demand
- **Memoization**: Expensive components memoized with React.memo
- **Image Optimization**: Automatic image compression and optimization
- **Caching**: Firebase data cached in context
- **Bundle Splitting**: Code split by routes and components

### Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔒 Security

### Firebase Security Rules

```javascript
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /landingPage/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}

// Storage rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### Content Not Updating

1. Check Firebase connection
2. Verify data structure matches expected format
3. Check browser console for errors
4. Clear browser cache

#### Images Not Loading

1. Check Firebase Storage rules
2. Verify image URLs are correct
3. Check image format compatibility

#### Social Media Links Not Working

1. Verify URL format is correct
2. Check if platform requires special formatting
3. Test links in incognito mode

### Debug Mode

```javascript
// Enable debug logging
localStorage.setItem("debug", "landing-page:*");
```

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **TypeScript**: Consider migrating to TypeScript for better type safety

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Material-UI**: For the excellent component library
- **Firebase**: For the robust backend services
- **Framer Motion**: For smooth animations
- **React Community**: For the amazing ecosystem

## 📞 Support

For support and questions:

- **Email**: support@englishlearning.com
- **Documentation**: [Project Wiki](wiki-url)
- **Issues**: [GitHub Issues](issues-url)

---

**Made with ❤️ for better English learning experiences**

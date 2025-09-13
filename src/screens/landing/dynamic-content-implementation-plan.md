# Dynamic Content Implementation Plan - Landing Page

## Overview

This document outlines a step-by-step approach to replace hardcoded content in the landing page with dynamic content from Firebase, ensuring we don't break the existing layout and functionality.

## Current State Analysis

### Landing Page Sections (in order of appearance):

1. **HeroSection.jsx** - Main hero with title, subtitle, CTA, background image
2. **StatisticsBanner.jsx** - Statistics/numbers display
3. **FeaturesSection.jsx** - Features with icons and descriptions
4. **ShowcaseTabsSection.jsx** - Course showcase tabs
5. **TestimonialsSection.jsx** - Customer testimonials
6. **FAQSection.jsx** - Frequently asked questions
7. **ContactSection.jsx** - Contact form and information

### Current Data Sources:

- ✅ **Settings Panel**: Already connected to Firebase
- ✅ **LandingPageContext**: Provides data to settings
- ❌ **Landing Sections**: Still using hardcoded content

## Implementation Strategy

### Phase 1: Foundation & Data Integration (Week 1)

#### Step 1.1: Create Landing Page Context Integration

**Goal**: Connect landing page sections to the existing LandingPageContext

**Files to Modify**:

- `src/screens/landing/HeroSection.jsx`
- `src/screens/landing/StatisticsBanner.jsx`
- `src/screens/landing/FeaturesSection.jsx`
- `src/screens/landing/TestimonialsSection.jsx`
- `src/screens/landing/FAQSection.jsx`
- `src/screens/landing/ContactSection.jsx`

**Implementation**:

```javascript
// Add to each landing section
import { useLandingPage } from "../../contexts/LandingPageContext";

const ComponentName = () => {
  const {
    heroContent,
    statistics,
    features,
    testimonials,
    faqs,
    contactInfo,
    isLoading,
  } = useLandingPage();

  // Use data from context instead of hardcoded values
};
```

#### Step 1.2: Add Loading States

**Goal**: Show loading indicators while data is being fetched

**Implementation**:

```javascript
// Add loading state handling
if (isLoading) {
  return <LoadingSpinner />;
}
```

#### Step 1.3: Add Fallback Content

**Goal**: Show default content if Firebase data is empty

**Implementation**:

```javascript
// Use fallback content when data is empty
const title = heroContent?.title || "Default Title";
const subtitle = heroContent?.subtitle || "Default subtitle";
```

### Phase 2: Hero Section Implementation (Week 1)

#### Step 2.1: Replace Hardcoded Hero Content

**File**: `src/screens/landing/HeroSection.jsx`

**Current Hardcoded Elements**:

- Title: "Master English with"
- Title Highlight: "Interactive Learning"
- Subtitle: "Experience personalized English learning..."
- Background image
- Demo video ID

**Dynamic Implementation**:

```javascript
const HeroSection = ({ isRTL, t, navigate, theme }) => {
  const { heroContent, isLoading } = useLandingPage();

  if (isLoading) {
    return <HeroLoadingSkeleton />;
  }

  return (
    <Box>
      <Typography variant="h1">
        {heroContent?.title || "Master English with"}
        <GradientText>
          {heroContent?.titleHighlight || "Interactive Learning"}
        </GradientText>
      </Typography>
      <Typography variant="h5">
        {heroContent?.subtitle || "Experience personalized English learning..."}
      </Typography>
      {/* Background image from heroContent.backgroundImage */}
      {/* Demo video from heroContent.demoVideoId */}
    </Box>
  );
};
```

#### Step 2.2: Handle Background Image

**Implementation**:

```javascript
// Dynamic background image
const backgroundStyle = heroContent?.backgroundImage
  ? { backgroundImage: `url(${heroContent.backgroundImage})` }
  : {
      /* fallback gradient */
    };
```

### Phase 3: Statistics Section Implementation (Week 1)

#### Step 3.1: Replace Hardcoded Statistics

**File**: `src/screens/landing/StatisticsBanner.jsx`

**Current Hardcoded Elements**:

- Statistics array with hardcoded values
- Labels and numbers

**Dynamic Implementation**:

```javascript
const StatisticsBanner = ({ t }) => {
  const { statistics, isLoading } = useLandingPage();

  if (isLoading) {
    return <StatisticsLoadingSkeleton />;
  }

  return (
    <Box>
      {statistics.map((stat, index) => (
        <StatisticItem
          key={stat.id || index}
          value={stat.value}
          label={stat.label}
        />
      ))}
    </Box>
  );
};
```

### Phase 4: Features Section Implementation (Week 2)

#### Step 4.1: Replace Hardcoded Features

**File**: `src/screens/landing/FeaturesSection.jsx`

**Current Hardcoded Elements**:

- Features array with hardcoded content
- Icons, titles, descriptions

**Dynamic Implementation**:

```javascript
const FeaturesSection = ({ t }) => {
  const { features, isLoading } = useLandingPage();

  if (isLoading) {
    return <FeaturesLoadingSkeleton />;
  }

  return (
    <Box>
      {features.map((feature, index) => (
        <FeatureCard
          key={feature.id || index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          benefits={feature.benefits}
        />
      ))}
    </Box>
  );
};
```

#### Step 4.2: Update FeatureCard Component

**File**: `src/screens/landing/FeatureCard.jsx`

**Implementation**:

```javascript
const FeatureCard = ({ icon, title, description, benefits }) => {
  // Use dynamic icon mapping
  const IconComponent = iconMap[icon] || DefaultIcon;

  return (
    <Card>
      <IconComponent />
      <Typography variant="h6">{title}</Typography>
      <Typography>{description}</Typography>
      {benefits &&
        benefits.map((benefit, index) => (
          <Typography key={index} variant="body2">
            • {benefit}
          </Typography>
        ))}
    </Card>
  );
};
```

### Phase 5: Testimonials Section Implementation (Week 2)

#### Step 5.1: Replace Hardcoded Testimonials

**File**: `src/screens/landing/TestimonialsSection.jsx`

**Current Hardcoded Elements**:

- Testimonials array with hardcoded content
- Names, roles, quotes, ratings

**Dynamic Implementation**:

```javascript
const TestimonialsSection = ({ t }) => {
  const { testimonials, isLoading } = useLandingPage();

  if (isLoading) {
    return <TestimonialsLoadingSkeleton />;
  }

  return (
    <Box>
      {testimonials.map((testimonial, index) => (
        <TestimonialCard
          key={testimonial.id || index}
          name={testimonial.name}
          role={testimonial.role}
          quote={testimonial.quote}
          rating={testimonial.rating}
          avatar={testimonial.avatar}
        />
      ))}
    </Box>
  );
};
```

### Phase 6: FAQ Section Implementation (Week 2)

#### Step 6.1: Replace Hardcoded FAQs

**File**: `src/screens/landing/FAQSection.jsx`

**Current Hardcoded Elements**:

- FAQ array with hardcoded questions and answers
- Categories

**Dynamic Implementation**:

```javascript
const FAQSection = ({ t }) => {
  const { faqs, isLoading } = useLandingPage();

  if (isLoading) {
    return <FAQLoadingSkeleton />;
  }

  return (
    <Box>
      {faqs.map((faq, index) => (
        <Accordion key={faq.id || index}>
          <AccordionSummary>
            <Typography>{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};
```

### Phase 7: Contact Section Implementation (Week 3)

#### Step 7.1: Replace Hardcoded Contact Info

**File**: `src/screens/landing/ContactSection.jsx`

**Current Hardcoded Elements**:

- Contact information (email, phone, location)
- Social media links

**Dynamic Implementation**:

```javascript
const ContactSection = ({ t }) => {
  const { contactInfo, isLoading } = useLandingPage();

  if (isLoading) {
    return <ContactLoadingSkeleton />;
  }

  return (
    <Box>
      <ContactInfo
        icon={<EmailIcon />}
        title="Email"
        content={contactInfo?.email}
      />
      <ContactInfo
        icon={<PhoneIcon />}
        title="Phone"
        content={contactInfo?.phone}
      />
      <ContactInfo
        icon={<LocationOnIcon />}
        title="Location"
        content={contactInfo?.location}
      />

      {/* Social Media Links */}
      {contactInfo?.socialLinks && (
        <SocialMediaLinks socialLinks={contactInfo.socialLinks} />
      )}
    </Box>
  );
};
```

#### Step 7.2: Create Social Media Links Component

**Implementation**:

```javascript
const SocialMediaLinks = ({ socialLinks }) => {
  const platforms = [
    { key: "facebook", icon: FacebookIcon, label: "Facebook" },
    { key: "twitter", icon: TwitterIcon, label: "Twitter" },
    { key: "linkedin", icon: LinkedInIcon, label: "LinkedIn" },
    { key: "whatsapp", icon: WhatsAppIcon, label: "WhatsApp" },
    { key: "tiktok", icon: TikTokIcon, label: "TikTok" },
  ];

  return (
    <Box>
      {platforms.map(({ key, icon: Icon, label }) => {
        const link = socialLinks[key];
        if (!link) return null;

        // Handle WhatsApp special case
        const href =
          key === "whatsapp"
            ? formatWhatsAppLink(link, socialLinks.whatsappMessage)
            : link;

        return (
          <IconButton key={key} href={href} target="_blank">
            <Icon />
          </IconButton>
        );
      })}
    </Box>
  );
};
```

### Phase 8: Error Handling & Fallbacks (Week 3)

#### Step 8.1: Add Error Boundaries

**Implementation**:

```javascript
// Create error boundary component
const LandingErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <ErrorFallback onReset={() => setHasError(false)} />;
  }

  return (
    <ErrorBoundary onError={() => setHasError(true)}>{children}</ErrorBoundary>
  );
};
```

#### Step 8.2: Add Data Validation

**Implementation**:

```javascript
// Validate data before using
const validateHeroContent = (content) => {
  if (!content) return defaultHeroContent;

  return {
    title: content.title || defaultHeroContent.title,
    titleHighlight: content.titleHighlight || defaultHeroContent.titleHighlight,
    subtitle: content.subtitle || defaultHeroContent.subtitle,
    backgroundImage: content.backgroundImage || "",
    demoVideoId: content.demoVideoId || "",
  };
};
```

### Phase 9: Performance Optimization (Week 3)

#### Step 9.1: Add Memoization

**Implementation**:

```javascript
// Memoize expensive components
const MemoizedFeatureCard = React.memo(FeatureCard);
const MemoizedTestimonialCard = React.memo(TestimonialCard);
```

#### Step 9.2: Add Lazy Loading

**Implementation**:

```javascript
// Lazy load non-critical sections
const TestimonialsSection = React.lazy(() => import("./TestimonialsSection"));
const FAQSection = React.lazy(() => import("./FAQSection"));
```

### Phase 10: Testing & Quality Assurance (Week 4)

#### Step 10.1: Add Unit Tests

**Implementation**:

```javascript
// Test data integration
describe("HeroSection", () => {
  it("should display dynamic content from context", () => {
    const mockHeroContent = {
      title: "Test Title",
      titleHighlight: "Test Highlight",
      subtitle: "Test Subtitle",
    };

    render(<HeroSection />, { wrapper: MockLandingPageProvider });
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });
});
```

#### Step 10.2: Add Integration Tests

**Implementation**:

```javascript
// Test complete data flow
describe("Landing Page Data Flow", () => {
  it("should load and display all sections correctly", async () => {
    render(<LandingPage />);

    await waitFor(() => {
      expect(screen.getByText(/Master English/)).toBeInTheDocument();
      expect(screen.getByText(/Active Students/)).toBeInTheDocument();
    });
  });
});
```

## Implementation Timeline

### Week 1: Foundation & Core Sections

- [ ] **Day 1-2**: Set up context integration and loading states
- [ ] **Day 3-4**: Implement Hero section dynamic content
- [ ] **Day 5**: Implement Statistics section dynamic content

### Week 2: Content Sections

- [ ] **Day 1-2**: Implement Features section dynamic content
- [ ] **Day 3-4**: Implement Testimonials section dynamic content
- [ ] **Day 5**: Implement FAQ section dynamic content

### Week 3: Contact & Polish

- [ ] **Day 1-2**: Implement Contact section dynamic content
- [ ] **Day 3-4**: Add error handling and fallbacks
- [ ] **Day 5**: Performance optimization

### Week 4: Testing & Launch

- [ ] **Day 1-2**: Add comprehensive tests
- [ ] **Day 3-4**: Final testing and bug fixes
- [ ] **Day 5**: Deploy and monitor

## Risk Mitigation

### 1. **Layout Preservation**

- **Strategy**: Keep existing CSS classes and styling
- **Approach**: Only replace content, not structure
- **Fallback**: Use default content if dynamic content fails

### 2. **Performance Impact**

- **Strategy**: Implement loading states and skeleton screens
- **Approach**: Lazy load non-critical sections
- **Fallback**: Cache data in context to reduce API calls

### 3. **Data Consistency**

- **Strategy**: Validate data before using
- **Approach**: Provide sensible defaults
- **Fallback**: Show error states instead of broken content

### 4. **User Experience**

- **Strategy**: Maintain smooth transitions
- **Approach**: Use skeleton loading states
- **Fallback**: Progressive enhancement

## Success Metrics

### Technical Metrics

- [ ] All sections load dynamic content successfully
- [ ] Loading states work properly
- [ ] Error handling prevents crashes
- [ ] Performance remains acceptable

### User Experience Metrics

- [ ] No layout shifts during content loading
- [ ] Smooth transitions between states
- [ ] Fallback content looks professional
- [ ] Social media links work correctly

### Business Metrics

- [ ] Content updates reflect immediately
- [ ] Settings panel controls work properly
- [ ] No broken links or missing content
- [ ] SEO-friendly dynamic content

## Conclusion

This step-by-step approach ensures we can safely replace hardcoded content with dynamic content while maintaining the existing layout and user experience. Each phase builds upon the previous one, allowing for testing and validation at each step.

The key is to implement changes incrementally, test thoroughly, and always have fallback content ready in case of any issues.

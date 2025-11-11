# Site Configuration

This directory contains the centralized configuration file for the Academy of Tutors website. All website data including contact information, business details, and settings can be modified from the `site.ts` file.

## File Structure

- `site.ts` - Main configuration file containing all website data
- `README.md` - This documentation file

## How to Use

### 1. Basic Site Information

```typescript
// Update these in site.ts
name: "Academy of Tutors",
description: "Connect with qualified tutors and guardians for personalized learning experiences",
url: "https://academyoftutors.com",
```

### 2. Contact Information

```typescript
contact: {
  phone: "+91 98765 43210",
  email: "contact@academyoftutors.com",
  address: {
    street: "123 Education Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    country: "India"
  }
}
```

### 3. Social Media Links

```typescript
social: {
  facebook: "https://facebook.com/academyoftutors",
  twitter: "https://twitter.com/academyoftutors",
  instagram: "https://instagram.com/academyoftutors",
  linkedin: "https://linkedin.com/company/academyoftutors",
  youtube: "https://youtube.com/@academyoftutors"
}
```

### 4. Footer Links

The footer links are organized into categories:

- **Company**: About Us, Mission, Careers, Press
- **Services**: For Teachers, For Guardians, Subjects, Pricing
- **Support**: Help Center, Contact Support, FAQ, Community
- **Legal**: Privacy Policy, Terms of Service, Cookie Policy, GDPR

### 5. Business Information

```typescript
business: {
  registrationNumber: "GSTIN: 27ABCDE1234F1Z5",
  panNumber: "PAN: ABCDE1234F",
  founded: "2024",
  ceo: "Dr. Education Expert",
  headquarters: "Mumbai, Maharashtra, India"
}
```

### 6. Payment Information

```typescript
payment: {
  registrationFee: 50,
  currency: "INR",
  paymentGateway: "Razorpay",
  supportedMethods: ["UPI", "Card", "Wallet"]
}
```

### 7. Features and Capabilities

```typescript
features: {
  maxSubjects: 10,
  maxExperience: 50,
  supportedGrades: ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"],
  supportedSubjects: ["Mathematics", "Science", "English", "Hindi", "History", "Geography", "Physics", "Chemistry", "Biology", "Computer Science"],
  learningModes: ["Online", "Offline", "Hybrid"],
  teachingModes: ["Online", "Offline", "Hybrid"]
}
```

### 8. SEO and Meta Information

```typescript
seo: {
  titleTemplate: "%s | Academy of Tutors",
  defaultTitle: "Academy of Tutors - Connect with Qualified Tutors",
  defaultDescription: "Find qualified tutors and connect with guardians for personalized learning experiences. Join Academy of Tutors today.",
  keywords: ["tutors", "education", "online learning", "home tuition", "academic support", "teachers", "guardians"],
  author: "Academy of Tutors",
  ogImage: "/og-image.jpg",
  twitterHandle: "@academyoftutors"
}
```

### 9. App Settings

```typescript
app: {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  supportedImageFormats: ["jpg", "jpeg", "png", "webp"],
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  maxLoginAttempts: 5,
  passwordMinLength: 8
}
```

## Helper Functions

The configuration file also includes helper functions:

- `getFullAddress()` - Returns the complete formatted address
- `getFormattedPhone()` - Returns the formatted phone number
- `getCopyrightText()` - Returns the copyright text with current year

## Usage in Components

To use the configuration in your components:

```typescript
import { siteConfig, getFullAddress, getCopyrightText } from "@/config/site";

// Use site data
const companyName = siteConfig.name;
const contactPhone = siteConfig.contact.phone;
const fullAddress = getFullAddress();
const copyrightText = getCopyrightText();
```

## Benefits

1. **Centralized Management**: All website data is in one place
2. **Easy Updates**: Change contact info, business details, or any data without touching multiple files
3. **Consistency**: Ensures all components use the same data
4. **Maintainability**: Easy to maintain and update website information
5. **Type Safety**: TypeScript provides type checking for all configuration data

## Common Updates

### Change Contact Information
1. Open `src/config/site.ts`
2. Update the `contact` section
3. Save the file
4. All components using this data will automatically update

### Change Business Details
1. Open `src/config/site.ts`
2. Update the `business` section
3. Save the file
4. Footer and other components will reflect the changes

### Change Registration Fee
1. Open `src/config/site.ts`
2. Update `payment.registrationFee`
3. Save the file
4. All payment-related components will use the new amount

### Add New Footer Links
1. Open `src/config/site.ts`
2. Add new links to the appropriate section in `footer`
3. Save the file
4. Footer component will automatically include the new links 
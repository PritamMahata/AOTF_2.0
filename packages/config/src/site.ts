export const siteConfig = {
  // Basic site information
  ceo:"Soumyadip Ghosh",
  name: "Academy of Tutorials & Freelancers",
  shortName: "AOTF",
  subDescription: "Connect with Expert Tutors for Academic Excellence",
  description: `Join Academy of Tutorials & Freelancers Services to find qualified tutors or share your expertise. Our platform makes learning accessible and teaching rewarding.`,
  url: "https://aotf.in",

  //payment ids
  UPI: {
    name: "Sayantan",
    Id: "balsayantan3@okhdfcbank",
    Currency: "INR"
  },

  // Contact information
  contact: {
    phone: "+91 6290338214",
    email: "contact@aotf.in",
    address: {
      street: "11 No. Dulal Nagar, Belgharia near Alap Banquet",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700056",
      country: "India"
    }
  },

  // Social media links
  social: {
    facebook: "https://facebook.com/academyoftutorialsandfreelancers",
    twitter: "https://twitter.com/academyoftutorialsandfreelancers",
    instagram: "https://instagram.com/academyoftutorialsandfreelancers",
    linkedin: "https://linkedin.com/company/academyoftutorialsandfreelancers",
    youtube: "https://youtube.com/@academyoftutorialsandfreelancers"
  },

  // Footer links
  footer: {
    quickLinks: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Terms and Conditions", href: "/terms" },
      { name: "Refund Policy", href: "/refund-policy" },
      { name: "Privacy Policy", href: "/privacy-policy" },
    ],
    services: [
      { name: "For Teachers", href: "/teacher" },
      { name: "For Guardians", href: "/guardian" },
      { name: "Subjects", href: "/subjects" },
      { name: "Pricing", href: "/pricing" }
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Contact Support", href: "/contact" },
      { name: "FAQ", href: "/faq" },
      { name: "Community", href: "/community" }
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" }
    ]
  },

  // Business information
  business: {
    registrationNumber: "GSTIN: 27ABCDE1234F1Z5",
    panNumber: "PAN: ABCDE1234F",
    founded: "2024",
    ceo: "Dr. Education Expert",
    headquarters: "Mumbai, Maharashtra, India"
  },

  // Payment information
  payment: {
    registrationFee: 49,
    currency: "INR",
    paymentGateway: "Razorpay",
    supportedMethods: ["UPI", "Card", "Wallet"]
  },

  // Features and capabilities
  features: {
    maxSubjects: 10,
    maxExperience: 50,
    supportedGrades: ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"],
    supportedSubjects: [
      "Mathematics", "Science", "English", "Hindi", "History",
      "Geography", "Physics", "Chemistry", "Biology", "Computer Science"
    ],
    learningModes: ["Online", "Offline", "Hybrid"],
    teachingModes: ["Online", "Offline", "Hybrid"],
    maxPostsPerStudent: 3 // Default value, can be changed in settings
  },

  // SEO and meta information
  seo: {
    titleTemplate: "%s | Academy of Tutors",
    defaultTitle: "Academy of Tutors - Connect with Qualified Tutors",
    defaultDescription: "Find qualified tutors and connect with guardians for personalized learning experiences. Join Academy of Tutors today.",
    keywords: ["tutors", "education", "online learning", "home tuition", "academic support", "teachers", "guardians"],
    author: "Academy of Tutors",
    ogImage: "/og-image.jpg",
    twitterHandle: "@academyoftutors"
  },

  // App settings
  app: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    supportedImageFormats: ["jpg", "jpeg", "png", "webp"],
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    passwordMinLength: 8
  },

  maxApplicationPerPost: 3
};

// Helper function to get full address
export const getFullAddress = () => {
  const { address } = siteConfig.contact;
  return `${address.street}, ${address.city}, ${address.state} ${address.pincode}, ${address.country}`;
};

// Helper function to get formatted phone number
export const getFormattedPhone = () => {
  return siteConfig.contact.phone;
};

// Helper function to get copyright text
export const getCopyrightText = () => {
  const currentYear = new Date().getFullYear();
  return `© ${currentYear} ${siteConfig.name}. All rights reserved.`;
};
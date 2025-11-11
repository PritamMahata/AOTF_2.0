// Validation utility for forms
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password || password.trim() === '') {
    errors.push('Password is required');
  } else {
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    if (password.length > 50) {
      errors.push('Password cannot exceed 50 characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Name validation
export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name || name.trim() === '') {
    errors.push('Name is required');
  } else {
    if (name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    if (name.trim().length > 100) {
      errors.push('Name cannot exceed 100 characters');
    }
    const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
    if (!nameRegex.test(name.trim())) {
      errors.push('Name can only contain letters, spaces, hyphens, apostrophes, and periods');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Phone validation (Indian format)
export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone || phone.trim() === '') {
    errors.push('Phone number is required');
  } else {
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length !== 10) {
      errors.push('Phone number must be exactly 10 digits');
    } else {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(cleanPhone)) {
        errors.push('Please enter a valid Indian mobile number');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Location validation
export const validateLocation = (location: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!location || location.trim() === '') {
    errors.push('Location is required');
  } else {
    const trimmed = location.trim();
    if (trimmed.length < 3) {
      errors.push('Location must be at least 3 characters long');
    }
    if (trimmed.length > 200) {
      errors.push('Location cannot exceed 200 characters');
    }
    // Basic validation - must contain at least letters
    const hasLetter = /[A-Za-z]/.test(trimmed);
    if (!hasLetter) {
      errors.push('Location must contain at least one letter');
    }
    // Allow letters, numbers, spaces, commas, periods, hyphens
    const validChars = /^[A-Za-z0-9\s,.\-]+$/;
    if (!validChars.test(trimmed)) {
      errors.push('Location can only contain letters, numbers, spaces, commas, periods, and hyphens');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Grade validation
export const validateGrade = (grade: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!grade || grade.trim() === '') {
    errors.push('Grade is required');
  } else {
    const validGrades = [
      'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
      'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
      'Grade 11', 'Grade 12', 'University Level'
    ];
    
    if (!validGrades.includes(grade)) {
      errors.push('Please select a valid grade');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Experience validation
export const validateExperience = (experience: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!experience || experience.trim() === '') {
    errors.push('Teaching experience is required');
  } else {
    const validExperiences = ['0-1', '2-5', '6-10', '10+'];
    if (!validExperiences.includes(experience)) {
      errors.push('Please select a valid experience level');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Qualifications validation
export const validateQualifications = (qualifications: string): ValidationResult => {
  const errors: string[] = [];
  
  if (qualifications && qualifications.trim() !== '') {
    const trimmed = qualifications.trim();

    if (trimmed.length > 50) {
      errors.push('Qualifications cannot exceed 50 characters');
    }
    // Must contain at least one letter and one number (e.g., "B.Sc 2020")
    const hasLetter = /[A-Za-z]/.test(trimmed);
    const hasNumber = /\d/.test(trimmed);
    if (!hasLetter && !hasNumber) {
      errors.push('Qualifications must include at least one letter and one number (e.g., "B.Sc")');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Bio validation
export const validateBio = (bio: string): ValidationResult => {
  const errors: string[] = [];
  
  if (bio && bio.trim() !== '') {
    if (bio.trim().length < 10) {
      errors.push('Bio must be at least 10 characters long');
    }
    if (bio.trim().length > 1000) {
      errors.push('Bio cannot exceed 1000 characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Subjects validation
export const validateSubjects = (subjects: string[]): ValidationResult => {
  const errors: string[] = [];
  
  if (!subjects || subjects.length === 0) {
    errors.push('Please select at least one subject');
  } else {
    if (subjects.length > 10) {
      errors.push('You can select up to 10 subjects');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Learning/Teaching mode validation
export const validateMode = (mode: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!mode || mode.trim() === '') {
    errors.push('Please select a mode preference');
  } else {
    const validModes = ['online', 'in-person', 'both'];
    if (!validModes.includes(mode)) {
      errors.push('Please select a valid mode');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Login form validation
export const validateLoginForm = (data: { email: string; password: string }): ValidationResult => {
  const errors: string[] = [];
  
  const emailValidation = validateEmail(data.email);
  const passwordValidation = validatePassword(data.password);
  
  errors.push(...emailValidation.errors);
  errors.push(...passwordValidation.errors);
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Signup form validation
export const validateSignupForm = (data: { 
  name: string; 
  email: string; 
  password: string; 
  confirmPassword: string; 
}): ValidationResult => {
  const errors: string[] = [];
  
  const nameValidation = validateName(data.name);
  const emailValidation = validateEmail(data.email);
  const passwordValidation = validatePassword(data.password);
  
  errors.push(...nameValidation.errors);
  errors.push(...emailValidation.errors);
  errors.push(...passwordValidation.errors);
  
  // Confirm password validation
  const password = data.password || '';
  const confirmPassword = data.confirmPassword || '';
  

  
  if (password.trim() !== confirmPassword.trim()) {
    errors.push('Passwords do not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// WhatsApp number validation (same as phone validation)
export const validateWhatsAppNumber = (whatsappNumber: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!whatsappNumber || whatsappNumber.trim() === '') {
    errors.push('WhatsApp number is required');
  } else {
    // Remove any non-digit characters
    const cleanWhatsApp = whatsappNumber.replace(/\D/g, '');
    
    if (cleanWhatsApp.length !== 10) {
      errors.push('WhatsApp number must be exactly 10 digits');
    } else {
      const whatsappRegex = /^[6-9]\d{9}$/;
      if (!whatsappRegex.test(cleanWhatsApp)) {
        errors.push('Please enter a valid Indian mobile number for WhatsApp');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// School board validation (for teacher onboarding - required field)
export const validateSchoolBoard = (board: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!board || board.trim() === '') {
    errors.push('School board is required');
  } else {
    const validBoards = ['CBSE', 'ICSE', 'ISC', 'WBBSE', 'WBCHS'];
    if (!validBoards.includes(board.toUpperCase())) {
      errors.push('Please select a valid board (CBSE, ICSE, ISC, WBBSE, or WBCHS)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Basic details form validation
export const validateBasicDetailsForm = (data: {
  phone: string;
  location: string;
  isPhoneWhatsApp?: boolean;
  whatsappNumber?: string;
  experience?: string;
  qualifications?: string;
  schoolBoard?: string;
  role: 'guardian' | 'teacher' | 'freelancer' | 'client' | null;
}): ValidationResult => {
  const errors: string[] = [];
  
  const phoneValidation = validatePhone(data.phone);
  const locationValidation = validateLocation(data.location);
  
  errors.push(...phoneValidation.errors);
  errors.push(...locationValidation.errors);
  
  // WhatsApp number validation
  if (data.isPhoneWhatsApp === false && data.whatsappNumber) {
    const whatsappValidation = validateWhatsAppNumber(data.whatsappNumber);
    errors.push(...whatsappValidation.errors);
  }
  
  // Role-specific validations
  if (data.role === 'teacher') {
    // Experience is required for teachers
    if (data.experience) {
      const experienceValidation = validateExperience(data.experience);
      errors.push(...experienceValidation.errors);
    }
    
    // Qualifications are required for teachers
    if (!data.qualifications || !data.qualifications.trim()) {
      errors.push('Qualifications are required for teachers');
    } else {
      const qualificationsValidation = validateQualifications(data.qualifications);
      errors.push(...qualificationsValidation.errors);
    }
    
    // School board is required for teachers
    if (!data.schoolBoard || !data.schoolBoard.trim()) {
      errors.push('School board is required for teachers');
    } else {
      const boardValidation = validateSchoolBoard(data.schoolBoard);
      errors.push(...boardValidation.errors);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Preferences form validation
export const validatePreferencesForm = (data: {
  subjectsOfInterest?: string[];
  subjectsTeaching?: string[];
  learningMode?: string;
  teachingMode?: string;
  bio?: string;
  role: 'guardian' | 'teacher' | 'freelancer' | 'client' | null;
}): ValidationResult => {
  const errors: string[] = [];
  
  if (data.role === 'guardian') {
    if (data.subjectsOfInterest) {
      const subjectsValidation = validateSubjects(data.subjectsOfInterest);
      errors.push(...subjectsValidation.errors);
    }
    if (data.learningMode) {
      const modeValidation = validateMode(data.learningMode);
      errors.push(...modeValidation.errors);
    }
  } else if (data.role === 'teacher') {
    if (data.subjectsTeaching) {
      const subjectsValidation = validateSubjects(data.subjectsTeaching);
      errors.push(...subjectsValidation.errors);
    }
    // Teaching mode is required for teachers
    const modeValidation = validateMode(data.teachingMode || "");
    errors.push(...modeValidation.errors);

    if (data.bio) {
      const bioValidation = validateBio(data.bio);
      errors.push(...bioValidation.errors);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Subject validation for teacher request forms
export const validateSubject = (subject: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!subject || subject.trim() === '') {
    errors.push('Subject is required');
  } else {
    const trimmed = subject.trim();
    if (trimmed.length < 2) {
      errors.push('Subject must be at least 2 characters long');
    }
    if (trimmed.length > 100) {
      errors.push('Subject cannot exceed 100 characters');
    }
    // Must contain at least one letter
    const hasLetter = /[A-Za-z]/.test(trimmed);
    if (!hasLetter) {
      errors.push('Subject must contain at least one letter');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Class/Grade validation
export const validateClassName = (className: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!className || className.trim() === '') {
    errors.push('Class/Grade is required');
  } else {
    const trimmed = className.trim();
    if (trimmed.length < 1) {
      errors.push('Class/Grade must be specified');
    }
    if (trimmed.length > 50) {
      errors.push('Class/Grade cannot exceed 50 characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Board validation (CBSE, ICSE, ISC, WBBSE, WBCHS) - for teacher request posts (optional)
export const validateBoard = (board: string): ValidationResult => {
  const errors: string[] = [];
  
  if (board && board.trim() !== '') {
    const validBoards = ['CBSE', 'ICSE', 'ISC', 'WBBSE', 'WBCHS'];
    if (!validBoards.includes(board.toUpperCase())) {
      errors.push('Please select a valid board (CBSE, ICSE, ISC, WBBSE, or WBCHS)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Preferred time validation
export const validatePreferredTime = (time: string): ValidationResult => {
  const errors: string[] = [];
  
  if (time && time.trim() !== '') {
    const trimmed = time.trim();
    if (trimmed.length > 50) {
      errors.push('Preferred time cannot exceed 50 characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Preferred days validation
export const validatePreferredDays = (days: string[]): ValidationResult => {
  const errors: string[] = [];
  
  if (days && days.length > 0) {
    const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const invalidDays = days.filter(day => !validDays.includes(day));
    if (invalidDays.length > 0) {
      errors.push('Please select valid days of the week');
    }
    if (days.length > 7) {
      errors.push('Cannot select more than 7 days');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Frequency validation
export const validateFrequency = (frequency: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!frequency || frequency.trim() === '') {
    errors.push('Frequency per week is required');
  } else {
    const validFrequencies = ['once', 'twice', 'thrice', 'custom'];
    if (!validFrequencies.includes(frequency)) {
      errors.push('Please select a valid frequency');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Class type validation
export const validateClassType = (classType: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!classType || classType.trim() === '') {
    errors.push('Class type is required');
  } else {
    const validTypes = ['online', 'in-person', 'both'];
    if (!validTypes.includes(classType)) {
      errors.push('Please select a valid class type');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Budget validation
export const validateBudget = (budget: string): ValidationResult => {
  const errors: string[] = [];
  
  if (budget && budget.trim() !== '') {
    const budgetNum = Number(budget);
    if (isNaN(budgetNum)) {
      errors.push('Budget must be a valid number');
    } else {
      if (budgetNum < 0) {
        errors.push('Budget cannot be negative');
      }
      if (budgetNum > 1000000) {
        errors.push('Budget cannot exceed ₹10,00,000');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Notes validation
export const validateNotes = (notes: string): ValidationResult => {
  const errors: string[] = [];
  
  if (notes && notes.trim() !== '') {
    const trimmed = notes.trim();
    if (trimmed.length > 500) {
      errors.push('Additional details cannot exceed 500 characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Complete teacher request form validation
export const validateTeacherRequestForm = (data: {
  subject: string;
  className: string;
  board?: string;
  preferredTime?: string;
  preferredDays?: string[];
  frequencyPerWeek: string;
  classType: string;
  location?: string;
  monthlyBudget?: string;
  notes?: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  // Required field validations
  const subjectValidation = validateSubject(data.subject);
  errors.push(...subjectValidation.errors);
  
  const classNameValidation = validateClassName(data.className);
  errors.push(...classNameValidation.errors);
  
  const frequencyValidation = validateFrequency(data.frequencyPerWeek);
  errors.push(...frequencyValidation.errors);
  
  const classTypeValidation = validateClassType(data.classType);
  errors.push(...classTypeValidation.errors);
  
  // Optional field validations
  if (data.board) {
    const boardValidation = validateBoard(data.board);
    errors.push(...boardValidation.errors);
  }
  
  if (data.preferredTime) {
    const timeValidation = validatePreferredTime(data.preferredTime);
    errors.push(...timeValidation.errors);
  }
  
  if (data.preferredDays && data.preferredDays.length > 0) {
    const daysValidation = validatePreferredDays(data.preferredDays);
    errors.push(...daysValidation.errors);
    
    // Check if number of days matches frequency
    const frequency = data.frequencyPerWeek.toLowerCase();
    const selectedDaysCount = data.preferredDays.length;
    
    if (frequency === 'once' && selectedDaysCount !== 1) {
      errors.push('Please select exactly 1 day for once per week');
    } else if (frequency === 'twice' && selectedDaysCount !== 2) {
      errors.push('Please select exactly 2 days for twice per week');
    } else if (frequency === 'thrice' && selectedDaysCount !== 3) {
      errors.push('Please select exactly 3 days for thrice per week');
    }
  }
  
  if (data.monthlyBudget) {
    const budgetValidation = validateBudget(data.monthlyBudget);
    errors.push(...budgetValidation.errors);
  }
  
  if (data.notes) {
    const notesValidation = validateNotes(data.notes);
    errors.push(...notesValidation.errors);
  }
  
  // Location validation for in-person classes
  if (data.classType && (data.classType === 'in-person' || data.classType === 'both')) {
    const locationValidation = validateLocation(data.location || '');
    errors.push(...locationValidation.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Feedback Type validation
export const validateFeedbackType = (feedbackType: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!feedbackType || feedbackType.trim() === '') {
    errors.push('Feedback type is required');
  } else {
    const validTypes = ['bug', 'feature', 'improvement', 'general'];
    if (!validTypes.includes(feedbackType)) {
      errors.push('Please select a valid feedback type');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rating validation
export const validateRating = (rating: number): ValidationResult => {
  const errors: string[] = [];
  
  if (rating === null || rating === undefined) {
    errors.push('Rating is required');
  } else {
    if (!Number.isInteger(rating)) {
      errors.push('Rating must be a whole number');
    }
    if (rating < 1 || rating > 5) {
      errors.push('Rating must be between 1 and 5');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Feedback Subject validation
export const validateFeedbackSubject = (subject: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!subject || subject.trim() === '') {
    errors.push('Subject is required');
  } else {
    const trimmed = subject.trim();
    if (trimmed.length < 5) {
      errors.push('Subject must be at least 5 characters long');
    }
    if (trimmed.length > 200) {
      errors.push('Subject cannot exceed 200 characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Feedback Message validation
export const validateFeedbackMessage = (message: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!message || message.trim() === '') {
    errors.push('Message is required');
  } else {
    const trimmed = message.trim();
    if (trimmed.length < 10) {
      errors.push('Message must be at least 10 characters long');
    }
    if (trimmed.length > 2000) {
      errors.push('Message cannot exceed 2000 characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Complete feedback form validation
export const validateFeedbackForm = (data: {
  feedbackType: string;
  rating: number;
  subject: string;
  message: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  const feedbackTypeValidation = validateFeedbackType(data.feedbackType);
  errors.push(...feedbackTypeValidation.errors);
  
  const ratingValidation = validateRating(data.rating);
  errors.push(...ratingValidation.errors);
  
  const subjectValidation = validateFeedbackSubject(data.subject);
  errors.push(...subjectValidation.errors);
  
  const messageValidation = validateFeedbackMessage(data.message);
  errors.push(...messageValidation.errors);
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
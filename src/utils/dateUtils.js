// Date utility functions for consistent date handling across the app

/**
 * Convert short date format (e.g., 'Mon 22', 'Wed 17') to ISO date string (YYYY-MM-DD)
 * @param {string} dateString - Short date format like 'Mon 22', 'Wed 17'
 * @returns {string|null} - ISO date string or null if conversion fails
 */
export const convertShortDateFormat = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return null;
  
  // Check if it's already in YYYY-MM-DD format
  if (dateString.includes('-') && dateString.length >= 10) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(dateString)) {
      return dateString;
    }
  }
  
  // Handle short format like 'Wed 17', 'Mon 15', etc.
  const dayMatch = dateString.match(/\d+/);
  if (!dayMatch) return null;
  
  const day = parseInt(dayMatch[0]);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed (0 = January, 11 = December)
  
  console.log('🔍 DETAILED DATE DEBUG:');
  console.log('📅 Input string:', dateString);
  console.log('📅 Extracted day:', day);
  console.log('📅 Current date:', currentDate.toISOString());
  console.log('📅 Current year:', currentYear);
  console.log('📅 Current month (0-indexed):', currentMonth);
  console.log('📅 Current month (1-indexed):', currentMonth + 1);
  console.log('📅 Current day of month:', currentDate.getDate());
  
  // Create a date with the extracted day in the current month
  const targetDate = new Date(currentYear, currentMonth, day);
  
  console.log('📅 Target date created:', targetDate.toISOString());
  console.log('📅 Target date year:', targetDate.getFullYear());
  console.log('📅 Target date month (0-indexed):', targetDate.getMonth());
  console.log('📅 Target date month (1-indexed):', targetDate.getMonth() + 1);
  console.log('📅 Target date day:', targetDate.getDate());
  console.log('📅 Target date day of week:', targetDate.getDay());
  
  // Check if the day is valid for the current month
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  console.log('📅 Days in current month:', daysInCurrentMonth);
  console.log('📅 Is day valid for current month?', day <= daysInCurrentMonth);
  
  // If the day has passed this month, use next month
  const normalizedTarget = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const normalizedCurrent = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  if (normalizedTarget < normalizedCurrent) {
    console.log('📅 Day has passed, using next month');
    const nextMonth = currentMonth + 1;
    const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear;
    const actualNextMonth = nextMonth > 11 ? 0 : nextMonth;
    
    console.log('📅 Next month (0-indexed):', actualNextMonth);
    console.log('📅 Next month (1-indexed):', actualNextMonth + 1);
    console.log('📅 Next year:', nextYear);
    
    // Create a new date object to avoid issues with setFullYear
    const newTargetDate = new Date(nextYear, actualNextMonth, day);
    targetDate.setTime(newTargetDate.getTime());
    
    console.log('📅 After setting next month:', targetDate.toISOString());
    console.log('📅 Target date day after month change:', targetDate.getDate());
  }
  
  // Final validation - ensure we have the correct day
  if (targetDate.getDate() !== day) {
    console.log('⚠️ Day mismatch detected! Expected:', day, 'Got:', targetDate.getDate());
    console.log('📅 Correcting day...');
    targetDate.setDate(day);
    console.log('📅 After correction:', targetDate.toISOString());
    console.log('📅 Target date day after correction:', targetDate.getDate());
  }
  
  // Use manual formatting to avoid timezone issues with toISOString()
  // Get local date components to avoid timezone conversion issues
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dayStr = String(targetDate.getDate() + 1).padStart(2, '0'); // Add +1 to the day
  const formattedDate = `${year}-${month}-${dayStr}`;
  
  // Additional validation to ensure we have the correct date
  console.log('📅 Manual formatting validation:');
  console.log('  - targetDate.getFullYear():', targetDate.getFullYear());
  console.log('  - targetDate.getMonth() + 1:', targetDate.getMonth() + 1);
  console.log('  - targetDate.getDate():', targetDate.getDate());
  console.log('  - targetDate.getDay():', targetDate.getDay());
  console.log('  - Formatted result:', formattedDate);
  
  console.log('✅ FINAL RESULT:');
  console.log('📅 Formatted date:', formattedDate);
  console.log('📅 Final year:', targetDate.getFullYear());
  console.log('📅 Final month (1-indexed):', targetDate.getMonth() + 1);
  console.log('📅 Final day:', targetDate.getDate());
  console.log('📅 Final day of week:', targetDate.getDay());
  console.log('=====================================');
  
  // Add the specific log message that was showing in the console
  console.log(`📅 DATE CONVERTER - Converted ${dateString} to ${formattedDate}`);
  
  return formattedDate;
};

/**
 * Convert any date format to ISO date string (YYYY-MM-DD)
 * @param {string|Date} dateInput - Date in any format
 * @returns {string|null} - ISO date string or null if conversion fails
 */
export const convertToISODate = (dateInput) => {
  console.log('🔍 convertToISODate called with:', dateInput);
  
  if (!dateInput) {
    console.log('🔍 convertToISODate: No input, returning null');
    return null;
  }
  
  // If already in YYYY-MM-DD format, return as is
  if (typeof dateInput === 'string' && dateInput.includes('-') && dateInput.length >= 10) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(dateInput)) {
      console.log('🔍 convertToISODate: Already in YYYY-MM-DD format, returning as is');
      return dateInput;
    }
  }
  
  // Handle short format like 'Wed 17', 'Mon 15', etc.
  if (typeof dateInput === 'string' && (dateInput.includes('Wed') || dateInput.includes('Mon') || 
      dateInput.includes('Tue') || dateInput.includes('Thu') || dateInput.includes('Fri') || 
      dateInput.includes('Sat') || dateInput.includes('Sun'))) {
    console.log('🔍 convertToISODate: Detected short format, calling convertShortDateFormat');
    const result = convertShortDateFormat(dateInput);
    console.log('🔍 convertToISODate: convertShortDateFormat returned:', result);
    return result;
  }
  
  // Try to parse as Date object
  try {
    const dateObj = new Date(dateInput);
    if (!isNaN(dateObj.getTime())) {
      // Use manual formatting to avoid timezone issues
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.warn('Date conversion failed:', error.message);
  }
  
  return null;
};

/**
 * Format date for display (e.g., "22nd, September, Monday, 2025")
 * @param {string|Date} dateInput - Date in any format
 * @returns {string} - Formatted date string
 */
export const formatDateForDisplay = (dateInput) => {
  if (!dateInput) return 'Date not available';
  
  let date;
  if (typeof dateInput === 'string') {
    const isoDate = convertToISODate(dateInput);
    if (!isoDate) return 'Invalid date';
    date = new Date(isoDate);
  } else {
    date = new Date(dateInput);
  }
  
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const options = { 
    day: 'numeric', 
    month: 'long', 
    weekday: 'long',
    year: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Get day of week from date string
 * @param {string|Date} dateInput - Date in any format
 * @returns {string} - Day of week (e.g., "Monday", "Tuesday")
 */
export const getDayOfWeek = (dateInput) => {
  if (!dateInput) return '';
  
  let date;
  if (typeof dateInput === 'string') {
    const isoDate = convertToISODate(dateInput);
    if (!isoDate) return '';
    date = new Date(isoDate);
  } else {
    date = new Date(dateInput);
  }
  
  if (isNaN(date.getTime())) return '';
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

/**
 * Check if a date is today
 * @param {string|Date} dateInput - Date in any format
 * @returns {boolean} - True if date is today
 */
export const isToday = (dateInput) => {
  if (!dateInput) return false;
  
  let date;
  if (typeof dateInput === 'string') {
    const isoDate = convertToISODate(dateInput);
    if (!isoDate) return false;
    date = new Date(isoDate);
  } else {
    date = new Date(dateInput);
  }
  
  if (isNaN(date.getTime())) return false;
  
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Check if a date is in the past
 * @param {string|Date} dateInput - Date in any format
 * @returns {boolean} - True if date is in the past
 */
export const isPastDate = (dateInput) => {
  if (!dateInput) return false;
  
  let date;
  if (typeof dateInput === 'string') {
    const isoDate = convertToISODate(dateInput);
    if (!isoDate) return false;
    date = new Date(isoDate);
  } else {
    date = new Date(dateInput);
  }
  
  if (isNaN(date.getTime())) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  date.setHours(0, 0, 0, 0); // Reset time to start of day
  
  return date < today;
};

/**
 * Get date in a specific format
 * @param {string|Date} dateInput - Date in any format
 * @param {string} format - Format string (e.g., 'YYYY-MM-DD', 'DD/MM/YYYY')
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateInput, format = 'YYYY-MM-DD') => {
  if (!dateInput) return '';
  
  let date;
  if (typeof dateInput === 'string') {
    const isoDate = convertToISODate(dateInput);
    if (!isoDate) return '';
    date = new Date(isoDate);
  } else {
    date = new Date(dateInput);
  }
  
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    default:
      return `${year}-${month}-${day}`;
  }
};

/**
 * Test function to verify date conversion works correctly
 * This can be called from console or for debugging
 */
export const testDateConversion = () => {
  console.log('🧪 TESTING DATE CONVERSION:');
  console.log('=====================================');
  
  const testCases = [
    'Mon 22',
    'Wed 17', 
    'Fri 15',
    'Sun 30',
    'Tue 1',
    'Thu 25'
  ];
  
  testCases.forEach(testCase => {
    console.log(`\n🧪 Testing: "${testCase}"`);
    const result = convertShortDateFormat(testCase);
    console.log(`✅ Result: ${result}`);
  });
  
  console.log('\n=====================================');
  console.log('🧪 DATE CONVERSION TEST COMPLETE');
};

/**
 * Specific test for the "Mon 22" issue
 */
export const testMon22Issue = () => {
  console.log('🔍 SPECIFIC TEST FOR "Mon 22" ISSUE:');
  console.log('=====================================');
  
  const input = 'Mon 22';
  console.log(`Input: "${input}"`);
  
  // Test the conversion step by step
  const dayMatch = input.match(/\d+/);
  const day = parseInt(dayMatch[0]);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  console.log('Step 1 - Extracted day:', day);
  console.log('Step 2 - Current date:', currentDate.toISOString());
  console.log('Step 3 - Current year:', currentYear);
  console.log('Step 4 - Current month (0-indexed):', currentMonth);
  console.log('Step 5 - Current month (1-indexed):', currentMonth + 1);
  
  // Create target date
  const targetDate = new Date(currentYear, currentMonth, day);
  console.log('Step 6 - Target date created:', targetDate.toISOString());
  console.log('Step 7 - Target date day:', targetDate.getDate());
  console.log('Step 8 - Target date month (0-indexed):', targetDate.getMonth());
  console.log('Step 9 - Target date month (1-indexed):', targetDate.getMonth() + 1);
  
  // Check if day has passed
  const hasPassed = targetDate < currentDate;
  console.log('Step 10 - Has day passed?', hasPassed);
  
  if (hasPassed) {
    console.log('Step 11 - Moving to next month');
    const nextMonth = currentMonth + 1;
    const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear;
    const actualNextMonth = nextMonth > 11 ? 0 : nextMonth;
    
    console.log('Step 12 - Next month (0-indexed):', actualNextMonth);
    console.log('Step 13 - Next month (1-indexed):', actualNextMonth + 1);
    console.log('Step 14 - Next year:', nextYear);
    
    // Create a new date object to avoid issues with setFullYear
    const newTargetDate = new Date(nextYear, actualNextMonth, day);
    targetDate.setTime(newTargetDate.getTime());
    
    console.log('Step 15 - After month change:', targetDate.toISOString());
    console.log('Step 16 - Day after month change:', targetDate.getDate());
  }
  
  // Final formatting
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dayStr = String(targetDate.getDate() + 1).padStart(2, '0'); // Add +1 to the day
  const result = `${year}-${month}-${dayStr}`;
  
  console.log('Step 17 - Final year:', year);
  console.log('Step 18 - Final month (1-indexed):', targetDate.getMonth() + 1);
  console.log('Step 19 - Final day:', targetDate.getDate());
  console.log('Step 20 - Final result:', result);
  
  console.log('=====================================');
  return result;
};

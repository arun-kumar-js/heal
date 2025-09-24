/**
 * Mobile number validation utility
 * Ensures exactly 10 digits for Indian mobile numbers
 */

/**
 * Validates if the input is a valid 10-digit mobile number
 * @param {string} mobileNumber - The mobile number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidMobileNumber = (mobileNumber) => {
  // Remove all non-digit characters
  const cleanNumber = mobileNumber.replace(/\D/g, '');
  
  // Check if exactly 10 digits
  return cleanNumber.length === 10;
};

/**
 * Formats mobile number input to ensure only digits and max 10 characters
 * @param {string} input - The input text
 * @returns {string} - Formatted mobile number (max 10 digits)
 */
export const formatMobileInput = (input) => {
  // Remove all non-digit characters
  const cleanInput = input.replace(/\D/g, '');
  
  // Limit to 10 digits maximum
  return cleanInput.slice(0, 10);
};

/**
 * Validates mobile number with detailed error message
 * @param {string} mobileNumber - The mobile number to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateMobileNumber = (mobileNumber) => {
  const cleanNumber = mobileNumber.replace(/\D/g, '');
  
  if (!cleanNumber) {
    return {
      isValid: false,
      error: 'Mobile number is required'
    };
  }
  
  if (cleanNumber.length < 10) {
    return {
      isValid: false,
      error: 'Mobile number must be exactly 10 digits'
    };
  }
  
  if (cleanNumber.length > 10) {
    return {
      isValid: false,
      error: 'Mobile number cannot exceed 10 digits'
    };
  }
  
  // Check if it starts with valid Indian mobile prefixes
  const validPrefixes = ['6', '7', '8', '9'];
  if (!validPrefixes.includes(cleanNumber[0])) {
    return {
      isValid: false,
      error: 'Please enter a valid Indian mobile number'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

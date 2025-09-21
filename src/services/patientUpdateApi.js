import axios from 'axios';
import { PATIENT_UPDATE_URL, basicAuth } from '../config/config.js';

/**
 * Update patient profile information
 * @param {Object} patientData - The patient data to update
 * @param {string} patientData.patient_id - Patient ID
 * @param {string} patientData.name - Patient name
 * @param {string} patientData.phone - Patient phone number
 * @param {string} patientData.email - Patient email
 * @param {string} patientData.gender - Patient gender
 * @returns {Promise<Object>} - API response object
 */
export const updatePatientProfile = async (patientData) => {
  try {
    console.log('=== PATIENT UPDATE API CALL DEBUG ===');
    console.log('API URL:', PATIENT_UPDATE_URL);
    console.log('Patient Data:', patientData);
    console.log('Basic Auth:', basicAuth);

    // Validate required fields
    const { patient_id, name, phone, email, gender } = patientData;
    
    if (!patient_id) {
      return {
        success: false,
        data: null,
        message: 'Patient ID is required',
      };
    }

    if (!name || !phone || !email) {
      return {
        success: false,
        data: null,
        message: 'Name, phone, and email are required fields',
      };
    }

    // Prepare request data
    const requestData = {
      patient_id,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      gender: gender || '',
    };

    console.log('🔄 Updating patient profile...', requestData);

    // Make API request
    const response = await axios.put(PATIENT_UPDATE_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': basicAuth,
      },
      timeout: 10000, // 10 seconds timeout
    });

    const data = response.data;
    console.log('=== PATIENT UPDATE API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', data);

    return {
      success: data.status === true || response.status === 200,
      data: data,
      message: data.message || (data.status === true ? 'Profile updated successfully!' : 'Failed to update profile'),
    };

  } catch (error) {
    console.error('=== PATIENT UPDATE API ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    let errorMessage = 'Network error occurred';
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          errorMessage = data.message || 'Invalid request data';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please check your credentials.';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Patient not found';
          break;
        case 422:
          errorMessage = data.message || 'Validation error';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = data.message || `Server error (${status})`;
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network connection error. Please check your internet connection.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Please try again.';
    }

    return {
      success: false,
      data: null,
      message: errorMessage,
      error: error,
    };
  }
};

/**
 * Validate patient data before sending to API
 * @param {Object} patientData - The patient data to validate
 * @returns {Object} - Validation result
 */
export const validatePatientData = (patientData) => {
  const { name, phone, email, gender } = patientData;
  const errors = [];

  // Name validation
  if (!name || !name.trim()) {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  // Phone validation
  if (!phone || !phone.trim()) {
    errors.push('Phone number is required');
  } else {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim().replace(/\D/g, ''))) {
      errors.push('Please enter a valid 10-digit phone number');
    }
  }

  // Email validation
  if (!email || !email.trim()) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please enter a valid email address');
    }
  }

  // Gender validation (optional)
  if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
    errors.push('Please select a valid gender');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

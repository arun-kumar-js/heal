import axios from 'axios';
import { PAYMENT_UPDATE_URL, basicAuth } from '../config/config.js';

/**
 * Update payment status for an appointment using GET method with query parameters
 * @param {Object} paymentData - The payment data to update
 * @param {Object} paymentData.appointment_details - Appointment details object
 * @param {string} paymentData.payment_status - Payment status (e.g., "paid")
 * @param {string} paymentData.payment_mode - Payment mode (e.g., "cash", "card", "upi")
 * @returns {Promise<Object>} - API response object
 */
export const updatePaymentStatus = async (paymentData) => {
  try {
    console.log('=== PAYMENT UPDATE API CALL DEBUG ===');
    console.log('API URL:', PAYMENT_UPDATE_URL);
    console.log('Payment Data:', paymentData);
    console.log('Basic Auth:', basicAuth);

    // Validate required fields
    const { appointment_details, payment_status, payment_mode } = paymentData;
    
    if (!appointment_details || !appointment_details.appointment_detail_id) {
      return {
        success: false,
        data: null,
        message: 'Appointment detail ID is required',
      };
    }

    if (!payment_status) {
      return {
        success: false,
        data: null,
        message: 'Payment status is required',
      };
    }

    if (!payment_mode) {
      return {
        success: false,
        data: null,
        message: 'Payment mode is required',
      };
    }

    // Prepare request data - only the required parameters
    const requestData = {
      appointment_details: appointment_details.appointment_detail_id,
      payment_status: payment_status.toLowerCase(),
      payment_mode: payment_mode.toLowerCase(),
    };

    console.log('🔄 Updating payment status...');
    console.log('📋 PAYMENT API - Passing data:', JSON.stringify(requestData, null, 2));
    console.log('🔍 PAYMENT API - Appointment detail ID:', requestData.appointment_detail_id);
    console.log('🔍 PAYMENT API - Payment status:', requestData.payment_status);
    console.log('🔍 PAYMENT API - Payment mode:', requestData.payment_mode);

    // Make API request using GET with query parameters
    const response = await axios.get(PAYMENT_UPDATE_URL, {
      params: requestData,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': basicAuth,
      },
      timeout: 10000, // 10 seconds timeout
    });

    const data = response.data;
    console.log('=== PAYMENT UPDATE API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', data);

    return {
      success: data.status === true || response.status === 200,
      data: data,
      message: data.message || (data.status === true ? 'Payment updated successfully!' : 'Failed to update payment'),
    };

  } catch (error) {
    console.error('=== PAYMENT UPDATE API ERROR ===');
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
          errorMessage = 'Appointment not found';
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
 * Validate payment data before sending to API
 * @param {Object} paymentData - The payment data to validate
 * @returns {Object} - Validation result
 */
export const validatePaymentData = (paymentData) => {
  const { appointment_details, payment_status, payment_mode } = paymentData;
  const errors = [];

  // Appointment detail ID validation
  if (!appointment_details || !appointment_details.appointment_detail_id) {
    errors.push('Appointment detail ID is required');
  }

  // Payment status validation
  if (!payment_status) {
    errors.push('Payment status is required');
  } else {
    const validStatuses = ['paid', 'partial'];
    if (!validStatuses.includes(payment_status.toLowerCase())) {
      errors.push('Payment status must be either "paid" or "partial"');
    }
  }

  // Payment mode validation
  if (!payment_mode) {
    errors.push('Payment mode is required');
  } else {
    const validModes = ['cash', 'card', 'upi', 'netbanking', 'wallet'];
    if (!validModes.includes(payment_mode.toLowerCase())) {
      errors.push('Invalid payment mode');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

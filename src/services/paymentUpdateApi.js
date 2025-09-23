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
    console.log('💳 PAYMENT UPDATE API CALL DEBUG ===');
    console.log('💳 API URL:', PAYMENT_UPDATE_URL);
    console.log('💳 Full Payment Data Received:', JSON.stringify(paymentData, null, 2));
    console.log('💳 Basic Auth:', basicAuth);

    // Validate required fields
    const { appointment_details, payment_status, payment_mode } = paymentData;
    
    console.log('💳 Extracted Fields:');
    console.log('💳 - appointment_details:', JSON.stringify(appointment_details, null, 2));
    console.log('💳 - payment_status:', payment_status);
    console.log('💳 - payment_mode:', payment_mode);
    
    if (!appointment_details || !appointment_details.appointment_detail_id) {
      console.error('❌ PAYMENT API - Missing appointment_detail_id');
      return {
        success: false,
        data: null,
        message: 'Appointment detail ID is required',
      };
    }

    if (!payment_status) {
      console.error('❌ PAYMENT API - Missing payment_status');
      return {
        success: false,
        data: null,
        message: 'Payment status is required',
      };
    }

    if (!payment_mode) {
      console.error('❌ PAYMENT API - Missing payment_mode');
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

    console.log('💳 PAYMENT API - Request Data Preparation:');
    console.log('💳 - Original appointment_details:', appointment_details);
    console.log('💳 - Extracted appointment_detail_id:', appointment_details.appointment_detail_id);
    console.log('💳 - Original payment_status:', payment_status);
    console.log('💳 - Lowercased payment_status:', payment_status.toLowerCase());
    console.log('💳 - Original payment_mode:', payment_mode);
    console.log('💳 - Lowercased payment_mode:', payment_mode.toLowerCase());
    
    console.log('💳 PAYMENT API - Final Request Data:');
    console.log('💳 - Complete requestData:', JSON.stringify(requestData, null, 2));
    console.log('💳 - appointment_details (ID):', requestData.appointment_details);
    console.log('💳 - payment_status:', requestData.payment_status);
    console.log('💳 - payment_mode:', requestData.payment_mode);

    // Make API request using GET with query parameters
    console.log('💳 PAYMENT API - Making API Request:');
    console.log('💳 - URL:', PAYMENT_UPDATE_URL);
    console.log('💳 - Method: GET');
    console.log('💳 - Query Parameters:', requestData);
    console.log('💳 - Headers:', {
      'Content-Type': 'application/json',
      'Authorization': basicAuth
    });
    
    const response = await axios.get(PAYMENT_UPDATE_URL, {
      params: requestData,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': basicAuth,
      },
      timeout: 10000, // 10 seconds timeout
    });

    const data = response.data;
    console.log('✅ PAYMENT UPDATE API RESPONSE ===');
    console.log('✅ Status Code:', response.status);
    console.log('✅ Response Headers:', response.headers);
    console.log('✅ Response Data:', JSON.stringify(data, null, 2));

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
  
  console.log('🔍 PAYMENT VALIDATION DEBUG:');
  console.log('🔍 - payment_mode received:', payment_mode);
  console.log('🔍 - payment_mode type:', typeof payment_mode);
  console.log('🔍 - payment_mode lowercase:', payment_mode?.toLowerCase());

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
    const validModes = ['cash', 'upi', 'credit_card', 'net_banking', 'card', 'netbanking', 'wallet'];
    if (!validModes.includes(payment_mode.toLowerCase())) {
      errors.push(`Invalid payment mode: ${payment_mode}. Valid modes are: ${validModes.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

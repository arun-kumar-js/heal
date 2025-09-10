import axios from 'axios';
import { LOGIN_URL } from '../config/config.js';

/**
 * Send OTP to the provided mobile number
 * @param {string} mobileNumber - The mobile number to send OTP to
 * @returns {Promise<Object>} - API response object
 */
export const sendOTP = async (mobileNumber) => {
  try {
    const response = await axios.post(LOGIN_URL, {
      phone: mobileNumber,
    });
    const data = response.data;
    console.log('API Response:', data);

    return {
      success: data.status === true,
      data: data,
      message: data.message || (data.status === true ? 'OTP sent successfully!' : 'Failed to send OTP'),
    };
  } catch (error) {
    console.log('Network Error:', error);
    return {
      success: false,
      data: null,
      message: 'Network error occurred',
      error: error,
    };
  }
};

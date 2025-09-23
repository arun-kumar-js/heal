import axios from 'axios';
import { BASE_URL, basicAuth } from '../config/config.js';

/**
 * Fetch doctor details by doctor ID
 * @param {number} doctorId - The doctor ID
 * @returns {Promise<Object>} - API response object
 */
export const getDoctorDetails = async (doctorId) => {
  try {
    console.log('🔍 DOCTOR DETAILS API DEBUG - Fetching doctor details:');
    console.log('🔍 DOCTOR DETAILS API DEBUG - doctorId:', doctorId);
    console.log('🔍 DOCTOR DETAILS API DEBUG - API URL:', `${BASE_URL}doctorDetails`);
    
    const requestData = {
      doctor_id: doctorId
    };
    console.log('🔍 DOCTOR DETAILS API DEBUG - Request params:', JSON.stringify(requestData, null, 2));
    
    const response = await axios.get(`${BASE_URL}doctorDetails`, {
      params: requestData,
      headers: {
        'Content-Type': 'application/json',
        Authorization: basicAuth,
      },
    });

    console.log('✅ DOCTOR DETAILS API DEBUG - Response status:', response.status);
    console.log('✅ DOCTOR DETAILS API DEBUG - Response headers:', response.headers);
    console.log('✅ DOCTOR DETAILS API DEBUG - Response data type:', typeof response.data);
    console.log('✅ DOCTOR DETAILS API DEBUG - Response data is array:', Array.isArray(response.data));
    console.log('✅ DOCTOR DETAILS API DEBUG - Response data keys:', response.data ? Object.keys(response.data) : 'No data');
    console.log('✅ DOCTOR DETAILS API DEBUG - Response data:', JSON.stringify(response.data, null, 2));
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ DOCTOR DETAILS API DEBUG - Error fetching doctor details:', error);
    
    if (error.response) {
      // Server responded with error status
      console.error('❌ DOCTOR DETAILS API DEBUG - Error Status:', error.response.status);
      console.error('❌ DOCTOR DETAILS API DEBUG - Error Data:', error.response.data);
      console.error('❌ DOCTOR DETAILS API DEBUG - Error Headers:', error.response.headers || 'No headers available');
      
      return {
        success: false,
        error: error.response.data?.message || `Server error: ${error.response.status}`,
        data: null,
      };
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ DOCTOR DETAILS API DEBUG - No response received:', error.request);
      
      return {
        success: false,
        error: 'Network error: No response from server',
        data: null,
      };
    } else {
      // Something else happened
      console.error('❌ DOCTOR DETAILS API DEBUG - Request setup error:', error.message);
      
      return {
        success: false,
        error: `Request error: ${error.message}`,
        data: null,
      };
    }
  }
};

export default {
  getDoctorDetails,
};

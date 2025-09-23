import axios from 'axios';
import { BASE_URL, basicAuth } from '../config/config.js';

/**
 * Get hospital details by clinic ID
 * @param {number} clinicId - Clinic ID
 * @returns {Promise<Object>} - API response object
 */
export const getHospitalDetails = async (clinicId) => {
  try {
    console.log('🏥 HOSPITAL DETAILS API - Fetching hospital details for clinic ID:', clinicId);
    console.log('🏥 HOSPITAL DETAILS API - URL:', `${BASE_URL}clinicDetails`);
    
    const response = await axios.get(`${BASE_URL}clinicDetails`, {
      params: {
        clinic_id: clinicId
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: basicAuth,
      },
    });

    console.log('🏥 HOSPITAL DETAILS API - Response status:', response.status);
    console.log('🏥 HOSPITAL DETAILS API - Response data:', JSON.stringify(response.data, null, 2));
    
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Hospital details fetched successfully',
    };
  } catch (error) {
    console.error('❌ HOSPITAL DETAILS API - Error fetching hospital details:', error);
    
    if (error.response) {
      console.error('❌ HOSPITAL DETAILS API - Error Status:', error.response.status);
      console.error('❌ HOSPITAL DETAILS API - Error Data:', error.response.data);
      
      return {
        success: false,
        error: error.response.data?.message || `Server error: ${error.response.status}`,
        data: null,
      };
    } else if (error.request) {
      console.error('❌ HOSPITAL DETAILS API - No response received:', error.request);
      
      return {
        success: false,
        error: 'Network error: No response from server',
        data: null,
      };
    } else {
      console.error('❌ HOSPITAL DETAILS API - Request setup error:', error.message);
      
      return {
        success: false,
        error: `Request error: ${error.message}`,
        data: null,
      };
    }
  }
};

export default {
  getHospitalDetails,
};

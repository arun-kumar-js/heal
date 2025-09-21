import axios from 'axios';

const PROFILE_API_URL = 'https://spiderdesk.asia/healto/api/patient-edit';

/**
 * Get user profile data by patient ID using patient-edit endpoint
 * @param {string|number} patientId - The patient ID to fetch profile for
 * @returns {Promise<Object>} - API response object with profile data
 */
export const getUserProfile = async (patientId) => {
  try {
    console.log('🔄 Fetching user profile for ID:', patientId);
    
    // Use GET method with patient_id as query parameter
    const response = await axios.get(PROFILE_API_URL, {
      params: {
        patient_id: patientId
      }
    });
    
    const data = response.data;
    console.log('📱 Profile API Response:', data);

    return {
      success: data.status === true,
      data: data.data,
      message: data.message || (data.status === true ? 'Profile fetched successfully!' : 'Failed to fetch profile'),
    };
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to fetch profile',
      error: error,
    };
  }
};

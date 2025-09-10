/**
 * Clinics API Service
 * Handles all clinic and hospital related API calls
 */

import axios from 'axios';

const API_BASE_URL = 'https://your-api-base-url.com/api'; // Replace with your actual API base URL

/**
 * Fetch all clinics and hospitals
 * @returns {Promise<Object>} - API response object
 */
export const fetchClinics = async () => {
  try {
    console.log('=== MAKING CLINICS API CALL ===');
    console.log('API URL:', `${API_BASE_URL}/clinics`);
    
    const response = await axios.get(`${API_BASE_URL}/clinics`);
    
    console.log('=== RAW CLINICS API RESPONSE ===');
    console.log('Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);
    console.log('Raw API Data:', JSON.stringify(response.data, null, 2));
    console.log('Data Type:', typeof response.data);
    console.log('Data Keys:', Object.keys(response.data));

    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Clinics fetched successfully',
    };
  } catch (error) {
    console.log('=== CLINICS API ERROR ===');
    console.log('Error Message:', error.message);
    console.log('Error Response:', error.response?.data);
    console.log('Error Status:', error.response?.status);
    
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Network error occurred while fetching clinics',
      error: error,
    };
  }
};

/**
 * Search clinics by query
 * @param {string} query - Search query
 * @returns {Promise<Object>} - API response object
 */
export const searchClinics = async (query) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/clinics/search?q=${encodeURIComponent(query)}`);
    
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Search completed successfully',
    };
  } catch (error) {
    console.log('Search Clinics API Error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Network error occurred while searching clinics',
      error: error,
    };
  }
};

/**
 * Get clinic details by ID
 * @param {number} clinicId - Clinic ID
 * @returns {Promise<Object>} - API response object
 */
export const getClinicDetails = async (clinicId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/clinics/${clinicId}`);
    
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Clinic details fetched successfully',
    };
  } catch (error) {
    console.log('Clinic Details API Error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Network error occurred while fetching clinic details',
      error: error,
    };
  }
};


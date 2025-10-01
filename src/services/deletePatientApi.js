import axios from 'axios';
import { BASE_URL, basicAuth } from '../config/config.js';

const DELETE_PATIENT_URL = BASE_URL + 'deletepatient';

/**
 * Delete patient account
 * @param {string} patientId - Patient ID to delete
 * @returns {Promise<Object>} - API response object
 */
export const deletePatientAccount = async (patientId) => {
  try {
    console.log('=== DELETE PATIENT API CALL ===');
    console.log('API URL:', DELETE_PATIENT_URL);
    console.log('Patient ID:', patientId);

    if (!patientId) {
      return {
        success: false,
        message: 'Patient ID is required',
      };
    }

    const response = await axios.post(
      DELETE_PATIENT_URL,
      {
        patient_id: patientId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': basicAuth,
        },
        timeout: 10000,
      }
    );

    console.log('=== DELETE PATIENT API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Data:', response.data);

    return {
      success: response.data.status === true || response.status === 200,
      message: response.data.message || 'Account deleted successfully',
      data: response.data,
    };

  } catch (error) {
    console.error('=== DELETE PATIENT API ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);

    let errorMessage = 'Failed to delete account';

    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          errorMessage = data.message || 'Invalid request';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please login again.';
          break;
        case 404:
          errorMessage = 'Account not found';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = data.message || `Server error (${status})`;
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your internet connection.';
    }

    return {
      success: false,
      message: errorMessage,
      error: error,
    };
  }
};


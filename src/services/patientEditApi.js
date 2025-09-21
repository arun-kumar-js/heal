import { BASE_URL, basicAuth } from '../config/config';

/**
 * Fetch patient edit data by patient ID
 * @param {string} patientId - The patient ID from OTP response
 * @returns {Promise<Object>} API response with patient data
 */
export const getPatientEditData = async (patientId) => {
  try {
    console.log('🔄 Fetching patient edit data for ID:', patientId);
    
    if (!patientId) {
      throw new Error('Patient ID is required');
    }

    const response = await fetch(`${BASE_URL}patient-edit`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': basicAuth,
      },
      body: JSON.stringify({
        patient_id: patientId
      })
    });

    console.log('📡 Patient edit API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Patient edit API error response:', errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Patient edit data fetched successfully:', data);

    return {
      success: true,
      data: data,
      message: 'Patient data fetched successfully'
    };

  } catch (error) {
    console.error('❌ Error fetching patient edit data:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to fetch patient data'
    };
  }
};

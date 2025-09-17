import axios from 'axios';
import { BASE_URL, basicAuth } from '../config/config.js';

// Get doctors by clinic/hospital ID
export const fetchDoctorsByClinic = async (clinicId) => {
  try {
    console.log('Fetching doctors by clinic from API:', `${BASE_URL}clinics/by/doctors`);
    console.log('Clinic ID:', clinicId);
    
    const response = await axios.get(`${BASE_URL}clinics/by/doctors`, {
      params: {
        clinic_id: clinicId
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: basicAuth,
      },
    });

    console.log('Doctors by clinic response status:', response.status);
    console.log('Doctors by clinic API response:', response.data);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error fetching doctors by clinic:', error);
    
    if (error.response) {
      // Server responded with error status
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
      console.error('Error Headers:', error.response.headers || 'No headers available');
      
      return {
        success: false,
        error: error.response.data?.message || `Server error: ${error.response.status}`,
        data: [],
      };
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      
      return {
        success: false,
        error: 'Network error: No response from server',
        data: [],
      };
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
      
      return {
        success: false,
        error: `Request error: ${error.message}`,
        data: [],
      };
    }
  }
};

// Get doctors by clinic with formatted data
export const getDoctorsByClinic = async (clinicId) => {
  try {
    const result = await fetchDoctorsByClinic(clinicId);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        data: [],
      };
    }

    // Handle grouped response structure - flatten doctors by specialization
    let formattedData = [];
    
    console.log('=== API RESPONSE DEBUG ===');
    console.log('Raw API response:', JSON.stringify(result.data, null, 2));
    console.log('Is array?', Array.isArray(result.data));
    console.log('Response type:', typeof result.data);
    
    if (Array.isArray(result.data)) {
      console.log('Processing grouped response structure');
      // Flatten the grouped doctors data into a single array
      result.data.forEach((specializationGroup, groupIndex) => {
        console.log(`Specialization group ${groupIndex}:`, specializationGroup);
        if (specializationGroup.doctors && Array.isArray(specializationGroup.doctors)) {
          specializationGroup.doctors.forEach((doctor, doctorIndex) => {
            console.log(`Doctor ${doctorIndex} in group ${groupIndex}:`, doctor);
            formattedData.push({
              ...doctor,
              specialization: specializationGroup.specialization
            });
          });
        }
      });
    } else if (result.data.doctors && Array.isArray(result.data.doctors)) {
      console.log('Processing flat structure');
      formattedData = result.data.doctors;
    } else {
      console.log('No doctors found in response');
      formattedData = [];
    }
    
    console.log('Final formatted data:', formattedData);
    console.log('=== END API RESPONSE DEBUG ===');
    
    return {
      success: true,
      data: formattedData,
    };
  } catch (error) {
    console.error('Error getting doctors by clinic:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

export default {
  fetchDoctorsByClinic,
  getDoctorsByClinic,
};

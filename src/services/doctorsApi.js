import axios from 'axios';
import { BASE_URL, basicAuth } from '../config/config.js';

/**
 * Fetch doctors by specialization and clinic
 * @param {string} specializationName - The specialization name (e.g., "Cardiology", "Neurology")
 * @param {number} clinicId - The clinic/hospital ID
 * @returns {Promise<Object>} - API response object
 */
export const fetchDoctorsBySpecializationClinic = async (specializationName, clinicId) => {
  try {
    console.log('🔍 DOCTORS API DEBUG - Fetching doctors by specialization and clinic:');
    console.log('🔍 DOCTORS API DEBUG - specializationName:', specializationName);
    console.log('🔍 DOCTORS API DEBUG - clinicId:', clinicId);
    console.log('🔍 DOCTORS API DEBUG - API URL:', `${BASE_URL}doctors/by/specializationclinic`);
    
    const requestParams = {
      specialization_name: specializationName,
      clinic_id: clinicId
    };
    console.log('🔍 DOCTORS API DEBUG - Request params:', JSON.stringify(requestParams, null, 2));
    
    const response = await axios.get(`${BASE_URL}doctors/by/specializationclinic`, {
      params: requestParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: basicAuth,
      },
    });

    console.log('✅ DOCTORS API DEBUG - Response status:', response.status);
    console.log('✅ DOCTORS API DEBUG - Response data:', JSON.stringify(response.data, null, 2));
    console.log('✅ DOCTORS API DEBUG - Number of doctors returned:', Array.isArray(response.data) ? response.data.length : 'Not an array');
    
    // Debug each doctor's specialization data
    if (Array.isArray(response.data)) {
      response.data.forEach((doctor, index) => {
        console.log(`🔍 DOCTOR ${index + 1} DEBUG:`, {
          name: doctor.name,
          specialization_id: doctor.specialization_id,
          specialization: doctor.specialization,
          specialization_name: doctor.specialization?.name,
          type: doctor.type
        });
      });
    }
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ DOCTORS API DEBUG - Error fetching doctors by specialization and clinic:', error);
    
    if (error.response) {
      // Server responded with error status
      console.error('❌ DOCTORS API DEBUG - Error Status:', error.response.status);
      console.error('❌ DOCTORS API DEBUG - Error Data:', error.response.data);
      console.error('❌ DOCTORS API DEBUG - Error Headers:', error.response.headers || 'No headers available');
      
      return {
        success: false,
        error: error.response.data?.message || `Server error: ${error.response.status}`,
        data: [],
      };
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ DOCTORS API DEBUG - No response received:', error.request);
      
      return {
        success: false,
        error: 'Network error: No response from server',
        data: [],
      };
    } else {
      // Something else happened
      console.error('❌ DOCTORS API DEBUG - Request setup error:', error.message);
      
      return {
        success: false,
        error: `Request error: ${error.message}`,
        data: [],
      };
    }
  }
};

/**
 * Fetch all doctors by clinic (without specialization filter)
 * @param {number} clinicId - The clinic/hospital ID
 * @returns {Promise<Object>} - API response object
 */
export const fetchAllDoctorsByClinic = async (clinicId) => {
  try {
    console.log('Fetching all doctors by clinic:', clinicId);
    
    const response = await axios.get(`${BASE_URL}doctors/by/clinic`, {
      params: {
        clinic_id: clinicId
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: basicAuth,
      },
    });

    console.log('All doctors by clinic response status:', response.status);
    console.log('All doctors by clinic API response:', response.data);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error fetching all doctors by clinic:', error);
    
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.message || `Server error: ${error.response.status}`,
        data: [],
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'Network error: No response from server',
        data: [],
      };
    } else {
      return {
        success: false,
        error: `Request error: ${error.message}`,
        data: [],
      };
    }
  }
};

/**
 * Get formatted doctors data with proper structure handling
 * @param {string} specializationName - The specialization name
 * @param {number} clinicId - The clinic/hospital ID
 * @param {boolean} filterBySpecialization - Whether to filter by specialization
 * @returns {Promise<Object>} - Formatted response object
 */
export const getDoctorsData = async (specializationName, clinicId, filterBySpecialization = true) => {
  try {
    let result;
    
    if (filterBySpecialization && specializationName) {
      result = await fetchDoctorsBySpecializationClinic(specializationName, clinicId);
    } else {
      result = await fetchAllDoctorsByClinic(clinicId);
    }
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        data: [],
      };
    }

    // Handle different response structures from the API
    let formattedData = [];
    
    console.log('=== API RESPONSE DEBUG ===');
    console.log('Raw API response:', JSON.stringify(result.data, null, 2));
    console.log('Is array?', Array.isArray(result.data));
    console.log('Response type:', typeof result.data);
    
    if (Array.isArray(result.data)) {
      console.log('Processing array response structure');
      // If response is directly an array, filter for doctor-like objects
      formattedData = result.data.filter(item => {
        // Check if this looks like a doctor object (has name and id)
        return item && typeof item === 'object' && item.name && item.id;
      });
    } else if (result.data && typeof result.data === 'object') {
      // Handle object response structure
      if (result.data.doctors && Array.isArray(result.data.doctors)) {
        console.log('Processing doctors array in object');
        formattedData = result.data.doctors.filter(item => {
          return item && typeof item === 'object' && item.name && item.id;
        });
      } else if (result.data.data && Array.isArray(result.data.data)) {
        console.log('Processing data array in object');
        formattedData = result.data.data.filter(item => {
          return item && typeof item === 'object' && item.name && item.id;
        });
      } else {
        console.log('Processing grouped response structure');
        // Flatten the grouped doctors data into a single array
        Object.keys(result.data).forEach((key, groupIndex) => {
          const group = result.data[key];
          console.log(`Group ${key} (${groupIndex}):`, group);
          if (group && Array.isArray(group)) {
            group.forEach((doctor, doctorIndex) => {
              console.log(`Doctor ${doctorIndex} in group ${key}:`, doctor);
              // Only add if it looks like a doctor object
              if (doctor && typeof doctor === 'object' && doctor.name && doctor.id) {
                formattedData.push({
                  ...doctor,
                  specialization: key
                });
              }
            });
          } else if (group && group.doctors && Array.isArray(group.doctors)) {
            group.doctors.forEach((doctor, doctorIndex) => {
              console.log(`Doctor ${doctorIndex} in group ${key}:`, doctor);
              // Only add if it looks like a doctor object
              if (doctor && typeof doctor === 'object' && doctor.name && doctor.id) {
                formattedData.push({
                  ...doctor,
                  specialization: group.specialization || key
                });
              }
            });
          }
        });
      }
    } else {
      console.log('No doctors found in response');
      formattedData = [];
    }
    
    console.log('Final formatted data:', formattedData);
    console.log('Number of doctors found:', formattedData.length);
    console.log('=== END API RESPONSE DEBUG ===');
    
    return {
      success: true,
      data: formattedData,
    };
  } catch (error) {
    console.error('Error getting doctors data:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

export default {
  fetchDoctorsBySpecializationClinic,
  fetchAllDoctorsByClinic,
  getDoctorsData,
};
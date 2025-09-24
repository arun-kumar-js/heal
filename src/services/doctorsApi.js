import axios from 'axios';
import { BASE_URL, basicAuth } from '../config/config.js';

// Helper function to get specialty name by ID
const getSpecialtyNameById = (specializationId) => {
  const specialtyMap = {
    1: 'Cardiology',
    2: 'Orthopedics', 
    3: 'Pediatrics',
    4: 'Dermatology',
    5: 'Neurology',
    6: 'Neurology', // Updated: ID 6 is actually Neurology, not General Medicine
    7: 'Gynecology',
    8: 'Ophthalmology',
    9: 'ENT',
    10: 'Psychiatry',
    11: 'Gastroenterology',
    12: 'Urology',
    13: 'Pulmonology',
    14: 'Radiology',
    15: 'Dentistry',
    16: 'Urology',
    17: 'Radiology'
  };
  return specialtyMap[specializationId] || 'Unknown';
};

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
    
    // Validate parameters
    if (!specializationName || !clinicId) {
      console.error('❌ DOCTORS API DEBUG - Missing required parameters:', { specializationName, clinicId });
      return {
        success: false,
        error: 'Missing required parameters: specializationName and clinicId are required',
        data: [],
      };
    }
    
    const requestParams = {
      specialization_name: specializationName,
      clinic_id: clinicId
    };
    console.log('🔍 DOCTORS API DEBUG - Request params:', JSON.stringify(requestParams, null, 2));
    console.log('🔍 DOCTORS API DEBUG - Full URL:', `${BASE_URL}doctors/by/specializationclinic?specialization_name=${encodeURIComponent(specializationName)}&clinic_id=${clinicId}`);
    
    const response = await axios.get(`${BASE_URL}doctors/by/specializationclinic`, {
      params: requestParams,
      headers: {
        'Content-Type': 'application/json',
        Authorization: basicAuth,
      },
    });

    console.log('✅ DOCTORS API DEBUG - Response status:', response.status);
    console.log('✅ DOCTORS API DEBUG - Response headers:', response.headers);
    console.log('✅ DOCTORS API DEBUG - Response data type:', typeof response.data);
    console.log('✅ DOCTORS API DEBUG - Response data:', JSON.stringify(response.data, null, 2));
    console.log('✅ DOCTORS API DEBUG - Number of doctors returned:', Array.isArray(response.data) ? response.data.length : 'Not an array');
    
    // Debug each doctor's specialization data
    if (Array.isArray(response.data)) {
      console.log('🔍 DOCTORS API DEBUG - Analyzing each doctor:');
      response.data.forEach((doctor, index) => {
        console.log(`🔍 DOCTOR ${index + 1} DEBUG:`, {
          name: doctor.name,
          specialization_id: doctor.specialization_id,
          specialization: doctor.specialization,
          specialization_name: doctor.specialization?.name,
          type: doctor.type,
          requested_specialization: specializationName
        });
        
        // Check if this doctor actually matches the requested specialization
        const doctorSpecialty = doctor.specialization?.name || 
                               (doctor.specialization_id ? getSpecialtyNameById(doctor.specialization_id) : 'Unknown');
        const isMatch = doctorSpecialty.toLowerCase() === specializationName.toLowerCase();
        console.log(`🔍 DOCTOR ${index + 1} MATCH CHECK: ${doctor.name} (${doctorSpecialty}) vs ${specializationName} = ${isMatch}`);
      });
    } else {
      console.log('⚠️ DOCTORS API DEBUG - Response is not an array:', response.data);
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

/**
 * Test function to verify API endpoint with specific parameters
 * @param {string} specializationName - The specialization name to test
 * @param {number} clinicId - The clinic ID to test
 * @returns {Promise<Object>} - Test result object
 */
export const testSpecializationAPI = async (specializationName, clinicId) => {
  console.log('🧪 TESTING API ENDPOINT - doctors/by/specializationclinic');
  console.log('🧪 TEST PARAMETERS:', { specializationName, clinicId });
  
  try {
    const result = await fetchDoctorsBySpecializationClinic(specializationName, clinicId);
    
    console.log('🧪 TEST RESULT:', {
      success: result.success,
      doctorCount: result.data?.length || 0,
      error: result.error
    });
    
    if (result.success && result.data) {
      console.log('🧪 TEST - Doctors returned:');
      result.data.forEach((doctor, index) => {
        const doctorSpecialty = doctor.specialization?.name || getSpecialtyNameById(doctor.specialization_id);
        const isMatch = doctorSpecialty.toLowerCase() === specializationName.toLowerCase();
        console.log(`  ${index + 1}. ${doctor.name} - ${doctorSpecialty} (Match: ${isMatch})`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('🧪 TEST ERROR:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

export default {
  fetchDoctorsBySpecializationClinic,
  fetchAllDoctorsByClinic,
  getDoctorsData,
  testSpecializationAPI,
};
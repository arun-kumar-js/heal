import axios from 'axios';
import { BASE_URL, basicAuth } from '../config/config.js';

// Get doctors by clinic/hospital ID
export const fetchDoctorsByClinic = async (clinicId) => {
  try {
    console.log('Fetching doctors by clinic from API:', `${BASE_URL}doctors/by/clinic`);
    console.log('Clinic ID:', clinicId);
    
    const response = await axios.get(`${BASE_URL}doctors/by/clinic`, {
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

    // Handle different response structures from the new API
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

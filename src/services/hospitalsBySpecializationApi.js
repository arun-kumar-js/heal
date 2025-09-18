import { HOSPITALS_BY_SPECIALIZATION_URL, basicAuth } from '../config/config.js';

// Get hospitals by specialization from API
export const fetchHospitalsBySpecialization = async (specializationName) => {
  try {
    console.log('Fetching hospitals by specialization from API:', HOSPITALS_BY_SPECIALIZATION_URL);
    console.log('Specialization name:', specializationName);
    
    // Try GET with query parameters first
    const urlWithParams = `${HOSPITALS_BY_SPECIALIZATION_URL}?specialization_name=${encodeURIComponent(specializationName)}`;
    console.log('Trying GET with URL:', urlWithParams);
    
    const response = await fetch(urlWithParams, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: basicAuth,
      },
    });

    console.log('Hospitals by specialization response status:', response.status);

    if (!response.ok) {
      // If GET fails, try POST as fallback
      console.log('GET failed, trying POST method...');
      const postResponse = await fetch(HOSPITALS_BY_SPECIALIZATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: basicAuth,
        },
        body: JSON.stringify({
          specialization_name: specializationName
        }),
      });
      
      if (!postResponse.ok) {
        throw new Error(`HTTP error! status: ${postResponse.status}`);
      }
      
      const data = await postResponse.json();
      console.log('Hospitals by specialization API response (POST):', data);
      
      return {
        success: true,
        data: data,
      };
    }

    const data = await response.json();
    console.log('Hospitals by specialization API response (GET):', data);
    
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error fetching hospitals by specialization:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

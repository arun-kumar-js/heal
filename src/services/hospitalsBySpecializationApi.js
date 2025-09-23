import { HOSPITALS_BY_SPECIALIZATION_URL, basicAuth } from '../config/config.js';

// Get hospitals by specialization from API
export const fetchHospitalsBySpecialization = async (specializationName) => {
  try {
    console.log('🏥 HOSPITALS API DEBUG - Fetching hospitals by specialization from API:', HOSPITALS_BY_SPECIALIZATION_URL);
    console.log('🏥 HOSPITALS API DEBUG - Specialization name:', specializationName);
    console.log('🏥 HOSPITALS API DEBUG - Specialization name type:', typeof specializationName);
    console.log('🏥 HOSPITALS API DEBUG - Specialization name length:', specializationName?.length);
    
    // Try GET with query parameters first
    const urlWithParams = `${HOSPITALS_BY_SPECIALIZATION_URL}?specialization_name=${encodeURIComponent(specializationName)}`;
    console.log('🏥 HOSPITALS API DEBUG - Trying GET with URL:', urlWithParams);
    
    const response = await fetch(urlWithParams, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: basicAuth,
      },
    });

    console.log('🏥 HOSPITALS API DEBUG - Response status:', response.status);
    console.log('🏥 HOSPITALS API DEBUG - Response ok:', response.ok);

    if (!response.ok) {
      // If GET fails, try POST as fallback
      console.log('🏥 HOSPITALS API DEBUG - GET failed, trying POST method...');
      console.log('🏥 HOSPITALS API DEBUG - POST body:', JSON.stringify({
        specialization_name: specializationName
      }, null, 2));
      
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
      
      console.log('🏥 HOSPITALS API DEBUG - POST response status:', postResponse.status);
      console.log('🏥 HOSPITALS API DEBUG - POST response ok:', postResponse.ok);
      
      if (!postResponse.ok) {
        console.error('🏥 HOSPITALS API DEBUG - POST also failed with status:', postResponse.status);
        throw new Error(`HTTP error! status: ${postResponse.status}`);
      }
      
      const data = await postResponse.json();
      console.log('🏥 HOSPITALS API DEBUG - POST response data:', JSON.stringify(data, null, 2));
      
      return {
        success: true,
        data: data,
      };
    }

    const data = await response.json();
    console.log('🏥 HOSPITALS API DEBUG - GET response data:', JSON.stringify(data, null, 2));
    
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('❌ HOSPITALS API DEBUG - Error fetching hospitals by specialization:', error);
    console.error('❌ HOSPITALS API DEBUG - Error message:', error.message);
    console.error('❌ HOSPITALS API DEBUG - Error stack:', error.stack);
    
    if (error.response) {
      console.error('❌ HOSPITALS API DEBUG - Error response status:', error.response.status);
      console.error('❌ HOSPITALS API DEBUG - Error response data:', error.response.data);
    }
    
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

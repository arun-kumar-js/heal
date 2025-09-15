import axios from 'axios';
import { DOCTORS_URL, basicAuth } from '../config/config';

// Fetch all doctors
export const fetchDoctors = async () => {
  try {
    console.log('Fetching doctors from:', DOCTORS_URL);
    
    const response = await axios.get(DOCTORS_URL, {
      headers: {
        'Authorization': basicAuth,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Doctors API Response:', response.data);
    console.log('Doctors API Status:', response.status);
    
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error('Error fetching doctors:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    return {
      success: false,
      error: error.message,
      status: error.response?.status || 500,
      data: null,
    };
  }
};

export default {
  fetchDoctors,
};

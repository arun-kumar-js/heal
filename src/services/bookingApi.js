import axios from 'axios';
import { STORE_USER_DETAIL_URL, basicAuth } from '../config/config';

// API function to store user appointment details
export const storeUserDetail = async (appointmentData) => {
  try {
    // Format the appointment data to ensure proper field mapping
    const formattedData = formatAppointmentData(appointmentData);
    
    console.log('📤 BOOKING API REQUEST:');
    console.log('URL:', STORE_USER_DETAIL_URL);
    console.log('Method: GET');
    console.log('Original Data:', JSON.stringify(appointmentData, null, 2));
    console.log('Formatted Data:', JSON.stringify(formattedData, null, 2));

    const response = await axios.get(STORE_USER_DETAIL_URL, {
      params: formattedData,
      headers: {
        'Authorization': basicAuth,
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 BOOKING API RESPONSE:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Appointment booked successfully!',
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to book appointment',
        error: response.data,
      };
    }
  } catch (error) {
    console.error('❌ BOOKING API ERROR:', error);
    
    if (error.response) {
      // Server responded with error status
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
      
      return {
        success: false,
        message: error.response.data?.message || 'Server error occurred',
        error: error.response.data,
        status: error.response.status,
      };
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      
      return {
        success: false,
        message: 'Network error - please check your connection',
        error: error.request,
      };
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
      
      return {
        success: false,
        message: 'Request failed - please try again',
        error: error.message,
      };
    }
  }
};

// Helper function to format appointment data
export const formatAppointmentData = (appointmentDetails) => {
  const {
    doctor_id,
    clinic_id,
    full_name,
    next_token,
    time_slot,
    appointment_date,
    mobile_number,
    email,
    reason
  } = appointmentDetails;

  return {
    doctor_id: doctor_id || null,
    clinic_id: clinic_id || null,
    full_name: full_name || '',
    next_token: next_token || '',
    time_slot: time_slot || '',
    appointment_date: appointment_date || '',
    mobile_number: mobile_number || '',
    email: email || '',
    reason: reason || ''
  };
};

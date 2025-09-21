import axios from 'axios';
import { BASE_URL, basicAuth } from '../config/config';

// API endpoint for appointment booking details
const APPOINTMENT_BOOKING_DETAILS_URL = `${BASE_URL}appointment/appointmentBookingDetials`;

/**
 * Fetch appointment booking details for a specific patient
 * @param {string|number} patientId - The patient's ID
 * @returns {Promise<Object>} - API response object
 */
export const getAppointmentBookingDetails = async (patientId) => {
  try {
    console.log('=== API CALL DEBUG ===');
    console.log('API URL:', APPOINTMENT_BOOKING_DETAILS_URL);
    console.log('Patient ID:', patientId);
    console.log('Basic Auth:', basicAuth);
    
    const response = await axios.get(APPOINTMENT_BOOKING_DETAILS_URL, {
      params: {
        patient_id: patientId.toString()
      },
      headers: {
        'Authorization': basicAuth,
        'Content-Type': 'application/json',
      },
    });

    console.log('=== API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', response.data);
    
    // Check if response data is empty or has no appointments
    const hasAppointments = response.data && (
      (Array.isArray(response.data) && response.data.length > 0) ||
      (response.data.appointment_detail && Array.isArray(response.data.appointment_detail) && response.data.appointment_detail.length > 0) ||
      (response.data.appointments && Array.isArray(response.data.appointments) && response.data.appointments.length > 0) ||
      (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) ||
      (response.data.appointment && Array.isArray(response.data.appointment) && response.data.appointment.length > 0)
    );

    return {
      success: true,
      data: response.data,
      message: hasAppointments ? 'Appointment booking details fetched successfully' : 'No appointments found',
    };
  } catch (error) {
    console.error('=== API ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request params:', error.config?.params);
    
    // Handle 404 as "no appointments found" rather than an error
    if (error.response?.status === 404) {
      console.log('404 response - treating as no appointments found');
      return {
        success: true, // Treat as success
        data: null,
        message: 'No appointment details found',
        error: null,
        status: 404,
      };
    }
    
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to fetch appointment booking details',
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

/**
 * Get patient ID from AsyncStorage
 * @returns {Promise<string|null>} - Patient ID or null if not found
 */
export const getPatientIdFromStorage = async () => {
  try {
    const { getOTPResponse } = await import('../utils/otpStorage');
    const otpResponse = await getOTPResponse();
    
    if (otpResponse && otpResponse.data && otpResponse.data.id) {
      console.log('Patient ID found in storage:', otpResponse.data.id);
      return otpResponse.data.id.toString();
    }
    
    console.log('No patient ID found in storage');
    return null;
  } catch (error) {
    console.error('Error getting patient ID from storage:', error);
    return null;
  }
};

/**
 * Get user ID from AsyncStorage
 * @returns {Promise<string|null>} - User ID or null if not found
 */
export const getUserIdFromStorage = async () => {
  try {
    const { getOTPResponse } = await import('../utils/otpStorage');
    const otpResponse = await getOTPResponse();
    console.log("otpResponse",otpResponse)
    if (otpResponse && otpResponse.data && otpResponse.data.uid) {
      console.log('User ID found in storage:', otpResponse.data.id);
      return otpResponse.data.id.toString();
    }
    
    console.log('No user ID found in storage');
    return null;
  } catch (error) {
    console.error('Error getting user ID from storage:', error);
    return null;
  }
};

/**
 * Fetch appointment booking details using patient ID from storage
 * @returns {Promise<Object>} - API response object
 */
export const getAppointmentBookingDetailsFromStorage = async () => {
  try {
    const patientId = await getPatientIdFromStorage();
    
    if (!patientId) {
      return {
        success: false,
        data: null,
        message: 'Patient ID not found in storage. Please login again.',
      };
    }
    
    return await getAppointmentBookingDetails(patientId);
  } catch (error) {
    console.error('Error fetching appointment booking details from storage:', error);
    return {
      success: false,
      data: null,
      message: 'Error fetching appointment booking details',
      error: error.message,
    };
  }
};

/**
 * Format appointment booking details for display
 * @param {Object} appointmentData - Raw appointment data from API
 * @returns {Object} - Formatted appointment data
 */
export const formatAppointmentData = (appointmentData) => {
  console.log('=== FORMATTING APPOINTMENT DATA ===');
  console.log('Raw appointment data:', appointmentData);
  console.log('Type of appointment data:', typeof appointmentData);
  console.log('Is array:', Array.isArray(appointmentData));
  
  if (!appointmentData) {
    console.log('No appointment data provided');
    return {
      appointments: [],
      totalAppointments: 0,
      upcomingAppointments: [],
      completedAppointments: [],
    };
  }

  // Handle different possible response structures
  let appointments = [];
  
  if (Array.isArray(appointmentData)) {
    appointments = appointmentData;
  } else if (appointmentData.appointment_detail && Array.isArray(appointmentData.appointment_detail)) {
    appointments = appointmentData.appointment_detail;
  } else if (appointmentData.appointments && Array.isArray(appointmentData.appointments)) {
    appointments = appointmentData.appointments;
  } else if (appointmentData.data && Array.isArray(appointmentData.data)) {
    appointments = appointmentData.data;
  } else if (appointmentData.appointment && Array.isArray(appointmentData.appointment)) {
    appointments = appointmentData.appointment;
  } else {
    console.log('No valid appointments array found, using empty array');
    appointments = [];
  }
  
  console.log('Extracted appointments array:', appointments);
  console.log('Appointments length:', appointments.length);
  
  const upcomingAppointments = [];
  const completedAppointments = [];
  const uncategorizedAppointments = [];

  // Sort appointments by date (only if we have appointments)
  const sortedAppointments = appointments.length > 0 ? appointments.sort((a, b) => {
    // Handle nested appointment structure from new API response
    const appointmentA = a.appointment || a;
    const appointmentB = b.appointment || b;
    
    const dateA = new Date(appointmentA.appointment_date || appointmentA.date || appointmentA.created_at || appointmentA.appointment_date_time);
    const dateB = new Date(appointmentB.appointment_date || appointmentB.date || appointmentB.created_at || appointmentB.appointment_date_time);
    return dateB - dateA; // Most recent first
  }) : [];

  // Categorize appointments by status
  sortedAppointments.forEach(appointment => {
    // Handle nested appointment structure from new API response
    const appointmentData = appointment.appointment || appointment;
    const status = appointmentData.status || appointment.status;
    const statusLower = status?.toLowerCase();
    
    console.log('=== APPOINTMENT STATUS DEBUG ===');
    console.log('Full appointment:', appointment);
    console.log('Appointment data:', appointmentData);
    console.log('Status:', status);
    console.log('Status lower:', statusLower);
    
    // Upcoming appointments: scheduled, confirmed, pending
    if (['scheduled', 'confirmed', 'pending'].includes(statusLower)) {
      console.log('Adding to upcoming:', statusLower);
      upcomingAppointments.push(appointment);
    } 
    // Completed appointments: completed, finished, done, closed, ended, successful
    else if (['completed', 'finished', 'done', 'closed', 'ended', 'successful', 'fulfilled'].includes(statusLower)) {
      console.log('Adding to completed:', statusLower);
      completedAppointments.push(appointment);
    }
    // Note: Other statuses (cancelled, rescheduled, etc.) are not categorized for now
    else {
      console.log('Status not categorized:', statusLower);
      uncategorizedAppointments.push(appointment);
    }
  });

  const result = {
    appointments: sortedAppointments,
    totalAppointments: appointments.length,
    upcomingAppointments,
    completedAppointments,
  };
  
  console.log('Formatted result:', result);
  return result;
};

/**
 * Get appointment status color
 * @param {string} status - Appointment status
 * @returns {string} - Color code for status
 */
export const getAppointmentStatusColor = (status) => {
  const statusColors = {
    'confirmed': '#28a745',
    'pending': '#ffc107',
    'cancelled': '#dc3545',
    'completed': '#17a2b8',
    'rescheduled': '#6f42c1',
    'scheduled': '#007bff',
    'active': '#28a745',
    'inactive': '#6c757d',
  };
  
  return statusColors[status?.toLowerCase()] || '#6c757d';
};

/**
 * Get appointment status text
 * @param {string} status - Appointment status
 * @returns {string} - Formatted status text
 */
export const getAppointmentStatusText = (status) => {
  console.log('=== STATUS TEXT DEBUG ===');
  console.log('Status received:', status);
  console.log('Status type:', typeof status);
  console.log('Status toLowerCase:', status?.toLowerCase());
  
  const statusTexts = {
    'confirmed': 'Confirmed',
    'pending': 'Pending',
    'cancelled': 'Cancelled',
    'completed': 'Completed',
    'rescheduled': 'Rescheduled',
    'scheduled': 'Scheduled',
    'active': 'Active',
    'inactive': 'Inactive',
  };
  
  const result = statusTexts[status?.toLowerCase()] || status || 'Unknown';
  console.log('Status result:', result);
  return result;
};

/**
 * Format appointment date for display
 * @param {string} dateString - Date string from API
 * @returns {string} - Formatted date string
 */
export const formatAppointmentDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting appointment date:', error);
    return dateString;
  }
};

/**
 * Format appointment time for display
 * @param {string} timeString - Time string from API
 * @returns {string} - Formatted time string
 */
export const formatAppointmentTime = (timeString) => {
  try {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Error formatting appointment time:', error);
    return timeString;
  }
};

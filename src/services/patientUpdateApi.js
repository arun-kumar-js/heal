import axios from 'axios';
import { PATIENT_UPDATE_URL, basicAuth } from '../config/config.js';

/**
 * Update patient profile information
 * @param {Object} patientData - The patient data to update
 * @param {string} patientData.patient_id - Patient ID
 * @param {string} patientData.name - Patient name
 * @param {string} patientData.phone - Patient phone number
 * @param {string} patientData.email - Patient email
 * @param {string} patientData.gender - Patient gender
 * @param {string} patientData.dob - Date of birth
 * @param {string} patientData.blood_group - Blood group
 * @param {string} patientData.address - Address
 * @param {Object} patientData.profile_image - Profile image file object with uri, type, and name
 * @returns {Promise<Object>} - API response object
 */
export const updatePatientProfile = async (patientData) => {
  try {
    console.log('=== PATIENT UPDATE API CALL DEBUG ===');
    console.log('API URL:', PATIENT_UPDATE_URL);
    console.log('Patient Data:', patientData);
    console.log('Basic Auth:', basicAuth);

    // Validate required fields
    const { patient_id, name, phone, email, gender, dob, blood_group, address, profile_image } = patientData;
    
    if (!patient_id) {
      return {
        success: false,
        data: null,
        message: 'Patient ID is required',
      };
    }

    if (!name || !phone || !email) {
      return {
        success: false,
        data: null,
        message: 'Name, phone, and email are required fields',
      };
    }

    // Check if we have a profile image to upload as file
    const hasImageFile = profile_image && 
                        typeof profile_image === 'object' && 
                        profile_image.uri && 
                        profile_image.uri.trim() !== '';

    let requestData;
    let headers;

    // Use FormData when image file is provided, JSON otherwise
    if (hasImageFile) {
      console.log('🔄 Using FormData format with image file...');
      console.log('📁 Profile image object:', profile_image);
      
      // Validate file URI format and properties
      if (!profile_image.uri.startsWith('file://') && !profile_image.uri.startsWith('content://')) {
        console.warn('⚠️ File URI format might be incorrect:', profile_image.uri);
      }
      
      // Validate file properties
      if (!profile_image.type) {
        console.warn('⚠️ File type not specified, defaulting to image/jpeg');
      }
      
      if (!profile_image.name) {
        console.warn('⚠️ File name not specified, defaulting to profile_image.jpg');
      }
      
      console.log('📁 File validation complete');
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add text fields
      formData.append('patient_id', patient_id);
      formData.append('name', name.trim());
      formData.append('phone', phone.trim());
      formData.append('email', email.trim());
      formData.append('gender', gender || '');
      formData.append('dob', dob || '');
      formData.append('blood_group', blood_group || '');
      formData.append('address', address || '');
      
      // Add image file - React Native FormData format
      let fileUri = profile_image.uri;
      
      // Ensure proper file URI format for React Native
      if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
        fileUri = `file://${fileUri}`;
      }
      
      // Additional URI validation
      console.log('🔍 URI validation:');
      console.log('  - URI starts with file://:', fileUri.startsWith('file://'));
      console.log('  - URI starts with content://:', fileUri.startsWith('content://'));
      console.log('  - URI length:', fileUri.length);
      console.log('  - URI contains cache:', fileUri.includes('cache'));
      console.log('  - URI contains temp:', fileUri.includes('temp'));
      
      const fileObject = {
        uri: fileUri,
        type: profile_image.type || 'image/jpeg',
        name: profile_image.name || 'profile_image.jpg',
      };
      
      console.log('📁 File object to append:', fileObject);
      console.log('📁 Original URI:', profile_image.uri);
      console.log('📁 Processed URI:', fileUri);
      console.log('📁 File Type:', profile_image.type || 'image/jpeg');
      console.log('📁 File Name:', profile_image.name || 'profile_image.jpg');
      
      // Append the file object to FormData
      formData.append('profile_image', fileObject);
      
      // Additional validation for FormData
      console.log('📋 FormData validation:');
      console.log('  - FormData instance:', formData instanceof FormData);
      console.log('  - FormData has _parts:', formData._parts ? 'Yes' : 'No');
      console.log('  - FormData _parts length:', formData._parts ? formData._parts.length : 'N/A');
      console.log('  - FormData _parts content:', formData._parts ? formData._parts : 'N/A');
      
      // Test if we can access FormData properties
      try {
        console.log('🔍 FormData properties test:');
        console.log('  - FormData keys:', Object.keys(formData));
        console.log('  - FormData prototype:', Object.getPrototypeOf(formData));
      } catch (testError) {
        console.warn('⚠️ FormData property access failed:', testError.message);
      }

      requestData = formData;
      headers = {
        'Authorization': basicAuth,
        // Don't set Content-Type for FormData - let axios handle it with boundary
      };

      console.log('🔄 Updating patient profile with image file (FormData)...');
      console.log('📝 FormData structure:');
      console.log('  - patient_id:', patient_id);
      console.log('  - name:', name.trim());
      console.log('  - phone:', phone.trim());
      console.log('  - email:', email.trim());
      console.log('  - gender:', gender || '');
      console.log('  - dob:', dob || '');
      console.log('  - blood_group:', blood_group || '');
      console.log('  - address:', address || '');
      console.log('  - profile_image: [File Object]');
      console.log('    - URI:', fileUri);
      console.log('    - Type:', profile_image.type || 'image/jpeg');
      console.log('    - Name:', profile_image.name || 'profile_image.jpg');
    } else {
      // Regular JSON request without image
      requestData = {
      patient_id,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      gender: gender || '',
        dob: dob || '',
        blood_group: blood_group || '',
        address: address || '',
      };

      headers = {
        'Content-Type': 'application/json',
        'Authorization': basicAuth,
      };

      console.log('🔄 Updating patient profile without image...', requestData);
    }

    // Make API request with retry mechanism
    console.log('🌐 Making API request to:', PATIENT_UPDATE_URL);
    console.log('📤 Request headers:', headers);
    console.log('📤 Request data type:', typeof requestData);
    console.log('📤 Request data is FormData:', requestData instanceof FormData);
    
    let response;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        // Test network connectivity first (only on first attempt)
        if (retryCount === 0) {
          try {
            console.log('🔍 Testing network connectivity...');
            const testResponse = await axios.get('https://spiderdesk.asia/healto/', {
              timeout: 5000,
              validateStatus: function (status) {
                return status < 500; // Accept any response under 500
              }
            });
            console.log('✅ Network connectivity test passed:', testResponse.status);
            
            // Test basic POST to the same endpoint
            console.log('🔍 Testing basic POST to patient-update endpoint...');
            const testPostResponse = await axios.post(PATIENT_UPDATE_URL, {
              patient_id: patient_id,
              name: 'Test',
              phone: '1234567890',
              email: 'test@test.com'
            }, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': basicAuth,
              },
              timeout: 10000,
              validateStatus: function (status) {
                return status < 500; // Accept any response under 500
              }
            });
            console.log('✅ Basic POST test response:', testPostResponse.status);
            
          } catch (testError) {
            console.warn('⚠️ Network connectivity test failed:', testError.message);
            if (testError.response) {
              console.warn('⚠️ Test response status:', testError.response.status);
              console.warn('⚠️ Test response data:', testError.response.data);
            }
          }
        }
        
        console.log(`🔄 Attempt ${retryCount + 1} of ${maxRetries + 1}...`);
        
        response = await axios.post(PATIENT_UPDATE_URL, requestData, {
          headers,
          timeout: 30000, // 30 seconds timeout for file uploads
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          validateStatus: function (status) {
            return status >= 200 && status < 300; // default
          },
        });
        
        // If we get here, the request was successful
        break;
        
      } catch (error) {
        retryCount++;
        console.error(`❌ Attempt ${retryCount} failed:`, error.message);
        
        // If this is a FormData request with network error, try alternatives
        if (error.code === 'ERR_NETWORK' && hasImageFile && retryCount === 1) {
          console.log('🔄 FormData failed with axios, trying fetch API...');
          
          try {
            // Try with fetch API instead of axios
            const formData = new FormData();
            formData.append('patient_id', patient_id);
            formData.append('name', name.trim());
            formData.append('phone', phone.trim());
            formData.append('email', email.trim());
            formData.append('gender', gender || '');
            formData.append('dob', dob || '');
            formData.append('blood_group', blood_group || '');
            formData.append('address', address || '');
            
            let fileUri = profile_image.uri;
            if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
              fileUri = `file://${fileUri}`;
            }
            
            const fileObject = {
              uri: fileUri,
              type: profile_image.type || 'image/jpeg',
              name: profile_image.name || 'profile_image.jpg',
            };
            
            formData.append('profile_image', fileObject);
            
            console.log('🌐 Trying fetch API with FormData...');
            
            const fetchResponse = await fetch(PATIENT_UPDATE_URL, {
              method: 'POST',
              headers: {
                'Authorization': basicAuth,
                // Don't set Content-Type for FormData
              },
              body: formData,
            });
            
            if (fetchResponse.ok) {
              const fetchData = await fetchResponse.json();
              console.log('✅ Fetch API succeeded!');
              
              return {
                success: true,
                data: fetchData.patient || fetchData,
                message: fetchData.message || 'Patient profile updated successfully with image via fetch',
              };
            } else {
              throw new Error(`Fetch failed with status: ${fetchResponse.status}`);
            }
            
          } catch (fetchError) {
            console.error('❌ Fetch API also failed:', fetchError.message);
            console.log('🔄 Trying JSON fallback without image...');
            
            // Fallback to JSON request without image
            requestData = {
              patient_id,
              name: name.trim(),
              phone: phone.trim(),
              email: email.trim(),
              gender: gender || '',
              dob: dob || '',
              blood_group: blood_group || '',
              address: address || '',
            };
            headers = {
              'Content-Type': 'application/json',
              'Authorization': basicAuth,
            };
            
            console.log('📝 JSON fallback data:', requestData);
            continue; // Try again with JSON data
          }
        }
        
        if (error.code === 'ERR_NETWORK' && retryCount <= maxRetries) {
          console.log(`⏳ Retrying in 2 seconds... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        // If we've exhausted retries or it's not a network error, throw the error
        throw error;
      }
    }

    const data = response.data;
    console.log('=== PATIENT UPDATE API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', data);

    return {
      success: data.status === true || response.status === 200,
      data: data,
      message: data.message || (data.status === true ? 'Profile updated successfully!' : 'Failed to update profile'),
    };

  } catch (error) {
    console.error('=== PATIENT UPDATE API ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error code:', error.code);
    console.error('Error config:', {
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      timeout: error.config?.timeout
    });
    
    let errorMessage = 'Network error occurred';
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          errorMessage = data.message || 'Invalid request data';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please check your credentials.';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Patient not found';
          break;
        case 422:
          errorMessage = data.message || 'Validation error';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = data.message || `Server error (${status})`;
      }
    } else if (error.request) {
      // Network error
      console.error('Network request failed:', error.request);
      console.error('Network error details:', {
        message: error.message,
        code: error.code,
        config: error.config
      });
      errorMessage = 'Network connection error. Please check your internet connection.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Please try again.';
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error - possible connectivity issue');
      errorMessage = 'Network error. Please check your internet connection and try again.';
    }

    return {
      success: false,
      data: null,
      message: errorMessage,
      error: error,
    };
  }
};

/**
 * Validate patient data before sending to API
 * @param {Object} patientData - The patient data to validate
 * @returns {Object} - Validation result
 */
export const validatePatientData = (patientData) => {
  const { name, phone, email, gender, dob, blood_group, address } = patientData;
  const errors = [];

  // Name validation
  if (!name || !name.trim()) {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  // Phone validation
  if (!phone || !phone.trim()) {
    errors.push('Phone number is required');
  } else {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim().replace(/\D/g, ''))) {
      errors.push('Please enter a valid 10-digit phone number');
    }
  }

  // Email validation
  if (!email || !email.trim()) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please enter a valid email address');
    }
  }

  // Gender validation (optional)
  if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
    errors.push('Please select a valid gender');
  }

  // DOB validation (optional)
  if (dob && dob.trim()) {
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(dob.trim())) {
      errors.push('Date of birth must be in YYYY-MM-DD format');
    }
  }

  // Blood group validation (optional)
  if (blood_group && blood_group.trim()) {
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(blood_group.trim())) {
      errors.push('Please select a valid blood group');
    }
  }

  // Address validation (optional)
  if (address && address.trim().length < 5) {
    errors.push('Address must be at least 5 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

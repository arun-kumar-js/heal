// Test function to verify user data retrieval from AsyncStorage
import { getOTPResponse } from '../utils/otpStorage';

export const testUserDataRetrieval = async () => {
  try {
    console.log('=== Testing User Data Retrieval ===');
    
    // Get the complete OTP response
    const otpResponse = await getOTPResponse();
    console.log('Complete OTP Response:', otpResponse);
    
    if (otpResponse && otpResponse.data) {
      const userInfo = otpResponse.data;
      
      // Format profile image URL
      const baseUrl = 'https://spiderdesk.asia/healto/';
      const profileImageUrl = userInfo.profile_image 
        ? `${baseUrl}${userInfo.profile_image}`
        : 'https://randomuser.me/api/portraits/men/32.jpg';
      
      // Display formatted user data
      const formattedUserData = {
        name: userInfo.name || 'User',
        profileImage: profileImageUrl,
        location: userInfo.address || 'Location not set',
        email: userInfo.email || '',
        phone: userInfo.phone_number || '',
        age: userInfo.age || '',
        gender: userInfo.gender || '',
        bloodGroup: userInfo.blood_group || '',
        patientId: userInfo.patient_unique_id || '',
      };
      
      console.log('=== Formatted User Data for UI ===');
      console.log('Name:', formattedUserData.name);
      console.log('Profile Image:', formattedUserData.profileImage);
      console.log('Location:', formattedUserData.location);
      console.log('Email:', formattedUserData.email);
      console.log('Phone:', formattedUserData.phone);
      console.log('Age:', formattedUserData.age);
      console.log('Gender:', formattedUserData.gender);
      console.log('Blood Group:', formattedUserData.bloodGroup);
      console.log('Patient ID:', formattedUserData.patientId);
      
      return formattedUserData;
    } else {
      console.log('No OTP response data found');
      return null;
    }
  } catch (error) {
    console.error('Error testing user data retrieval:', error);
    return null;
  }
};

// Call this function to test
// testUserDataRetrieval();

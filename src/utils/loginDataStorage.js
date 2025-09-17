import AsyncStorage from '@react-native-async-storage/async-storage';

// Login data storage keys
export const LOGIN_RESPONSE_KEY = 'loginResponse';
export const USER_TOKEN_KEY = 'userToken';
export const USER_PROFILE_KEY = 'userProfile';
export const LOGIN_TIMESTAMP_KEY = 'loginTimestamp';

// Save complete login response to AsyncStorage
export const saveLoginResponse = async (loginResponse) => {
  try {
    const loginDataWithTimestamp = {
      ...loginResponse,
      timestamp: new Date().toISOString(),
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    };
    
    // Save complete login response
    await AsyncStorage.setItem(LOGIN_RESPONSE_KEY, JSON.stringify(loginDataWithTimestamp));
    
    // Save individual components for easy access
    await AsyncStorage.setItem(USER_TOKEN_KEY, loginResponse.token);
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(loginResponse.data));
    await AsyncStorage.setItem(LOGIN_TIMESTAMP_KEY, loginDataWithTimestamp.timestamp);
    
    console.log('Login response saved successfully:', loginDataWithTimestamp);
    return true;
  } catch (error) {
    console.error('Error saving login response to AsyncStorage:', error);
    return false;
  }
};

// Get complete login response from AsyncStorage
export const getLoginResponse = async () => {
  try {
    const loginResponseString = await AsyncStorage.getItem(LOGIN_RESPONSE_KEY);
    if (loginResponseString) {
      const parsedResponse = JSON.parse(loginResponseString);
      console.log('Retrieved login response from AsyncStorage:', parsedResponse);
      return parsedResponse;
    }
    return null;
  } catch (error) {
    console.error('Error getting login response from AsyncStorage:', error);
    return null;
  }
};

// Get user token from AsyncStorage
export const getUserToken = async () => {
  try {
    const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
    if (token) {
      console.log('Retrieved user token from AsyncStorage');
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting user token from AsyncStorage:', error);
    return null;
  }
};

// Get user profile data from AsyncStorage
export const getUserProfile = async () => {
  try {
    const profileString = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (profileString) {
      const profile = JSON.parse(profileString);
      console.log('Retrieved user profile from AsyncStorage:', profile);
      return profile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile from AsyncStorage:', error);
    return null;
  }
};

// Get user profile data formatted for UI display
export const getFormattedUserProfile = async () => {
  try {
    const profile = await getUserProfile();
    if (!profile) {
      return {
        name: 'User',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        location: 'Location not set',
        email: '',
        phone: '',
        age: '',
        gender: '',
        bloodGroup: '',
        patientId: '',
      };
    }

    // Format profile image URL with base URL
    const baseUrl = 'https://spiderdesk.asia/healto/';
    const profileImageUrl = profile.profile_image 
      ? `${baseUrl}${profile.profile_image}`
      : 'https://randomuser.me/api/portraits/men/32.jpg';

    return {
      name: profile.name || 'User',
      profileImage: profileImageUrl,
      location: profile.address || 'Location not set',
      email: profile.email || '',
      phone: profile.phone_number || '',
      age: profile.age || '',
      gender: profile.gender || '',
      bloodGroup: profile.blood_group || '',
      patientId: profile.patient_unique_id || '',
      dob: profile.dob || '',
      status: profile.status || 0,
      createdAt: profile.created_at || '',
      updatedAt: profile.updated_at || '',
    };
  } catch (error) {
    console.error('Error getting formatted user profile:', error);
    return {
      name: 'User',
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      location: 'Location not set',
      email: '',
      phone: '',
      age: '',
      gender: '',
      bloodGroup: '',
      patientId: '',
    };
  }
};

// Check if login response is valid and not expired
export const isLoginResponseValid = async () => {
  try {
    const loginResponse = await getLoginResponse();
    if (!loginResponse) {
      return false;
    }
    
    const now = new Date();
    const expiresAt = new Date(loginResponse.expiresAt);
    
    if (now > expiresAt) {
      console.log('Login response has expired');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking login response validity:', error);
    return false;
  }
};

// Get session duration in minutes
export const getSessionDuration = async () => {
  try {
    const loginTime = await AsyncStorage.getItem(LOGIN_TIMESTAMP_KEY);
    if (!loginTime) {
      return 0;
    }
    
    const login = new Date(loginTime);
    const now = new Date();
    const durationMs = now - login;
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    
    console.log('Session duration:', durationMinutes, 'minutes');
    return durationMinutes;
  } catch (error) {
    console.error('Error calculating session duration:', error);
    return 0;
  }
};

// Get time remaining until session expires
export const getTimeRemaining = async () => {
  try {
    const loginResponse = await getLoginResponse();
    if (!loginResponse) {
      return 0;
    }
    
    const now = new Date();
    const expiresAt = new Date(loginResponse.expiresAt);
    const remainingMs = expiresAt - now;
    
    if (remainingMs <= 0) {
      return 0;
    }
    
    const remainingMinutes = Math.floor(remainingMs / (1000 * 60));
    console.log('Time remaining:', remainingMinutes, 'minutes');
    return remainingMinutes;
  } catch (error) {
    console.error('Error calculating time remaining:', error);
    return 0;
  }
};

// Clear all login data from AsyncStorage
export const clearLoginData = async () => {
  try {
    await AsyncStorage.multiRemove([
      LOGIN_RESPONSE_KEY,
      USER_TOKEN_KEY,
      USER_PROFILE_KEY,
      LOGIN_TIMESTAMP_KEY,
    ]);
    console.log('Login data cleared from AsyncStorage');
    return true;
  } catch (error) {
    console.error('Error clearing login data from AsyncStorage:', error);
    return false;
  }
};

// Get formatted session info
export const getSessionInfo = async () => {
  try {
    const loginResponse = await getLoginResponse();
    const loginTime = await AsyncStorage.getItem(LOGIN_TIMESTAMP_KEY);
    const sessionDuration = await getSessionDuration();
    const timeRemaining = await getTimeRemaining();
    const isValid = await isLoginResponseValid();
    
    return {
      loginResponse,
      loginTime,
      sessionDuration,
      timeRemaining,
      isValid,
      isExpired: !isValid,
    };
  } catch (error) {
    console.error('Error getting session info:', error);
    return {
      loginResponse: null,
      loginTime: null,
      sessionDuration: 0,
      timeRemaining: 0,
      isValid: false,
      isExpired: true,
    };
  }
};

// Update specific user profile field
export const updateUserProfileField = async (field, value) => {
  try {
    const currentProfile = await getUserProfile();
    if (!currentProfile) {
      console.error('No user profile found to update');
      return false;
    }
    
    const updatedProfile = { ...currentProfile, [field]: value };
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedProfile));
    
    // Also update the complete login response
    const loginResponse = await getLoginResponse();
    if (loginResponse) {
      const updatedLoginResponse = {
        ...loginResponse,
        data: updatedProfile,
      };
      await AsyncStorage.setItem(LOGIN_RESPONSE_KEY, JSON.stringify(updatedLoginResponse));
    }
    
    console.log(`User profile field ${field} updated successfully`);
    return true;
  } catch (error) {
    console.error(`Error updating user profile field ${field}:`, error);
    return false;
  }
};

// Check if user is logged in
export const isUserLoggedIn = async () => {
  try {
    const token = await getUserToken();
    const isValid = await isLoginResponseValid();
    return !!(token && isValid);
  } catch (error) {
    console.error('Error checking if user is logged in:', error);
    return false;
  }
};

// Get user data for API requests (with token)
export const getAuthenticatedUserData = async () => {
  try {
    const token = await getUserToken();
    const profile = await getUserProfile();
    
    if (!token || !profile) {
      return null;
    }
    
    return {
      token,
      profile,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Error getting authenticated user data:', error);
    return null;
  }
};

// Format time duration for display
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}m`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
};

// Format timestamp for display
export const formatTimestamp = (timestamp) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid date';
  }
};

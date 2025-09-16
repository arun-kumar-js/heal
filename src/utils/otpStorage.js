import AsyncStorage from '@react-native-async-storage/async-storage';

// OTP storage keys
export const OTP_RESPONSE_KEY = 'otpResponse';
export const USER_LOGIN_TIME_KEY = 'userLoginTime';

// Get OTP response from AsyncStorage
export const getOTPResponse = async () => {
  try {
    const otpResponseString = await AsyncStorage.getItem(OTP_RESPONSE_KEY);
    if (otpResponseString) {
      const parsedResponse = JSON.parse(otpResponseString);
      console.log('Retrieved OTP response from AsyncStorage:', parsedResponse);
      return parsedResponse;
    }
    return null;
  } catch (error) {
    console.error('Error getting OTP response from AsyncStorage:', error);
    return null;
  }
};

// Get user login time from AsyncStorage
export const getUserLoginTime = async () => {
  try {
    const loginTime = await AsyncStorage.getItem(USER_LOGIN_TIME_KEY);
    if (loginTime) {
      console.log('Retrieved user login time:', loginTime);
      return loginTime;
    }
    return null;
  } catch (error) {
    console.error('Error getting user login time from AsyncStorage:', error);
    return null;
  }
};

// Save OTP response with timestamp
export const saveOTPResponse = async (otpData) => {
  try {
    const otpDataWithTimestamp = {
      ...otpData,
      timestamp: new Date().toISOString(),
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    };
    
    await AsyncStorage.setItem(OTP_RESPONSE_KEY, JSON.stringify(otpDataWithTimestamp));
    await AsyncStorage.setItem(USER_LOGIN_TIME_KEY, otpDataWithTimestamp.loginTime);
    
    console.log('OTP response with timestamp saved:', otpDataWithTimestamp);
    return true;
  } catch (error) {
    console.error('Error saving OTP response to AsyncStorage:', error);
    return false;
  }
};

// Check if OTP response is valid and not expired
export const isOTPResponseValid = async () => {
  try {
    const otpResponse = await getOTPResponse();
    if (!otpResponse) {
      return false;
    }
    
    const now = new Date();
    const expiresAt = new Date(otpResponse.expiresAt);
    
    if (now > expiresAt) {
      console.log('OTP response has expired');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking OTP response validity:', error);
    return false;
  }
};

// Get session duration in minutes
export const getSessionDuration = async () => {
  try {
    const loginTime = await getUserLoginTime();
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
    const otpResponse = await getOTPResponse();
    if (!otpResponse) {
      return 0;
    }
    
    const now = new Date();
    const expiresAt = new Date(otpResponse.expiresAt);
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

// Clear OTP response and login time
export const clearOTPData = async () => {
  try {
    await AsyncStorage.removeItem(OTP_RESPONSE_KEY);
    await AsyncStorage.removeItem(USER_LOGIN_TIME_KEY);
    console.log('OTP data cleared from AsyncStorage');
    return true;
  } catch (error) {
    console.error('Error clearing OTP data from AsyncStorage:', error);
    return false;
  }
};

// Get formatted session info
export const getSessionInfo = async () => {
  try {
    const otpResponse = await getOTPResponse();
    const loginTime = await getUserLoginTime();
    const sessionDuration = await getSessionDuration();
    const timeRemaining = await getTimeRemaining();
    const isValid = await isOTPResponseValid();
    
    return {
      otpResponse,
      loginTime,
      sessionDuration,
      timeRemaining,
      isValid,
      isExpired: !isValid,
    };
  } catch (error) {
    console.error('Error getting session info:', error);
    return {
      otpResponse: null,
      loginTime: null,
      sessionDuration: 0,
      timeRemaining: 0,
      isValid: false,
      isExpired: true,
    };
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

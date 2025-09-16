// Example usage of OTP storage utilities
// This file shows how to use the OTP storage functions in other screens

import { 
  getOTPResponse, 
  getUserLoginTime, 
  saveOTPResponse, 
  isOTPResponseValid,
  getSessionDuration,
  getTimeRemaining,
  clearOTPData,
  getSessionInfo,
  formatDuration,
  formatTimestamp
} from '../utils/otpStorage';

// Example 1: Check if user is logged in and session is valid
export const checkUserSession = async () => {
  try {
    const isValid = await isOTPResponseValid();
    console.log('User session is valid:', isValid);
    return isValid;
  } catch (error) {
    console.error('Error checking user session:', error);
    return false;
  }
};

// Example 2: Get user login time
export const getUserLoginInfo = async () => {
  try {
    const loginTime = await getUserLoginTime();
    if (loginTime) {
      console.log('User logged in at:', formatTimestamp(loginTime));
      return loginTime;
    }
    return null;
  } catch (error) {
    console.error('Error getting user login info:', error);
    return null;
  }
};

// Example 3: Get session duration
export const getCurrentSessionDuration = async () => {
  try {
    const duration = await getSessionDuration();
    console.log('Current session duration:', formatDuration(duration));
    return duration;
  } catch (error) {
    console.error('Error getting session duration:', error);
    return 0;
  }
};

// Example 4: Get time remaining until session expires
export const getSessionTimeRemaining = async () => {
  try {
    const remaining = await getTimeRemaining();
    console.log('Time remaining:', formatDuration(remaining));
    return remaining;
  } catch (error) {
    console.error('Error getting time remaining:', error);
    return 0;
  }
};

// Example 5: Get complete session information
export const getCompleteSessionInfo = async () => {
  try {
    const sessionInfo = await getSessionInfo();
    console.log('Complete session info:', sessionInfo);
    return sessionInfo;
  } catch (error) {
    console.error('Error getting complete session info:', error);
    return null;
  }
};

// Example 6: Logout user (clear OTP data)
export const logoutUser = async () => {
  try {
    const success = await clearOTPData();
    if (success) {
      console.log('User logged out successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error logging out user:', error);
    return false;
  }
};

// Example 7: Usage in a React component
/*
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getCompleteSessionInfo, logoutUser } from '../examples/otpUsage';

const SessionInfoScreen = () => {
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    loadSessionInfo();
  }, []);

  const loadSessionInfo = async () => {
    const info = await getCompleteSessionInfo();
    setSessionInfo(info);
  };

  const handleLogout = async () => {
    const success = await logoutUser();
    if (success) {
      // Navigate to login screen
      navigation.navigate('Login');
    }
  };

  return (
    <View>
      {sessionInfo && (
        <>
          <Text>Login Time: {formatTimestamp(sessionInfo.loginTime)}</Text>
          <Text>Session Duration: {formatDuration(sessionInfo.sessionDuration)}</Text>
          <Text>Time Remaining: {formatDuration(sessionInfo.timeRemaining)}</Text>
          <Text>Session Valid: {sessionInfo.isValid ? 'Yes' : 'No'}</Text>
        </>
      )}
      <TouchableOpacity onPress={handleLogout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};
*/

// Example 8: Auto-logout when session expires
export const checkAndHandleSessionExpiry = async () => {
  try {
    const sessionInfo = await getSessionInfo();
    
    if (sessionInfo.isExpired) {
      console.log('Session has expired, logging out user');
      await clearOTPData();
      return { expired: true, message: 'Session expired' };
    }
    
    if (sessionInfo.timeRemaining < 5) { // Less than 5 minutes remaining
      console.log('Session will expire soon');
      return { 
        expired: false, 
        warning: true, 
        message: `Session expires in ${formatDuration(sessionInfo.timeRemaining)}` 
      };
    }
    
    return { expired: false, warning: false, message: 'Session is valid' };
  } catch (error) {
    console.error('Error checking session expiry:', error);
    return { expired: true, message: 'Error checking session' };
  }
};

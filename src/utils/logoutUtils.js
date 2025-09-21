import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearOTPData } from './otpStorage';
import { clearLoginData } from './loginDataStorage';
import { clearUserData } from './userStorage';

// All AsyncStorage keys used in the app
const ALL_STORAGE_KEYS = [
  // OTP related keys
  'otpResponse',
  'userLoginTime',
  
  // Login related keys
  'loginResponse',
  'userToken',
  'userProfile',
  'loginTimestamp',
  
  // User data keys
  'userData',
  
  // Any other keys that might be stored
  'appointmentData',
  'bookingData',
  'doctorData',
  'categoryData',
];

/**
 * Clear all AsyncStorage data
 * @returns {Promise<boolean>} - Success status
 */
export const clearAllAsyncStorage = async () => {
  try {
    console.log('🔄 Clearing all AsyncStorage data...');
    
    // Clear all known keys
    await AsyncStorage.multiRemove(ALL_STORAGE_KEYS);
    
    // Also use utility functions for comprehensive clearing
    await Promise.all([
      clearOTPData(),
      clearLoginData(),
      clearUserData(),
    ]);
    
    // Get all remaining keys and clear them (fallback)
    const allKeys = await AsyncStorage.getAllKeys();
    if (allKeys.length > 0) {
      console.log('⚠️ Found additional keys, clearing them:', allKeys);
      await AsyncStorage.multiRemove(allKeys);
    }
    
    console.log('✅ All AsyncStorage data cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing AsyncStorage:', error);
    return false;
  }
};

/**
 * Reset Redux store to initial state
 * This should be called after clearing AsyncStorage
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<boolean>} - Success status
 */
export const resetReduxStore = async (dispatch) => {
  try {
    console.log('🔄 Resetting Redux store...');
    
    // Import actions dynamically to avoid circular dependencies
    const { logoutUser } = await import('../store/slices/userSlice');
    
    // Dispatch logout action which will clear user state
    dispatch(logoutUser());
    
    // You can add more slice reset actions here if needed
    // dispatch(resetDoctorsState());
    // dispatch(resetCategoriesState());
    // dispatch(resetAppointmentDetailsState());
    
    console.log('✅ Redux store reset successfully');
    return true;
  } catch (error) {
    console.error('❌ Error resetting Redux store:', error);
    return false;
  }
};

/**
 * Complete logout process - clears both AsyncStorage and Redux
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} navigation - Navigation function (optional)
 * @returns {Promise<Object>} - Result object with success status and message
 */
export const performCompleteLogout = async (dispatch, navigation = null) => {
  try {
    console.log('🔄 Starting complete logout process...');
    
    // Step 1: Clear AsyncStorage
    const storageCleared = await clearAllAsyncStorage();
    
    // Step 2: Reset Redux store
    const reduxReset = await resetReduxStore(dispatch);
    
    if (storageCleared && reduxReset) {
      console.log('✅ Complete logout successful');
      
      // Navigate to login screen if navigation is provided
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }], // Adjust route name as needed
        });
      }
      
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } else {
      throw new Error('Partial logout failure');
    }
  } catch (error) {
    console.error('❌ Complete logout failed:', error);
    return {
      success: false,
      message: 'Logout failed. Please try again.',
      error: error.message,
    };
  }
};

/**
 * Check if user is logged in by checking both AsyncStorage and Redux
 * @param {Object} reduxState - Current Redux state
 * @returns {Promise<boolean>} - Login status
 */
export const isUserLoggedIn = async (reduxState = null) => {
  try {
    // Check Redux state first (if provided)
    if (reduxState && reduxState.user && reduxState.user.isAuthenticated) {
      return true;
    }
    
    // Fallback: Check AsyncStorage
    const otpResponse = await AsyncStorage.getItem('otpResponse');
    const loginResponse = await AsyncStorage.getItem('loginResponse');
    
    return !!(otpResponse || loginResponse);
  } catch (error) {
    console.error('❌ Error checking login status:', error);
    return false;
  }
};

/**
 * Get logout confirmation data
 * @returns {Object} - Confirmation dialog data
 */
export const getLogoutConfirmation = () => ({
  title: 'Logout',
  message: 'Are you sure you want to logout? This will clear all your data.',
  confirmText: 'Logout',
  cancelText: 'Cancel',
  confirmButtonStyle: { backgroundColor: '#dc3545' }, // Red color for logout
});

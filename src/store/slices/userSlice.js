import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { saveOTPResponse, getOTPResponse, clearOTPData } from '../../utils/otpStorage';
import { clearLoginData } from '../../utils/loginDataStorage';
import { clearUserData as clearUserStorageData } from '../../utils/userStorage';

// Async thunk to save OTP response
export const saveUserOTPResponse = createAsyncThunk(
  'user/saveOTPResponse',
  async (otpData, { rejectWithValue }) => {
    try {
      console.log('🔄 Saving OTP response to storage and Redux...', otpData);
      
      // Save to AsyncStorage
      const success = await saveOTPResponse(otpData);
      
      if (success) {
        console.log('✅ OTP response saved successfully');
        return otpData;
      } else {
        throw new Error('Failed to save OTP response to storage');
      }
    } catch (error) {
      console.error('❌ Error saving OTP response:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to load OTP response from storage
export const loadUserOTPResponse = createAsyncThunk(
  'user/loadOTPResponse',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Loading OTP response from storage...');
      
      const otpResponse = await getOTPResponse();
      
      if (otpResponse) {
        console.log('✅ OTP response loaded successfully:', otpResponse);
        return otpResponse;
      } else {
        console.log('⚠️ No OTP response found in storage');
        return null;
      }
    } catch (error) {
      console.error('❌ Error loading OTP response:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch user profile data by patient ID
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (patientIdArg, { rejectWithValue, getState }) => {
    try {
      let patientId = patientIdArg;
      
      // If no patient ID provided, try to get it from Redux state
      if (!patientId) {
        const state = getState();
        patientId = state.user.patientId;
        console.log('🔄 No patient ID provided, using from Redux state:', patientId);
      }
      
      // If still no patient ID, try AsyncStorage as fallback
      if (!patientId) {
        const otpResponseString = await AsyncStorage.getItem('otpresponse');
        if (otpResponseString) {
          const otpResponse = JSON.parse(otpResponseString);
          patientId = otpResponse?.data?.id;
          console.log('🔄 No patient ID in Redux, using from AsyncStorage:', patientId);
        }
      }
      
      console.log('🔄 Fetching user profile for patient ID:', patientId);
      if (!patientId) {
        throw new Error('Patient ID is required to fetch profile');
      }
      const response = await axios.get('https://spiderdesk.asia/healto/api/patient-edit', {
        params: { patient_id: patientId },
      });
      
      console.log('🔍 Full API response:', response.data);
      
      if (response.data.success) {
        console.log('✅ User profile fetched successfully:', response.data.data);
        return response.data.data;
      } else {
        // If success is false but we have data, try to use the response directly
        if (response.data && (response.data.id || response.data.patient_unique_id)) {
          console.log('⚠️ API success=false but found patient data, using response directly:', response.data);
          return response.data;
        }
        throw new Error(response.data.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to logout user and clear all data
export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Logging out user and clearing all data...');
      
      // Clear all AsyncStorage data
      await Promise.all([
        clearOTPData(),
        clearLoginData(),
        clearUserStorageData(),
      ]);
      
      console.log('✅ All user data cleared from AsyncStorage');
      return true;
    } catch (error) {
      console.error('❌ Error during logout:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // OTP Response data
  otpResponse: null,
  patientId: null,
  patientData: null,
  
  // Loading states
  isLoading: false,
  isSaving: false,
  
  // Error states
  error: null,
  saveError: null,
  
  // User profile data (from login response)
  userProfile: null,
  
  // Authentication state
  isAuthenticated: false,
  loginTime: null,
  expiresAt: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Clear user data (for manual clearing without async operations)
    clearUserData: (state) => {
      console.log('🔄 Redux: clearUserData called - clearing all user data');
      state.otpResponse = null;
      state.patientId = null;
      state.patientData = null;
      state.userProfile = null;
      state.isAuthenticated = false;
      state.loginTime = null;
      state.expiresAt = null;
      state.error = null;
      state.saveError = null;
      state.isLoading = false;
      state.isSaving = false;
      console.log('✅ Redux: All user data cleared');
    },
    
    // Update user profile data
    updateUserProfile: (state, action) => {
      console.log('🔄 Redux: updateUserProfile called with payload:', action.payload);
      console.log('🔄 Redux: Current userProfile before update:', state.userProfile);
      state.userProfile = { ...state.userProfile, ...action.payload };
      console.log('✅ Redux: userProfile updated:', state.userProfile);
    },
    
    // Set authentication state
    setAuthenticationState: (state, action) => {
      console.log('🔄 Redux: setAuthenticationState called with payload:', action.payload);
      state.isAuthenticated = action.payload.isAuthenticated;
      state.loginTime = action.payload.loginTime;
      state.expiresAt = action.payload.expiresAt;
      console.log('✅ Redux: Authentication state updated:', {
        isAuthenticated: state.isAuthenticated,
        loginTime: state.loginTime,
        expiresAt: state.expiresAt,
      });
    },
    
    // Clear errors
    clearErrors: (state) => {
      console.log('🔄 Redux: clearErrors called');
      state.error = null;
      state.saveError = null;
      console.log('✅ Redux: Errors cleared');
    },
    
    // Set patient data manually (for testing or direct updates)
    setPatientData: (state, action) => {
      console.log('🔄 Redux: setPatientData called with payload:', action.payload);
      state.patientData = action.payload;
      if (action.payload && action.payload.id) {
        state.patientId = action.payload.id;
      }
      console.log('✅ Redux: Patient data set:', state.patientData);
      console.log('✅ Redux: Patient ID set:', state.patientId);
    },
    
    // Update patient data after successful profile update
    updatePatientData: (state, action) => {
      const updatedData = action.payload;
      
      // Clear old patient data and set new data completely
      state.patientData = {
        ...updatedData,
      };
      
      // Update patient ID
      if (updatedData.id) {
        state.patientId = updatedData.id;
      }
      
      // Clear and update user profile with new data
      state.userProfile = {
        ...updatedData,
      };
      
      console.log('🔄 Redux store cleared and updated with new patient data:', updatedData);
    },
  },
  extraReducers: (builder) => {
    // Save OTP Response
    builder
      .addCase(saveUserOTPResponse.pending, (state) => {
        state.isSaving = true;
        state.saveError = null;
      })
      .addCase(saveUserOTPResponse.fulfilled, (state, action) => {
        console.log('🔄 Redux: saveUserOTPResponse.fulfilled called with payload:', action.payload);
        state.isSaving = false;
        state.otpResponse = action.payload;
        
        // Extract patient data from OTP response
        if (action.payload && action.payload.data) {
          state.patientData = action.payload.data;
          state.patientId = action.payload.data.id;
          
          // Set authentication state
          state.isAuthenticated = true;
          state.loginTime = action.payload.loginTime || new Date().toISOString();
          state.expiresAt = action.payload.expiresAt;
        }
        
        state.saveError = null;
        console.log('✅ Redux: OTP response saved and state updated:', {
          patientData: state.patientData,
          patientId: state.patientId,
          isAuthenticated: state.isAuthenticated,
        });
      })
      .addCase(saveUserOTPResponse.rejected, (state, action) => {
        state.isSaving = false;
        state.saveError = action.payload;
      });
    
    // Load OTP Response
    builder
      .addCase(loadUserOTPResponse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserOTPResponse.fulfilled, (state, action) => {
        console.log('🔄 Redux: loadUserOTPResponse.fulfilled called with payload:', action.payload);
        state.isLoading = false;
        
        if (action.payload) {
          state.otpResponse = action.payload;
          
          // Extract patient data from OTP response
          if (action.payload.data) {
            state.patientData = action.payload.data;
            state.patientId = action.payload.data.id;
            
            // Set authentication state
            state.isAuthenticated = true;
            state.loginTime = action.payload.loginTime;
            state.expiresAt = action.payload.expiresAt;
          }
          console.log('✅ Redux: OTP response loaded and state updated:', {
            patientData: state.patientData,
            patientId: state.patientId,
            isAuthenticated: state.isAuthenticated,
          });
        } else {
          // No OTP response found, reset state
          state.otpResponse = null;
          state.patientData = null;
          state.patientId = null;
          state.isAuthenticated = false;
          state.loginTime = null;
          state.expiresAt = null;
          console.log('⚠️ Redux: No OTP response found, state reset');
        }
        
        state.error = null;
      })
      .addCase(loadUserOTPResponse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // Fetch User Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        
        console.log('🔄 Redux: fetchUserProfile.fulfilled called with payload:', action.payload);
        console.log('🔄 Redux: Current state.patientData before update:', state.patientData);
        
        // Update patient data with fresh profile data from API
        state.patientData = action.payload;
        
        // Extract patient ID from various possible fields
        const patientId = action.payload.id || action.payload.patient_unique_id || action.payload.patient_id;
        if (patientId) {
          state.patientId = patientId;
          console.log('✅ Redux: Patient ID extracted and set:', patientId);
        } else {
          console.log('⚠️ Redux: No patient ID found in API response');
        }
        
        // Also update user profile
        state.userProfile = action.payload;
        
        console.log('✅ Redux: Fresh profile data loaded from API:', action.payload);
        console.log('✅ Redux: Updated state.patientData:', state.patientData);
        console.log('✅ Redux: Updated state.patientId:', state.patientId);
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    
    // Logout User
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        console.log('🔄 Redux: logoutUser.fulfilled called - resetting all state');
        // Reset all state to initial values
        state.otpResponse = null;
        state.patientId = null;
        state.patientData = null;
        state.userProfile = null;
        state.isAuthenticated = false;
        state.loginTime = null;
        state.expiresAt = null;
        state.isLoading = false;
        state.isSaving = false;
        state.error = null;
        state.saveError = null;
        console.log('✅ Redux: User logged out and all state reset');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  clearUserData,
  updateUserProfile,
  setAuthenticationState,
  clearErrors,
  setPatientData,
  updatePatientData,
} = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user;
export const selectPatientId = (state) => state.user.patientId;
export const selectPatientData = (state) => state.user.patientData;
export const selectOTPResponse = (state) => state.user.otpResponse;
export const selectUserProfile = (state) => state.user.userProfile;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectIsLoading = (state) => state.user.isLoading;
export const selectIsSaving = (state) => state.user.isSaving;
export const selectUserError = (state) => state.user.error;
export const selectUserSaveError = (state) => state.user.saveError;

// Helper selector to get formatted user data for display
export const selectFormattedUserData = (state) => {
  const { patientData, userProfile, otpResponse } = state.user;
  
  // Try multiple fallback sources
  let name = 'User';
  let phone = '';
  let email = '';
  let patientId = null;
  let isLoggedIn = false;
  
  // 1. Try patient data first
  if (patientData) {
    name = patientData.name || patientData.patient_name || 'User';
    phone = patientData.phone_number || patientData.phone || '';
    email = patientData.email || '';
    patientId = patientData.id || patientData.patient_unique_id;
    isLoggedIn = true;
  }
  // 2. Try user profile data
  else if (userProfile) {
    name = userProfile.name || userProfile.patient_name || 'User';
    phone = userProfile.phone_number || userProfile.phone || '';
    email = userProfile.email || '';
    patientId = userProfile.id || userProfile.patient_unique_id;
    isLoggedIn = true;
  }
  // 3. Try OTP response data
  else if (otpResponse && otpResponse.data) {
    name = otpResponse.data.name || otpResponse.data.patient_name || 'User';
    phone = otpResponse.data.phone_number || otpResponse.data.phone || '';
    email = otpResponse.data.email || '';
    patientId = otpResponse.data.id || otpResponse.data.patient_unique_id;
    isLoggedIn = true;
  }
  
  return {
    name,
    phone,
    email,
    patientId,
    isLoggedIn,
  };
};

// Utility function to log complete user slice data
export const logUserSliceData = (state) => {
  console.log('📊 ===== USER SLICE DATA =====');
  console.log('🔐 Authentication State:', {
    isAuthenticated: state.user.isAuthenticated,
    loginTime: state.user.loginTime,
    expiresAt: state.user.expiresAt,
  });
  console.log('👤 Patient Data:', state.user.patientData);
  console.log('📋 User Profile:', state.user.userProfile);
  console.log('📱 OTP Response:', state.user.otpResponse);
  console.log('🆔 Patient ID:', state.user.patientId);
  console.log('⏳ Loading States:', {
    isLoading: state.user.isLoading,
    isSaving: state.user.isSaving,
  });
  console.log('❌ Error States:', {
    error: state.user.error,
    saveError: state.user.saveError,
  });
  console.log('📝 Formatted User Data:', selectFormattedUserData(state));
  console.log('📊 ===== END USER SLICE DATA =====');
};

export default userSlice.reducer;

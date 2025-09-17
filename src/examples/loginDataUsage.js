// Example usage of login data storage functions
// This file shows how to use the login data storage utilities

import { 
  saveLoginResponse,
  getLoginResponse,
  getUserToken,
  getUserProfile,
  getFormattedUserProfile,
  isLoginResponseValid,
  getSessionDuration,
  getTimeRemaining,
  clearLoginData,
  getSessionInfo,
  updateUserProfileField,
  isUserLoggedIn,
  getAuthenticatedUserData,
  formatDuration,
  formatTimestamp
} from '../utils/loginDataStorage';

// Example login response data (as provided by user)
const exampleLoginResponse = {
  "status": true,
  "message": "Login successful",
  "token": "98|SKYEYGJ3iTPr5oTjKQLPtaq460ZqmhapjBuRi1N6c8927678",
  "data": {
    "id": 51,
    "patient_unique_id": "PAT-01753",
    "name": "Arun",
    "dob": "1994-03-07T00:00:00.000000Z",
    "age": 31,
    "gender": "Male",
    "blood_group": "A+",
    "phone_number": "8122839500",
    "email": "taruntarun5@gmail.com",
    "otp": null,
    "otp_expires_at": null,
    "address": "Cillum facilis inven",
    "profile_image": "profile_images/1757571656_stylish-handsome-indian-man-tshirt-pastel-wall 1.jpg",
    "status": 1,
    "created_at": "2025-09-09T10:36:27.000000Z",
    "updated_at": "2025-09-16T08:06:11.000000Z"
  }
};

// Example 1: Save login response after successful login
export const handleSuccessfulLogin = async (loginResponse) => {
  try {
    const success = await saveLoginResponse(loginResponse);
    if (success) {
      console.log('Login data saved successfully');
      return true;
    } else {
      console.error('Failed to save login data');
      return false;
    }
  } catch (error) {
    console.error('Error handling successful login:', error);
    return false;
  }
};

// Example 2: Get user profile for display in UI
export const loadUserProfileForUI = async () => {
  try {
    const profile = await getFormattedUserProfile();
    console.log('User profile for UI:', profile);
    return profile;
  } catch (error) {
    console.error('Error loading user profile for UI:', error);
    return null;
  }
};

// Example 3: Check if user is logged in and session is valid
export const checkUserAuthentication = async () => {
  try {
    const isLoggedIn = await isUserLoggedIn();
    const isValid = await isLoginResponseValid();
    const sessionInfo = await getSessionInfo();
    
    console.log('User authentication status:', {
      isLoggedIn,
      isValid,
      sessionInfo
    });
    
    return {
      isLoggedIn,
      isValid,
      sessionInfo
    };
  } catch (error) {
    console.error('Error checking user authentication:', error);
    return {
      isLoggedIn: false,
      isValid: false,
      sessionInfo: null
    };
  }
};

// Example 4: Get user data for API requests
export const getAuthHeaders = async () => {
  try {
    const authData = await getAuthenticatedUserData();
    if (authData && authData.isAuthenticated) {
      return {
        'Authorization': `Bearer ${authData.token}`,
        'Content-Type': 'application/json',
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return null;
  }
};

// Example 5: Update user profile field
export const updateUserField = async (field, value) => {
  try {
    const success = await updateUserProfileField(field, value);
    if (success) {
      console.log(`User field ${field} updated successfully`);
      return true;
    } else {
      console.error(`Failed to update user field ${field}`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating user field ${field}:`, error);
    return false;
  }
};

// Example 6: React Hook for login data
export const useLoginData = () => {
  const [loginData, setLoginData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadLoginData();
  }, []);

  const loadLoginData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const loginResponse = await getLoginResponse();
      const profile = await getFormattedUserProfile();
      const authStatus = await isUserLoggedIn();
      
      setLoginData(loginResponse);
      setUserProfile(profile);
      setIsAuthenticated(authStatus);
    } catch (err) {
      setError(err);
      console.error('Error loading login data:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveLogin = async (loginResponse) => {
    try {
      const success = await saveLoginResponse(loginResponse);
      if (success) {
        await loadLoginData(); // Reload data
        return true;
      }
      return false;
    } catch (err) {
      setError(err);
      console.error('Error saving login data:', err);
      return false;
    }
  };

  const updateProfile = async (field, value) => {
    try {
      const success = await updateUserProfileField(field, value);
      if (success) {
        await loadLoginData(); // Reload data
        return true;
      }
      return false;
    } catch (err) {
      setError(err);
      console.error('Error updating profile:', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      const success = await clearLoginData();
      if (success) {
        setLoginData(null);
        setUserProfile(null);
        setIsAuthenticated(false);
        return true;
      }
      return false;
    } catch (err) {
      setError(err);
      console.error('Error logging out:', err);
      return false;
    }
  };

  return {
    loginData,
    userProfile,
    loading,
    error,
    isAuthenticated,
    loadLoginData,
    saveLogin,
    updateProfile,
    logout,
  };
};

// Example 7: Usage in a React component
export const UserProfileComponent = () => {
  const { userProfile, loading, error, updateProfile } = useLoginData();
  const [name, setName] = useState('');

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
    }
  }, [userProfile]);

  const handleSaveName = async () => {
    const success = await updateProfile('name', name);
    if (success) {
      console.log('Name updated successfully');
    }
  };

  if (loading) {
    return <Text>Loading user profile...</Text>;
  }

  if (error) {
    return <Text>Error loading user profile: {error.message}</Text>;
  }

  return (
    <View>
      <Image source={{ uri: userProfile?.profileImage }} style={styles.profileImage} />
      <Text>Name: {userProfile?.name || 'Not set'}</Text>
      <Text>Email: {userProfile?.email || 'Not set'}</Text>
      <Text>Phone: {userProfile?.phone || 'Not set'}</Text>
      <Text>Age: {userProfile?.age || 'Not set'}</Text>
      <Text>Gender: {userProfile?.gender || 'Not set'}</Text>
      <Text>Blood Group: {userProfile?.bloodGroup || 'Not set'}</Text>
      <Text>Patient ID: {userProfile?.patientId || 'Not set'}</Text>
      <Text>Address: {userProfile?.location || 'Not set'}</Text>
      
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
      />
      <TouchableOpacity onPress={handleSaveName}>
        <Text>Save Name</Text>
      </TouchableOpacity>
    </View>
  );
};

// Example 8: Session management
export const SessionManager = () => {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    loadSessionInfo();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadSessionInfo = async () => {
    try {
      const info = await getSessionInfo();
      setSessionInfo(info);
      setTimeRemaining(info.timeRemaining);
    } catch (error) {
      console.error('Error loading session info:', error);
    }
  };

  const updateTimeRemaining = async () => {
    try {
      const remaining = await getTimeRemaining();
      setTimeRemaining(remaining);
    } catch (error) {
      console.error('Error updating time remaining:', error);
    }
  };

  return (
    <View>
      <Text>Session Duration: {sessionInfo ? formatDuration(sessionInfo.sessionDuration) : '0m'}</Text>
      <Text>Time Remaining: {formatDuration(timeRemaining)}</Text>
      <Text>Is Valid: {sessionInfo?.isValid ? 'Yes' : 'No'}</Text>
      <Text>Login Time: {sessionInfo?.loginTime ? formatTimestamp(sessionInfo.loginTime) : 'Unknown'}</Text>
    </View>
  );
};

// Example 9: API request with authentication
export const makeAuthenticatedRequest = async (url, options = {}) => {
  try {
    const authHeaders = await getAuthHeaders();
    if (!authHeaders) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });

    return response;
  } catch (error) {
    console.error('Error making authenticated request:', error);
    throw error;
  }
};

// Example 10: Complete login flow
export const completeLoginFlow = async (loginResponse) => {
  try {
    // 1. Save login response
    const saveSuccess = await saveLoginResponse(loginResponse);
    if (!saveSuccess) {
      throw new Error('Failed to save login data');
    }

    // 2. Verify authentication
    const authStatus = await checkUserAuthentication();
    if (!authStatus.isLoggedIn) {
      throw new Error('Authentication verification failed');
    }

    // 3. Get user profile for UI
    const userProfile = await getFormattedUserProfile();
    if (!userProfile) {
      throw new Error('Failed to load user profile');
    }

    console.log('Login flow completed successfully');
    return {
      success: true,
      userProfile,
      authStatus,
    };
  } catch (error) {
    console.error('Error in complete login flow:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

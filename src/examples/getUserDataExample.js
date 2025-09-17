// Comprehensive example of getting user data from AsyncStorage
// This file demonstrates various ways to retrieve and use user data

import { 
  getUserData, 
  saveUserData, 
  updateUserDataField, 
  clearUserData,
  hasUserData 
} from '../utils/userStorage';

// Example 1: Basic user data retrieval
export const getBasicUserData = async () => {
  try {
    const userData = await getUserData();
    console.log('Retrieved user data:', userData);
    return userData;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Example 2: Get user data with loading state
export const getUserDataWithLoading = async (setLoading, setUserData) => {
  try {
    setLoading(true);
    const data = await getUserData();
    setUserData(data);
    return data;
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  } finally {
    setLoading(false);
  }
};

// Example 3: Get specific user field
export const getUserField = async (fieldName) => {
  try {
    const userData = await getUserData();
    return userData[fieldName] || null;
  } catch (error) {
    console.error(`Error getting user field ${fieldName}:`, error);
    return null;
  }
};

// Example 4: Check if user has specific data
export const checkUserHasData = async (fieldName) => {
  try {
    const userData = await getUserData();
    return userData && userData[fieldName] && userData[fieldName] !== '';
  } catch (error) {
    console.error(`Error checking user field ${fieldName}:`, error);
    return false;
  }
};

// Example 5: Get user data with fallback values
export const getUserDataWithFallback = async (fallbackData = {}) => {
  try {
    const userData = await getUserData();
    return {
      name: userData.name || fallbackData.name || 'User',
      profileImage: userData.profileImage || fallbackData.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg',
      location: userData.location || fallbackData.location || 'Location not set',
      email: userData.email || fallbackData.email || '',
      phone: userData.phone || fallbackData.phone || '',
      dateOfBirth: userData.dateOfBirth || fallbackData.dateOfBirth || '',
      gender: userData.gender || fallbackData.gender || '',
    };
  } catch (error) {
    console.error('Error getting user data with fallback:', error);
    return fallbackData;
  }
};

// Example 6: React Hook for user data
export const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserData();
      setUserData(data);
    } catch (err) {
      setError(err);
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (newData) => {
    try {
      const success = await saveUserData(newData);
      if (success) {
        setUserData(newData);
        return true;
      }
      return false;
    } catch (err) {
      setError(err);
      console.error('Error updating user data:', err);
      return false;
    }
  };

  const updateField = async (field, value) => {
    try {
      const success = await updateUserDataField(field, value);
      if (success) {
        setUserData(prev => ({ ...prev, [field]: value }));
        return true;
      }
      return false;
    } catch (err) {
      setError(err);
      console.error('Error updating user field:', err);
      return false;
    }
  };

  const clearData = async () => {
    try {
      const success = await clearUserData();
      if (success) {
        setUserData(null);
        return true;
      }
      return false;
    } catch (err) {
      setError(err);
      console.error('Error clearing user data:', err);
      return false;
    }
  };

  return {
    userData,
    loading,
    error,
    loadUserData,
    updateUserData,
    updateField,
    clearData,
  };
};

// Example 7: Usage in a React component
export const UserProfileComponent = () => {
  const { userData, loading, error, updateField } = useUserData();
  const [name, setName] = useState('');

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
    }
  }, [userData]);

  const handleSaveName = async () => {
    const success = await updateField('name', name);
    if (success) {
      console.log('Name updated successfully');
    }
  };

  if (loading) {
    return <Text>Loading user data...</Text>;
  }

  if (error) {
    return <Text>Error loading user data: {error.message}</Text>;
  }

  return (
    <View>
      <Text>Name: {userData?.name || 'Not set'}</Text>
      <Text>Email: {userData?.email || 'Not set'}</Text>
      <Text>Location: {userData?.location || 'Not set'}</Text>
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

// Example 8: Get user data for specific screens
export const getUserDataForHome = async () => {
  try {
    const userData = await getUserData();
    return {
      name: userData.name || 'User',
      profileImage: userData.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg',
      location: userData.location || 'Location not set',
    };
  } catch (error) {
    console.error('Error getting user data for home:', error);
    return {
      name: 'User',
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      location: 'Location not set',
    };
  }
};

export const getUserDataForProfile = async () => {
  try {
    const userData = await getUserData();
    return {
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      dateOfBirth: userData.dateOfBirth || '',
      gender: userData.gender || '',
      profileImage: userData.profileImage || '',
      location: userData.location || '',
    };
  } catch (error) {
    console.error('Error getting user data for profile:', error);
    return {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      profileImage: '',
      location: '',
    };
  }
};

// Example 9: Validate user data
export const validateUserData = (userData) => {
  const errors = [];
  
  if (!userData.name || userData.name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (userData.email && !isValidEmail(userData.email)) {
    errors.push('Invalid email format');
  }
  
  if (userData.phone && !isValidPhone(userData.phone)) {
    errors.push('Invalid phone format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Example 10: Get user data with error handling and retry
export const getUserDataWithRetry = async (maxRetries = 3) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const userData = await getUserData();
      return userData;
    } catch (error) {
      retries++;
      console.error(`Attempt ${retries} failed:`, error);
      
      if (retries >= maxRetries) {
        throw new Error(`Failed to get user data after ${maxRetries} attempts`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
};

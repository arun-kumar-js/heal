import AsyncStorage from '@react-native-async-storage/async-storage';

// User data storage keys
export const USER_DATA_KEY = 'userData';

// Default user data structure
export const DEFAULT_USER_DATA = {
  name: 'User',
  profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
  location: 'Luz Corner, Mylapore, Chen...',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
};

// Get user data from AsyncStorage
export const getUserData = async () => {
  try {
    const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
    if (userDataString) {
      return JSON.parse(userDataString);
    }
    return DEFAULT_USER_DATA;
  } catch (error) {
    console.error('Error getting user data from AsyncStorage:', error);
    return DEFAULT_USER_DATA;
  }
};

// Save user data to AsyncStorage
export const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error saving user data to AsyncStorage:', error);
    return false;
  }
};

// Update specific user data field
export const updateUserDataField = async (field, value) => {
  try {
    const currentData = await getUserData();
    const updatedData = { ...currentData, [field]: value };
    return await saveUserData(updatedData);
  } catch (error) {
    console.error('Error updating user data field:', error);
    return false;
  }
};

// Clear user data from AsyncStorage
export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing user data from AsyncStorage:', error);
    return false;
  }
};

// Check if user data exists
export const hasUserData = async () => {
  try {
    const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
    return userDataString !== null;
  } catch (error) {
    console.error('Error checking user data:', error);
    return false;
  }
};

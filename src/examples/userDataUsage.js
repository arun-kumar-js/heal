// Example usage of user data storage functions
// This file shows how to use the user storage utilities in other screens

import { 
  getUserData, 
  saveUserData, 
  updateUserDataField, 
  clearUserData,
  hasUserData 
} from '../utils/userStorage';

// Example 1: Get user data in any screen
export const loadUserProfile = async () => {
  try {
    const userData = await getUserData();
    console.log('User data:', userData);
    return userData;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
};

// Example 2: Update user name from Profile screen
export const updateProfileName = async (newName) => {
  try {
    const success = await updateUserDataField('name', newName);
    if (success) {
      console.log('Name updated successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating name:', error);
    return false;
  }
};

// Example 3: Update user location from Settings screen
export const updateUserLocation = async (newLocation) => {
  try {
    const success = await updateUserDataField('location', newLocation);
    if (success) {
      console.log('Location updated successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating location:', error);
    return false;
  }
};

// Example 4: Update profile image after image picker
export const updateProfileImage = async (imageUri) => {
  try {
    const success = await updateUserDataField('profileImage', imageUri);
    if (success) {
      console.log('Profile image updated successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating profile image:', error);
    return false;
  }
};

// Example 5: Save complete user profile
export const saveCompleteProfile = async (profileData) => {
  try {
    const success = await saveUserData(profileData);
    if (success) {
      console.log('Complete profile saved successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving complete profile:', error);
    return false;
  }
};

// Example 6: Check if user has data before showing profile
export const checkUserDataExists = async () => {
  try {
    const exists = await hasUserData();
    console.log('User data exists:', exists);
    return exists;
  } catch (error) {
    console.error('Error checking user data:', error);
    return false;
  }
};

// Example 7: Clear user data on logout
export const clearUserProfile = async () => {
  try {
    const success = await clearUserData();
    if (success) {
      console.log('User data cleared successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
};

// Example 8: Usage in a React component
/*
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { loadUserProfile, updateProfileName } from '../examples/userDataUsage';

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const data = await loadUserProfile();
    if (data) {
      setUserData(data);
      setName(data.name);
    }
  };

  const handleSaveName = async () => {
    const success = await updateProfileName(name);
    if (success) {
      setUserData(prev => ({ ...prev, name }));
      alert('Name updated successfully!');
    }
  };

  return (
    <View>
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
*/

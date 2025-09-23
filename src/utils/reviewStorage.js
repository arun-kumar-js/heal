import AsyncStorage from '@react-native-async-storage/async-storage';

// Review storage keys
export const REVIEW_DATA_KEY = 'reviewData';

// Get review data from AsyncStorage
export const getReviewData = async () => {
  try {
    const reviewDataString = await AsyncStorage.getItem(REVIEW_DATA_KEY);
    if (reviewDataString) {
      const parsedData = JSON.parse(reviewDataString);
      console.log('Retrieved review data from AsyncStorage:', parsedData);
      return parsedData;
    }
    return null;
  } catch (error) {
    console.error('Error getting review data from AsyncStorage:', error);
    return null;
  }
};

// Save review data to AsyncStorage
export const saveReviewData = async (reviewData) => {
  try {
    const reviewDataWithTimestamp = {
      ...reviewData,
      submittedAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(REVIEW_DATA_KEY, JSON.stringify(reviewDataWithTimestamp));
    console.log('Review data saved to AsyncStorage:', reviewDataWithTimestamp);
    return true;
  } catch (error) {
    console.error('Error saving review data to AsyncStorage:', error);
    return false;
  }
};

// Get review data for specific appointment
export const getReviewForAppointment = async (appointmentId) => {
  try {
    const allReviews = await getReviewData();
    if (allReviews && allReviews[appointmentId]) {
      return allReviews[appointmentId];
    }
    return null;
  } catch (error) {
    console.error('Error getting review for appointment:', error);
    return null;
  }
};

// Save review data for specific appointment
export const saveReviewForAppointment = async (appointmentId, reviewData) => {
  try {
    const allReviews = await getReviewData() || {};
    allReviews[appointmentId] = {
      ...reviewData,
      submittedAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(REVIEW_DATA_KEY, JSON.stringify(allReviews));
    console.log('Review data saved for appointment:', appointmentId, allReviews[appointmentId]);
    return true;
  } catch (error) {
    console.error('Error saving review for appointment:', error);
    return false;
  }
};

// Check if review exists for specific appointment
export const hasReviewForAppointment = async (appointmentId) => {
  try {
    const review = await getReviewForAppointment(appointmentId);
    return review !== null;
  } catch (error) {
    console.error('Error checking review for appointment:', error);
    return false;
  }
};

// Clear all review data
export const clearAllReviewData = async () => {
  try {
    await AsyncStorage.removeItem(REVIEW_DATA_KEY);
    console.log('All review data cleared from AsyncStorage');
    return true;
  } catch (error) {
    console.error('Error clearing review data from AsyncStorage:', error);
    return false;
  }
};

// Clear review data for specific appointment
export const clearReviewForAppointment = async (appointmentId) => {
  try {
    const allReviews = await getReviewData() || {};
    if (allReviews[appointmentId]) {
      delete allReviews[appointmentId];
      await AsyncStorage.setItem(REVIEW_DATA_KEY, JSON.stringify(allReviews));
      console.log('Review data cleared for appointment:', appointmentId);
      return true;
    }
    return true; // Already doesn't exist
  } catch (error) {
    console.error('Error clearing review for appointment:', error);
    return false;
  }
};

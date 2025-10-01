import axios from 'axios';
import { BASE_URL, basicAuth } from '../config/config.js';

const FAQ_URL = BASE_URL + 'support/faq';

/**
 * Fetch FAQs from the API
 * @returns {Promise<Object>} - API response object with FAQs
 */
export const getFAQs = async () => {
  try {
    console.log('=== FAQ API CALL ===');
    console.log('API URL:', FAQ_URL);

    const response = await axios.get(FAQ_URL, {
      headers: {
        'Authorization': basicAuth,
      },
      timeout: 10000,
    });

    console.log('=== FAQ API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('Data type:', typeof response.data);
    console.log('Data keys:', response.data ? Object.keys(response.data) : 'null');

    // Handle different API response structures
    let faqData = response.data;
    
    // Check if response has nested structure
    if (faqData.faqs) {
      faqData = faqData.faqs;
    } else if (faqData.data) {
      faqData = faqData.data;
    }

    return {
      success: true,
      data: faqData,
      message: response.data.message || 'FAQs fetched successfully',
    };

  } catch (error) {
    console.error('=== FAQ API ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);

    let errorMessage = 'Failed to fetch FAQs';

    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          errorMessage = data.message || 'Invalid request';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please login again.';
          break;
        case 404:
          errorMessage = 'FAQs not found';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = data.message || `Server error (${status})`;
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your internet connection.';
    }

    return {
      success: false,
      data: [],
      message: errorMessage,
      error: error,
    };
  }
};


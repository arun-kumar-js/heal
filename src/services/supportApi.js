import axios from 'axios';
import { BASE_URL, basicAuth } from '../config/config.js';

/**
 * Fetch Help Centre content from the API
 * @returns {Promise<Object>} - API response object
 */
export const getHelpContent = async () => {
  try {
    const HELP_URL = BASE_URL + 'support/help';
    console.log('=== HELP API CALL ===');
    console.log('API URL:', HELP_URL);

    const response = await axios.get(HELP_URL, {
      headers: { 'Authorization': basicAuth },
      timeout: 10000,
    });

    console.log('=== HELP API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Data:', response.data);

    let helpData = response.data;
    if (helpData.help) helpData = helpData.help;
    else if (helpData.data) helpData = helpData.data;

    return {
      success: true,
      data: helpData,
      message: response.data.message || 'Help content fetched successfully',
    };
  } catch (error) {
    console.error('=== HELP API ERROR ===', error.message);
    return {
      success: false,
      data: [],
      message: 'Failed to fetch help content',
      error: error,
    };
  }
};

/**
 * Fetch Terms & Conditions from the API
 * @returns {Promise<Object>} - API response object
 */
export const getTermsConditions = async () => {
  try {
    const TERMS_URL = BASE_URL + 'support/terms';
    console.log('=== TERMS API CALL ===');
    console.log('API URL:', TERMS_URL);

    const response = await axios.get(TERMS_URL, {
      headers: { 'Authorization': basicAuth },
      timeout: 10000,
    });

    console.log('=== TERMS API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Data:', response.data);

    let termsData = response.data;
    if (termsData.terms) termsData = termsData.terms;
    else if (termsData.data) termsData = termsData.data;

    return {
      success: true,
      data: termsData,
      message: response.data.message || 'Terms fetched successfully',
    };
  } catch (error) {
    console.error('=== TERMS API ERROR ===', error.message);
    return {
      success: false,
      data: null,
      message: 'Failed to fetch terms and conditions',
      error: error,
    };
  }
};

/**
 * Fetch Privacy Policy from the API
 * @returns {Promise<Object>} - API response object
 */
export const getPrivacyPolicy = async () => {
  try {
    const PRIVACY_URL = BASE_URL + 'support/privacy';
    console.log('=== PRIVACY API CALL ===');
    console.log('API URL:', PRIVACY_URL);

    const response = await axios.get(PRIVACY_URL, {
      headers: { 'Authorization': basicAuth },
      timeout: 10000,
    });

    console.log('=== PRIVACY API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Data:', response.data);

    let privacyData = response.data;
    if (privacyData.privacy) privacyData = privacyData.privacy;
    else if (privacyData.data) privacyData = privacyData.data;

    return {
      success: true,
      data: privacyData,
      message: response.data.message || 'Privacy policy fetched successfully',
    };
  } catch (error) {
    console.error('=== PRIVACY API ERROR ===', error.message);
    return {
      success: false,
      data: null,
      message: 'Failed to fetch privacy policy',
      error: error,
    };
  }
};

/**
 * Fetch Contact Support information from the API
 * @returns {Promise<Object>} - API response object
 */
export const getContactSupport = async () => {
  try {
    const CONTACT_URL = BASE_URL + 'support/contact';
    console.log('=== CONTACT API CALL ===');
    console.log('API URL:', CONTACT_URL);

    const response = await axios.get(CONTACT_URL, {
      headers: { 'Authorization': basicAuth },
      timeout: 10000,
    });

    console.log('=== CONTACT API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Data:', response.data);

    let contactData = response.data;
    if (contactData.contact) contactData = contactData.contact;
    else if (contactData.data) contactData = contactData.data;

    return {
      success: true,
      data: contactData,
      message: response.data.message || 'Contact info fetched successfully',
    };
  } catch (error) {
    console.error('=== CONTACT API ERROR ===', error.message);
    return {
      success: false,
      data: null,
      message: 'Failed to fetch contact information',
      error: error,
    };
  }
};


import { BASE_URL } from '../config/config';

// Test function to check if the API endpoint is accessible
export const testReviewEndpoint = async () => {
  try {
    console.log('Testing review endpoint...');
    const testUrl = `${BASE_URL}reviews-update`;
    console.log('Test URL:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Test Response Status:', response.status);
    console.log('Test Response Headers:', response.headers);
    
    const contentType = response.headers.get('content-type');
    console.log('Test Content Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Test Response Data:', data);
    } else {
      const textData = await response.text();
      console.log('Test Response Text:', textData);
    }
    
    return {
      success: true,
      status: response.status,
      contentType: contentType
    };
  } catch (error) {
    console.error('Test endpoint error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Submit review for completed appointment
export const submitReview = async (reviewData) => {
  try {
    console.log('=== REVIEW API DEBUG ===');
    console.log('Base URL:', BASE_URL);
    console.log('Review Data Received:', reviewData);
    
    // Since it's a GET request, we need to construct the URL with query parameters
    const queryParams = new URLSearchParams({
      doctor_id: reviewData.doctor_id,
      clinic_id: reviewData.clinic_id,
      patient_id: reviewData.patient_id,
      doctor_rating: reviewData.doctor_rating,
      clinic_rating: reviewData.clinic_rating,
      appointment_id: reviewData.appointment_id
    });

    // Try multiple possible endpoints
    const possibleEndpoints = [
      `${BASE_URL}reviews-update`,
      `${BASE_URL}api/reviews-update`,
      `${BASE_URL}review`,
      `${BASE_URL}api/review`,
      `${BASE_URL}feedback`,
      `${BASE_URL}api/feedback`
    ];

    console.log('Trying endpoints:', possibleEndpoints);
    console.log('Base URL structure:', BASE_URL);
    console.log('Query parameters:', queryParams.toString());

    // Try each endpoint until one works
    for (let i = 0; i < possibleEndpoints.length; i++) {
      const endpoint = possibleEndpoints[i];
      const fullUrl = `${endpoint}?${queryParams}`;
      
      console.log(`Trying endpoint ${i + 1}/${possibleEndpoints.length}:`, fullUrl);
      console.log(`Full URL breakdown: ${endpoint} + ? + ${queryParams.toString()}`);
      
      try {
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log(`Endpoint ${i + 1} Response Status:`, response.status);
        
        if (response.ok) {
          console.log(`Success with endpoint: ${endpoint}`);
          return await handleResponse(response);
        } else {
          console.log(`Endpoint ${i + 1} failed with status:`, response.status);
        }
      } catch (endpointError) {
        console.log(`Endpoint ${i + 1} error:`, endpointError.message);
      }
    }

    // If all endpoints failed
    return {
      success: false,
      error: 'All review endpoints failed. Please check server configuration.',
      data: 'No working endpoint found'
    };

  } catch (error) {
    console.error('Error submitting review:', error);
    return {
      success: false,
      error: error.message || 'Network error occurred'
    };
  }
};

// Helper function to handle response
const handleResponse = async (response) => {
  console.log('Response Status:', response.status);
  console.log('Response Headers:', response.headers);
  
  // Check if response is ok before trying to parse JSON
  if (!response.ok) {
    console.log('Response not OK, status:', response.status);
    const errorText = await response.text();
    console.log('Error Response Text:', errorText);
    return {
      success: false,
      error: `Server error: ${response.status}`,
      data: errorText
    };
  }

  // Check content type before parsing JSON
  const contentType = response.headers.get('content-type');
  console.log('Content Type:', contentType);
  
  let data;
  try {
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('Response Data (JSON):', data);
    } else {
      const textData = await response.text();
      console.log('Response Data (Text):', textData);
      return {
        success: false,
        error: 'Server returned non-JSON response',
        data: textData
      };
    }
  } catch (parseError) {
    console.error('JSON Parse Error:', parseError);
    const textData = await response.text();
    console.log('Raw Response Text:', textData);
    return {
      success: false,
      error: 'Failed to parse server response as JSON',
      data: textData
    };
  }

  return {
    success: true,
    data: data,
    message: 'Review submitted successfully'
  };
};

// Alternative POST method (recommended for review submission)
export const submitReviewPost = async (reviewData) => {
  try {
    const response = await fetch(`${BASE_URL}reviews-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doctor_id: reviewData.doctor_id,
        clinic_id: reviewData.clinic_id,
        patient_id: reviewData.patient_id,
        doctor_rating: reviewData.doctor_rating,
        clinic_rating: reviewData.clinic_rating,
        appointment_id: reviewData.appointment_id
      })
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: data,
        message: 'Review submitted successfully'
      };
    } else {
      return {
        success: false,
        error: data.message || 'Failed to submit review',
        data: data
      };
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    return {
      success: false,
      error: error.message || 'Network error occurred'
    };
  }
};

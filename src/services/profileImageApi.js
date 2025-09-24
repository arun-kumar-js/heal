import { BASE_URL } from '../config/config';

// Upload profile image with multiple endpoint attempts
export const uploadProfileImage = async (patientId, imageUri) => {
  try {
    console.log('=== PROFILE IMAGE UPLOAD DEBUG ===');
    console.log('Patient ID:', patientId);
    console.log('Image URI:', imageUri);
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('profile_image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile_image.jpg',
    });

    console.log('FormData created:', formData);
    
    // Try multiple possible endpoints with different HTTP methods
    const possibleEndpoints = [
      { url: `${BASE_URL}patient-update`, method: 'PUT' },
      { url: `${BASE_URL}patient-update`, method: 'POST' },
      { url: `${BASE_URL}upload-profile-image`, method: 'POST' },
      { url: `${BASE_URL}patient-image-upload`, method: 'POST' },
      { url: `${BASE_URL}profile-image`, method: 'POST' },
      { url: `${BASE_URL}upload-image`, method: 'POST' },
      { url: `${BASE_URL}patient/profile-image`, method: 'POST' },
    ];

    console.log('Trying endpoints:', possibleEndpoints);

    // Try each endpoint until one works
    for (let i = 0; i < possibleEndpoints.length; i++) {
      const endpoint = possibleEndpoints[i];
      console.log(`Trying endpoint ${i + 1}/${possibleEndpoints.length}:`, endpoint.url, `with ${endpoint.method}`);
      
      try {
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        console.log(`Endpoint ${i + 1} Response Status:`, response.status);
        console.log(`Endpoint ${i + 1} Response Headers:`, response.headers);

        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
          console.log(`Endpoint ${i + 1} not OK, status:`, response.status);
          const errorText = await response.text();
          console.log(`Endpoint ${i + 1} Error Response Text:`, errorText);
          continue; // Try next endpoint
        }

        // Check content type before parsing JSON
        const contentType = response.headers.get('content-type');
        console.log(`Endpoint ${i + 1} Content Type:`, contentType);
        
        let responseData;
        try {
          if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
            console.log(`Endpoint ${i + 1} Response Data (JSON):`, responseData);
          } else {
            const textData = await response.text();
            console.log(`Endpoint ${i + 1} Response Data (Text):`, textData);
            continue; // Try next endpoint
          }
        } catch (parseError) {
          console.error(`Endpoint ${i + 1} JSON Parse Error:`, parseError);
          const textData = await response.text();
          console.log(`Endpoint ${i + 1} Raw Response Text:`, textData);
          continue; // Try next endpoint
        }

        // If we get here, the endpoint worked
        console.log(`Success with endpoint: ${endpoint.url} using ${endpoint.method}`);
        return {
          success: true,
          data: responseData,
          message: 'Profile image uploaded successfully'
        };

      } catch (endpointError) {
        console.log(`Endpoint ${i + 1} error:`, endpointError.message);
        continue; // Try next endpoint
      }
    }

    // If all endpoints failed
    return {
      success: false,
      error: 'All upload endpoints failed. Please check server configuration.',
      data: 'No working endpoint found'
    };

  } catch (error) {
    console.error('Error uploading profile image:', error);
    return {
      success: false,
      error: error.message || 'Network error occurred while uploading image'
    };
  }
};

// Alternative upload method using JSON with base64 data
export const uploadProfileImageAlternative = async (patientId, imageUri) => {
  try {
    console.log('=== ALTERNATIVE PROFILE IMAGE UPLOAD (JSON) ===');
    console.log('Patient ID:', patientId);
    console.log('Image URI:', imageUri);
    
    // Try to convert image to base64 for server upload
    let base64Image = null;
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const reader = new FileReader();
      base64Image = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      console.log('Base64 image created, length:', base64Image.length);
    } catch (base64Error) {
      console.log('Failed to convert to base64:', base64Error);
    }
    
    // Try different approaches
    const jsonData = {
      patient_id: patientId,
      profile_image: base64Image || imageUri, // Send base64 if available, otherwise local URI
      action: 'update_profile_image'
    };

    console.log('JSON Data:', { ...jsonData, profile_image: base64Image ? `[base64 data ${base64Image.length} chars]` : imageUri });

    // Try different possible endpoints with JSON and different methods
    const possibleEndpoints = [
      { url: `${BASE_URL}patient-update`, method: 'PUT' },
      { url: `${BASE_URL}patient-update`, method: 'POST' },
      { url: `${BASE_URL}upload-profile-image`, method: 'POST' },
      { url: `${BASE_URL}patient-image-upload`, method: 'POST' },
      { url: `${BASE_URL}profile-image`, method: 'POST' },
      { url: `${BASE_URL}upload-image`, method: 'POST' },
    ];

    for (let i = 0; i < possibleEndpoints.length; i++) {
      const endpoint = possibleEndpoints[i];
      console.log(`Trying JSON endpoint ${i + 1}/${possibleEndpoints.length}:`, endpoint.url, `with ${endpoint.method}`);
      
      try {
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonData),
        });

        console.log(`JSON Endpoint ${i + 1} Response Status:`, response.status);
        console.log(`JSON Endpoint ${i + 1} Response Headers:`, response.headers);
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          console.log(`JSON Endpoint ${i + 1} Content Type:`, contentType);
          
          if (contentType && contentType.includes('application/json')) {
            const responseData = await response.json();
            console.log(`Success with JSON endpoint: ${endpoint.url} using ${endpoint.method}`);
            return {
              success: true,
              data: responseData,
              message: 'Profile image uploaded successfully'
            };
          } else {
            const textData = await response.text();
            console.log(`JSON Endpoint ${i + 1} Response Text:`, textData);
            // If it's not JSON but response is OK, it might still be successful
            if (textData.includes('success') || textData.includes('uploaded')) {
              return {
                success: true,
                data: { message: textData },
                message: 'Profile image uploaded successfully'
              };
            }
          }
        } else {
          console.log(`JSON Endpoint ${i + 1} failed with status:`, response.status);
          const errorText = await response.text();
          console.log(`JSON Endpoint ${i + 1} Error Text:`, errorText);
        }
      } catch (endpointError) {
        console.log(`JSON Endpoint ${i + 1} error:`, endpointError.message);
      }
    }

    return {
      success: false,
      error: 'All JSON upload endpoints failed. Please check server configuration.',
      data: 'No working JSON endpoint found'
    };

  } catch (error) {
    console.error('Error uploading profile image (JSON alternative):', error);
    return {
      success: false,
      error: error.message || 'Network error occurred while uploading image'
    };
  }
};

import { HOSPITAL_TYPES_URL, basicAuth } from '../config/config.js';

// Get all hospital/clinic types from API
export const fetchHospitalTypes = async () => {
  try {
    console.log('Fetching hospital types from API:', HOSPITAL_TYPES_URL);
    
    const response = await fetch(HOSPITAL_TYPES_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: basicAuth,
      },
    });

    console.log('Hospital types response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Hospital types API response:', data);
    
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error fetching hospital types:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

// Get hospital types with images mapping
export const getHospitalTypesWithImages = async () => {
  try {
    const result = await fetchHospitalTypes();
    
    if (!result.success) {
      // Return fallback data if API fails
      return getFallbackHospitalTypes();
    }

    // Map API data to include images
    const hospitalTypesWithImages = result.data.map((type, index) => ({
      id: type.id || index,
      name: type.name || type.title || 'Unknown',
      image: getHospitalTypeImage(type.name || type.title),
      color: getHospitalTypeColor(type.name || type.title),
      description: type.description || '',
      ...type, // Include all original data
    }));

    return {
      success: true,
      data: hospitalTypesWithImages,
    };
  } catch (error) {
    console.error('Error getting hospital types with images:', error);
    return {
      success: false,
      error: error.message,
      data: getFallbackHospitalTypes(),
    };
  }
};

// Get hospital type image based on name
const getHospitalTypeImage = (typeName) => {
  const imageMap = {
    'Hospitals': require('../Assets/Images/hospital.png'),
    'Clinics': require('../Assets/Images/clinic.png'),
    'Multi Specialty Clinic': require('../Assets/Images/multi.png'),
    'Multi Specialty': require('../Assets/Images/multi.png'),
    'General Hospital': require('../Assets/Images/hospital.png'),
    'Specialty Clinic': require('../Assets/Images/clinic.png'),
  };
  
  return imageMap[typeName] || require('../Assets/Images/hospital.png');
};

// Get hospital type color based on name
const getHospitalTypeColor = (typeName) => {
  const colorMap = {
    'Hospitals': '#BDE4F4',
    'Clinics': '#F8C8D5',
    'Multi Specialty Clinic': '#F1B7B2',
    'Multi Specialty': '#F1B7B2',
    'General Hospital': '#BDE4F4',
    'Specialty Clinic': '#F8C8D5',
  };
  
  return colorMap[typeName] || '#BDE4F4';
};

// Fallback hospital types if API fails
const getFallbackHospitalTypes = () => {
  return [
    {
      id: 1,
      name: 'Hospitals',
      image: require('../Assets/Images/hospital.png'),
      color: '#BDE4F4',
    },
    {
      id: 2,
      name: 'Clinics',
      image: require('../Assets/Images/clinic.png'),
      color: '#F8C8D5',
    },
    {
      id: 3,
      name: 'Multi Specialty\nClinic',
      image: require('../Assets/Images/multi.png'),
      color: '#F1B7B2',
    },
  ];
};

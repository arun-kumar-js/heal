import { CATEGORIES_URL, basicAuth } from '../config/config.js';

// Get all categories/departments from API
export const fetchCategories = async () => {
  try {
    console.log('Fetching categories from API:', CATEGORIES_URL);
    
    const response = await fetch(CATEGORIES_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: basicAuth,
      },
    });

    console.log('Categories response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Categories API response:', data);
    
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

// Get categories with icons mapping
export const getCategoriesWithIcons = async () => {
  try {
    const result = await fetchCategories();
    
    if (!result.success) {
      // Return fallback data if API fails
      return getFallbackCategories();
    }

    // Map API data to include icons
    const categoriesWithIcons = result.data.map((category, index) => ({
      id: category.id || index,
      name: category.name || category.title || 'Unknown',
      icon: getCategoryIcon(category.name || category.title),
      color: getCategoryColor(category.name || category.title),
      description: category.description || '',
      ...category, // Include all original data
    }));

    return {
      success: true,
      data: categoriesWithIcons,
    };
  } catch (error) {
    console.error('Error getting categories with icons:', error);
    return {
      success: false,
      error: error.message,
      data: getFallbackCategories(),
    };
  }
};

// Get category icon based on name
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'Cardiology': require('../Assets/Images/heart.png'),
    'Neurology': require('../Assets/Images/brain.png'),
    'Orthopedics': require('../Assets/Images/bone.png'),
    'Pediatrics': require('../Assets/Images/baby.png'),
    'Gynecology': require('../Assets/Images/gyneric.png'),
    'Dermatology': require('../Assets/Images/skin.png'),
    'Ophthalmology': require('../Assets/Images/eye.png'),
    'ENT': require('../Assets/Images/ear.png'),
    'Psychiatry': require('../Assets/Images/brain.png'),
    'General Medicine': require('../Assets/Images/medical.png'),
    'View All': require('../Assets/Images/view_all.png'),
  };
  
  return iconMap[categoryName] || require('../Assets/Images/medical.png');
};

// Get category color based on name
const getCategoryColor = (categoryName) => {
  const colorMap = {
    'Cardiology': '#FF6B6B',
    'Neurology': '#4ECDC4',
    'Orthopedics': '#45B7D1',
    'Pediatrics': '#96CEB4',
    'Gynecology': '#FFEAA7',
    'Dermatology': '#DDA0DD',
    'Ophthalmology': '#98D8C8',
    'ENT': '#F7DC6F',
    'Psychiatry': '#BB8FCE',
    'General Medicine': '#85C1E9',
  };
  
  return colorMap[categoryName] || '#85C1E9';
};

// Fallback categories if API fails
const getFallbackCategories = () => {
  return [
    { id: 1, name: 'Cardiology', icon: require('../Assets/Images/heart.png'), color: '#FF6B6B' },
    { id: 2, name: 'Neurology', icon: require('../Assets/Images/brain.png'), color: '#4ECDC4' },
    { id: 3, name: 'Orthopedics', icon: require('../Assets/Images/bone.png'), color: '#45B7D1' },
    { id: 4, name: 'Pediatrics', icon: require('../Assets/Images/baby.png'), color: '#96CEB4' },
    { id: 5, name: 'Gynecology', icon: require('../Assets/Images/gyneric.png'), color: '#FFEAA7' },
    { id: 6, name: 'View All', icon: require('../Assets/Images/view_all.png'), color: '#85C1E9', viewAll: true },
  ];
};

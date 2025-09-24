import { GOOGLE_MAPS_ANDROID_API_KEY, GOOGLE_MAPS_IOS_API_KEY } from '../config/config';
import { Platform } from 'react-native';

class GeocodingService {
  constructor() {
    this.apiKey = Platform.OS === 'ios' ? GOOGLE_MAPS_IOS_API_KEY : GOOGLE_MAPS_ANDROID_API_KEY;
  }

  // Reverse geocoding - convert coordinates to address
  async getAddressFromCoordinates(latitude, longitude) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}`;
      
      console.log('Reverse geocoding URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Geocoding response:', data);
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        
        // Extract different parts of the address
        const addressComponents = result.address_components;
        let areaName = '';
        let cityName = '';
        let stateName = '';
        let countryName = '';
        
        // Parse address components
        addressComponents.forEach(component => {
          const types = component.types;
          
          if (types.includes('locality')) {
            cityName = component.long_name;
          } else if (types.includes('administrative_area_level_2')) {
            areaName = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            stateName = component.long_name;
          } else if (types.includes('country')) {
            countryName = component.long_name;
          }
        });
        
        // Create a readable location string
        let locationString = '';
        if (areaName) {
          locationString = areaName;
        } else if (cityName) {
          locationString = cityName;
        } else if (stateName) {
          locationString = stateName;
        } else {
          locationString = result.formatted_address.split(',')[0];
        }
        
        return {
          success: true,
          areaName: locationString,
          fullAddress: result.formatted_address,
          city: cityName,
          state: stateName,
          country: countryName,
          coordinates: {
            latitude,
            longitude
          }
        };
      } else {
        console.error('Geocoding failed:', data.status, data.error_message);
        return {
          success: false,
          error: data.error_message || 'Geocoding failed',
          areaName: 'Unknown Location'
        };
      }
    } catch (error) {
      console.error('Geocoding service error:', error);
      return {
        success: false,
        error: error.message,
        areaName: 'Unknown Location'
      };
    }
  }

  // Get a short location name for display
  async getLocationName(latitude, longitude) {
    try {
      const result = await this.getAddressFromCoordinates(latitude, longitude);
      return result.success ? result.areaName : 'Unknown Location';
    } catch (error) {
      console.error('Error getting location name:', error);
      return 'Unknown Location';
    }
  }
}

export default new GeocodingService();

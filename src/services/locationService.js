import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';

class LocationService {
  constructor() {
    this.currentLocation = null;
  }

  // Request location permissions
  async requestLocationPermission() {
    if (Platform.OS === 'android') {
      try {
        // First check if permission is already granted
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        
        if (hasPermission) {
          console.log('Location permission already granted');
          return true;
        }

        console.log('Requesting location permission...');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message: 'Healto needs access to your location to find nearby hospitals and clinics. This helps us show you the closest healthcare facilities.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
          }
        );
        
        console.log('Permission result:', granted);
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          console.log('Location permission denied');
          Alert.alert(
            'Permission Denied',
            'Location permission is required to find nearby hospitals. Please enable it in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
          return false;
        } else {
          console.log('Location permission denied permanently');
          Alert.alert(
            'Permission Required',
            'Location access is required for this feature. Please enable it in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
          return false;
        }
      } catch (err) {
        console.error('Permission request error:', err);
        return false;
      }
    }
    return true; // iOS permissions are handled in Info.plist
  }

  // Get current location
  async getCurrentLocation() {
    try {
      console.log('Getting current location...');
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        console.log('Permission not granted, cannot get location');
        return null;
      }

      return new Promise((resolve, reject) => {
        console.log('Requesting location from device...');
        Geolocation.getCurrentPosition(
          (position) => {
            console.log('Location received:', position);
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            };
            this.currentLocation = location;
            console.log('Location stored:', location);
            resolve(location);
          },
          (error) => {
            console.error('Location error:', error);
            let errorMessage = 'Unable to get your location.';
            
            switch (error.code) {
              case 1:
                errorMessage = 'Location permission denied. Please enable location access in Settings.';
                break;
              case 2:
                errorMessage = 'Location unavailable. Please check your GPS settings.';
                break;
              case 3:
                errorMessage = 'Location request timed out. Please try again.';
                break;
            }
            
            Alert.alert('Location Error', errorMessage, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Try Again', onPress: () => this.getCurrentLocation() }
            ]);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 10000,
          }
        );
      });
    } catch (error) {
      console.error('Location service error:', error);
      return null;
    }
  }

  // Watch location changes
  watchLocation(callback) {
    return Geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        this.currentLocation = location;
        callback(location);
      },
      (error) => {
        console.error('Watch location error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
      }
    );
  }

  // Stop watching location
  stopWatchingLocation(watchId) {
    Geolocation.clearWatch(watchId);
  }

  // Get cached location
  getCachedLocation() {
    return this.currentLocation;
  }

  // Calculate distance between two coordinates
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // Format distance for display
  formatDistance(distance) {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else {
      return `${distance.toFixed(1)}km`;
    }
  }
}

export default new LocationService();
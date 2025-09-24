import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import LocationService from '../services/locationService';

const PermissionTestScreen = () => {
  const [permissionStatus, setPermissionStatus] = useState('Unknown');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    if (Platform.OS === 'android') {
      try {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        setPermissionStatus(hasPermission ? 'Granted' : 'Denied');
        console.log('Permission status:', hasPermission ? 'Granted' : 'Denied');
      } catch (error) {
        console.error('Error checking permission:', error);
        setPermissionStatus('Error');
      }
    } else {
      setPermissionStatus('iOS - Check Info.plist');
    }
  };

  const requestPermissionDirectly = async () => {
    if (Platform.OS === 'android') {
      try {
        setLoading(true);
        console.log('Requesting permission directly...');
        
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Test',
            message: 'This is a direct permission request test for Healto app.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
          }
        );
        
        console.log('Direct permission result:', granted);
        setPermissionStatus(granted);
        
        Alert.alert(
          'Permission Result',
          `Permission status: ${granted}`,
          [{ text: 'OK' }]
        );
      } catch (error) {
        console.error('Direct permission error:', error);
        Alert.alert('Error', 'Failed to request permission');
      } finally {
        setLoading(false);
      }
    }
  };

  const testLocationService = async () => {
    setLoading(true);
    try {
      console.log('Testing location service...');
      const currentLocation = await LocationService.getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        Alert.alert(
          'Location Success',
          `Lat: ${currentLocation.latitude.toFixed(6)}\nLng: ${currentLocation.longitude.toFixed(6)}`
        );
      } else {
        Alert.alert('Location Failed', 'Could not get location');
      }
    } catch (error) {
      console.error('Location test error:', error);
      Alert.alert('Error', 'Location test failed');
    } finally {
      setLoading(false);
    }
  };

  const openSettings = () => {
    if (Platform.OS === 'android') {
      import('react-native').then(({ Linking }) => {
        Linking.openSettings();
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔐 Permission Test</Text>
      <Text style={styles.subtitle}>Debug Location Permissions</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Permission Status:</Text>
        <Text style={[
          styles.statusText,
          permissionStatus === 'Granted' ? styles.granted : 
          permissionStatus === 'Denied' ? styles.denied : styles.unknown
        ]}>
          {permissionStatus}
        </Text>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={checkPermissionStatus}>
          <Text style={styles.buttonText}>🔍 Check Permission Status</Text>
        </TouchableOpacity>

        {Platform.OS === 'android' && (
          <TouchableOpacity style={styles.button} onPress={requestPermissionDirectly}>
            <Text style={styles.buttonText}>📱 Request Permission Directly</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={testLocationService}>
          <Text style={styles.buttonText}>📍 Test Location Service</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.settingsButton]} onPress={openSettings}>
          <Text style={styles.buttonText}>⚙️ Open Settings</Text>
        </TouchableOpacity>
      </View>

      {location && (
        <View style={styles.locationInfo}>
          <Text style={styles.label}>📍 Location Data:</Text>
          <Text style={styles.coordinates}>
            Lat: {location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.coordinates}>
            Lng: {location.longitude.toFixed(6)}
          </Text>
          <Text style={styles.coordinates}>
            Accuracy: {location.accuracy.toFixed(0)}m
          </Text>
        </View>
      )}

      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>🐛 Debug Info:</Text>
        <Text style={styles.debugText}>Platform: {Platform.OS}</Text>
        <Text style={styles.debugText}>Check console logs for detailed info</Text>
        <Text style={styles.debugText}>Make sure location is enabled on device</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  granted: {
    color: '#34C759',
  },
  denied: {
    color: '#FF3B30',
  },
  unknown: {
    color: '#FF9500',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsButton: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  coordinates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  debugContainer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#856404',
  },
  debugText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 5,
  },
});

export default PermissionTestScreen;

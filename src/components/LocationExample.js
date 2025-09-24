import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LocationService from '../services/locationService';

const LocationExample = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [watchId, setWatchId] = useState(null);

  const getLocation = async () => {
    setLoading(true);
    try {
      const currentLocation = await LocationService.getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        Alert.alert(
          'Location Found',
          `Lat: ${currentLocation.latitude.toFixed(6)}\nLng: ${currentLocation.longitude.toFixed(6)}`
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWatching = () => {
    const id = LocationService.watchLocation((newLocation) => {
      setLocation(newLocation);
      console.log('Location updated:', newLocation);
    });
    setWatchId(id);
  };

  const stopWatching = () => {
    if (watchId) {
      LocationService.stopWatchingLocation(watchId);
      setWatchId(null);
    }
  };

  useEffect(() => {
    return () => {
      if (watchId) {
        LocationService.stopWatchingLocation(watchId);
      }
    };
  }, [watchId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Service Test</Text>
      
      {loading && <ActivityIndicator size="large" color="#007AFF" />}
      
      {location && (
        <View style={styles.locationInfo}>
          <Text style={styles.label}>Current Location:</Text>
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

      <TouchableOpacity style={styles.button} onPress={getLocation}>
        <Text style={styles.buttonText}>Get Current Location</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]} 
        onPress={watchId ? stopWatching : startWatching}
      >
        <Text style={styles.buttonText}>
          {watchId ? 'Stop Watching' : 'Start Watching Location'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  locationInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LocationExample;

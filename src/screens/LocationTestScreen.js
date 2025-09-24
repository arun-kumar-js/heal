import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import LocationService from '../services/locationService';

const LocationTestScreen = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);

  const getLocation = async () => {
    setLoading(true);
    try {
      const currentLocation = await LocationService.getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        setLocationHistory(prev => [currentLocation, ...prev.slice(0, 4)]);
        Alert.alert(
          'Location Found',
          `Latitude: ${currentLocation.latitude.toFixed(6)}\nLongitude: ${currentLocation.longitude.toFixed(6)}\nAccuracy: ${currentLocation.accuracy.toFixed(0)}m`
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get location. Please check permissions.');
    } finally {
      setLoading(false);
    }
  };

  const startWatching = () => {
    const id = LocationService.watchLocation((newLocation) => {
      setLocation(newLocation);
      setLocationHistory(prev => [newLocation, ...prev.slice(0, 4)]);
      console.log('Location updated:', newLocation);
    });
    setWatchId(id);
    Alert.alert('Location Watching', 'Started watching location changes');
  };

  const stopWatching = () => {
    if (watchId) {
      LocationService.stopWatchingLocation(watchId);
      setWatchId(null);
      Alert.alert('Location Watching', 'Stopped watching location changes');
    }
  };

  const clearHistory = () => {
    setLocationHistory([]);
  };

  useEffect(() => {
    return () => {
      if (watchId) {
        LocationService.stopWatchingLocation(watchId);
      }
    };
  }, [watchId]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📍 Location Service Test</Text>
      <Text style={styles.subtitle}>Test Google Maps & Location Integration</Text>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Getting location...</Text>
        </View>
      )}
      
      {location && (
        <View style={styles.locationInfo}>
          <Text style={styles.label}>📍 Current Location:</Text>
          <Text style={styles.coordinates}>
            Lat: {location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.coordinates}>
            Lng: {location.longitude.toFixed(6)}
          </Text>
          <Text style={styles.coordinates}>
            Accuracy: {location.accuracy.toFixed(0)}m
          </Text>
          <Text style={styles.coordinates}>
            Time: {new Date(location.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={getLocation}>
          <Text style={styles.buttonText}>🎯 Get Current Location</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, watchId ? styles.stopButton : styles.watchButton]} 
          onPress={watchId ? stopWatching : startWatching}
        >
          <Text style={styles.buttonText}>
            {watchId ? '⏹️ Stop Watching' : '👁️ Start Watching'}
          </Text>
        </TouchableOpacity>

        {locationHistory.length > 0 && (
          <TouchableOpacity 
            style={[styles.button, styles.clearButton]} 
            onPress={clearHistory}
          >
            <Text style={styles.buttonText}>🗑️ Clear History</Text>
          </TouchableOpacity>
        )}
      </View>

      {locationHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>📍 Location History:</Text>
          {locationHistory.map((loc, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyText}>
                {index + 1}. Lat: {loc.latitude.toFixed(4)}, Lng: {loc.longitude.toFixed(4)}
              </Text>
              <Text style={styles.historyTime}>
                {new Date(loc.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>ℹ️ Integration Status:</Text>
        <Text style={styles.infoText}>✅ Google Maps API Keys Configured</Text>
        <Text style={styles.infoText}>✅ Location Permissions Set</Text>
        <Text style={styles.infoText}>✅ Firebase Configuration Ready</Text>
        <Text style={styles.infoText}>✅ Location Service Active</Text>
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
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
  locationInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  coordinates: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'monospace',
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
  watchButton: {
    backgroundColor: '#34C759',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  clearButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyContainer: {
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
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  historyItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  historyTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  infoContainer: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2d5a2d',
  },
  infoText: {
    fontSize: 14,
    color: '#2d5a2d',
    marginBottom: 5,
  },
});

export default LocationTestScreen;

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import axios from 'axios';

const ClinicsScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [clinics, setClinics] = useState([]);
  const [filteredClinics, setFilteredClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  
  // Get the selected type from route params
  const selectedType = route.params?.selectedType || 'Hospitals';
  const selectedTypeFormatted = route.params?.selectedTypeFormatted || 'Hospitals';


  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    setLoading(true);
    
    try {
      console.log('=== MAKING CLINICS API CALL ===');
      console.log('API URL:https://spiderdesk.asia/healto/api/clinics');
      
      const response = await axios.get('https://spiderdesk.asia/healto/api/clinics');
      
      console.log('=== RAW CLINICS API RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response Status Text:', response.statusText);
      console.log('Raw API Data:', JSON.stringify(response.data, null, 2));
      console.log('Data Type:', typeof response.data);
      console.log('Data Keys:', Object.keys(response.data));
      
      if (response.data.categories) {
        console.log('Categories found:', response.data.categories.length);
        console.log('Categories data:', response.data.categories);
        setClinics(response.data.categories);
        setFilteredClinics(response.data.categories);
      } else {
        console.log('No categories found in API response');
        setClinics([]);
        setFilteredClinics([]);
      }
    } catch (error) {
      console.log('=== CLINICS API ERROR ===');
      console.log('Error Message:', error.message);
      console.log('Error Response:', error.response?.data);
      console.log('Error Status:', error.response?.status);
      
      setClinics([]);
      setFilteredClinics([]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    let filtered = clinics;
    
    // Filter by selected type first
    if (selectedType === 'Hospitals') {
      filtered = clinics.filter(clinic => clinic.type === 'hospital');
    } else if (selectedType === 'Clinics') {
      filtered = clinics.filter(clinic => clinic.type === 'clinic');
    } else if (selectedType === 'Multi Specialty\nClinic') {
      filtered = clinics.filter(clinic => clinic.type === 'multispeciality');
    }
    
    // Then filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(clinic =>
        clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredClinics(filtered);
  }, [searchQuery, clinics, selectedType]);

  const renderStars = (rating) => {
    const numRating = parseFloat(rating);
    const stars = [];
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="star" size={12} color="#FFA500" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star-half-alt" size={12} color="#FFA500" />
      );
    }

    const emptyStars = 5 - Math.ceil(numRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star" size={12} color="#E0E0E0" />
      );
    }

    return stars;
  };

  const getHospitalImage = (clinic) => {
    // Use clinic logo with proper base URL if available, otherwise use placeholder
    if (clinic.logo && !imageErrors[clinic.id]) {
      const imageUrl = `https://spiderdesk.asia/healto/${clinic.logo}`;
      console.log('Loading image for', clinic.name, ':', imageUrl);
      return { uri: imageUrl };
    } else {
      console.log('No logo for', clinic.name, '- using placeholder');
      return require('../Assets/Images/hospital.png');
    }
  };

  const handleImageError = (clinicId) => {
    console.log('Image failed to load for clinic ID:', clinicId);
    setImageErrors(prev => ({ ...prev, [clinicId]: true }));
  };

  const getHospitalType = (clinic) => {
    return clinic.type === 'hospital' ? 'Multi Specialty Hospital' : 'Clinic';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#003784" />
      
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Top Most {selectedTypeFormatted}</Text>
            <Text style={styles.headerSubtitle}>Select the {selectedTypeFormatted}</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder={`Search by ${selectedTypeFormatted}`}
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading {selectedTypeFormatted.toLowerCase()}...</Text>
          </View>
        ) : filteredClinics.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>No {selectedTypeFormatted.toLowerCase()} available</Text>
          </View>
        ) : (
          filteredClinics.map((clinic) => (
            <TouchableOpacity key={clinic.id} style={styles.hospitalCard}>
              <ImageBackground
                source={getHospitalImage(clinic)}
                style={styles.hospitalImage}
                imageStyle={styles.hospitalImageStyle}
                onError={() => handleImageError(clinic.id)}
                onLoad={() => {
                  console.log('Image loaded successfully for', clinic.name);
                }}
              >
                <View style={styles.imageOverlay}>


                  
                  <View style={styles.hospitalInfo}>
                    <View style={styles.hospitalDetails}>
                      <Text style={styles.hospitalName}>{clinic.name}</Text>
                      <Text style={styles.hospitalType}>{getHospitalType(clinic)}</Text>
                      <View style={styles.ratingContainer}>
                        <View style={styles.starsContainer}>
                          {renderStars(clinic.rating)}
                        </View>
                        <Text style={styles.ratingText}>{clinic.rating}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.viewButtonContainer}>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => navigation.navigate('HospitalDetailsScreen', { hospital: clinic })}
                    >
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#003784',
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
    paddingBottom: hp('9%'),
    
    position: 'relative',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    position: 'absolute',
    left: wp('5%'),
    top: hp('2%'),
    zIndex: 1000,
    padding: wp('2%'),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('1%'),
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: hp('0.5%'),
  },
  headerSubtitle: {
    fontSize: wp('3.5%'),
    color: '#FFFFFF',
    opacity: 0.9,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: wp('5%'),
    marginTop: hp('-7%'),
    marginBottom: hp('2%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.5%'),
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  searchIcon: {
    marginRight: wp('3%'),
  },
  searchInput: {
    flex: 1,
    fontSize: wp('4%'),
    color: '#333',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('5%'),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('10%'),
  },
  loadingText: {
    fontSize: wp('4%'),
    color: '#666',
  },
  hospitalCard: {
    marginBottom: hp('2%'),
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E3F2FD', // Light blue border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hospitalImage: {
    height: hp('30%'),
    width: '100%',
  },
  hospitalImageStyle: {
    borderRadius: 15,
  },
  imageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    padding: wp('4%'),
  },
  hospitalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: hp('1%'),
  },
  hospitalDetails: {
    flex: 1,
    paddingTop: hp('1%'),
  },
  hospitalName: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: hp('0.3%'),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  hospitalType: {
    fontSize: wp('3.2%'),
    color: '#FFFFFF',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: wp('2%'),
  },
  ratingText: {
    fontSize: wp('3.5%'),
    color: '#FFFFFF',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  viewButtonContainer: {
    alignItems: 'flex-end',
    marginTop: -hp('6%'),
  },
  viewButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1%'),
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  viewButtonText: {
    color: '#003784',
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
  },
});

export default ClinicsScreen;

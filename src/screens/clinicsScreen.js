import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
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
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import axios from 'axios';

const ClinicsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [clinics, setClinics] = useState([]);
  const [filteredClinics, setFilteredClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});


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
    if (searchQuery.trim() === '') {
      setFilteredClinics(clinics);
    } else {
      const filtered = clinics.filter(clinic =>
        clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClinics(filtered);
    }
  }, [searchQuery, clinics]);

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#003784" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Top Most Hospitals</Text>
            <Text style={styles.headerSubtitle}>Select the Hospital</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder="Search by Hospitals"
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
            <Text style={styles.loadingText}>Loading hospitals...</Text>
          </View>
        ) : filteredClinics.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>No hospitals available</Text>
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
                    </View>
                    <View style={styles.ratingContainer}>
                      <View style={styles.starsContainer}>
                        {renderStars(clinic.rating)}
                      </View>
                      <Text style={styles.ratingText}>{clinic.rating}</Text>
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
    paddingBottom: hp('2%'),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('1%'),
  },
  backButton: {
    marginRight: wp('4%'),
  },
  headerTextContainer: {
    flex: 1,
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
    marginVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    paddingBottom: hp('15%'),
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  },
  hospitalName: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: hp('0.5%'),
  },
  hospitalType: {
    fontSize: wp('3.5%'),
    color: '#FFFFFF',
    opacity: 0.9,
  },
  ratingContainer: {
    alignItems: 'flex-end',
    marginRight: wp('2%'),
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: hp('0.3%'),
  },
  ratingText: {
    fontSize: wp('3.5%'),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  viewButtonContainer: {
    alignItems: 'flex-end',
  },
  viewButton: {
    backgroundColor: '#003784',
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('1.2%'),
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
  },
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#003784',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: hp('1.5%'),
    paddingBottom: Platform.OS === 'ios' ? hp('3%') : hp('1.5%'),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  activeNavItem: {
    // Active state styling
  },
  navIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    borderRadius: 20,
    marginBottom: hp('0.5%'),
  },
  navText: {
    color: '#FFFFFF',
    fontSize: wp('3%'),
    marginTop: hp('0.5%'),
  },
});

export default ClinicsScreen;

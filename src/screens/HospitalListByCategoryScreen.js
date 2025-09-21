import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { PoppinsFonts } from '../config/fonts';

const HospitalListByCategoryScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [paramsData, setParamsData] = useState({});
  // Get the selected category from route params
  const selectedCategory = route.params?.selectedCategory || '';
  const hospitalsData = route.params?.hospitals || [];

  useEffect(() => {
    if (route.params) {
      setParamsData(route.params);
    }
  }, [route.params]);

  // Fetch hospitals by selectedCategory when it changes
  useEffect(() => {
    const fetchHospitalsByCategory = async () => {
      if (!selectedCategory) {
        console.log('No selectedCategory provided, skipping API call');
        return;
      }
      
      console.log('Fetching hospitals for category:', selectedCategory);
      setLoading(true);
      try {
        const response = await axios.get('https://spiderdesk.asia/healto/api/specialization/by/clinic', {
          params: {
            specialization_name: selectedCategory,
          },
        });
        
        console.log('Hospitals API response:', response.data);
        if (response.data && Array.isArray(response.data)) {
          setHospitals(response.data);
          setFilteredHospitals(response.data);
        } else {
          setHospitals([]);
          setFilteredHospitals([]);
        }
      } catch (error) {
        console.error('Error fetching hospitals by category:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitalsByCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  useEffect(() => {
    if (hospitalsData && hospitalsData.length > 0) {
      setHospitals(hospitalsData);
      setFilteredHospitals(hospitalsData);
    }
  }, [hospitalsData]);

  useEffect(() => {
    let filtered = hospitals;
    
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = hospitals.filter(hospital =>
        hospital.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredHospitals(filtered);
  }, [searchQuery, hospitals]);

  const renderStars = (rating) => {
    const numRating = parseFloat(rating) || 0;
    const stars = [];
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;

    // Ensure we have valid numbers
    if (isNaN(numRating) || numRating < 0) {
      // Return 5 empty stars for invalid ratings
      for (let i = 0; i < 5; i++) {
        stars.push(
          <Icon key={`empty-${i}`} name="star" size={12} color="#E0E0E0" />
        );
      }
      return stars;
    }

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

  const getHospitalImage = (hospital) => {
    // Use hospital logo with proper base URL if available, otherwise use placeholder
    if (hospital.logo && !imageErrors[hospital.id]) {
      const imageUrl = `https://spiderdesk.asia/healto/${hospital.logo}`;
      return { uri: imageUrl };
    } else {
      return require('../Assets/Images/hospital.png');
    }
  };

  const handleImageError = (hospitalId) => {
    setImageErrors(prev => ({ ...prev, [hospitalId]: true }));
  };

  const getHospitalType = (hospital) => {
    if (!hospital || !hospital.type) {
      return 'Medical Facility';
    }
    return hospital.type === 'hospital' ? 'Multi Specialty Hospital' : 'Clinic';
  };

  const handleHospitalPress = (hospital) => {
    if (!hospital) {
      console.warn('Hospital object is null or undefined');
      return;
    }
    
    
    navigation.navigate('DoctorBySpc', { 
      hospital: hospital,
      selectedCategory: selectedCategory,
      clinicId: hospital.id,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6EFD" />
      
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
            <Text style={styles.headerTitle}>{selectedCategory} Hospitals</Text>
            <Text style={styles.headerSubtitle}>Select the Hospital</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder="Search hospitals..."
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
            <ActivityIndicator size="large" color="#0D6EFD" />
            <Text style={styles.loadingText}>Loading hospitals...</Text>
          </View>
        ) : filteredHospitals.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Icon name="hospital" size={60} color="#0D6EFD" />
            <Text style={styles.noResultsTitle}>
              No {selectedCategory} hospitals found
            </Text>
            <Text style={styles.noResultsSubtitle}>
              We couldn't find any hospitals specializing in {selectedCategory.toLowerCase()}.
            </Text>
          </View>
        ) : (
          filteredHospitals.map((hospital) => {
            if (!hospital || !hospital.id) {
              console.warn('Invalid hospital object:', hospital);
              return null;
            }
            return (
            <TouchableOpacity 
              key={hospital.id} 
              style={styles.hospitalCard}
              onPress={() => handleHospitalPress(hospital)}
            >
              <ImageBackground
                source={getHospitalImage(hospital)}
                style={styles.hospitalImage}
                imageStyle={styles.hospitalImageStyle}
                onError={() => handleImageError(hospital.id)}
                onLoad={() => {}}
              >
                <View style={styles.imageOverlay}>
                  <View style={styles.hospitalInfo}>
                    <View style={styles.hospitalDetails}>
                      <Text style={styles.hospitalName}>{hospital.name || 'Unknown Hospital'}</Text>
                      <Text style={styles.hospitalType}>{getHospitalType(hospital)}</Text>
                      <View style={styles.ratingContainer}>
                        <View style={styles.starsContainer}>
                          {renderStars(hospital.rating)}
                        </View>
                        <Text style={styles.ratingText}>{hospital.rating ? String(hospital.rating) : 'N/A'}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.viewButtonContainer}>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => handleHospitalPress(hospital)}
                    >
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
            );
          })
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
    backgroundColor: '#0D6EFD',
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
    fontFamily: PoppinsFonts.Bold,
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
    marginTop: hp('2%'),
    fontSize: wp('4%'),
    color: '#666',
    fontFamily: PoppinsFonts.Regular,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('10%'),
    paddingHorizontal: wp('10%'),
  },
  noResultsTitle: {
    fontSize: wp('5%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#333',
    textAlign: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
  },
  noResultsSubtitle: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
    lineHeight: wp('5%'),
  },
  hospitalCard: {
    marginBottom: hp('2%'),
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E3F2FD',
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
    fontFamily: PoppinsFonts.Bold,
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
    fontFamily: PoppinsFonts.Bold,
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
    color: '#0D6EFD',
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Bold,
  },
});

export default HospitalListByCategoryScreen;

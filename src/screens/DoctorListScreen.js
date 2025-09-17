import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchQuery, clearFilters, fetchDoctors } from '../store/slices/doctorsSlice';
import { 
  selectFilteredDoctors, 
  selectDoctorsLoading, 
  selectDoctorsError, 
  selectSelectedCategory,
  selectSearchQuery 
} from '../store/selectors/doctorsSelectors';
import BackButton from '../components/BackButton';
import { getOTPResponse, getFormattedUserProfile } from '../utils/otpStorage';

const IMAGE_BASE_URL = 'https://spiderdesk.asia/healto/';

const DoctorListScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const doctors = useSelector(selectFilteredDoctors);
  const loading = useSelector(selectDoctorsLoading);
  const error = useSelector(selectDoctorsError);
  const selectedCategory = useSelector(selectSelectedCategory);
  const searchQuery = useSelector(selectSearchQuery);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    // Fetch doctors data when component mounts
    console.log('DoctorListScreen: Dispatching fetchDoctors...');
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    // Preload images for better performance when doctors change
    if (doctors && doctors.length > 0) {
      preloadImages(doctors);
    }
  }, [doctors]);

  // Preload images for better performance - only preload first 6 images
  const preloadImages = useCallback((doctorsList) => {
    if (!doctorsList || !Array.isArray(doctorsList)) {
      console.log('preloadImages: doctorsList is not a valid array:', doctorsList);
      return;
    }
    const doctorsToPreload = doctorsList.slice(0, 6); // Only preload first 6
    doctorsToPreload.forEach(doctor => {
      const imageSource = getDoctorImage(doctor);
      if (imageSource.uri) {
        Image.prefetch(imageSource.uri).catch(error => {
          console.log('Failed to preload image for doctor:', doctor.name, error);
        });
      }
    });
  }, []);
console.log(doctors)
  
  // Normalize specialty names to handle variations
  const normalizeSpecialtyName = (name) => {
    if (!name) return '';
    
    const normalized = name.trim().toLowerCase();
    
    // Handle common variations
    const variations = {
      'cardiology': 'Cardiology',
      'cardiac': 'Cardiology',
      'heart': 'Cardiology',
      'neurology': 'Neurology',
      'brain': 'Neurology',
      'neural': 'Neurology',
      'orthopedics': 'Orthopedics',
      'orthopedic': 'Orthopedics',
      'bone': 'Orthopedics',
      'pediatrics': 'Pediatrics',
      'pediatric': 'Pediatrics',
      'child': 'Pediatrics',
      'dermatology': 'Dermatology',
      'skin': 'Dermatology',
      'gynecology': 'Gynecology',
      'gynecological': 'Gynecology',
      'women': 'Gynecology',
      'ophthalmology': 'Ophthalmology',
      'eye': 'Ophthalmology',
      'vision': 'Ophthalmology',
      'ent': 'ENT',
      'ear nose throat': 'ENT',
      'psychiatry': 'Psychiatry',
      'mental': 'Psychiatry',
      'psychology': 'Psychiatry'
    };
    
    return variations[normalized] || name.trim();
  };

  const getDoctorSpecialty = (doctor) => {
    // First try to get specialization name from nested specialization object
    if (doctor.specialization && doctor.specialization.name) {
      return normalizeSpecialtyName(doctor.specialization.name);
    }
    
    // Map specialization_id to actual specialty names as fallback
    const specialtyMap = {
      1: 'Cardiology',
      2: 'Orthopedics', 
      3: 'Pediatrics',
      4: 'Dermatology',
      5: 'Neurology',
      6: 'General Medicine',
      7: 'Gynecology',
      8: 'Ophthalmology',
      9: 'ENT',
      10: 'Psychiatry'
    };
    
    // Use specialization_id if available, otherwise fallback to type
    if (doctor.specialization_id) {
      return specialtyMap[doctor.specialization_id] || 'General Medicine';
    }
    
    // Fallback to type-based mapping
    const typeMap = {
      'hospital': 'Cardiology',
      'clinic': 'General Medicine',
      'multispeciality': 'Multi Specialty'
    };
    return typeMap[doctor.type] || 'General Medicine';
  };

  // Use filtered doctors from Redux selector with safety check
  const filteredDoctors = doctors || [];

  const renderStars = (rating) => {
    return (
      <Icon name="star" size={12} color="#FFA500" />
    );
  };

  // Memoized image source to prevent unnecessary re-renders
  const getDoctorImage = useCallback((doctor) => {
    // Check for various possible image fields with Healto base URL
    const imageFields = [
      'profile_image',
      'image', 
      'avatar',
      'photo',
      'profile_picture',
      'doctor_image'
    ];
    
    for (const field of imageFields) {
      if (doctor[field]) {
        return { 
          uri: `${IMAGE_BASE_URL}${doctor[field]}`,
          cache: 'force-cache', // Enable caching
        };
      }
    }
    
    // Fallback to a reliable placeholder image
    return { 
      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || 'Doctor')}&size=300&background=0D6EFD&color=fff`,
      cache: 'force-cache',
    };
  }, []);

  // Handle image loading states
  const handleImageLoadStart = useCallback((doctorId) => {
    setImageLoadingStates(prev => ({ ...prev, [doctorId]: true }));
    setImageErrors(prev => ({ ...prev, [doctorId]: false }));
  }, []);

  const handleImageLoad = useCallback((doctorId) => {
    setImageLoadingStates(prev => ({ ...prev, [doctorId]: false }));
  }, []);

  const handleImageError = useCallback((doctorId) => {
    setImageLoadingStates(prev => ({ ...prev, [doctorId]: false }));
    setImageErrors(prev => ({ ...prev, [doctorId]: true }));
  }, []);

  const renderDoctorCard = ({ item: doctor, index }) => {
    const doctorId = doctor.id.toString();
    const isLoading = imageLoadingStates[doctorId];
    const hasError = imageErrors[doctorId];
    
    const handleDoctorPress = () => {
      navigation.navigate('DoctorAppointment', { doctor });
    };
    
    return (
      <TouchableOpacity 
        key={doctor.id} 
        style={styles.doctorCard}
        onPress={handleDoctorPress}
      >
        <ImageBackground
          source={getDoctorImage(doctor)}
          style={styles.doctorImage}
          imageStyle={styles.doctorImageStyle}
          onError={() => handleImageError(doctorId)}
          onLoad={() => handleImageLoad(doctorId)}
          onLoadStart={() => handleImageLoadStart(doctorId)}
        >
          {/* Loading indicator */}
          {isLoading && (
            <View style={styles.imageLoadingContainer}>
              <ActivityIndicator size="large" color="#0D6EFD" />
            </View>
          )}
          
          {/* Error state */}
          {hasError && (
            <View style={styles.imageErrorContainer}>
              <Icon name="user-md" size={40} color="#0D6EFD" />
            </View>
          )}
          
          <View style={styles.imageOverlay}>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(doctor.rating || 4.0)}
              </View>
              <Text style={styles.ratingText}>{(doctor.rating || 4.0).toFixed(1)}</Text>
            </View>
            
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpecialty}>{getDoctorSpecialty(doctor)}</Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
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
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Lets Find Your Problem?</Text>
          <Text style={styles.headerSubtitle}>Select the Doctor</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder="Search by Doctor N..."
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={(text) => dispatch(setSearchQuery(text))}
        />
      </View>

      {/* Doctors Grid */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.doctorsGridContainer}
      >
        {filteredDoctors.length > 0 ? (
          <View style={styles.doctorsGrid}>
            {filteredDoctors.map((doctor, index) => (
              renderDoctorCard({ item: doctor, index })
            ))}
          </View>
        ) : (
          <View style={styles.noResultsContainer}>
            <Icon name="user-md" size={60} color="#0D6EFD" />
            <Text style={styles.noResultsTitle}>
              {selectedCategory ? `No ${selectedCategory} specialists found` : 'No doctors found'}
            </Text>
            <Text style={styles.noResultsSubtitle}>
              {selectedCategory 
                ? `We couldn't find any ${selectedCategory.toLowerCase()} specialists matching your search.`
                : 'Try adjusting your search criteria or browse all doctors.'
              }
            </Text>
            
            {/* Debug information */}
            <Text style={styles.debugText}>
              Debug: {doctors.length} total doctors, {filteredDoctors.length} filtered
            </Text>
            <Text style={styles.debugText}>
              Category: {selectedCategory || 'None'}, Filter: {route.params?.categoryFilter ? 'Yes' : 'No'}
            </Text>
            
            {/* Show all doctors as fallback for debugging */}
            {doctors.length > 0 && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>All Available Doctors (Debug):</Text>
                {doctors.slice(0, 3).map((doctor, index) => (
                  <Text key={index} style={styles.debugDoctorText}>
                    {doctor.name} - {getDoctorSpecialty(doctor)}
                  </Text>
                ))}
                {doctors.length > 3 && (
                  <Text style={styles.debugDoctorText}>... and {doctors.length - 3} more</Text>
                )}
              </View>
            )}
          </View>
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
    paddingTop: hp('1%'),
    paddingBottom: hp('10%'),
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
  headerTextContainer: {
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('1%'),
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: hp('0.5%'),
  },
  headerSubtitle: {
    fontSize: wp('4%'),
    color: '#FFFFFF',
    opacity: 0.9,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: wp('5%'),
    marginTop: hp('-8%'),
    marginBottom: hp('4%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('.5%'),
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
  scrollView: {
    flex: 1,
  },
  doctorsGridContainer: {
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('5%'),
  },
  doctorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  doctorCard: {
    width: (wp('100%') - wp('12%')) / 2,
    height: ((wp('100%') - wp('12%')) / 2) * 1.25,
    marginBottom: hp('2%'),
    borderRadius: 15,
    overflow: 'hidden',
  },
  doctorImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  doctorImageStyle: {
    borderRadius: 15,
  },
  imageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    padding: wp('4%'),
  },
  ratingContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: wp('1%'),
  },
  ratingText: {
    fontSize: wp('3%'),
    fontWeight: 'bold',
    color: '#333',
    marginLeft: wp('1%'),
  },
  doctorInfo: {
    marginBottom: hp('1%'),
  },
  doctorName: {
    color: '#FFFFFF',
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    marginBottom: hp('0.3%'),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  doctorSpecialty: {
    color: '#FFFFFF',
    fontSize: wp('3.5%'),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    zIndex: 1,
  },
  imageErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    zIndex: 1,
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
    fontWeight: 'bold',
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
  debugText: {
    fontSize: wp('3%'),
    color: '#999',
    textAlign: 'center',
    marginTop: hp('1%'),
  },
  debugContainer: {
    marginTop: hp('3%'),
    padding: wp('4%'),
    backgroundColor: '#f8f9fa',
    borderRadius: wp('2%'),
  },
  debugTitle: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp('1%'),
  },
  debugDoctorText: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: hp('0.5%'),
  },
});

export default DoctorListScreen;

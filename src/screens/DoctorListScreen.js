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
    const numRating = parseFloat(rating) ;
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
        <View style={styles.doctorImageContainer}>
          {/* Loading indicator */}
          {isLoading && (
            <View style={styles.imageLoadingContainer}>
              <ActivityIndicator size="large" color="#0D6EFD" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}
          
          {/* Error state */}
          {hasError && (
            <View style={styles.imageErrorContainer}>
              <Icon name="user-md" size={40} color="#0D6EFD" />
              <Text style={styles.errorText}>Image unavailable</Text>
            </View>
          )}
          
          <Image
            source={getDoctorImage(doctor)}
            style={[
              styles.doctorImage,
              (isLoading || hasError) && styles.hiddenImage
            ]}
            onError={() => handleImageError(doctorId)}
            onLoad={() => handleImageLoad(doctorId)}
            onLoadStart={() => handleImageLoadStart(doctorId)}
            resizeMode="cover"
            // Performance optimizations
            fadeDuration={200}
            progressiveRenderingEnabled={true}
            removeClippedSubviews={true}
          />
          
          <View style={styles.cardOverlay}>
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
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6EFD" />
      
      <BackButton onPress={() => navigation.goBack()} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            {selectedCategory ? `${selectedCategory} Specialists` : 'Lets Find Your Problem?'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {selectedCategory ? 'Select the Doctor' : 'Select the Doctor'}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={16} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Doctor N..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={(text) => dispatch(setSearchQuery(text))}
          />
        </View>
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
              <View key={doctor.id} style={styles.doctorCardWrapper}>
                {renderDoctorCard({ item: doctor, index })}
              </View>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#0D6EFD',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('3%'),
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: wp('4%'),
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('2%'),
  },
  doctorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  doctorCardWrapper: {
    width: '48%',
    marginBottom: hp('2%'),
  },
  doctorCard: {
    height: wp('65%'),
    borderRadius: wp('4%'),
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  doctorImageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  doctorImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: '#f0f0f0', // Fallback background color
  },
  hiddenImage: {
    opacity: 0,
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
  loadingText: {
    marginTop: wp('2%'),
    fontSize: wp('3.5%'),
    color: '#0D6EFD',
    fontWeight: '500',
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
  errorText: {
    marginTop: wp('2%'),
    fontSize: wp('3.5%'),
    color: '#666',
    textAlign: 'center',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: wp('4%'),
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.8%'),
    borderRadius: wp('3%'),
    marginTop: -wp('3.8%'),
    marginRight: -wp('3.3%'),
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: wp('1%'),
  },
  ratingText: {
    fontSize: wp('3%'),
    fontWeight: 'bold',
    color: '#333',
  },
  doctorInfo: {
    position: 'absolute',
    bottom: wp('4%'),
    left: wp('4%'),
    right: wp('4%'),
  },
  doctorName: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: hp('0.3%'),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  doctorSpecialty: {
    fontSize: wp('3.8%'),
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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

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
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { getDoctorsData } from '../services/doctorsApi';
import { PoppinsFonts } from '../config/fonts';

const IMAGE_BASE_URL = 'https://spiderdesk.asia/healto/';

const DoctorBySpc = ({ navigation, route }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  // Get parameters from route
  const selectedCategory = route.params?.selectedCategory;
  const clinicId = route.params?.clinicId || route.params?.hospitalId;
  const hospitalName = route.params?.hospitalName;
  const isFromHospital = route.params?.fromHospital || false;
  
  // Debug logging
  console.log('🔍 DOCTOR BY SPC DEBUG - DoctorListByHospitalScreen Debug Info:');
  console.log('🔍 DOCTOR BY SPC DEBUG - selectedCategory:', selectedCategory);
  console.log('🔍 DOCTOR BY SPC DEBUG - clinicId:', clinicId);
  console.log('🔍 DOCTOR BY SPC DEBUG - hospitalName:', hospitalName);
  console.log('🔍 DOCTOR BY SPC DEBUG - isFromHospital:', isFromHospital);
  console.log('🔍 DOCTOR BY SPC DEBUG - route.params:', JSON.stringify(route.params, null, 2));

  // Fetch doctors from API when component mounts
  useEffect(() => {
    if (!clinicId) {
      console.log('No clinic ID provided, cannot fetch doctors');
      return;
    }
    
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching doctors for clinic:', clinicId, 'specialization:', selectedCategory);
        
        const result = await getDoctorsData(selectedCategory, clinicId, !!selectedCategory);
        
        if (result.success) {
          setDoctors(result.data);
          console.log('✅ DOCTOR BY SPC DEBUG - Successfully fetched doctors:', result.data.length);
          console.log('✅ DOCTOR BY SPC DEBUG - Doctors data:', JSON.stringify(result.data, null, 2));
        } else {
          setError(result.error);
          console.error('❌ DOCTOR BY SPC DEBUG - Failed to fetch doctors:', result.error);
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to fetch doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, [clinicId, selectedCategory]);

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
  
  // Normalize specialty names to handle variations
  const normalizeSpecialtyName = (name) => {
    if (!name) return '';
    
    // Simple capitalization - just capitalize first letter of each word
    return name.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getDoctorSpecialty = (doctor) => {
    console.log('🔍 DOCTOR SPECIALTY DEBUG - Doctor object:', JSON.stringify(doctor, null, 2));
    console.log('🔍 DOCTOR SPECIALTY DEBUG - Selected category from route:', selectedCategory);
    
    // PRIORITY 1: If we have a selected category from the route, use that as the specialty
    // This ensures the displayed specialty matches the category we're viewing
    if (selectedCategory) {
      console.log('🔍 DOCTOR SPECIALTY DEBUG - Using selected category as specialty:', selectedCategory);
      return selectedCategory;
    }
    
    // PRIORITY 2: Try to get specialization name from nested specialization object
    if (doctor.specialization && doctor.specialization.name) {
      console.log('🔍 DOCTOR SPECIALTY DEBUG - Using specialization.name:', doctor.specialization.name);
      return normalizeSpecialtyName(doctor.specialization.name);
    }
    
    // PRIORITY 3: Map specialization_id to actual specialty names as fallback
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
      const mappedSpecialty = specialtyMap[doctor.specialization_id] || 'General Medicine';
      console.log('🔍 DOCTOR SPECIALTY DEBUG - Using specialization_id:', doctor.specialization_id, '-> mapped to:', mappedSpecialty);
      return mappedSpecialty;
    }
    
    // PRIORITY 4: Fallback to type-based mapping
    const typeMap = {
      'hospital': 'Cardiology',
      'clinic': 'General Medicine',
      'multispeciality': 'Multi Specialty'
    };
    const typeBasedSpecialty = typeMap[doctor.type] || 'General Medicine';
    console.log('🔍 DOCTOR SPECIALTY DEBUG - Using type-based mapping:', doctor.type, '->', typeBasedSpecialty);
    return typeBasedSpecialty;
  };

  // Filter doctors by search query only (specialization filtering is done by API)
  const filteredDoctors = useMemo(() => {
    if (!doctors || !Array.isArray(doctors)) {
      console.log('No doctors data available:', doctors);
      return [];
    }
    
    // If no search query, return all doctors
    if (!searchQuery.trim()) {
      console.log('No search query, returning all doctors:', doctors.length);
      return doctors;
    }
    
    console.log('Filtering doctors by search query:', searchQuery, 'Total doctors:', doctors.length);
    
    const filtered = doctors.filter(doctor => {
      if (!doctor || typeof doctor !== 'object') {
        console.warn('Invalid doctor object in filter:', doctor);
        return false;
      }
      
      const doctorName = (doctor.name || '').toLowerCase();
      const searchTerm = searchQuery.trim().toLowerCase();
      
      const isMatch = doctorName.includes(searchTerm);
      console.log(`Doctor: ${doctor.name || 'Unknown'}, Search: ${searchTerm}, Match: ${isMatch}`);
      
      return isMatch;
    });
    
    console.log(`Filtered ${filtered.length} doctors out of ${doctors.length} for search: ${searchQuery}`);
    return filtered;
  }, [doctors, searchQuery]);

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
    // Add comprehensive null safety checks
    if (!doctor || typeof doctor !== 'object') {
      console.warn('Invalid doctor object:', doctor);
      return null;
    }
    
    const doctorId = (doctor.id || doctor.doctor_id || index).toString();
    const isLoading = imageLoadingStates[doctorId];
    const hasError = imageErrors[doctorId];
    
    const handleDoctorPress = () => {
      navigation.navigate('DoctorAppointment', { 
        doctor,
        hospitalName: hospitalName || doctor?.clinic?.name || 'Hospital'
      });
    };
    
    return (
      <TouchableOpacity 
        key={doctorId} 
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
              <Text style={styles.doctorName}>{doctor.name || 'Dr. Unknown'}</Text>
              <Text style={styles.doctorSpecialty}>{getDoctorSpecialty(doctor)}</Text>
              <Text style={styles.doctorClinic}>{hospitalName || doctor?.clinic?.name || 'Hospital'}</Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#1A83FF" />
      
      
      {/* Header */}
      <LinearGradient
        colors={['#1A83FF', '#003784']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{hospitalName || 'Hospital'}</Text>
          <Text style={styles.headerSubtitle}>
            {selectedCategory 
              ? `${selectedCategory} Specialists` 
              : 'Select the Doctor'
            }
          </Text>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder="Search by Doctor N..."
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Doctors Grid */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.doctorsGridContainer,
          isFromHospital && styles.doctorsGridContainerNoSearch
        ]}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D6EFD" />
            <Text style={styles.loadingText}>Loading doctors...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="exclamation-triangle" size={60} color="#d9534f" />
            <Text style={styles.errorTitle}>Failed to load doctors</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                // Retry by refetching doctors
                setError(null);
                setLoading(true);
                // The useEffect will trigger again
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredDoctors.length > 0 ? (
          <View style={styles.doctorsGrid}>
            {filteredDoctors.map((doctor, index) => {
              const card = renderDoctorCard({ item: doctor, index });
              return card; // This will be null if doctor is invalid, which is fine
            }).filter(Boolean)} {/* Remove null entries */}
          </View>
        ) : (
          <View style={styles.noResultsContainer}>
            <Icon name="user-md" size={60} color="#0D6EFD" />
            <Text style={styles.noResultsTitle}>
              {selectedCategory ? `No ${selectedCategory} specialists found` : 'No doctors found'}
            </Text>
            <Text style={styles.noResultsSubtitle}>
              {selectedCategory 
                ? `We couldn't find any ${selectedCategory.toLowerCase()} specialists at this hospital.`
                : 'Try adjusting your search criteria or browse all doctors.'
              }
            </Text>
            
            {/* Debug information */}
            <Text style={styles.debugText}>
              Debug: {doctors.length} total doctors, {filteredDoctors.length} filtered
            </Text>
            <Text style={styles.debugText}>
              Category: {selectedCategory || 'None'}, Clinic ID: {clinicId || 'N/A'}
            </Text>
            <Text style={styles.debugText}>
              Hospital: {hospitalName || 'N/A'}, Search: {searchQuery || 'None'}
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
    fontFamily: PoppinsFonts.Bold,
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
  doctorsGridContainerNoSearch: {
    paddingTop: hp('2%'),
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
    top: hp('.1%'),
    right: wp('.2%'),
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
    fontFamily: PoppinsFonts.Bold,
    color: '#333',
    marginLeft: wp('1%'),
  },
  doctorInfo: {
    marginBottom: hp('-1.8%'),
   // marginTop: hp('2%'),
  },
  doctorName: {
    color: '#FFFFFF',
    fontSize: wp('4.5%'),
    fontFamily: PoppinsFonts.Bold,
    //marginBottom: hp('0.3%'),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    //paddingTop: hp('30%'),
  },
  doctorSpecialty: {
    color: '#FFFFFF',
    fontSize: wp('3.5%'),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
   // marginBottom: hp('0.3%'),
  },
  doctorClinic: {
    color: '#FFFFFF',
    fontSize: wp('3%'),
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontFamily: PoppinsFonts.Regular,
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
    fontFamily: PoppinsFonts.Bold,
    color: '#333',
    marginBottom: hp('1%'),
  },
  debugDoctorText: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: hp('0.5%'),
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('10%'),
    paddingHorizontal: wp('10%'),
  },
  errorTitle: {
    fontSize: wp('5%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#d9534f',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
    textAlign: 'center',
  },
  errorText: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp('3%'),
    lineHeight: wp('5%'),
  },
  retryButton: {
    backgroundColor: '#0D6EFD',
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Bold,
  },
});

export default DoctorBySpc;

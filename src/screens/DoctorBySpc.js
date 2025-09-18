import axios from 'axios';
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
import { PoppinsFonts } from '../config/fonts';

const IMAGE_BASE_URL = 'https://spiderdesk.asia/healto/';

const DoctorBySpc = ({ navigation, route }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  
  // Get selectedCategory and clinicId from route params
  const selectedCategory = route.params?.selectedCategory || route.params?.categoryFilter || null;
  const clinicId = route.params?.clinicId || route.params?.hospital?.id || null;
  
  // Debug: Log the received parameters
  console.log('DoctorBySpc received parameters:', {
    selectedCategory,
    clinicId,
    allParams: route.params
  });
  

  // Fetch doctors from API when component mounts
  useEffect(() => {
    if (!selectedCategory || !clinicId) {
      return;
    }
    
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiParams = {
          clinic_id: clinicId,
          specialization: selectedCategory, // Pass selectedCategory to API
        };
        
        console.log('Sending API request with parameters:', apiParams);
        
        const response = await axios.get(
          'https://spiderdesk.asia/healto/api/doctors/by/clinic',
          {
            params: apiParams,
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Basic ' + btoa('admin:vamilenterprise2025!@#'),
            },
          }
        );
        
        console.log('API Response with both parameters:', response.data);
        console.log('Extracted doctors array:', response.data.doctors);
        console.log('Number of doctors received:', response.data.doctors?.length || 0);
        
        setDoctors(response.data.doctors || []);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to fetch doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [selectedCategory, clinicId]);

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
    const normalized = name.trim().toLowerCase();
    // Add more normalization logic as needed, e.g., mapping synonyms
    // Example: "cardiologist" and "cardiology" -> "Cardiology"
    if (
      normalized === 'cardiologist' ||
      normalized === 'cardiology'
    ) {
      return 'Cardiology';
    }
    if (
      normalized === 'general physician' ||
      normalized === 'general medicine' ||
      normalized === 'physician'
    ) {
      return 'General Medicine';
    }
    if (
      normalized === 'multi specialty' ||
      normalized === 'multispeciality'
    ) {
      return 'Multi Specialty';
    }
    // Capitalize the first letter of each word for display
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getDoctorSpecialty = (doctor) => {
    // First try to get specialization name from nested specialization object
    if (doctor.specialization && doctor.specialization.name) {
      return normalizeSpecialtyName(doctor.specialization.name);
    }
    
    
    
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

  // Filter doctors based on search query and selected category
  const filteredDoctors = useMemo(() => {
    if (!doctors || !Array.isArray(doctors)) {
      return [];
    }
    
    console.log('Filtering doctors:', {
      totalDoctors: doctors.length,
      searchQuery,
      selectedCategory,
      doctors: doctors.map(d => ({ name: d.name, specialty: getDoctorSpecialty(d) }))
    });
    
    return doctors.filter(doctor => {
      if (!doctor || typeof doctor !== 'object') {
        return false;
      }
      
      // Filter by search query (name match)
      const matchesSearch = searchQuery
        ? (doctor.name || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
        : true;
      
      // Filter by selected category if present (keep as fallback even though API should filter)
      const doctorSpecialty = getDoctorSpecialty(doctor);
      const matchesCategory = selectedCategory
        ? doctorSpecialty.toLowerCase() === selectedCategory.toLowerCase()
        : true;
      
      return matchesSearch && matchesCategory;
    });
  }, [doctors, searchQuery, selectedCategory]);

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
        hospitalName: doctor?.clinic_name || 'Hospital'
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
              <Text style={styles.doctorClinic}>{doctor?.clinic_name || 'Hospital'}</Text>
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
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>

      {/* Doctors Grid */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.doctorsGridContainer}
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
            {/* Retry just triggers a refetch by changing state, so we can use a dummy state update */}
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                // Simple retry by refetching
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
                ? `We couldn't find any ${selectedCategory.toLowerCase()} specialists matching your search.`
                : 'Try adjusting your search criteria or browse all doctors.'
              }
            </Text>
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
    fontFamily: PoppinsFonts.Bold,
    color: '#333',
    marginLeft: wp('1%'),
  },
  doctorInfo: {
    marginBottom: hp('1%'),
  },
  doctorName: {
    color: '#FFFFFF',
    fontSize: wp('4.5%'),
    fontFamily: PoppinsFonts.Bold,
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
    marginBottom: hp('0.3%'),
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
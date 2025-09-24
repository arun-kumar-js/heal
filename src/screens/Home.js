import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedCategory } from '../store/slices/doctorsSlice';
import { selectDoctors } from '../store/selectors/doctorsSelectors';
import { selectFormattedUserData, loadUserOTPResponse, selectPatientId } from '../store/slices/userSlice';
import { getOTPResponse } from '../utils/otpStorage';
import { performCompleteLogout, getLogoutConfirmation } from '../utils/logoutUtils';
import { PoppinsFonts, FontStyles } from '../config/fonts';
import LocationService from '../services/locationService';
import GeocodingService from '../services/geocodingService';
import { getUserProfile } from '../services/profileApi';

const Home = ({ navigation }) => {
  const dispatch = useDispatch();
  const doctorsFromRedux = useSelector(selectDoctors);
  const userData = useSelector(selectFormattedUserData);
  const patientId = useSelector(selectPatientId);
  const [activeFilter, setActiveFilter] = useState('All');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationName, setLocationName] = useState('Getting location...');
  const [locationLoading, setLocationLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [userName, setUserName] = useState('User');
  const [refreshing, setRefreshing] = useState(false);

  // Load user data and doctors data on component mount
  useEffect(() => {
    loadDoctors();
    loadUserData();
    loadCurrentLocation();
    loadProfileImage();
  }, [patientId]);

  const loadUserData = async () => {
    try {
      console.log('🔄 Loading user data from Redux...');
      dispatch(loadUserOTPResponse());
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    }
  };

  const loadProfileImage = async () => {
    if (!patientId) {
      console.log('⚠️ No patient ID available for profile image');
      return;
    }

    try {
      console.log('🔄 Loading profile image from API for patient ID:', patientId);
      setProfileLoading(true);
      
      const result = await getUserProfile(patientId);
      
      if (result.success && result.data) {
        console.log('✅ Profile data loaded:', result.data);
        
        // Extract user name from API response
        if (result.data.name) {
          console.log('👤 User name from API:', result.data.name);
          setUserName(result.data.name);
        }
        
        // Extract profile image from API response
        if (result.data.profile_image) {
          const baseUrl = 'https://spiderdesk.asia/healto/';
          const imageUrl = result.data.profile_image.startsWith('http') 
            ? result.data.profile_image 
            : `${baseUrl}${result.data.profile_image}`;
          
          console.log('📸 Profile image URL:', imageUrl);
          setProfileImage(imageUrl);
        } else {
          console.log('⚠️ No profile image found in API response');
        }
      } else {
        console.log('❌ Failed to load profile data:', result.message);
      }
    } catch (error) {
      console.error('❌ Error loading profile image:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const onRefresh = async () => {
    console.log('🔄 Pull to refresh triggered');
    setRefreshing(true);
    
    try {
      // Refresh all data in parallel
      await Promise.all([
        loadDoctors(),
        loadProfileImage(),
        loadCurrentLocation(),
        loadUserData()
      ]);
      
      console.log('✅ All data refreshed successfully');
      
      // Show success feedback (optional)
      // You can add a toast notification here if needed
      
    } catch (error) {
      console.error('❌ Error during refresh:', error);
      
      // Show error feedback (optional)
      Alert.alert(
        'Refresh Failed',
        'Some data could not be refreshed. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setRefreshing(false);
    }
  };

  const loadCurrentLocation = async () => {
    try {
      console.log('🔄 Loading current location...');
      setLocationLoading(true);
      setLocationName('Getting location...');
      
      // Get current location
      const location = await LocationService.getCurrentLocation();
      
      if (location) {
        console.log('📍 Location received:', location);
        setCurrentLocation(location);
        
        // Get location name using reverse geocoding
        const locationNameResult = await GeocodingService.getLocationName(
          location.latitude, 
          location.longitude
        );
        
        console.log('🏙️ Location name:', locationNameResult);
        setLocationName(locationNameResult);
      } else {
        console.log('❌ No location received');
        setLocationName('Location unavailable');
      }
    } catch (error) {
      console.error('❌ Error loading location:', error);
      setLocationName('Location unavailable');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLogout = () => {
    const confirmation = getLogoutConfirmation();
    
    Alert.alert(
      confirmation.title,
      confirmation.message,
      [
        {
          text: confirmation.cancelText,
          style: 'cancel',
        },
        {
          text: confirmation.confirmText,
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔄 Starting logout process...');
              
              // Perform complete logout
              const result = await performCompleteLogout(dispatch, navigation);
              
              if (result.success) {
                Alert.alert(
                  'Success',
                  'You have been logged out successfully.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert(
                  'Error',
                  result.message || 'Logout failed. Please try again.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('❌ Logout error:', error);
              Alert.alert(
                'Error',
                'An unexpected error occurred during logout.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const loadDoctors = async () => {
    setLoading(true);
    try {
      console.log('Fetching doctors from: https://spiderdesk.asia/healto/doctors');
      
      const response = await axios.get('https://spiderdesk.asia/healto/api/doctors');
      
      console.log('Doctors API Response:', response);
      console.log('Doctors API Status:', response.status);
      
      setDoctors(response.data.doctors);
      console.log('Doctors loaded successfully:', response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };
console.log("doctors", doctors);
  const hospitalData = [
    {
      name: 'Hospitals',
      image: require('../Assets/Images/hospital.png'),
      type: 'hospital',
      //color: '#BDE4F4',
    },
    {
      name: 'Clinics',
      image: require('../Assets/Images/clinic.png'),
      type: 'clinic',
      //  color: '#F8C8D5',
    },
    {
      name: 'Multi Specialty\nClinic',
      image: require('../Assets/Images/multi.png'),
      type: 'multispeciality',
      // color: '#F1B7B2',
    },
  ];

  const departmentData = [
    { name: 'Cardiology', icon: require('../Assets/Images/heart.png'),  },
    { name: 'Neurology', icon: require('../Assets/Images/brain.png'),  },
    { name: 'Orthopedics', icon: require('../Assets/Images/bone.png'), },
    { name: 'Pediatrics', icon: require('../Assets/Images/baby.png'),},
    { name: 'Gynecology', icon: require('../Assets/Images/gyneric.png'),  },
    { name: 'View All', icon: require('../Assets/Images/view_all.png'), viewAll: true },
  ];

  const filterData = [
    { name: 'All', icon: null },
    { name: 'Cardiology', icon: require('../Assets/Images/heart1.png') },
    { name: 'Neurology', icon: require('../Assets/Images/brain1.png') },
    { name: 'Orthopedics', icon: require('../Assets/Images/bone1.png') },
  ];
  const doctorData1=()=>{
    
    
  }

  // Helper function to get user profile image
  const getUserProfileImage = () => {
    // If we have a profile image from API, use that
    if (profileImage) {
      return { uri: profileImage };
    }
    
    // Fallback to generated avatar based on API user name
    return { 
      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=300&background=d4a574&color=fff&bold=true` 
    };
  };

  // Helper function to get doctor image
  const getDoctorImage = (doctor) => {
    // Use Healto base URL for doctor profile images
    if (doctor.profile_image) {
      return { uri: `https://spiderdesk.asia/healto/${doctor.profile_image}` };
    }
    
    if (doctor.image) {
      return { uri: `https://spiderdesk.asia/healto/${doctor.image}` };
    }
    
    if (doctor.avatar) {
      return { uri: `https://spiderdesk.asia/healto/${doctor.avatar}` };
    }
    
    if (doctor.photo) {
      return { uri: `https://spiderdesk.asia/healto/${doctor.photo}` };
    }
    
    if (doctor.profile_picture) {
      return { uri: `https://spiderdesk.asia/healto/${doctor.profile_picture}` };
    }
    
    if (doctor.doctor_image) {
      return { uri: `https://spiderdesk.asia/healto/${doctor.doctor_image}` };
    }
    
    // Fallback to random user images if no profile image
    return { uri: `https://randomuser.me/api/portraits/${doctor.gender === 'Female' ? 'women' : 'men'}/${Math.floor(Math.random() * 50) + 1}.jpg` };
  };

  // Helper function to get doctor specialty
  const getDoctorSpecialty = (doctor) => {
    // Use the specialization.name from API response if available
    if (doctor?.specialization?.name) {
      return doctor.specialization.name;
    }
    
    // Fallback to mapping specialization_id if specialization.name is not available
    const specialtyMap = {
      1: 'Cardiology',
      2: 'Orthopedics', 
      3: 'Pediatrics',
      4: 'Dermatology',
      5: 'Neurology',
      6: 'Neurology',
      7: 'Gynecology',
      8: 'Ophthalmology',
      9: 'ENT',
      10: 'Psychiatry'
    };
    
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

  // Use Redux doctors data if available, otherwise use local state
  const allDoctors = doctorsFromRedux && doctorsFromRedux.length > 0 ? doctorsFromRedux : doctors;
  
  // Filter doctors based on active filter
  const filteredDoctors = allDoctors.filter(doctor => {
    if (activeFilter === 'All') {
      return true;
    }
    
    const doctorSpecialty = getDoctorSpecialty(doctor);
    return doctorSpecialty === activeFilter;
  });
  
  // Get first 3 doctors for display from filtered results
  const displayedDoctors = filteredDoctors && filteredDoctors.length > 0 ? filteredDoctors.slice(0, 3) : [];

  // Prepare doctors data for display
  const doctorData = displayedDoctors.map((doctor, index) => ({
    id: doctor.id,
    name: doctor.name, // Use the full name from API (already includes "Dr.")
    specialty: getDoctorSpecialty(doctor),
    rating: (4.0 + (index % 3) * 0.3).toFixed(1),
    image: getDoctorImage(doctor).uri,
    clinic: doctor.clinic, // Include clinic information
  }));

  // Add View All option
  doctorData.push({
    name: 'View All',
    viewAll: true,
    image: 'https://placehold.co/300x400/d9534f/ffffff.png?text=Doctor',
  });

  // Show loading state if doctors are not loaded yet
  if (loading && doctors.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#1A83FF" />
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading doctors...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#1A83FF" />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={activeFilter === 'All'}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1A83FF']} // Android
              tintColor="#1A83FF" // iOS
              title="Refreshing..." // iOS
              titleColor="#1A83FF" // iOS
            />
          }
        >
          <LinearGradient
            colors={['#1A83FF', '#003784']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerTop}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={getUserProfileImage()}
                  style={styles.profileImage}
                />
                {profileLoading && (
                  <View style={styles.profileLoadingOverlay}>
                    <Icon 
                      name="spinner" 
                      size={16} 
                      color="#FFFFFF" 
                    />
                  </View>
                )}
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.greetingText}>Hi, {userName}</Text>
                <TouchableOpacity 
                  style={styles.locationContainer}
                  onPress={loadCurrentLocation}
                  disabled={locationLoading}
                >
                  <Text style={styles.locationText}>
                    {locationLoading ? 'Getting location...' : locationName}
                  </Text>
                  <Icon 
                    name="map-marker-alt" 
                    size={16} 
                    color="#FFFFFF" 
                    style={styles.locationIcon} 
                  />
                  {locationLoading && (
                    <Icon 
                      name="spinner" 
                      size={12} 
                      color="#FFFFFF" 
                      style={styles.loadingIcon}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.searchContainer}
              onPress={() => navigation.navigate('DoctorListScreen')}
            >
              <Icon
                name="search"
                size={20}
                color="#888"
                style={styles.searchIcon}
              />
              <TextInput
                placeholder="Search by Doctor, Depa..."
                placeholderTextColor="#888"
                style={styles.searchInput}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.mainContent}>
            <View style={styles.firstCard}>
              <Text style={[styles.cardTitle, { color: '#003784' }]}>Top Hospitals/Clinics</Text>
              <Text style={styles.cardSubtitle}>Select From Below</Text>
              <View style={styles.divider} />
              <View style={styles.categoryRow}>
                {hospitalData.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.categoryItem}
                    onPress={() => navigation.navigate('ClinicsScreen', { 
                      selectedType: item.name,
                      selectedTypeFormatted: item.name
                    })}
                  >
                    <View
                      style={[
                        styles.categoryIconContainer,
                        { backgroundColor: item.color },
                      ]}
                    >
                      <Image
                        source={item.image}
                        style={styles.categoryImage}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.categoryText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={[styles.cardTitle, { color: '#003784' }]}>Lets Find Your Problem?</Text>
              <Text style={styles.cardSubtitle}>Select the Department</Text>
              <View style={styles.departmentGrid}>
                {departmentData.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.departmentItem}
                    onPress={() => {
                      if (item.viewAll) {
                        // Navigate to Category screen for "View All"
                        navigation.navigate('Category');
                      } else {
                        // Navigate to HospitalListByCategoryScreen with selected category
                        navigation.navigate('HospitalListByCategoryScreen', {
                          selectedCategory: item.name
                        });
                      }
                    }}
                  >
                    {item.viewAll ? (
                      <View
                        style={[
                          styles.departmentIconContainer,
                          {
                            backgroundColor: '#FFFFFF',
                            borderWidth: 1,
                            borderColor: '#E0E0E0',
                          },
                        ]}
                      >
                        <Image
                          source={item.icon}
                          style={styles.departmentIcon}
                          resizeMode="contain"
                        />
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.departmentIconContainer,
                          { backgroundColor: item.color },
                        ]}
                      >
                        <Image
                          source={item.icon}
                          style={styles.departmentIcon}
                          resizeMode="contain"
                        />
                      </View>
                    )}
                    {!item.viewAll && (
                      <Text style={styles.departmentText}>{item.name}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.doctorsSection}>
              <View style={styles.doctorsHeader}>
                <View>
                  <Text  style={[styles.cardTitle, { color: '#003784' }]}>Top Doctors?</Text>
                  <Text style={styles.cardSubtitle}>Select the Department</Text>
                  
                </View>
                <TouchableOpacity onPress={() => {
                  // Clear category filter to show all doctors
                  dispatch(setSelectedCategory(null));
                  setActiveFilter('All');
                  navigation.navigate('DoctorListScreen');
                }}>
                  <Text style={styles.seeAllLink}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
              >
                {filterData.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.filterChip,
                      activeFilter === item.name
                        ? styles.activeFilterChip
                        : styles.inactiveFilterChip,
                    ]}
                    onPress={() => {
                      setActiveFilter(item.name);
                      // Also update Redux state for consistency
                      if (item.name === 'All') {
                        dispatch(setSelectedCategory(null));
                      } else {
                        dispatch(setSelectedCategory(item.name));
                      }
                    }}
                  >
                    {item.icon && (
                      <Image
                        source={item.icon}
                        style={[
                          styles.filterIcon,
                          {
                            tintColor: activeFilter === item.name
                          }
                        ]}
                         resizeMode="contain"
                      />
                    )}
                    <Text
                      style={
                        activeFilter === item.name
                          ? styles.activeFilterText
                          : styles.inactiveFilterText
                      }
                    >
                      {item.name}
                      
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.doctorsGrid}>
                {(() => {
                  // Filter doctors based on active filter
                  const filteredDoctors = doctorData.filter(doctor => {
                    if (activeFilter === 'All') {
                      return true;
                    }
                    return doctor.specialty === activeFilter;
                  });
                  
                  // If no doctors found for the selected category, show only View All card
                  if (activeFilter !== 'All' && filteredDoctors.length === 0) {
                    return (
                      <TouchableOpacity style={styles.doctorCard}>
                        <ImageBackground
                          source={{ uri: 'https://placehold.co/300x400/d9534f/ffffff.png?text=Doctor' }}
                          style={styles.doctorImage}
                          imageStyle={{ borderRadius: 15 }}
                        >
                          <TouchableOpacity 
                            style={styles.viewAllDoctorOverlay}
                            onPress={() => {
                              // Clear category filter to show all doctors
                              dispatch(setSelectedCategory(null));
                              setActiveFilter('All');
                              navigation.navigate('DoctorListScreen');
                            }}
                          >
                            <Text style={styles.viewAllDoctorText}>View All</Text>
                          </TouchableOpacity>
                        </ImageBackground>
                      </TouchableOpacity>
                    );
                  }
                  
                  return filteredDoctors.map((doctor, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.doctorCard}
                      onPress={() => {
                        if (!doctor.viewAll) {
                          // Find the original doctor data from the API response
                          const originalDoctor = allDoctors.find(d => d.id === doctor.id);
                          if (originalDoctor) {
                            navigation.navigate('DoctorAppointment', {
                              doctor: originalDoctor
                            });
                          }
                        }
                      }}
                    >
                      <ImageBackground
                        source={{ uri: doctor.image }}
                        style={styles.doctorImage}
                        imageStyle={{ borderRadius: 15 }}
                      >
                        {doctor.viewAll ? (
                          <TouchableOpacity 
                            style={styles.viewAllDoctorOverlay}
                            onPress={() => {
                              // Clear category filter to show all doctors
                              dispatch(setSelectedCategory(null));
                              setActiveFilter('All');
                              navigation.navigate('DoctorListScreen');
                            }}
                          >
                            <Text style={styles.viewAllDoctorText}>View All</Text>
                          </TouchableOpacity>
                        ) : (
                          <>
                           
                            <LinearGradient
                              colors={['transparent', 'rgba(0,0,0,0.7)']}
                              style={styles.doctorInfoGradient}
                            >
                              <Text style={styles.doctorName}>{doctor.name}</Text>
                              <Text style={styles.doctorSpecialty}>
                                {doctor.specialty}
                              </Text>
                              <Text style={styles.doctorClinic}>{doctor?.clinic?.name }</Text>
                            </LinearGradient>
                          </>
                        )}
                      </ImageBackground>
                    </TouchableOpacity>
                  ));
                })()}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A83FF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: hp('10%'),
  },
  header: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('2%'),
    borderBottomLeftRadius: wp('7.5%'),
    borderBottomRightRadius: wp('7.5%'),
    marginBottom: hp('4%'),
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2.5%'),
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: wp('4%'),
  },
  refreshButton: {
    padding: wp('3%'),
    borderRadius: wp('6%'),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    // Default state
  },
  refreshIconSpinning: {
    // Animation will be handled by the spinning icon
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: wp('5.5%'),
    fontFamily: PoppinsFonts.Bold,
    backgroundColor: 'transparent',
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Regular,
    backgroundColor: 'transparent',
  },
  gradientTextContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('1%'),
    marginBottom: hp('0.5%'),
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    paddingHorizontal: wp('4%'),
    height: hp('6%'),
  },
  searchIcon: {
    marginRight: wp('2.5%'),
  },
  searchInput: {
    flex: 1,
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Regular,
    color: '#000',
  },
  mainContent: {
    marginTop: hp('-2.5%'),
    paddingHorizontal: wp('4%'),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('5%'),
    padding: wp('5%'),
    marginBottom: hp('2.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  firstCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('5%'),
    padding: wp('5%'),
    marginBottom: hp('2.5%'),
    marginTop: hp('1.2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: wp('4.5%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  cardSubtitle: {
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Regular,
    color: '#666',
    marginTop: hp('0.2%'),
    marginBottom: hp('2%'),
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryItem: {
    alignItems: 'center',
    width: '32%',
  },
  categoryIconContainer: {
    width: wp('20%'), // 80px responsive
    height: wp('25%'), // 100px responsive
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
   // marginBottom: wp('0.5%'), // Further reduced to 0.5%
  },
  categoryImage: {
    width: wp('20%'),
    height: wp('20%'),
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    // marginVertical: hp('1%'),
    width: '100%',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: PoppinsFonts.Bold,
    color: '#000',
    textAlign: 'center',
  },
  departmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  departmentItem: {
    width: '32%',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  departmentIconContainer: {
    width: wp('22%'),
    height: wp('22%'),
    borderRadius: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  departmentText: {
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#000',
    textAlign: 'center',
  },
  viewAllText: {
    fontSize: 16,
    fontFamily: PoppinsFonts.Bold,
    color: '#0D6EFD',
  },
  doctorsSection: {
    marginTop: 10,
  },
  doctorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 4,
  },
  seeAllLink: {
    fontSize: 14,
    fontFamily: PoppinsFonts.Bold,
    color: '#333',
  },
  filterScroll: {
    paddingBottom: 15,
    paddingLeft: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  activeFilterChip: {
    backgroundColor: 'rgba(13, 110, 253, 0.1)',
    borderColor: '#0D6EFD',
  },
  inactiveFilterChip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  activeFilterText: {
    color: '#0D6EFD',
    fontFamily: PoppinsFonts.Bold,
  },
  inactiveFilterText: {
    fontFamily: PoppinsFonts.Regular,
   // color: '#666',
  },
  filterIcon: {
    width: 17,
    height: 20,
    marginRight: 8,
  },
  departmentIcon: {
    width: 75,
    height: 75,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginLeft: 4,
  },
  loadingIcon: {
    marginLeft: 6,
    opacity: 0.8,
  },
  patientIdText: {
    fontSize: wp('3.5%'),
    color: '#FFFFFF',
    opacity: 0.8,
    fontFamily: PoppinsFonts.Regular,
    marginTop: hp('0.5%'),
  },
  logoutButtonHeader: {
    padding: wp('3%'),
    borderRadius: wp('6%'),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#E53935', // Red background
  },
  ratingBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  ratingText: {
    fontSize: wp('3%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#333',
    marginLeft: wp('1%'),
  },
  doctorInfoGradient: {
    padding: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  doctorName: {
    color: '#FFFFFF',
    fontSize: wp('4.5%'),
    fontFamily: PoppinsFonts.Bold,
    marginBottom: hp('0.3%'),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    //marginTop: hp('0.8%'),
  },
  doctorSpecialty: {
    color: '#FFFFFF',
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Regular,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
   // marginTop: hp('1.%'),
   // paddingBottom:hp('1%'),
  },
  doctorClinic: {
    color: '#FFFFFF',
    fontSize: wp('3%'),
    fontFamily: PoppinsFonts.Regular,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  viewAllDoctorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllDoctorText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: PoppinsFonts.Bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Regular,
    color: '#666',
    textAlign: 'center',
  },
});

export default Home;
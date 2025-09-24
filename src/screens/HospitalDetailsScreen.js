import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
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
import LinearGradient from 'react-native-linear-gradient';
import { PoppinsFonts } from '../config/fonts';
import { getDoctorsByClinic } from '../services/doctorsByClinicApi';
import { getHospitalDetails } from '../services/hospitalDetailsApi';

const HospitalDetailsScreen = ({ navigation, route }) => {
  const { hospital } = route.params || {};
  
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState(null);
  const [failedImages, setFailedImages] = useState(new Set());
  const [hospitalDetails, setHospitalDetails] = useState(null);
  const [hospitalLoading, setHospitalLoading] = useState(false);
  const [hospitalError, setHospitalError] = useState(null);

  // Fetch hospital details by ID
  const loadHospitalDetails = async () => {
    if (!hospital?.id) {
      console.log('No hospital ID provided, skipping hospital details fetch');
      return;
    }

    try {
      setHospitalLoading(true);
      setHospitalError(null);
      
      console.log('🏥 HOSPITAL DETAILS - Fetching hospital details for ID:', hospital.id);
      const result = await getHospitalDetails(hospital.id);
      
      if (result.success) {
        console.log('🏥 HOSPITAL DETAILS - Hospital details loaded successfully:', result.data);
        setHospitalDetails(result.data);
      } else {
        setHospitalError(result.error);
        console.error('🏥 HOSPITAL DETAILS - Failed to load hospital details:', result.error);
      }
    } catch (error) {
      setHospitalError(error.message);
      console.error('🏥 HOSPITAL DETAILS - Error loading hospital details:', error);
    } finally {
      setHospitalLoading(false);
    }
  };

  // Fetch doctors by clinic ID
  const loadDoctorsByClinic = async () => {
    if (!hospital?.id) {
      console.log('No hospital ID provided, skipping doctors fetch');
      return;
    }

    try {
      setDoctorsLoading(true);
      setDoctorsError(null);
      
      console.log('Fetching doctors for clinic ID:', hospital.id);
      const result = await getDoctorsByClinic(hospital.id);
      
      if (result.success) {
        setDoctors(result.data);
        console.log('Doctors loaded successfully:', result.data);
        console.log('First doctor details:', result.data[0]);
        if (result.data[0]) {
          console.log('First doctor image field:', result.data[0].image);
          console.log('All fields in first doctor:', Object.keys(result.data[0]));
        }
      } else {
        setDoctorsError(result.error);
        console.error('Failed to load doctors:', result.error);
      }
    } catch (error) {
      setDoctorsError(error.message);
      console.error('Error loading doctors:', error);
    } finally {
      setDoctorsLoading(false);
    }
  };

  // Load hospital details and doctors when component mounts
  useEffect(() => {
    loadHospitalDetails();
    loadDoctorsByClinic();
  }, [hospital?.id]);

  // Helper function to get doctor image
  const getDoctorImage = (doctor) => {
    console.log('=== getDoctorImage called ===');
    console.log('Getting image for doctor:', doctor.name, 'Profile image field:', doctor.profile_image);
    
    if (doctor.profile_image) {
      const imageUrl = `https://spiderdesk.asia/healto/${doctor.profile_image}`;
      console.log('Using doctor.profile_image:', imageUrl);
      return { uri: imageUrl };
    }
    
    if (doctor.image) {
      const imageUrl = `https://spiderdesk.asia/healto/${doctor.image}`;
      console.log('Using doctor.image:', imageUrl);
      return { uri: imageUrl };
    }
    
    // Fallback to test image if no image field
    console.log('No image field found, using test image as fallback');
    const testImageUri = 'https://spiderdesk.asia/healto/profile_images/1757658752_doctor22.jpg';
    return { uri: testImageUri };
    
    // Original image logic (commented out for debugging)
    /*
    if (doctor.image) {
      const imageUrl = `https://spiderdesk.asia/healto/${doctor.image}`;
      console.log('Using doctor.image:', imageUrl);
      
      // Test if the image URL is accessible
      fetch(imageUrl, { method: 'HEAD' })
        .then(response => {
          console.log(`Image URL test for ${doctor.name}:`, {
            url: imageUrl,
            status: response.status,
            ok: response.ok,
            headers: response.headers
          });
        })
        .catch(error => {
          console.log(`Image URL test failed for ${doctor.name}:`, {
            url: imageUrl,
            error: error.message
          });
        });
      
      return { uri: imageUrl };
    }
    
    if (doctor.profile_image) {
      const imageUrl = `https://spiderdesk.asia/healto/${doctor.profile_image}`;
      console.log('Using doctor.profile_image:', imageUrl);
      return { uri: imageUrl };
    }
    if (doctor.avatar) {
      const imageUrl = `https://spiderdesk.asia/healto/${doctor.avatar}`;
      console.log('Using doctor.avatar:', imageUrl);
      return { uri: imageUrl };
    }
    if (doctor.photo) {
      const imageUrl = `https://spiderdesk.asia/healto/${doctor.photo}`;
      console.log('Using doctor.photo:', imageUrl);
      return { uri: imageUrl };
    }
    if (doctor.profile_picture) {
      const imageUrl = `https://spiderdesk.asia/healto/${doctor.profile_picture}`;
      console.log('Using doctor.profile_picture:', imageUrl);
      return { uri: imageUrl };
    }
    if (doctor.doctor_image) {
      const imageUrl = `https://spiderdesk.asia/healto/${doctor.doctor_image}`;
      console.log('Using doctor.doctor_image:', imageUrl);
      return { uri: imageUrl };
    }
    
    // Fallback to random user images
    const fallbackUrl = `https://randomuser.me/api/portraits/${doctor.gender === 'Female' ? 'women' : 'men'}/${Math.floor(Math.random() * 50) + 1}.jpg`;
    console.log('Using fallback image:', fallbackUrl);
    return { uri: fallbackUrl };
    */
  };

  // Helper function to get doctor specialty
  const getDoctorSpecialty = (doctor) => {
    // Use specialization from API response if available
    if (doctor.specialization) {
      // Handle both string and object specialization
      if (typeof doctor.specialization === 'string') {
        return doctor.specialization;
      } else if (doctor.specialization.name) {
        return doctor.specialization.name;
      }
    }
    
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
    
    const typeMap = {
      'hospital': 'Cardiology',
      'clinic': 'General Medicine',
      'multispeciality': 'Multi Specialty'
    };
    return typeMap[doctor.type] || 'General Medicine';
  };

  // Prepare doctors data for display (first 6 doctors)
  const displayedDoctors = doctors.slice(0, 6).map((doctor, index) => {
    console.log('=== DOCTOR DEBUG INFO ===');
    console.log('Doctor name:', doctor.name);
    console.log('All doctor fields:', Object.keys(doctor));
    console.log('Doctor object:', JSON.stringify(doctor, null, 2));
    
    // Safety check - ensure doctor is an object and has required fields
    if (!doctor || typeof doctor !== 'object') {
      console.warn('Invalid doctor object:', doctor);
      return null;
    }
    
    const doctorImage = getDoctorImage(doctor);
    console.log('Processed image URI:', doctorImage.uri);
    console.log('=== END DOCTOR DEBUG ===');
    
    return {
      // Keep the complete original doctor object
      ...doctor,
      // Override with processed display data
      specialty: getDoctorSpecialty(doctor),
      rating: doctor.rating ? Number(doctor.rating) : (4.0 + (index % 3) * 0.3),
      image: doctorImage.uri,
    };
  }).filter(doctor => doctor !== null); // Remove any null entries

  // Use hospital details from API if available, otherwise fallback to passed hospital object
  const currentHospital = hospitalDetails?.clinics || hospital;

  // Use real hospital data or fallback to default values
  const hospitalData = {
    name: currentHospital?.name || hospital?.name || 'Hospital',
    type: currentHospital?.type || hospital?.type || 'hospital',
    rating: currentHospital?.rating || hospital?.rating || '0',
    info: currentHospital?.info || hospital?.info || 'Hospital information not available',
    address: currentHospital?.address || hospital?.address || 'Address not available',
    phone: currentHospital?.phone || hospital?.phone || 'Phone not available',
    email: currentHospital?.email || hospital?.email || 'Email not available',
    logo: currentHospital?.logo || hospital?.logo || null,
  };
  
  const statsData = [
    { number: `${currentHospital?.reviews_count || 0}+`, label: 'Reviews' },
    { number: `${hospitalDetails?.doctors_count || currentHospital?.doctors_count || 0}+`, label: 'Doctors' },
    { number: `${currentHospital?.experience || 0}+`, label: 'Experience' },
  ];

  // Debug: Log the hospital objects to see their structure
  console.log('🏥 HOSPITAL DETAILS - Passed hospital object:', JSON.stringify(hospital, null, 2));
  console.log('🏥 HOSPITAL DETAILS - Hospital details from API:', JSON.stringify(hospitalDetails, null, 2));
  console.log('🏥 HOSPITAL DETAILS - Current hospital (used for display):', JSON.stringify(currentHospital, null, 2));
  console.log('🏥 HOSPITAL DETAILS - Reviews count:', currentHospital?.reviews_count);
  console.log('🏥 HOSPITAL DETAILS - Doctors count from hospitalDetails:', hospitalDetails?.doctors_count);
  console.log('🏥 HOSPITAL DETAILS - Doctors count from currentHospital:', currentHospital?.doctors_count);
  console.log('🏥 HOSPITAL DETAILS - Final doctors count used:', hospitalDetails?.doctors_count || currentHospital?.doctors_count || 0);
  console.log('🏥 HOSPITAL DETAILS - Experience:', currentHospital?.experience);

  // Dynamic departments based on hospital specializations
  const getDepartmentsData = () => {
    if (!hospitalDetails?.clinics?.specializations) {
      // Fallback to default departments if no specializations available
      return [
        { name: 'Cardiology', icon: require('../Assets/Images/heart.png'), },
        { name: 'ENT', icon: require('../Assets/Images/ENT.png'), },
        { name: 'Orthopedics', icon: require('../Assets/Images/bone.png'),  },
        { name: 'Neurology', icon: require('../Assets/Images/brain.png'), },
        { name: 'Gastroenterology', icon: require('../Assets/Images/Gastroenterology.png'), },
      ];
    }

    // Icon mapping for specializations - using proper images from Category.js
    const iconMapping = {
      'Cardiology': require('../Assets/Images/heart.png'),
      'Neurology': require('../Assets/Images/brain.png'),
      'Orthopedics': require('../Assets/Images/bone.png'),
      'Pediatrics': require('../Assets/Images/baby.png'),
      'Gynecology': require('../Assets/Images/gyneric.png'),
      'Dermatology': require('../Assets/Images/Dermatology.png'),
      'Ophthalmology': require('../Assets/Images/Ophthalmology.png'),
      'ENT': require('../Assets/Images/ENT.png'),
      'Dentistry': require('../Assets/Images/Dentistry.png'),
      'Psychiatry': require('../Assets/Images/Psychiatry.png'),
      'Gastroenterology': require('../Assets/Images/Gastroenterology.png'),
      'Urology': require('../Assets/Images/Urology.png'),
      'Radiology': require('../Assets/Images/Radiology.png'),
      'Pulmonology': require('../Assets/Images/Pulmonology.png'),
    };

    // Convert specializations to departments data
    return hospitalDetails.clinics.specializations.map(specialization => ({
      name: specialization.name,
      icon: iconMapping[specialization.name] || require('../Assets/Images/heart.png'),
      id: specialization.id,
      description: specialization.description
    }));
  };

  const departmentsData = getDepartmentsData();
  
  // Debug: Log specializations and departments data
  console.log('🏥 HOSPITAL DETAILS - Hospital specializations:', hospitalDetails?.clinics?.specializations);
  console.log('🏥 HOSPITAL DETAILS - Generated departments data:', departmentsData);

  const filterData = [
    { name: 'All', icon: null },
    { name: 'Cardiology', icon: require('../Assets/Images/heart.png') },
    { name: 'Neurology', icon: require('../Assets/Images/brain.png') },
    { name: 'Orthopedics', icon: require('../Assets/Images/bone.png') },
  ];

  const doctorsData = [
    {
      name: 'Dr. Aishwarya',
      specialty: 'Cardiology',
      rating: '4.5',
      image: 'https://placehold.co/300x400/d9534f/ffffff.png?text=Dr.+Aishwarya',
    },
    {
      name: 'Dr. Kishore',
      specialty: 'Orthopedics',
      rating: '4.3',
      image: 'https://placehold.co/300x400/d9534f/ffffff.png?text=Dr.+Kishore',
    },
    {
      name: 'Dr. Shreya',
      specialty: 'Pediatrics',
      rating: '4.5',
      image: 'https://placehold.co/300x400/d9534f/ffffff.png?text=Dr.+Shreya',
    },
  ];

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
  

  const getHospitalImage = () => {
    if (hospital?.logo) {
      return { uri: `https://spiderdesk.asia/healto/${hospital.logo}` };
    }
    return require('../Assets/Images/hospital.png');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A83FF" />
      
 
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        scrollEventThrottle={16}
      >
        {/* Hospital Header Image */}
        <View style={styles.headerImageContainer}>
          <ImageBackground
            source={getHospitalImage()}
            style={styles.headerImage}
            imageStyle={styles.headerImageStyle}
          >
            <View style={styles.headerOverlay}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-left" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>{hospitalData.name}</Text>
               
                <View style={styles.ratingContainer}>
                  <View style={styles.starsContainer}>
                    {renderStars(hospitalData.rating)}
                  </View>
                  <Text style={styles.ratingText}>{hospitalData.rating}</Text>
                </View>
              </View>
              
             <TouchableOpacity style={styles.callButton}>
                <Image source={require('../Assets/Images/phone2.png')} style={{width: wp('12%'), height: wp('12%')}} />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* Statistics Bar */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#1A83FF', '#003784']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.statsGradient}
          >
            {statsData.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statNumber}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                {index < statsData.length - 1 && <View style={styles.statDivider} />}
              </View>
            ))}
          </LinearGradient>
        </View>

        {/* About Hospital */}
        <View style={styles.aboutContainer}>
          <Text style={styles.aboutTitle}>About Hospital</Text>
          <Text style={styles.aboutText}>
            {hospitalData.info}
          </Text>
          
          {/* Contact Information */}
          <View style={styles.contactContainer}>
            <View style={styles.contactItem}>
              <Icon name="map-marker-alt" size={16} color="#003784" />
              <Text style={styles.contactText}>{hospitalData.address}</Text>
            </View>
            <View style={styles.contactItem}>
              <Icon name="phone" size={16} color="#003784" />
              <Text style={styles.contactText}>{hospitalData.phone}</Text>
            </View>
            <View style={styles.contactItem}>
              <Icon name="envelope" size={16} color="#003784" />
              <Text style={styles.contactText}>{hospitalData.email}</Text>
            </View>
          </View>
        </View>

        {/* Most Common Picked */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { color: '#003784' }]}>Most Common Picked</Text>
          <Text style={styles.cardSubtitle}>Select the Department</Text>
          <View style={styles.departmentGrid}>
            {departmentsData.map((dept, index) => (
              <TouchableOpacity 
                key={dept.id || index} 
                style={styles.departmentItem}
                onPress={() => navigation.navigate('DoctorListByHospitalScreen', { 
                  doctors: displayedDoctors,
                  hospitalId: hospital?.id,
                  hospitalName: hospital?.name,
                  selectedCategory: dept.name,
                  specializationId: dept.id,
                  specializationDescription: dept.description,
                  fromHospital: true
                })}
              >
                <View style={[styles.departmentIconContainer, { backgroundColor: dept.color }]}>
                  <Image source={dept.icon} style={styles.departmentIcon} resizeMode="contain" />
                </View>
                <Text style={styles.departmentText}>{dept.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.departmentItem}
              onPress={() => navigation.navigate('DoctorListByHospitalScreen', { 
                doctors: displayedDoctors,
                hospitalId: hospital?.id,
                hospitalName: hospital?.name,
                fromHospital: true
              })}
            >
              <View style={[styles.departmentIconContainer, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0' }]}>
                <Image source={require('../Assets/Images/view_all.png')} style={styles.departmentIcon} resizeMode="contain" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Doctors */}
        <View style={styles.sectionContainer}>
          <View style={styles.doctorsHeader}>
            <View>
              <Text style={styles.headerTextContainer}>Top Doctors</Text>
              <Text style={styles.cardSubtitle}>Available at this hospital</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('DoctorListByHospitalScreen', { 
              doctors: displayedDoctors,
              hospitalId: hospital?.id,
              hospitalName: hospital?.name
            })}>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* Doctors Grid */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.doctorsScroll}
          >
            {doctorsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0D6EFD" />
                <Text style={styles.loadingText}>Loading doctors...</Text>
              </View>
            ) : doctorsError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load doctors</Text>
                <TouchableOpacity onPress={loadDoctorsByClinic} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : displayedDoctors.length > 0 ? (
              displayedDoctors.map((doctor, index) => {
                console.log('=== RENDERING DOCTOR CARD ===');
                console.log('Doctor name:', doctor.name);
                console.log('Doctor image field:', doctor.image);
                console.log('Image source being passed to Image component:', { uri: doctor.image });
                console.log('Full doctor object:', doctor);
                console.log('=== END RENDERING DOCTOR CARD ===');
                
                // Additional safety checks before rendering
                if (!doctor || typeof doctor !== 'object') {
                  console.warn('Skipping invalid doctor object:', doctor);
                  return null;
                }
                
                return (
                  <TouchableOpacity 
                    key={doctor.id || index} 
                    style={styles.doctorCard}
                    onPress={() => navigation.navigate('DoctorAppointment', { 
                      doctor,
                      hospitalName: hospital?.name 
                    })}
                  >
                    <Image 
                      source={{ uri: doctor.image }} 
                      style={styles.doctorImage}
                      onLoad={() => console.log('✅ Image loaded successfully for:', doctor.name, 'URL:', doctor.image)}
                      onError={(error) => {
                        console.log('❌ Image load error for doctor:', doctor.name, 'Image URL:', doctor.image, 'Error:', error);
                        setFailedImages(prev => new Set([...prev, doctor.id]));
                      }}
                    />
                    <View style={styles.doctorInfo}>
                      <Text style={styles.doctorName}>{doctor.name }</Text>
                      <Text style={styles.doctorSpecialty}>{doctor.specialty }</Text>
                    </View>
                  </TouchableOpacity>
                );
              }).filter(Boolean) // Remove any null entries
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No doctors available</Text>
              </View>
            )}
            {displayedDoctors.length > 0 && (
              <TouchableOpacity 
                style={styles.viewAllDoctorCard}
                onPress={() => navigation.navigate('DoctorListByHospitalScreen', { 
                  doctors: displayedDoctors,
                  hospitalId: hospital?.id,
                  hospitalName: hospital?.name
                })}
              >
                <View style={styles.viewAllDoctorContent}>
                  <Text style={styles.viewAllDoctorText}>View All</Text>
                </View>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp('5%'),
  },
  headerImageContainer: {
    height: hp('40%'),
    width: '100%',
  },
  headerImage: {
    flex: 1,
    width: '100%',
  },
  headerImageStyle: {
    resizeMode: 'cover',
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingTop: Platform.OS === 'ios' ? hp('6%') : hp('4%'),
    paddingHorizontal: wp('5%'),
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? hp('6%') : hp('4%'),
    left: wp('5%'),
    zIndex: 1,
  },
  hospitalInfo: {
    flex: 1,
    marginBottom: hp('2%'),
  },
  hospitalName: {
    fontSize: wp('6%'),
    color: '#FFFFFF',
    marginBottom: hp('0.5%'),
    fontFamily: PoppinsFonts.Bold,
  },
  hospitalType: {
    fontSize: wp('4%'),
    color: '#FFFFFF',
    marginBottom: hp('1%'),
    fontFamily: PoppinsFonts.Regular,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: wp('2%'),
  },
  ratingText: {
    fontSize: wp('4%'),
    color: '#FFFFFF',
    fontFamily: PoppinsFonts.Bold,
  },
  callButton: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: '#003784',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  statsContainer: {
    marginHorizontal: wp('3%'),
    marginTop: hp('2%'),
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    
  },
  statsGradient: {
    flexDirection: 'row',
    width:'100%',
    height: hp('8%'),
    borderRadius: 10,
    paddingVertical: hp('1%'),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  statNumber: {
    fontSize: wp('5%'),
    color: '#FFFFFF',
    marginBottom: -hp('0.3%'),
    fontFamily: PoppinsFonts.Bold,
  },
  statLabel: {
    fontSize: wp('3.2%'),
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: PoppinsFonts.Regular,
  },
  statDivider: {
    width: 1,
    height: hp('2.5%'),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -hp('1.25%') }],
  },
  aboutContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: wp('5%'),
    marginTop: hp('1%'),
    padding: wp('5%'),
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: hp('2%'),
  },
  aboutTitle: {
    fontSize: wp('5%'),
    color: '#333',
    marginBottom: hp('1%'),
    fontFamily: PoppinsFonts.Bold,
  },
  aboutText: {
    fontSize: wp('4%'),
    color: '#666',
    lineHeight: wp('5%'),
    marginBottom: hp('2%'),
    fontFamily: PoppinsFonts.Regular,
  },
  contactContainer: {
   // marginTop: hp('2%'),
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  contactText: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginLeft: wp('3%'),
    flex: 1,
    fontFamily: PoppinsFonts.Regular,
  },
  sectionContainer: {
    marginVertical: hp('2%'),
    backgroundColor: '#FFFFFF',
    marginHorizontal: wp('5%'),
    padding: wp('5%'),
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: hp('30%'),
  },
  sectionTitle: {
    fontSize: wp('5%'),
    color: '#333',
    marginBottom: hp('0.5%'),
    fontFamily: PoppinsFonts.Bold,
  },
  sectionSubtitle: {
    fontSize: wp('4%'),
    color: '#666',
    marginBottom: hp('2%'),
    fontFamily: PoppinsFonts.Regular,
  },
  departmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  departmentItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  departmentIcon: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  departmentIconImage: {
    width: wp('6%'),
    height: wp('6%'),
  },
  departmentName: {
    fontSize: wp('3%'),
    color: '#333',
    textAlign: 'center',
    fontFamily: PoppinsFonts.Regular,
  },
  viewAllItem: {
    width: '18%',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  viewAllText: {
    fontSize: wp('3.5%'),
    color: '#003784',
    fontFamily: PoppinsFonts.Bold,
  },
  doctorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: hp('2%'),
  },
  seeAllLink: {
    fontSize: wp('4%'),
    color: '#003784',
    fontFamily: PoppinsFonts.Bold,
  },
  filterScroll: {
    marginBottom: hp('2%'),
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
  filterIcon: {
    width: 17,
    height: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Regular,
  },
  activeFilterText: {
    color: '#0D6EFD',
    fontFamily: PoppinsFonts.Bold,
  },
  inactiveFilterText: {
    color: '#666',
  },
  doctorsScroll: {
    marginTop: hp('1%'),
    height: hp('25%'),
  },
  doctorCard: {
    width: wp('35%'),
    marginRight: wp('4%'),
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorImage: {
    width: '100%',
    height: wp('35%'),
    resizeMode: 'cover',
  },
  doctorInfo: {
    padding: wp('3%'),
  },
  doctorName: {
    fontSize: wp('4%'),
    color: '#333',
    marginBottom: hp('0.5%'),
    fontFamily: PoppinsFonts.Bold,
  },
  doctorSpecialty: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: hp('1%'),
    fontFamily: PoppinsFonts.Regular,
  },
  doctorRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorStars: {
    flexDirection: 'row',
    marginRight: wp('2%'),
  },
  doctorRatingText: {
    fontSize: wp('3.5%'),
    color: '#333',
    fontFamily: PoppinsFonts.Bold,
  },
  viewAllDoctorCard: {
    width: wp('35%'),
    marginRight: wp('4%'),
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',

  },
  viewAllDoctorContent: {
    alignItems: 'center',
  },
  viewAllDoctorText: {
    fontSize: wp('4%'),
    color: '#666',
    fontFamily: PoppinsFonts.Bold,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('5%'),
    padding: wp('5%'),
    marginTop: hp('1%'),
    marginBottom: hp('2.5%'),
    marginHorizontal: wp('5%'),
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
    color: '#666',
    marginTop: hp('0.2%'),
    marginBottom: hp('2%'),
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
  departmentIcon: {
    width: 75,
    height: 75,
  },
  departmentText: {
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#000',
    textAlign: 'center',
  },
  headerTextContainer: {
    fontSize: wp('5%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#333',
    marginBottom: hp('0.5%'),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('4%'),
    width: wp('80%'),
  },
  loadingText: {
    marginTop: hp('1%'),
    fontSize: wp('4%'),
    color: '#666',
    fontFamily: PoppinsFonts.regular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('4%'),
    width: wp('80%'),
  },
  errorText: {
    fontSize: wp('4%'),
    color: '#d9534f',
    fontFamily: PoppinsFonts.regular,
    textAlign: 'center',
    marginBottom: hp('2%'),
  },
  retryButton: {
    backgroundColor: '#0D6EFD',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('2%'),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.medium,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('4%'),
    width: wp('80%'),
  },
  noDataText: {
    fontSize: wp('4%'),
    color: '#666',
    fontFamily: PoppinsFonts.regular,
    textAlign: 'center',
  },
  testImageContainer: {
    marginVertical: hp('2%'),
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: wp('4%'),
    borderRadius: wp('2%'),
  },
  testImageText: {
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Bold,
    marginBottom: hp('1%'),
    color: '#333',
  },
  testImage: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('10%'),
    borderWidth: 2,
    borderColor: '#0D6EFD',
  },
});

export default HospitalDetailsScreen;

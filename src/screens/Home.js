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
  ImageBackground,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import axios from 'axios';

const Home = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch doctors data on component mount
  useEffect(() => {
    loadDoctors();
  }, []);

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

  // Get first 3 doctors for display
  const displayedDoctors = doctors && doctors.length > 0 ? doctors.slice(0, 3) : [];
  const hospitalData = [
    {
      name: 'Hospitals',
      image: require('../Assets/Images/hospital.png'),
      //color: '#BDE4F4',
    },
    {
      name: 'Clinics',
      image: require('../Assets/Images/clinic.png'),
      //  color: '#F8C8D5',
    },
    {
      name: 'Multi Specialty\nClinic',
      image: require('../Assets/Images/multi.png'),
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
    // Map specialization_id to actual specialty names
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

  // Prepare doctors data for display
  const doctorData = displayedDoctors.map((doctor, index) => ({
    id: doctor.id,
    name: doctor.name, // Use the full name from API (already includes "Dr.")
    specialty: getDoctorSpecialty(doctor),
    rating: (4.0 + (index % 3) * 0.3).toFixed(1),
    image: getDoctorImage(doctor).uri,
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
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0D6EFD" />
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading doctors...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6EFD" />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Image
                source={{
                  uri: 'https://randomuser.me/api/portraits/men/32.jpg',
                }}
                style={styles.profileImage}
              />
              <View style={styles.headerTextContainer}>
                <Text style={styles.greetingText}>Hi, Krishna!</Text>
                <View style={styles.locationContainer}>
                  <Text style={styles.locationText}>
                    Luz Corner, Mylapore, Chen...
                  </Text>
                  <Icon name="map-marker-alt" size={16} color="#FFFFFF" style={styles.locationIcon} />
                </View>
              </View>
            </View>
            <View style={styles.searchContainer}>
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
              />
            </View>
          </View>

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
                    onPress={() => navigation.navigate('ClinicsScreen')}
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
                  <TouchableOpacity key={index} style={styles.departmentItem}>
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
                  <Text style={styles.headerTextContainer}>Top Doctors?</Text>
                  <Text style={styles.cardSubtitle}>Select the Department</Text>
                  
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('DoctorListScreen', { doctors: doctors })}>
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
                    onPress={() => setActiveFilter(item.name)}
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
                {doctorData.map((doctor, index) => (
                  <TouchableOpacity key={index} style={styles.doctorCard}>
                    <ImageBackground
                      source={{ uri: doctor.image }}
                      style={styles.doctorImage}
                      imageStyle={{ borderRadius: 15 }}
                    >
                      {doctor.viewAll ? (
                        <TouchableOpacity 
                          style={styles.viewAllDoctorOverlay}
                          onPress={() => navigation.navigate('DoctorListScreen', { doctors: doctors })}
                        >
                          <Text style={styles.viewAllDoctorText}>View All</Text>
                        </TouchableOpacity>
                      ) : (
                        <>
                          <View style={styles.ratingBadge}>
                            <Icon
                              name="star"
                              size={12}
                              color="#FFC107"
                              solid
                              style={{ marginRight: 4 }}
                            />
                            <Text style={styles.ratingText}>
                              {doctor.rating}
                            </Text>
                          </View>
                          <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.7)']}
                            style={styles.doctorInfoGradient}
                          >
                            <Text style={styles.doctorName}>{doctor.name}</Text>
                            <Text style={styles.doctorSpecialty}>
                              {doctor.specialty}
                            </Text>
                          </LinearGradient>
                        </>
                      )}
                    </ImageBackground>
                  </TouchableOpacity>
                ))}
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
    // backgroundColor: '#0f0f0f',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: hp('10%'),
  },
  header: {
    backgroundColor: '#0D6EFD',
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
  profileImage: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: wp('4%'),
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: wp('3.5%'),
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
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  cardSubtitle: {
    fontSize: wp('3.5%'),
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
  },
  inactiveFilterText: {
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    marginBottom: hp('0.3%'),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginTop: hp('0.8%'),
  },
  doctorSpecialty: {
    color: '#FFFFFF',
    fontSize: wp('3.5%'),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
   // marginTop: hp('1.%'),
    paddingBottom:hp('1%'),
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
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
  },
});

export default Home;

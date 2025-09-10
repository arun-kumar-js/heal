import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
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
import LinearGradient from 'react-native-linear-gradient';
import { PoppinsFonts } from '../config/fonts';

const HospitalDetailsScreen = ({ navigation, route }) => {
  const { hospital } = route.params || {};
  
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Use real hospital data or fallback to default values
  const hospitalData = {
    name: hospital?.name || 'Hospital',
    type: hospital?.type || 'hospital',
    rating: hospital?.rating || '4.5',
    info: hospital?.info || 'Hospital information not available',
    address: hospital?.address || 'Address not available',
    phone: hospital?.phone || 'Phone not available',
    email: hospital?.email || 'Email not available',
    logo: hospital?.logo || null,
  };

  const statsData = [
    { number: '2000+', label: 'Reviews' },
    { number: '400+', label: 'Doctors' },
    { number: '12+', label: 'Experience' },
  ];

  const departmentsData = [
    { name: 'Cardiology', icon: require('../Assets/Images/heart.png'), color: '#E53935' },
    { name: 'ENT', icon: require('../Assets/Images/brain.png'), color: '#4CAF50' },
    { name: 'Orthopedics', icon: require('../Assets/Images/bone.png'), color: '#FF9800' },
    { name: 'Neurology', icon: require('../Assets/Images/brain.png'), color: '#2196F3' },
    { name: 'Gastroenterology', icon: require('../Assets/Images/heart.png'), color: '#E91E63' },
  ];

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
      <StatusBar barStyle="light-content" backgroundColor="#003784" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                <Text style={styles.hospitalType}>
                  {hospitalData.type === 'hospital' ? 'Multi Specialty Hospital' : 'Clinic'}
                </Text>
                <View style={styles.ratingContainer}>
                  <View style={styles.starsContainer}>
                    {renderStars(hospitalData.rating)}
                  </View>
                  <Text style={styles.ratingText}>{hospitalData.rating}</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.callButton}>
                <Icon name="phone" size={20} color="#FFFFFF" />
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
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Most Common Picked</Text>
          <Text style={styles.sectionSubtitle}>Select the Department</Text>
          <View style={styles.departmentsGrid}>
            {departmentsData.map((dept, index) => (
              <TouchableOpacity key={index} style={styles.departmentItem}>
                <View style={[styles.departmentIcon, { backgroundColor: dept.color }]}>
                  <Image source={dept.icon} style={styles.departmentIconImage} />
                </View>
                <Text style={styles.departmentName}>{dept.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.viewAllItem}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Doctors */}
        <View style={styles.sectionContainer}>
          <View style={styles.doctorsHeader}>
            <View>
              <Text style={styles.sectionTitle}>Top Doctors</Text>
              <Text style={styles.sectionSubtitle}>Select the Department</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {filterData.map((filter, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.name ? styles.activeFilterChip : styles.inactiveFilterChip,
                ]}
                onPress={() => setSelectedFilter(filter.name)}
              >
                {filter.icon && (
                  <Image
                    source={filter.icon}
                    style={[
                      styles.filterIcon,
                      { tintColor: selectedFilter === filter.name ? '#003784' : '#666' }
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter.name ? styles.activeFilterText : styles.inactiveFilterText,
                  ]}
                >
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Doctors Grid */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.doctorsScroll}
          >
            {doctorsData.map((doctor, index) => (
              <TouchableOpacity key={index} style={styles.doctorCard}>
                <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                  <View style={styles.doctorRating}>
                    <View style={styles.doctorStars}>
                      {renderStars(doctor.rating)}
                    </View>
                    <Text style={styles.doctorRatingText}>{doctor.rating}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.viewAllDoctorCard}>
              <View style={styles.viewAllDoctorContent}>
                <Text style={styles.viewAllDoctorText}>View All</Text>
              </View>
            </TouchableOpacity>
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
 
  //  paddingHorizontal: wp('4%'),
    width:'100%',
    height:'27%',
    borderRadius:10
 
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  statNumber: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: hp('0.3%'),
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
    marginTop: -hp('23.5%'),
    padding: wp('5%'),
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  aboutTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
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
    marginVertical: hp('1%'),
    backgroundColor: '#FFFFFF',
    marginHorizontal: wp('5%'),
    padding: wp('5%'),
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
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
    maxHeight: hp('20%'),
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    fontFamily: PoppinsFonts.Bold,
  },
  filterScroll: {
    marginBottom: hp('2%'),
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    borderRadius: 20,
    marginRight: wp('3%'),
    borderWidth: 1,
  },
  activeFilterChip: {
    backgroundColor: 'rgba(0, 55, 132, 0.1)',
    borderColor: '#003784',
  },
  inactiveFilterChip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  filterIcon: {
    width: 16,
    height: 16,
    marginRight: wp('2%'),
  },
  filterText: {
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Regular,
  },
  activeFilterText: {
    color: '#003784',
    fontWeight: 'bold',
    fontFamily: PoppinsFonts.Bold,
  },
  inactiveFilterText: {
    color: '#666',
    fontFamily: PoppinsFonts.Regular,
  },
  doctorsScroll: {
    marginTop: hp('1%'),
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: '#666',
    fontFamily: PoppinsFonts.Bold,
  },
});

export default HospitalDetailsScreen;

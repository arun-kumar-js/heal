import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import axios from 'axios';

const IMAGE_BASE_URL = 'https://spiderdesk.asia/healto/';

const DoctorListScreen = ({ navigation, route }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Use doctors passed from Home screen
    if (route.params?.doctors) {
      console.log('Using doctors passed from Home screen:', route.params.doctors);
      setDoctors(route.params.doctors);
    }
  }, [route.params?.doctors]);
console.log(doctors)
  

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const getDoctorImage = (doctor) => {
    console.log('Doctor data for image:', doctor);
    
    // Check for various possible image fields with Healto base URL
    if (doctor.profile_image) {
      console.log('Using profile_image:', doctor.profile_image);
      return { uri: `${IMAGE_BASE_URL}${doctor.profile_image}` };
    }
    
    if (doctor.image) {
      console.log('Using image:', doctor.image);
      return { uri: `${IMAGE_BASE_URL}${doctor.image}` };
    }
    
    if (doctor.avatar) {
      console.log('Using avatar:', doctor.avatar);
      return { uri: `${IMAGE_BASE_URL}${doctor.avatar}` };
    }
    
    if (doctor.photo) {
      console.log('Using photo:', doctor.photo);
      return { uri: `${IMAGE_BASE_URL}${doctor.photo}` };
    }
    
    if (doctor.profile_picture) {
      console.log('Using profile_picture:', doctor.profile_picture);
      return { uri: `${IMAGE_BASE_URL}${doctor.profile_picture}` };
    }
    
    if (doctor.doctor_image) {
      console.log('Using doctor_image:', doctor.doctor_image);
      return { uri: `${IMAGE_BASE_URL}${doctor.doctor_image}` };
    }
    
    // Fallback to random user images if no profile image
    const randomImage = `https://randomuser.me/api/portraits/${doctor.gender === 'Female' ? 'women' : 'men'}/${Math.floor(Math.random() * 50) + 1}.jpg`;
    console.log('Using fallback image:', randomImage);
    console.log('Doctor gender:', doctor.gender);
    
    // Test with a simple working image first
    console.log('Testing with simple image URL');
    return { uri: 'https://picsum.photos/300/400' };
  };

  const renderDoctorCard = ({ item: doctor, index }) => (
    <TouchableOpacity key={doctor.id} style={styles.doctorCard}>
      <View style={styles.doctorImageContainer}>
        <Image
          source={getDoctorImage(doctor)}
          style={styles.doctorImage}
          onError={(error) => {
            console.log('Image loading error for doctor:', doctor.name, error);
            console.log('Image source:', getDoctorImage(doctor));
          }}
          onLoad={() => {
            console.log('Image loaded successfully for doctor:', doctor.name);
            console.log('Image source:', getDoctorImage(doctor));
          }}
          onLoadStart={() => {
            console.log('Image loading started for doctor:', doctor.name);
          }}
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

  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.searchBar}>
          <Icon name="search" size={16} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Doctor N..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Doctors Grid */}
      <FlatList
        data={filteredDoctors}
        renderItem={renderDoctorCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: wp('4%'), paddingBottom: hp('2%') }}
        showsVerticalScrollIndicator={false}
      />
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
  doctorCard: {
    flex: 1,
    margin: wp('2%'),
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
    marginTop: wp('2%'),
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
});

export default DoctorListScreen;

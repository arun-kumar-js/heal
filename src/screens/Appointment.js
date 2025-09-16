import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome5';

const Appointment = ({ navigation }) => {
  const doctors = [
    {
      id: 1,
      name: 'Dr. Aishwarya',
      specialty: 'Cardiology',
      clinic: 'From Kl Clinic',
      rating: 4.5,
      image: 'https://ui-avatars.com/api/?name=Dr+Aishwarya&background=0D6EFD&color=fff&size=100',
    },
    {
      id: 2,
      name: 'Dr. Kishore',
      specialty: 'Neurology',
      clinic: 'From Kl Clinic',
      rating: 4.3,
      image: 'https://ui-avatars.com/api/?name=Dr+Kishore&background=0D6EFD&color=fff&size=100',
    },
    {
      id: 3,
      name: 'Dr. Shan',
      specialty: 'Dermatology',
      clinic: 'From Kl Clinic',
      rating: 4.0,
      image: 'https://ui-avatars.com/api/?name=Dr+Shan&background=0D6EFD&color=fff&size=100',
    },
    {
      id: 4,
      name: 'Dr. Stephen',
      specialty: 'Orthopedics',
      clinic: 'From Kl Clinic',
      rating: 4.2,
      image: 'https://ui-avatars.com/api/?name=Dr+Stephen&background=0D6EFD&color=fff&size=100',
    },
  ];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Icon key={i} name="star" size={12} color="#FFD700" solid />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Icon key={i} name="star-half-alt" size={12} color="#FFD700" solid />
        );
      } else {
        stars.push(
          <Icon key={i} name="star" size={12} color="#E5E5E5" />
        );
      }
    }
    return stars;
  };

  const renderDoctorCard = (doctor) => (
    <TouchableOpacity 
      key={doctor.id} 
      style={styles.doctorCard}
      onPress={() => navigation.navigate('AppointmentDetails', { doctor })}
    >
      <View style={styles.doctorInfo}>
        <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
        <View style={styles.doctorDetails}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSpecialty}>
            {doctor.specialty} {doctor.clinic}
          </Text>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(doctor.rating)}
            </View>
            <Text style={styles.ratingText}>{doctor.rating}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.navigateButton}>
        <Icon name="chevron-right" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Appointment Details</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {doctors.map(renderDoctorCard)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0D6EFD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
  },
  backButton: {
    padding: wp('2%'),
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
  headerRight: {
    width: wp('10%'),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  doctorImage: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('7.5%'),
    marginRight: wp('4%'),
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: hp('0.5%'),
    fontFamily: 'Poppins-Bold',
  },
  doctorSpecialty: {
    fontSize: wp('3.5%'),
    color: '#666666',
    marginBottom: hp('1%'),
    fontFamily: 'Poppins-Regular',
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
    fontSize: wp('3.5%'),
    color: '#666666',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  navigateButton: {
    backgroundColor: '#0D6EFD',
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Appointment;

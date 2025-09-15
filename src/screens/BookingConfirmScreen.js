import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const BookingConfirmScreen = ({ navigation, route }) => {
  const { 
    doctor, 
    selectedDate, 
    selectedTime, 
    reason, 
    token,
    personalInfo 
  } = route.params || {};

  // Generate a random token if not provided
  const randomToken = token || Math.floor(Math.random() * 100).toString().padStart(2, '0');

  const getDoctorImage = (doctor) => {
    if (doctor?.profile_image) {
      return { uri: `https://spiderdesk.asia/healto/${doctor.profile_image}` };
    }
    return { 
      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor?.name || 'Dr. Aishwarya')}&size=300&background=ff6b6b&color=fff`
    };
  };

  const getDoctorSpecialty = (doctor) => {
    const specialtyMap = {
      1: 'Cardiology',
      2: 'Dermatology',
      3: 'Orthopedics',
      4: 'Pediatrics',
      5: 'Gynecology',
      6: 'Neurology',
      7: 'Ophthalmology',
      8: 'ENT',
      9: 'Gastroenterology',
      10: 'Pulmonology',
      11: 'Psychiatry',
      12: 'Radiology',
      13: 'Urology',
    };
    return specialtyMap[doctor?.specialization_id] || 'General Medicine';
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Icon key={i} name="star" size={12} color="#FFA500" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Icon key={i} name="star-half-alt" size={12} color="#FFA500" />
        );
      } else {
        stars.push(
          <Icon key={i} name="star" size={12} color="#E0E0E0" />
        );
      }
    }

    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '04th, June, Thursday, 2025';
    
    const date = new Date(dateString);
    const options = { 
      day: 'numeric', 
      month: 'long', 
      weekday: 'long', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleContinueToPayment = () => {
    // Navigate to payment screen
    navigation.navigate('Payment', {
      doctor,
      selectedDate,
      selectedTime,
      reason,
      token: randomToken,
      personalInfo
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={styles.progressStep}>
            <View style={styles.stepCircleContainer}>
              <Image 
                source={require('../Assets/Images/status.png')} 
                style={styles.statusImage}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.stepLabel, styles.inactiveStepText]}>User Detail</Text>
          </View>
          
          <View style={styles.progressLine} />
          
          <View style={styles.progressStep}>
            <View style={styles.stepCircleContainer}>
              <Image 
                source={require('../Assets/Images/status1.png')} 
                style={styles.statusImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.stepLabel}>Time & Date</Text>
          </View>
          
          <View style={styles.progressLine} />
          
          <View style={styles.progressStep}>
            <View style={styles.stepCircleContainer}>
              <Image 
                source={require('../Assets/Images/status.png')} 
                style={styles.statusImage}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.stepLabel, styles.inactiveStepText]}>Payment</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Doctor Information Card */}
        <View style={styles.doctorCard}>
          <Image source={getDoctorImage(doctor)} style={styles.doctorImage} />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor?.name || 'Dr. Aishwarya'}</Text>
            <Text style={styles.doctorSpecialty}>
              {getDoctorSpecialty(doctor)} From {doctor?.clinic_name || 'Kl Clinic'}
            </Text>
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {renderStars(doctor?.rating || 4.5)}
              </View>
              <Text style={styles.ratingText}>{doctor?.rating || 4.5}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Icon name="phone" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Time & Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time & Date</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoIcon}>
              <Icon name="clock" size={16} color="#0D6EFD" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{selectedTime || '10:30 AM'}</Text>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoIcon}>
              <Icon name="calendar" size={16} color="#0D6EFD" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(selectedDate)}</Text>
            </View>
          </View>
        </View>

        {/* Token Number Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Token Number</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoIcon}>
              <Icon name="star" size={16} color="#0D6EFD" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoValue}>{randomToken}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinueToPayment}>
          <Text style={styles.continueButtonText}>Continue to Payment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: wp('2%'),
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: wp('10%'),
  },
  progressContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: hp('3%'),
    paddingHorizontal: wp('5%'),
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: wp('6%'),
    paddingBottom: hp('0%'),
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircleContainer: {
    width: wp('8%'),
    height: wp('8%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1.5%'),
    position: 'relative',
  },
  statusImage: {
    width: wp('6%'),
    height: wp('6%'),
    position: 'absolute',
  },
  inactiveStepText: {
    color: '#666',
  },
  stepLabel: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: hp('1%'),
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: wp('1%'),
    alignSelf: 'center',
    marginTop: -wp('9%'),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('5%'),
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginVertical: hp('2%'),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorImage: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('7.5%'),
    marginRight: wp('4%'),
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp('0.5%'),
  },
  doctorSpecialty: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: hp('0.5%'),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: wp('2%'),
  },
  ratingText: {
    fontSize: wp('3.5%'),
    fontWeight: '500',
    color: '#333',
  },
  callButton: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: '#0D6EFD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp('2%'),
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  infoIcon: {
    width: wp('8%'),
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: hp('0.5%'),
  },
  infoValue: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#333',
  },
  buttonContainer: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  continueButton: {
    backgroundColor: '#0D6EFD',
    borderRadius: wp('2%'),
    paddingVertical: hp('2%'),
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#fff',
  },
});

export default BookingConfirmScreen;

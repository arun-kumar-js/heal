import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const PaymentSuccessScreen = ({ navigation, route }) => {
  const { 
    doctor, 
    selectedDate, 
    selectedTime, 
    reason, 
    token,
    personalInfo,
    paymentAmount,
    paymentMode
  } = route.params || {};

  const formatDate = (dateString) => {
    if (!dateString) return 'June 4th';
    
    const date = new Date(dateString);
    const options = { 
      day: 'numeric', 
      month: 'long'
    };
    const formatted = date.toLocaleDateString('en-US', options);
    return formatted.replace(/(\d+)/, (match) => {
      const day = parseInt(match);
      if (day >= 11 && day <= 13) return day + 'th';
      switch (day % 10) {
        case 1: return day + 'st';
        case 2: return day + 'nd';
        case 3: return day + 'rd';
        default: return day + 'th';
      }
    });
  };

  const handleViewDetails = () => {
    // Navigate to bottom tab's appointment screen
    navigation.navigate('MainApp', {
      screen: 'Appointment',
      params: {
        doctor,
        selectedDate,
        selectedTime,
        reason,
        token,
        personalInfo,
        paymentAmount,
        paymentMode
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Booking Confirmation Image */}
      <View style={styles.illustrationContainer}>
        <Image 
          source={require('../Assets/Images/bookinfconfirm.png')} 
          style={styles.bookingConfirmImage}
          resizeMode="contain"
        />
      </View>

      {/* Appointment Confirmation Text */}
      <View style={styles.confirmationContainer}>
        <Text style={styles.confirmationText}>
          Your appointment with {doctor?.name || 'Dr. Aishwarya'} is
        </Text>
        <Text style={styles.confirmationText}>
          confirmed for {formatDate(selectedDate)} at {selectedTime || '10:30 AM'}
        </Text>
      </View>

      {/* Token Number */}
      <View style={styles.tokenContainer}>
        <View style={styles.tokenBox}>
          <Text style={styles.tokenText}>
            Your token number is {token || '26'}
          </Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Please arrive 10 minutes early and bring any
        </Text>
        <Text style={styles.instructionsText}>
          medical records. We look forward to seeing you!
        </Text>
      </View>

      {/* View Details Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.viewDetailsButton} onPress={handleViewDetails}>
          <Text style={styles.viewDetailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  illustrationContainer: {
    alignItems: 'center',
    paddingTop: hp('8%'),
    paddingBottom: hp('4%'),
    backgroundColor: 'rgba(13, 110, 253, 0.05)',
  },
  bookingConfirmImage: {
    width: wp('70%'),
    height: wp('60%'),
  },
  confirmationContainer: {
    alignItems: 'center',
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('3%'),
  },
  confirmationText: {
    fontSize: wp('5%'),
    fontWeight: '700',
    color: '#0D6EFD',
    textAlign: 'center',
    lineHeight: wp('6%'),
  },
  tokenContainer: {
    alignItems: 'center',
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('2%'),
  },
  tokenBox: {
    backgroundColor: '#FFD700',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tokenText: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#0D6EFD',
    textAlign: 'center',
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('2%'),
  },
  instructionsText: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
    lineHeight: wp('5%'),
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: wp('8%'),
    paddingBottom: hp('4%'),
  },
  viewDetailsButton: {
    backgroundColor: '#0D6EFD',
    borderRadius: wp('2%'),
    paddingVertical: hp('2%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  viewDetailsButtonText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#fff',
  },
});

export default PaymentSuccessScreen;

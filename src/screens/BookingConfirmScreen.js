import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { PoppinsFonts } from '../config/fonts';
import { useSelector } from 'react-redux';
import { formatDateForDisplay } from '../utils/dateUtils';

const BookingConfirmScreen = ({ navigation, route }) => {
  // Get data from Redux slice
  const appointmentDetails = useSelector(state => state.appointmentDetails);
  
  // Fallback to route params if Redux data is not available
  const { 
    doctor: routeDoctor, 
    selectedDate: routeSelectedDate, 
    selectedTime: routeSelectedTime, 
    selectedTimeSlot: routeSelectedTimeSlot,
    reason: routeReason, 
    token: routeToken,
    personalInfo: routePersonalInfo,
    appointmentData: routeAppointmentData
  } = route.params || {};

  // Use Redux data as primary source, fallback to route params
  const doctor = appointmentDetails.formData.doctor || routeDoctor;
  const selectedDate = appointmentDetails.formData.selectedDate || routeSelectedDate;
  const selectedTime = appointmentDetails.formData.selectedTime || routeSelectedTime;
  const selectedTimeSlot = appointmentDetails.formData.selectedTimeSlot || routeSelectedTimeSlot;
  const reason = appointmentDetails.formData.reason || routeReason;
  const token = appointmentDetails.formData.token || routeToken;
  const personalInfo = appointmentDetails.formData.personalInfo || routePersonalInfo;
  const appointmentData = appointmentDetails.currentAppointment || routeAppointmentData;
  const amount = appointmentDetails.formData.amount || selectedTimeSlot?.amount;

  // Debug: Log all data sources
  console.log('📋 BOOKING CONFIRM - Redux data:', appointmentDetails.formData);
  console.log('📋 BOOKING CONFIRM - Route params:', {
    doctor: routeDoctor,
    selectedDate: routeSelectedDate,
    selectedTime: routeSelectedTime,
    selectedTimeSlot: routeSelectedTimeSlot,
    reason: routeReason,
    token: routeToken,
    personalInfo: routePersonalInfo,
    appointmentData: routeAppointmentData
  });
  console.log('📋 BOOKING CONFIRM - Final data used:', {
    doctor,
    selectedDate,
    selectedTime,
    selectedTimeSlot,
    reason,
    token,
    personalInfo,
    appointmentData,
    amount
  });

  // Use token from selectedTimeSlot or fallback to token or generate random
  const randomToken = selectedTimeSlot?.token || token || Math.floor(Math.random() * 100).toString().padStart(2, '0');

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

  // Use the centralized date utility function
  const formatDate = formatDateForDisplay;

  // Format time for display - prioritize selectedTimeSlot
  const formatTime = () => {
    if (selectedTimeSlot?.start_time) {
      return selectedTimeSlot.start_time;
    }
    if (selectedTime) {
      return selectedTime;
    }
    return '10:30 AM';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
            <Text style={styles.stepLabel}>User Detail</Text>
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
            <Text style={[styles.stepLabel, styles.inactiveStepText]}>Time & Date</Text>
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
            <Text style={[styles.stepLabel, styles.inactiveStepText]}>Payment</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Doctor Card */}
        <View style={styles.doctorCard}>
          <Image 
            source={getDoctorImage(doctor)} 
            style={styles.doctorImage}
            resizeMode="cover"
          />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor?.name || 'Dr. Aishwarya'}</Text>
            <Text style={styles.doctorSpecialty}>
              {getDoctorSpecialty(doctor)} From {doctor?.clinic_name || 'KL Clinic'}
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
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Time</Text>
            <View style={styles.inputField}>
              <Image
                source={require('../Assets/Images/Time.png')}
                style={[styles.inputIcon, { width: 16, height: 16 }]}
                resizeMode="contain"
              />
               <Text style={styles.inputText}>{formatTime()}</Text>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date</Text>
            <View style={styles.inputField}>
              <Image
                source={require('../Assets/Images/Date.png')}
                style={[styles.inputIcon, { width: 16, height: 16 }]}
                resizeMode="contain"
              />
              <Text style={styles.inputText}>{formatDate(selectedDate)}</Text>
            </View>
          </View>
        </View>

         {/* Token Number Section */}
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>Token Number</Text>
           <View style={styles.inputGroup}>
             <View style={styles.inputField}>
             <Image
                 source={require('../Assets/Images/token.png')}
                 style={[styles.inputIcon, { width: 16, height: 16 }]}
                 resizeMode="contain"
               />
               <Text style={styles.inputText}>{randomToken}</Text>
             </View>
           </View>
         </View>

         {/* Personal Information Section */}
         {personalInfo && (
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>Personal Information</Text>
             
             <View style={styles.inputGroup}>
               <Text style={styles.inputLabel}>Full Name</Text>
               <View style={styles.inputField}>
                 <Image
                   source={require('../Assets/Images/user1.png')}
                   style={[styles.inputIcon, { width: 16, height: 16 }]}
                   resizeMode="contain"
                 />
                 <Text style={styles.inputText}>{personalInfo.fullName}</Text>
               </View>
             </View>
             
             <View style={styles.inputGroup}>
               <Text style={styles.inputLabel}>Mobile Number</Text>
               <View style={styles.inputField}>
                 <Image
                   source={require('../Assets/Images/phone2.png')}
                   style={[styles.inputIcon, { width: 16, height: 16 }]}
                   resizeMode="contain"
                 />
                 <Text style={styles.inputText}>{personalInfo.mobileNumber}</Text>
               </View>
             </View>
             
             <View style={styles.inputGroup}>
               <Text style={styles.inputLabel}>Email</Text>
               <View style={styles.inputField}>
                 <Image
                   source={require('../Assets/Images/mail1.png')}
                   style={[styles.inputIcon, { width: 16, height: 16 }]}
                   resizeMode="contain"
                 />
                 <Text style={styles.inputText}>{personalInfo.email}</Text>
               </View>
             </View>
           </View>
         )}

         {/* Reason for Visit Section */}
         {reason && (
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>Reason for Visit</Text>
             <View style={styles.inputGroup}>
               <View style={styles.reasonField}>
                 <Text style={styles.reasonText}>{reason}</Text>
               </View>
             </View>
           </View>
         )}

         {/* Payment Amount Section */}
         {(amount || selectedTimeSlot?.amount) && (
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>Payment Amount</Text>
             <View style={styles.inputGroup}>
               <View style={styles.inputField}>
                 <Image
                   source={require('../Assets/Images/status1.png')}
                   style={[styles.inputIcon, { width: 16, height: 16 }]}
                   resizeMode="contain"
                 />
                 <Text style={styles.inputText}>₹{amount || selectedTimeSlot?.amount}</Text>
               </View>
             </View>
           </View>
         )}

        

        
         
           
        
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => {
            const paymentData = {
              doctor: doctor,
              selectedDate: selectedDate,
              selectedTime: selectedTime,
              selectedTimeSlot: selectedTimeSlot,
              reason: reason,
              token: randomToken,
              personalInfo: personalInfo,
              amount: amount || '0',
              appointmentData: appointmentData
            };
            
            console.log('💳 BOOKING CONFIRM - Navigating to Payment with data:', paymentData);
            console.log('💰 BOOKING CONFIRM - Amount from Redux slice:', amount);
            
            navigation.navigate('Payment', paymentData);
          }}
        >
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
    fontFamily: PoppinsFonts.SemiBold,
    color: '#333',
  },
  placeholder: {
    width: wp('10%'),
  },
  progressContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('5%'),
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStep: {
    alignItems: 'center',
  },
  stepCircle: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1%'),
  },
  stepCircleInner: {
    width: wp('4%'),
    height: wp('4%'),
    borderRadius: wp('2%'),
    backgroundColor: '#E0E0E0',
  },
  activeStep: {
    backgroundColor: '#0D6EFD',
  },
  activeStepInner: {
    backgroundColor: '#0D6EFD',
  },
  stepLabel: {
    fontSize: wp('3%'),
    fontFamily: PoppinsFonts.Medium,
    color: '#666',
    textAlign: 'center',
  },
  activeStepText: {
    color: '#0D6EFD',
    fontFamily: PoppinsFonts.SemiBold,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: wp('2%'),
    marginTop: -wp('4%'),
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
    fontFamily: PoppinsFonts.SemiBold,
    color: '#333',
    marginBottom: hp('0.5%'),
  },
  doctorSpecialty: {
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Regular,
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
    fontFamily: PoppinsFonts.Medium,
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
    elevation: 2,
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontFamily: PoppinsFonts.SemiBold,
    color: '#333',
    marginBottom: hp('2%'),
  },
  inputGroup: {
    marginBottom: hp('2%'),
  },
  inputLabel: {
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Medium,
    color: '#333',
    marginBottom: hp('1%'),
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.5%'),
  },
  inputIcon: {
    marginRight: wp('3%'),
  },
  inputText: {
    flex: 1,
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Regular,
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
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.SemiBold,
    color: '#fff',
  },progressContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: hp('.5%'),
    paddingHorizontal: wp('5%'),
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: wp('6%'),
    paddingBottom: hp('0%'), // Add padding to center lines with images
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
    fontSize: wp('3%'),
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: wp('1%'),
    alignSelf: 'center',
    marginTop:- wp('9%'), // Move line up to align with smaller images
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('5%'),
  },
  reasonField: {
    backgroundColor: '#f8f9fa',
    borderRadius: wp('2%'),
    padding: wp('3%'),
    minHeight: hp('8%'),
  },
  reasonText: {
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Regular,
    color: '#333',
    lineHeight: wp('5%'),
  },
  debugContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: wp('2%'),
    padding: wp('3%'),
  },
  debugText: {
    fontSize: wp('3%'),
    fontFamily: PoppinsFonts.Regular,
    color: '#666',
    marginBottom: hp('0.5%'),
  },
});

export default BookingConfirmScreen;
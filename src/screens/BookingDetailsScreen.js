import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { PoppinsFonts, FontStyles } from '../config/fonts';
import BackButton from '../components/BackButton';
import { storeUserDetail, formatAppointmentData } from '../services/bookingApi';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import {
  setDoctor, 
  setDateTime, 
  setPersonalInfo, 
  setReason, 
  setAmount, 
  setToken,
  bookAppointment,
  clearFormData 
} from '../store/slices/appointmentDetailsSlice';
import { convertToISODate, testDateConversion, testMon22Issue } from '../utils/dateUtils';

// Use the centralized date utility function
const convertDateFormat = convertToISODate;

const BookingDetailsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const appointmentDetails = useSelector(state => state.appointmentDetails);
  
  const { 
    doctor, 
    selectedDate, 
    selectedTime, 
    selectedTimeSlot,
    reason, 
    token 
  } = route.params || {};

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState(
    reason || "I've been experiencing frequent chest discomfort, occasional shortness of breath, and unusual fatigue even during light activity."
  );
  const [isReasonEditable, setIsReasonEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Redux state with route params
  useEffect(() => {
    console.log('🔄 BOOKING DETAILS - Initializing Redux state with route params');
    
    if (doctor) {
      dispatch(setDoctor(doctor));
      console.log('👨‍⚕️ BOOKING DETAILS - Doctor dispatched to Redux:', doctor);
    }
    
    if (selectedDate || selectedTime || selectedTimeSlot) {
      // Convert selectedDate to proper format if needed
      const formattedSelectedDate = convertDateFormat(selectedDate) || selectedDate;
      
      dispatch(setDateTime({ 
        selectedDate: formattedSelectedDate, 
        selectedTime, 
        selectedTimeSlot 
      }));
      console.log('📅 BOOKING DETAILS - Date/Time dispatched to Redux:', { 
        selectedDate: formattedSelectedDate, 
        selectedTime, 
        selectedTimeSlot 
      });
    }
    
    if (reason) {
      dispatch(setReason(reason));
      console.log('📝 BOOKING DETAILS - Reason dispatched to Redux:', reason);
    }
    
    if (token) {
      dispatch(setToken(token));
      console.log('🎫 BOOKING DETAILS - Token dispatched to Redux:', token);
    }
    
    if (selectedTimeSlot?.amount) {
      dispatch(setAmount(selectedTimeSlot.amount));
      console.log('💰 BOOKING DETAILS - Amount dispatched to Redux:', selectedTimeSlot.amount);
    } else {
      // Set default amount if no amount found in time slot
      const defaultAmount = 150; // Default consultation fee based on API response
      dispatch(setAmount(defaultAmount));
      console.log('💰 BOOKING DETAILS - No amount in timeSlot, setting default:', defaultAmount);
    }
  }, [doctor, selectedDate, selectedTime, selectedTimeSlot, reason, token, dispatch]);

  // Log Redux state changes
  useEffect(() => {
    console.log('📊 BOOKING DETAILS - Redux state updated:', appointmentDetails);
  }, [appointmentDetails]);

  // Test date conversion on component mount for debugging
  useEffect(() => {
    console.log('🧪 RUNNING DATE CONVERSION TEST:');
    testDateConversion();
    console.log('\n🔍 RUNNING SPECIFIC "Mon 22" TEST:');
    testMon22Issue();
  }, []);

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

  // Validation function for booking data
  const validateBookingData = () => {
    const errors = [];
    
    if (!fullName.trim()) {
      errors.push('Please enter your full name');
    }
    if (!mobileNumber.trim()) {
      errors.push('Please enter your mobile number');
    }
    if (!email.trim()) {
      errors.push('Please enter your email');
    }
    if (!doctor?.id) {
      errors.push('Doctor information is missing');
    }
    if (!selectedDate) {
      errors.push('Please select a date');
    }
    if (!selectedTime) {
      errors.push('Please select a time slot');
    }
    if (!reasonForVisit.trim()) {
      errors.push('Please provide a reason for visit');
    }
    
    return errors;
  };

  const handleNext = async () => {
    // Validate all required fields
    const validationErrors = validateBookingData();
    if (validationErrors.length > 0) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: validationErrors[0], // Show first error
      });
      return;
    }

    // Dispatch personal information to Redux
    const personalInfo = {
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      email: email.trim()
    };
    
    dispatch(setPersonalInfo(personalInfo));
    dispatch(setReason(reasonForVisit.trim()));
    
    console.log('👤 BOOKING DETAILS - Personal info dispatched to Redux:', personalInfo);
    console.log('📝 BOOKING DETAILS - Reason dispatched to Redux:', reasonForVisit.trim());

    setIsLoading(true);

    try {
      // Use token from selected time slot, or generate a random one if not provided
      const randomToken = selectedTimeSlot?.token || token || Math.floor(Math.random() * 100).toString().padStart(2, '0');

      // Dispatch token to Redux
      dispatch(setToken(randomToken));

      // Format the appointment date properly with validation
      console.log('📅 DATE DEBUG:');
      console.log('selectedDate:', selectedDate);
      console.log('selectedDate type:', typeof selectedDate);
      
      const convertedDate = convertDateFormat(selectedDate);
      console.log('📅 BOOKING DETAILS - convertDateFormat result:', convertedDate);
      const formattedDate = convertedDate || new Date().toISOString().split('T')[0];

      console.log('formattedDate:', formattedDate);
      console.log('selectedTimeSlot:', selectedTimeSlot);
      console.log('selectedTime:', selectedTime);
      
      // Format appointment time to railway time (24-hour format)
      let appointmentTime = '';
      if (selectedTimeSlot?.start_time) {
        appointmentTime = selectedTimeSlot.start_time;
      } else if (selectedTime) {
        // Convert selectedTime to railway format if needed
        appointmentTime = selectedTime;
      } else {
        // Fallback to current time in railway format
        const now = new Date();
        appointmentTime = now.toTimeString().slice(0, 5); // HH:MM format
      }
      
      console.log('appointment_time value:', appointmentTime);

      // Get amount from selectedTimeSlot or Redux state or use default
      const appointmentAmount = selectedTimeSlot?.amount || appointmentDetails.formData.amount || 150;
      console.log('💰 BOOKING DETAILS - Using amount for appointment:', appointmentAmount);
      console.log('💰 BOOKING DETAILS - Amount sources:', {
        selectedTimeSlotAmount: selectedTimeSlot?.amount,
        reduxAmount: appointmentDetails.formData.amount,
        finalAmount: appointmentAmount
      });

      // Prepare appointment data
      const appointmentData = {
        doctor_id: doctor?.id || null,
        clinic_id: doctor?.clinic_id || null,
        full_name: fullName.trim(),
        next_token: randomToken,
        time_slot: appointmentTime,
        appointment_date: formattedDate,
        mobile_number: mobileNumber.trim(),
        email: email.trim(),
        reason: reasonForVisit.trim(),
        amount: appointmentAmount // Include amount in appointment data
      };

      console.log('📤 BOOKING APPOINTMENT:', appointmentData);

      // Use Redux async thunk to book appointment
      const result = await dispatch(bookAppointment(appointmentData)).unwrap();

      if (result) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Appointment booked successfully!',
          visibilityTime: 2000,
          onHide: () => {
            // Navigate to booking confirm screen after toast hides
            navigation.navigate('BookingConfirm', {
              appointmentData: result,
              doctor: doctor,
              selectedDate: selectedDate,
              selectedTime: selectedTime,
              selectedTimeSlot: selectedTimeSlot,
              reason: reasonForVisit,
              token: randomToken,
              personalInfo: {
                fullName,
                mobileNumber,
                email
              }
            });
          },
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => navigation.goBack() }
      ]
    );
  };

  const handleEditReason = () => {
    setIsReasonEditable(!isReasonEditable);
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
                source={require('../Assets/Images/status1.png')} 
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

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
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
            <Image 
              source={require('../Assets/Images/phone2.png')} 
             style={{width: wp('12%'), height: wp('12%')}}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Personal Information Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
        </View>
        
        {/* Full Name Card */}
        <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Full Name</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Image
                source={require('../Assets/Images/User.png')}
                style={{ width: 16, height: 16, tintColor: '#0D6EFD' }}
                resizeMode="contain"
              />
            </View>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Mobile Number Card */}

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
            <Image
                source={require('../Assets/Images/Phone.png')}
                style={{ width: 16, height: 16, tintColor: '#0D6EFD' }}
                resizeMode="contain"
              />
            </View>
            <TextInput
              style={styles.input}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="Enter your mobile number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Email Card */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
            <Image
                source={require('../Assets/Images/Mail.png')}
                style={{ width: 16, height: 16, tintColor: '#0D6EFD' }}
                resizeMode="contain"
              />
            </View>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Reason For Visit Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reason For Visit</Text>
            <TouchableOpacity onPress={handleEditReason}>
              <Icon 
                name="pencil-alt" 
                size={14} 
                color={isReasonEditable ? "#0D6EFD" : "#333"} 
              />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={[
              styles.textArea,
              !isReasonEditable && styles.textAreaReadOnly
            ]}
            value={reasonForVisit}
            onChangeText={setReasonForVisit}
            placeholder="Describe your symptoms or reason for visit..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={isReasonEditable}
          />
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.nextButton, isLoading && styles.nextButtonDisabled]} 
          onPress={handleNext}
          disabled={isLoading}
        >
          <Text style={styles.nextButtonText}>
            {isLoading ? 'Booking...' : 'Book Appointment'}
          </Text>
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
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#0D6EFD',
    borderBottomWidth: 1,
    borderBottomColor: '#0D6EFD',
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
    fontFamily: PoppinsFonts.SemiBold,
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
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: hp('1%'),
    paddingHorizontal: wp('1%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
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
    marginBottom: hp('1%'),
  },
  heading: {
    fontSize: 14,
    fontFamily: PoppinsFonts.SemiBold,
    lineHeight: 14, // 100% of fontSize
    letterSpacing: 0,
    color: '#333',
  },
  inputLabel: {
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Medium,
    color: '#333',
    marginBottom: hp('0.5%'),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('3%'),
   // paddingVertical: hp('1%'),
marginTop: hp('1%'),
  },
  inputIcon: {
    marginRight: wp('3%'),
  },
  input: {
    flex: 1,
    fontSize: wp('4%'),
    color: '#333',
  },
  textArea: {
    backgroundColor: '#f8f9fa',
    borderRadius: wp('2%'),
    padding: wp('3%'),
    fontSize: wp('4%'),
    color: '#333',
    minHeight: hp('10%'),
  },
  textAreaReadOnly: {
    backgroundColor: '#f0f0f0',
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: wp('2%'),
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  cancelButtonText: {
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Medium,
    color: '#666',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#0D6EFD',
    borderRadius: wp('2%'),
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
    marginLeft: wp('2%'),
  },
  nextButtonText: {
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.SemiBold,
    color: '#fff',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  callIcon: {
    width: wp('6%'),
    height: wp('6%'),
    color: '#fff',
  },
});

export default BookingDetailsScreen;

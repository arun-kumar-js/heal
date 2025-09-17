import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { PoppinsFonts } from '../config/fonts';
import { useSelector, useDispatch } from 'react-redux';
import { setManualAmount } from '../store/slices/appointmentDetailsSlice';

const PaymentScreen = ({ navigation, route }) => {
  // Get data from Redux slice
  const appointmentDetails = useSelector(state => state.appointmentDetails);
  const dispatch = useDispatch();
  
  // Fallback to route params if Redux data is not available
  const { 
    doctor: routeDoctor, 
    selectedDate: routeSelectedDate, 
    selectedTime: routeSelectedTime, 
    selectedTimeSlot: routeSelectedTimeSlot,
    reason: routeReason, 
    token: routeToken,
    personalInfo: routePersonalInfo,
    amount: routeAmount,
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
  const amount = appointmentDetails.formData.amount || routeAmount || selectedTimeSlot?.amount;

  // Debug: Log all data sources
  console.log('💳 PAYMENT SCREEN - Redux data:', appointmentDetails.formData);
  console.log('💳 PAYMENT SCREEN - Route params:', {
    doctor: routeDoctor,
    selectedDate: routeSelectedDate,
    selectedTime: routeSelectedTime,
    selectedTimeSlot: routeSelectedTimeSlot,
    reason: routeReason,
    token: routeToken,
    personalInfo: routePersonalInfo,
    amount: routeAmount,
    appointmentData: routeAppointmentData
  });
  console.log('💳 PAYMENT SCREEN - Final data used:', {
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

  // Specific amount debugging
  console.log('💰 AMOUNT DEBUG - Route amount:', routeAmount);
  console.log('💰 AMOUNT DEBUG - Redux amount:', appointmentDetails.formData.amount);
  console.log('💰 AMOUNT DEBUG - SelectedTimeSlot object:', selectedTimeSlot);
  console.log('💰 AMOUNT DEBUG - SelectedTimeSlot amount field:', selectedTimeSlot?.amount);
  console.log('💰 AMOUNT DEBUG - SelectedTimeSlot price field:', selectedTimeSlot?.price);
  console.log('💰 AMOUNT DEBUG - SelectedTimeSlot fee field:', selectedTimeSlot?.fee);
  console.log('💰 AMOUNT DEBUG - SelectedTimeSlot cost field:', selectedTimeSlot?.cost);
  console.log('💰 AMOUNT DEBUG - Final amount used:', amount);
  console.log('💰 AMOUNT DEBUG - Amount type:', typeof amount);
  console.log('💰 AMOUNT DEBUG - Amount value:', amount);

  const [selectedPayment, setSelectedPayment] = useState('Full Payment');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('UPI');

  // Set default amount if none is found
  useEffect(() => {
    if (!amount || amount === '0' || amount === 0) {
      console.log('⚠️ PAYMENT SCREEN - No amount found, setting default amount of 150');
      dispatch(setManualAmount(150));
    }
  }, [amount, dispatch]);

  // Log amount debugging information
  useEffect(() => {
    console.log('💰 PAYMENT SCREEN - Amount debugging:');
    console.log('  - Route amount:', routeAmount);
    console.log('  - Redux amount:', appointmentDetails.formData.amount);
    console.log('  - SelectedTimeSlot:', selectedTimeSlot);
    console.log('  - Final amount used:', amount);
    console.log('  - Amount type:', typeof amount);
    console.log('  - Amount value:', amount);
  }, [amount, routeAmount, appointmentDetails.formData.amount, selectedTimeSlot]);

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

  const handlePayNow = () => {
    const fullAmount = amount || 150; // Use amount from Redux or fallback to 150
    const halfAmount = Math.round(fullAmount / 2);
    const finalAmount = selectedPayment === 'Full Payment' ? fullAmount : halfAmount;
    
    console.log('💰 PAYMENT CALCULATION:');
    console.log('  - Original amount:', amount);
    console.log('  - Full amount (with fallback):', fullAmount);
    console.log('  - Half amount (calculated):', halfAmount);
    console.log('  - Selected payment type:', selectedPayment);
    
    // Show confirmation dialog
    Alert.alert(
      'Confirm Payment',
      `Are you sure you want to proceed with ${selectedPayment} of ₹${finalAmount}?\n\nThis action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Proceed',
          style: 'default',
          onPress: () => {
            const paymentData = {
              doctor,
              selectedDate,
              selectedTime,
              selectedTimeSlot,
              reason,
              token,
              personalInfo,
              appointmentData,
              paymentAmount: `₹ ${finalAmount}`,
              paymentMode: selectedPaymentMode,
              actualAmount: finalAmount
            };
            
            console.log('💳 PAYMENT SCREEN - Processing payment:', paymentData);
            console.log('💰 PAYMENT SCREEN - Amount from Redux:', amount);
            console.log('💳 PAYMENT SCREEN - Selected payment type:', selectedPayment);
            console.log('💳 PAYMENT SCREEN - Final payment amount:', paymentData.paymentAmount);
            console.log('💳 PAYMENT SCREEN - Actual amount value:', paymentData.actualAmount);
            
            // Navigate to payment success screen and reset navigation stack
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'PaymentSuccess',
                  params: paymentData
                }
              ]
            });
          },
        },
      ]
    );
  };

  const PaymentOption = ({ title, amount, isSelected, onPress, color }) => (
    <TouchableOpacity style={styles.paymentOption} onPress={onPress}>
      <View style={styles.radioContainer}>
        <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
          {isSelected && <View style={styles.radioButtonInner} />}
        </View>
        <Text style={styles.paymentOptionText}>{title}</Text>
      </View>
      <View style={[styles.amountBox, { backgroundColor: color }]}>
        <Text style={styles.amountText}>{amount}</Text>
      </View>
    </TouchableOpacity>
  );

  const PaymentModeOption = ({ title, isSelected, onPress }) => (
    <TouchableOpacity style={styles.paymentModeOption} onPress={onPress}>
      <View style={styles.radioContainer}>
        <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
          {isSelected && <View style={styles.radioButtonInner} />}
        </View>
        <Text style={styles.paymentModeText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#fff" />
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
                source={require('../Assets/Images/status.png')} 
                style={styles.statusImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.stepLabel}>Payment</Text>
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

       

        {/* Payment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          
          <PaymentOption
            title="Full Payment"
            amount={`₹ ${amount || 150}`}
            isSelected={selectedPayment === 'Full Payment'}
            onPress={() => setSelectedPayment('Full Payment')}
            color="#4CAF50"
          />
          
          <PaymentOption
            title="Partial Payment"
            amount={`₹ ${Math.round((amount || 150) / 2)}`}
            isSelected={selectedPayment === 'Partial Payment'}
            onPress={() => setSelectedPayment('Partial Payment')}
            color="#FF9800"
          />

          <View style={styles.totalAmountContainer}>
            <Text style={styles.totalAmountLabel}>Total Amount</Text>
            <Text style={styles.totalAmountValue}>
              {selectedPayment === 'Full Payment' ? `₹ ${amount || 150}` : `₹ ${Math.round((amount || 150) / 2)}`}
            </Text>
          </View>
        </View>

        {/* Payment Mode Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Mode</Text>
          
          <PaymentModeOption
            title="UPI"
            isSelected={selectedPaymentMode === 'UPI'}
            onPress={() => setSelectedPaymentMode('UPI')}
          />
          
          <PaymentModeOption
            title="Credit Card"
            isSelected={selectedPaymentMode === 'Credit Card'}
            onPress={() => setSelectedPaymentMode('Credit Card')}
          />
          
          <PaymentModeOption
            title="Net Banking"
            isSelected={selectedPaymentMode === 'Net Banking'}
            onPress={() => setSelectedPaymentMode('Net Banking')}
          />
          
          <PaymentModeOption
            title="Cash"
            isSelected={selectedPaymentMode === 'Cash'}
            onPress={() => setSelectedPaymentMode('Cash')}
          />
        </View>
      </ScrollView>

      {/* Pay Now Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.payNowButton} onPress={handlePayNow}>
          <Text style={styles.payNowButtonText}>Pay Now</Text>
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
    color: '#fff',
  },
  placeholder: {
    width: wp('10%'),
  },
  progressContainer: {
    backgroundColor: '#f8f9fa',
   // paddingVertical: hp('3%'),
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
    fontSize: wp('3%'),
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
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioButton: {
    width: wp('5%'),
    height: wp('5%'),
    borderRadius: wp('2.5%'),
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  radioButtonSelected: {
    borderColor: '#0D6EFD',
  },
  radioButtonInner: {
    width: wp('2.5%'),
    height: wp('2.5%'),
    borderRadius: wp('1.25%'),
    backgroundColor: '#0D6EFD',
  },
  paymentOptionText: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#333',
  },
  amountBox: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.8%'),
    borderRadius: wp('1%'),
  },
  amountText: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: '#fff',
  },
  totalAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('1%'),
    paddingTop: hp('1%'),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalAmountLabel: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#333',
  },
  totalAmountValue: {
    fontSize: wp('4%'),
    fontWeight: '700',
    color: '#0D6EFD',
  },
  paymentModeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  paymentModeText: {
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
  payNowButton: {
    backgroundColor: '#0D6EFD',
    borderRadius: wp('2%'),
    paddingVertical: hp('2%'),
    alignItems: 'center',
  },
  payNowButtonText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#fff',
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
});

export default PaymentScreen;

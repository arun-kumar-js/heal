import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { 
  getAppointmentStatusColor,
  getAppointmentStatusText,
  formatAppointmentDate,
  formatAppointmentTime
} from '../services/appointmentBookingApi';
import { PoppinsFonts } from '../config/fonts';

// Helper function to get specialization name from ID
const getSpecializationName = (specializationId) => {
  const specializationMap = {
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
  return specializationMap[specializationId] || 'General Medicine';
};

const AppointmentDetailsScreen = ({ navigation, route }) => {
  const { appointment, doctor } = route.params || {};
  
  // Extract data from appointment object (handle new API structure)
  const appointmentData = appointment?.appointment || appointment;
  const doctorData = appointmentData?.doctor || appointment?.doctor || doctor;
  const patientData = appointmentData?.patient || appointment?.patient;
  const clinicData = appointmentData?.clinic || appointment?.clinic;
  const subPatientData = appointmentData?.sub_patient || appointment?.sub_patient;
  
  // Get appointment details
  const appointmentDate = formatAppointmentDate(
    appointmentData?.appointment_date || 
    appointmentData?.date || 
    appointmentData?.created_at
  );
  
  const appointmentTime = formatAppointmentTime(
    appointmentData?.appointment_time || 
    appointmentData?.time || 
    '09:00:00'
  );
  
  const status = appointmentData?.status || appointment?.status;
  const statusColor = getAppointmentStatusColor(status);
  const statusText = getAppointmentStatusText(status);
  
  // Get payment details from appointment_detail level
  const paymentStatus = appointment?.payment_status || appointmentData?.payment_status;
  const paymentAmount = appointment?.payment_amount || appointmentData?.payment_amount;
  const amountPaid = appointment?.amount_paid || appointmentData?.amount_paid;
  const balanceAmount = appointment?.balance_amount || appointmentData?.balance_amount;
  const refundAmount = appointment?.refund_amount || appointmentData?.refund_amount;
  
  const description = appointment?.description || appointmentData?.description;
  const tokenNumber = appointment?.token || appointmentData?.token || appointment?.id || appointmentData?.id;
  
  // Get doctor info
  const doctorName = doctorData?.name || 'Dr. Unknown';
  const doctorSpecialty = doctorData?.specialization_id ? 
    getSpecializationName(doctorData.specialization_id) : 
    (doctorData?.specialization || 'General Medicine');
  const doctorPhone = doctorData?.phone || '';
  const doctorEmail = doctorData?.email || '';
  const doctorExperience = doctorData?.experience_years || '';
  const doctorQualification = doctorData?.qualification || '';
  const doctorInfo = doctorData?.info || '';
  
  const baseUrl = 'https://spiderdesk.asia/healto/';
  const doctorImage = doctorData?.profile_image ? 
    `${baseUrl}${doctorData.profile_image}` :
    `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&background=0D6EFD&color=fff&size=100`;
  
  // Get patient info (prefer sub-patient if available)
  const patientName = subPatientData?.name || patientData?.name || 'Patient';
  const patientPhone = subPatientData?.phone_number || patientData?.phone_number || patientData?.phone || '';
  const patientEmail = subPatientData?.email || patientData?.email || '';
  const patientGender = subPatientData?.gender || patientData?.gender || '';
  
  // Get clinic info
  const clinicName = clinicData?.name || 'Clinic';
  const clinicPhone = clinicData?.phone || '';
  const clinicEmail = clinicData?.email || '';
  
  // Get payment status color and text
  const getPaymentStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return { color: '#28a745', text: 'Paid' };
      case 'partial':
        return { color: '#ffc107', text: 'Partial' };
      case 'unpaid':
      case 'pending':
        return { color: '#dc3545', text: 'Unpaid' };
      default:
        return { color: '#6c757d', text: status || 'Unknown' };
    }
  };
  
  const paymentInfo = getPaymentStatusInfo(paymentStatus);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Icon key={i} name="star" size={14} color="#FF9500" solid />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Icon key={i} name="star-half-alt" size={14} color="#FF9500" solid />
        );
      } else {
        stars.push(
          <Icon key={i} name="star" size={14} color="#E5E5E5" />
        );
      }
    }
    return stars;
  };

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

      {/* Content with KeyboardAvoidingView */}
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Doctor Information Card */}
        <View style={styles.doctorCard}>
          <Image 
            source={{ uri: doctorImage }} 
            style={styles.doctorImage} 
          />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctorName}</Text>
            <Text style={styles.doctorSpecialty}>
              {doctorSpecialty}
            </Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>{doctorData?.rating || '4.5'}</Text>
              <View style={styles.starsContainer}>
                {renderStars(doctorData?.rating || 4.5)}
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Icon name="phone" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Token Number Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Token Number</Text>
          <View style={styles.inputContainer}>
            <Icon name="bullseye" size={16} color="#0D6EFD" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={tokenNumber ? tokenNumber.toString() : 'Not assigned'}
              editable={false}
              placeholder="Token Number"
            />
          </View>
        </View>

        {/* Reason For Visit Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason For Visit</Text>
          <View style={styles.textAreaContainer}>
            <Text style={styles.textArea}>
              {description || 'No description provided'}
            </Text>
          </View>
        </View>

        {/* Time Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time</Text>
          <View style={styles.inputContainer}>
            <Icon name="clock" size={16} color="#0D6EFD" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={appointmentTime}
              editable={false}
              placeholder="Time"
            />
          </View>
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <View style={styles.inputContainer}>
            <Icon name="calendar" size={16} color="#0D6EFD" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={appointmentDate}
              editable={false}
              placeholder="Date"
            />
          </View>
        </View>

        {/* Appointment Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Appointment Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Payment Status:</Text>
            <View style={[styles.paymentBadge, { 
              backgroundColor: paymentInfo.color
            }]}>
              <Text style={{color:"black",fontSize:wp('3%'),fontFamily:PoppinsFonts.SemiBold}}>
                {paymentInfo.text}
              </Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Date & Time:</Text>
            <Text style={styles.dateTimeText}>{appointmentDate} at {appointmentTime}</Text>
          </View>
          {description && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Description:</Text>
              <Text style={styles.descriptionText}>{description}</Text>
            </View>
          )}
          {paymentAmount && paymentAmount !== '0.00' && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Amount:</Text>
              <Text style={styles.amountText}>₹{paymentAmount}</Text>
            </View>
          )}
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          
          <View style={styles.inputContainer}>
            <Icon name="user" size={16} color="#0D6EFD" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={patientName}
              editable={false}
              placeholder="Full Name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="phone" size={16} color="#0D6EFD" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={patientPhone || 'Not provided'}
              editable={false}
              placeholder="Mobile Number"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="envelope" size={16} color="#0D6EFD" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={patientEmail || 'Not provided'}
              editable={false}
              placeholder="Email"
            />
          </View>

          {patientGender && (
            <View style={styles.inputContainer}>
              <Icon name="venus-mars" size={16} color="#0D6EFD" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={patientGender}
                editable={false}
                placeholder="Gender"
              />
            </View>
          )}
        </View>

        {/* Clinic Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinic Information</Text>
          
          <View style={styles.inputContainer}>
            <Icon name="hospital" size={16} color="#0D6EFD" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={clinicName}
              editable={false}
              placeholder="Clinic Name"
            />
          </View>

          {clinicPhone && (
            <View style={styles.inputContainer}>
              <Icon name="phone" size={16} color="#0D6EFD" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={clinicPhone}
                editable={false}
                placeholder="Clinic Phone"
              />
            </View>
          )}

          {clinicEmail && (
            <View style={styles.inputContainer}>
              <Icon name="envelope" size={16} color="#0D6EFD" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={clinicEmail}
                editable={false}
                placeholder="Clinic Email"
              />
            </View>
          )}

        </View>

        {/* Payment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.paymentContainer}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Total Amount:</Text>
              <Text style={styles.paymentValue}>₹{paymentAmount || '0.00'}</Text>
            </View>
            {amountPaid && amountPaid !== '0.00' && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Amount Paid:</Text>
                <Text style={[styles.paymentValue, { color: '#28a745' }]}>₹{amountPaid}</Text>
              </View>
            )}
            {balanceAmount && balanceAmount !== '0.00' && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Balance Amount:</Text>
                <Text style={[styles.paymentValue, { color: '#dc3545' }]}>₹{balanceAmount}</Text>
              </View>
            )}
            {refundAmount && refundAmount !== '0.00' && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Refund Amount:</Text>
                <Text style={[styles.paymentValue, { color: '#17a2b8' }]}>₹{refundAmount}</Text>
              </View>
            )}
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Status:</Text>
              <View style={[styles.paymentStatusBadge, { backgroundColor: paymentInfo.color }]}>
                <Text style={styles.paymentStatusText}>{paymentInfo.text}</Text>
              </View>
            </View>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardContainer: {
    flex: 1,
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
    color: '#FFFFFF',
    fontFamily: PoppinsFonts.Bold,
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
    padding: wp('3%'),
    marginBottom: hp('1%'),
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  doctorImage: {
    width: wp('18%'),
    height: wp('18%'),
    borderRadius: wp('9%'),
    marginRight: wp('4%'),
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: wp('4.5%'),
    color: '#333333',
    marginBottom: hp('0.5%'),
    fontFamily: PoppinsFonts.Bold,
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
  ratingText: {
    fontSize: wp('3.5%'),
    color: '#333333',
    marginRight: wp('2%'),
    fontFamily: PoppinsFonts.SemiBold,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  callButton: {
    backgroundColor: '#0D6EFD',
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: hp('1%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    color: '#333333',
    marginBottom: hp('0.8%'),
    fontFamily: PoppinsFonts.Bold,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('3%'),
   // paddingVertical: hp('1%'),
    marginBottom: hp('0.8%'),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputIcon: {
    marginRight: wp('3%'),
  },
  input: {
    flex: 1,
    fontSize: wp('4%'),
    color: '#333333',
    fontFamily: 'Poppins-Regular',
  },
  textAreaContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('2%'),
    padding: wp('3%'),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  textArea: {
    fontSize: wp('4%'),
    color: '#333333',
    lineHeight: wp('5%'),
    fontFamily: 'Poppins-Regular',
  },
  paymentContainer: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1%'),
  },
  paymentText: {
    fontSize: wp('3%'),
    color: '#000000',
    fontFamily: 'Poppins-Regular',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  paymentLabel: {
    fontSize: wp('3.5%'),
    color: '#666666',
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  paymentValue: {
    fontSize: wp('3.5%'),
    color: '#333333',
    fontFamily: PoppinsFonts.SemiBold,
    flex: 1,
    textAlign: 'right',
  },
  paymentStatusBadge: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('1.5%'),
  },
  paymentStatusText: {
    fontSize: wp('3%'),
    color: '#FFFFFF',
    fontFamily: PoppinsFonts.SemiBold,
  },
  // New styles for status card
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    padding: wp('3%'),
    marginBottom: hp('1%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  statusLabel: {
    fontSize: wp('4%'),
    color: '#333333',
    fontFamily: PoppinsFonts.SemiBold,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('2%'),
  },
  statusText: {
    fontSize: wp('3%'),
    color: '#FFFFFF',
    fontFamily: PoppinsFonts.SemiBold,
  },
  paymentBadge: {
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.3%'),
    borderRadius: wp('1.5%'),
  },
  paymentText: {
    fontSize: wp('4%'),
    color: 'black',
    fontFamily: PoppinsFonts.SemiBold,
  },
  dateTimeText: {
    fontSize: wp('3.5%'),
    color: '#0D6EFD',
    fontFamily: PoppinsFonts.SemiBold,
  },
  descriptionText: {
    fontSize: wp('3.5%'),
    color: '#666666',
    fontStyle: 'italic',
    fontFamily: 'Poppins-Regular',
    flex: 1,
    textAlign: 'right',
  },
  amountText: {
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.SemiBold,
    color:"black"
  },
});

export default AppointmentDetailsScreen;

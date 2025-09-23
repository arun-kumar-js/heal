import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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
import { submitReview, testReviewEndpoint } from '../services/reviewApi';
import { PoppinsFonts } from '../config/fonts';
import { 
  getReviewForAppointment, 
  saveReviewForAppointment, 
  hasReviewForAppointment 
} from '../utils/reviewStorage';

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
  
  // Feedback form state
  const [doctorRating, setDoctorRating] = useState(0);
  const [hospitalRating, setHospitalRating] = useState(0);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  const [savedReview, setSavedReview] = useState(null);

  // Test API endpoint when component mounts (only for completed appointments)
  React.useEffect(() => {
    if (status?.toLowerCase() === 'completed') {
      console.log('Testing review endpoint for completed appointment...');
      testReviewEndpoint();
    }
  }, [status]);

  // Load saved review data when component mounts
  React.useEffect(() => {
    const loadSavedReview = async () => {
      if (status?.toLowerCase() === 'completed') {
        const appointmentId = appointmentData?.id || appointment?.id;
        if (appointmentId) {
          const reviewExists = await hasReviewForAppointment(appointmentId);
          if (reviewExists) {
            const savedReviewData = await getReviewForAppointment(appointmentId);
            if (savedReviewData) {
              setSavedReview(savedReviewData);
              setDoctorRating(savedReviewData.doctor_rating || 0);
              setHospitalRating(savedReviewData.clinic_rating || 0);
              setIsReviewSubmitted(true);
              console.log('Loaded saved review:', savedReviewData);
            }
          }
        }
      }
    };

    loadSavedReview();
  }, [status, appointmentData, appointment]);
  
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
  const doctorSpecialty = doctorData?.specialization?.name || 
    (doctorData?.specialization_id ? 
      getSpecializationName(doctorData.specialization_id) : 
      'Specialization not available');
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

  // Feedback form functions
  const handleDoctorRating = (rating) => {
    setDoctorRating(rating);
  };

  const handleHospitalRating = (rating) => {
    setHospitalRating(rating);
  };

  // Handle phone call functionality
  const handlePhoneCall = () => {
    const phoneNumber = clinicPhone || doctorPhone;
    if (phoneNumber) {
      const phoneUrl = `tel:${phoneNumber}`;
      Linking.openURL(phoneUrl).catch(err => {
        console.error('Error opening phone dialer:', err);
        Alert.alert('Error', 'Unable to open phone dialer');
      });
    } else {
      Alert.alert('No Phone Number', 'Phone number not available');
    }
  };

  const handleSubmitFeedback = async () => {
    if (doctorRating === 0 || hospitalRating === 0) {
      alert('Please rate both doctor and hospital before submitting feedback.');
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      // Prepare review data according to the API specification
      const reviewData = {
        doctor_id: doctorData?.id || appointmentData?.doctor_id,
        clinic_id: clinicData?.id || appointmentData?.clinic_id,
        patient_id: patientData?.id || appointmentData?.patient_id,
        doctor_rating: doctorRating,
        clinic_rating: hospitalRating,
        appointment_id: appointmentData?.id || appointment?.id
      };

      // Detailed console logging for debugging
      console.log('=== REVIEW SUBMISSION DEBUG ===');
      console.log('Doctor Rating:', doctorRating);
      console.log('Hospital Rating:', hospitalRating);
      console.log('--- Raw Data Sources ---');
      console.log('doctorData:', doctorData);
      console.log('clinicData:', clinicData);
      console.log('patientData:', patientData);
      console.log('appointmentData:', appointmentData);
      console.log('appointment:', appointment);
      console.log('--- Extracted IDs ---');
      console.log('doctor_id:', doctorData?.id || appointmentData?.doctor_id);
      console.log('clinic_id:', clinicData?.id || appointmentData?.clinic_id);
      console.log('patient_id:', patientData?.id || appointmentData?.patient_id);
      console.log('appointment_id:', appointmentData?.id || appointment?.id);
      console.log('--- Final Review Data ---');
      console.log('Review Data Object:', JSON.stringify(reviewData, null, 2));
      console.log('=== END REVIEW DEBUG ===');

      // Save review data locally first
      const appointmentId = appointmentData?.id || appointment?.id;
      const saveSuccess = await saveReviewForAppointment(appointmentId, reviewData);
      
      if (saveSuccess) {
        console.log('Review saved locally successfully');
        setSavedReview(reviewData);
        setIsReviewSubmitted(true);
        alert('Thank you for your feedback!');
      } else {
        console.error('Failed to save review locally');
        alert('Failed to save feedback. Please try again.');
        return;
      }

      // Try to submit to API (optional - for server sync)
      try {
        const result = await submitReview(reviewData);
        console.log('API Response:', result);
        
        if (result.success) {
          console.log('Review also submitted to server successfully');
        } else {
          console.log('Server submission failed, but local save was successful');
        }
      } catch (apiError) {
        console.log('API submission failed, but local save was successful:', apiError);
      }
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

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

  const renderInteractiveStars = (rating, onRatingChange) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => onRatingChange(i)}
          style={styles.starButton}
        >
          <Icon 
            name="star" 
            size={20} 
            color={i <= rating ? "#FFD700" : "#E5E5E5"} 
            solid={i <= rating}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#1A83FF" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1A83FF', '#003784']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Details</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

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
             <Text style={styles.hospitalName}>{clinicName}</Text>
             <View style={styles.ratingContainer}>
               <Text style={styles.ratingText}>{doctorData?.rating || '4.5'}</Text>
               <View style={styles.starsContainer}>
                 {renderStars(doctorData?.rating || 4.5)}
               </View>
             </View>
           </View>
           <TouchableOpacity style={styles.callButton} onPress={handlePhoneCall}>
             <Icon name="phone" size={16} color="#FFFFFF" />
           </TouchableOpacity>
         </View>

         {/* Payment Details Card */}
         <View style={styles.paymentCard}>
           <View style={styles.paymentCardHeader}>
             <View style={styles.paymentCardTitleContainer}>
               <Icon name="credit-card" size={20} color="#0D6EFD" />
               <Text style={styles.paymentCardTitle}>Payment Details</Text>
             </View>
           </View>
           
           <View style={styles.paymentInfoGrid}>
             <View style={styles.paymentInfoItem}>
               <View style={styles.paymentInfoIconContainer}>
                 <Icon name="money-bill-wave" size={16} color="#0D6EFD" />
               </View>
               <View style={styles.paymentInfoContent}>
                 <Text style={styles.paymentInfoLabel}>Total Amount</Text>
                 <Text style={styles.paymentInfoValue}>₹{paymentAmount || '0.00'}</Text>
               </View>
             </View>

             {amountPaid && amountPaid !== '0.00' && (
               <View style={styles.paymentInfoItem}>
                 <View style={styles.paymentInfoIconContainer}>
                   <Icon name="check-circle" size={16} color="#28a745" />
                 </View>
                 <View style={styles.paymentInfoContent}>
                   <Text style={styles.paymentInfoLabel}>Amount Paid</Text>
                   <Text style={[styles.paymentInfoValue, { color: '#28a745' }]}>₹{amountPaid}</Text>
                 </View>
               </View>
             )}

             {balanceAmount && balanceAmount !== '0.00' && (
               <View style={styles.paymentInfoItem}>
                 <View style={styles.paymentInfoIconContainer}>
                   <Icon name="exclamation-triangle" size={16} color="#dc3545" />
                 </View>
                 <View style={styles.paymentInfoContent}>
                   <Text style={styles.paymentInfoLabel}>Balance Amount</Text>
                   <Text style={[styles.paymentInfoValue, { color: '#dc3545' }]}>₹{balanceAmount}</Text>
                 </View>
               </View>
             )}

             {refundAmount && refundAmount !== '0.00' && (
               <View style={styles.paymentInfoItem}>
                 <View style={styles.paymentInfoIconContainer}>
                   <Icon name="undo" size={16} color="#17a2b8" />
                 </View>
                 <View style={styles.paymentInfoContent}>
                   <Text style={styles.paymentInfoLabel}>Refund Amount</Text>
                   <Text style={[styles.paymentInfoValue, { color: '#17a2b8' }]}>₹{refundAmount}</Text>
                 </View>
               </View>
             )}

             <View style={styles.paymentInfoItem}>
               <View style={styles.paymentInfoIconContainer}>
                 <Icon name="info-circle" size={16} color="#0D6EFD" />
               </View>
               <View style={styles.paymentInfoContent}>
                 <Text style={styles.paymentInfoLabel}>Payment Status</Text>
                 <View style={[styles.paymentStatusBadge, { backgroundColor: paymentInfo.color }]}>
                   <Text style={styles.paymentStatusText}>{paymentInfo.text}</Text>
                 </View>
               </View>
             </View>
           </View>
         </View>

        {/* Appointment Details Card */}
        <View style={styles.appointmentDetailsCard}>
          <View style={styles.appointmentDetailsCardHeader}>
            <View style={styles.appointmentDetailsCardTitleContainer}>
              <Icon name="calendar-alt" size={20} color="#0D6EFD" />
              <Text style={styles.appointmentDetailsCardTitle}>Appointment Details</Text>
            </View>
          </View>
          
          <View style={styles.appointmentDetailsGrid}>
            <View style={styles.appointmentDetailsItem}>
              <View style={styles.appointmentDetailsIconContainer}>
                <Icon name="bullseye" size={16} color="#0D6EFD" />
              </View>
              <View style={styles.appointmentDetailsContent}>
                <Text style={styles.appointmentDetailsLabel}>Token Number</Text>
                <Text style={styles.appointmentDetailsValue}>
                  {tokenNumber ? tokenNumber.toString() : 'Not assigned'}
                </Text>
              </View>
            </View>

            <View style={styles.appointmentDetailsItem}>
              <View style={styles.appointmentDetailsIconContainer}>
                <Icon name="clock" size={16} color="#0D6EFD" />
              </View>
              <View style={styles.appointmentDetailsContent}>
                <Text style={styles.appointmentDetailsLabel}>Appointment Time</Text>
                <Text style={styles.appointmentDetailsValue}>{appointmentTime}</Text>
              </View>
            </View>

            <View style={styles.appointmentDetailsItem}>
              <View style={styles.appointmentDetailsIconContainer}>
                <Icon name="calendar" size={16} color="#0D6EFD" />
              </View>
              <View style={styles.appointmentDetailsContent}>
                <Text style={styles.appointmentDetailsLabel}>Appointment Date</Text>
                <Text style={styles.appointmentDetailsValue}>{appointmentDate}</Text>
              </View>
            </View>

            <View style={styles.appointmentDetailsItemFull}>
              <View style={styles.appointmentDetailsIconContainer}>
                <Icon name="file-medical-alt" size={16} color="#0D6EFD" />
              </View>
              <View style={styles.appointmentDetailsContent}>
                <Text style={styles.appointmentDetailsLabel}>Reason For Visit</Text>
                <Text style={styles.appointmentDetailsValue}>
                  {description || 'No description provided'}
                </Text>
              </View>
            </View>
          </View>
        </View>


        {/* Appointment Status Card */}
       
        {/* Patient Information Card */}
        <View style={styles.patientCard}>
          <View style={styles.patientCardHeader}>
            <View style={styles.patientCardTitleContainer}>
              <Icon name="user-circle" size={20} color="#0D6EFD" />
              <Text style={styles.patientCardTitle}>Patient Information</Text>
            </View>
          </View>
          
          <View style={styles.patientInfoGrid}>
            <View style={styles.patientInfoItem}>
              <View style={styles.patientInfoIconContainer}>
                <Icon name="user" size={16} color="#0D6EFD" />
              </View>
              <View style={styles.patientInfoContent}>
                <Text style={styles.patientInfoLabel}>Full Name</Text>
                <Text style={styles.patientInfoValue}>{patientName}</Text>
              </View>
            </View>

            <View style={styles.patientInfoItem}>
              <View style={styles.patientInfoIconContainer}>
                <Icon name="phone" size={16} color="#0D6EFD" />
              </View>
              <View style={styles.patientInfoContent}>
                <Text style={styles.patientInfoLabel}>Mobile Number</Text>
                <Text style={styles.patientInfoValue}>{patientPhone || 'Not provided'}</Text>
              </View>
            </View>

            <View style={styles.patientInfoItem}>
              <View style={styles.patientInfoIconContainer}>
                <Icon name="envelope" size={16} color="#0D6EFD" />
              </View>
              <View style={styles.patientInfoContent}>
                <Text style={styles.patientInfoLabel}>Email Address</Text>
                <Text style={styles.patientInfoValue}>{patientEmail || 'Not provided'}</Text>
              </View>
            </View>

           
          </View>
        </View>

        {/* Clinic Information Card */}
        <View style={styles.clinicCard}>
          <View style={styles.clinicCardHeader}>
            <View style={styles.clinicCardTitleContainer}>
              <Icon name="hospital" size={20} color="#0D6EFD" />
              <Text style={styles.clinicCardTitle}>Clinic Information</Text>
            </View>
          </View>
          
          <View style={styles.clinicInfoGrid}>
            <View style={styles.clinicInfoItem}>
              <View style={styles.clinicInfoIconContainer}>
                <Icon name="hospital" size={16} color="#0D6EFD" />
              </View>
              <View style={styles.clinicInfoContent}>
                <Text style={styles.clinicInfoLabel}>Clinic Name</Text>
                <Text style={styles.clinicInfoValue}>{clinicName}</Text>
              </View>
            </View>

            {clinicPhone && (
              <View style={styles.clinicInfoItem}>
                <View style={styles.clinicInfoIconContainer}>
                  <Icon name="phone" size={16} color="#0D6EFD" />
                </View>
                <View style={styles.clinicInfoContent}>
                  <Text style={styles.clinicInfoLabel}>Phone Number</Text>
                  <Text style={styles.clinicInfoValue}>{clinicPhone}</Text>
                </View>
              </View>
            )}

            {clinicEmail && (
              <View style={styles.clinicInfoItem}>
                <View style={styles.clinicInfoIconContainer}>
                  <Icon name="envelope" size={16} color="#0D6EFD" />
                </View>
                <View style={styles.clinicInfoContent}>
                  <Text style={styles.clinicInfoLabel}>Email Address</Text>
                  <Text style={styles.clinicInfoValue}>{clinicEmail}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Payment Section
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
        </View> */}

        {/* Feedback Form - Only show for completed appointments */}
        {status?.toLowerCase() === 'completed' && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>
              {isReviewSubmitted ? 'Your Review' : 'How was your experience?'}
            </Text>
            
            <View style={styles.ratingSection}>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Rate Doctor</Text>
                <View style={styles.starsContainer}>
                  {isReviewSubmitted ? (
                    renderStars(doctorRating)
                  ) : (
                    renderInteractiveStars(doctorRating, handleDoctorRating)
                  )}
                </View>
              </View>
              
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Rate Hospital</Text>
                <View style={styles.starsContainer}>
                  {isReviewSubmitted ? (
                    renderStars(hospitalRating)
                  ) : (
                    renderInteractiveStars(hospitalRating, handleHospitalRating)
                  )}
                </View>
              </View>
            </View>

            {isReviewSubmitted && savedReview && (
              <View style={styles.submittedReviewInfo}>
                <Text style={styles.submittedReviewText}>
                  Review submitted on {new Date(savedReview.submittedAt).toLocaleDateString()}
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={[
                styles.submitButton, 
                (isSubmittingFeedback || isReviewSubmitted) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitFeedback}
              disabled={isSubmittingFeedback || isReviewSubmitted}
            >
              <Text style={styles.submitButtonText}>
                {isSubmittingFeedback ? 'Submitting...' : 
                 isReviewSubmitted ? 'Review Submitted' : 'Submit Review'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
    marginBottom: hp('0.5%'),
    fontFamily: 'Poppins-Regular',
  },
  hospitalName: {
    fontSize: wp('3.2%'),
    color: '#0D6EFD',
    fontFamily: PoppinsFonts.SemiBold,
    marginBottom: hp('0.5%'),
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
  // Patient Card Styles
  patientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  patientCardHeader: {
    marginBottom: hp('2%'),
    paddingBottom: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  patientCardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientCardTitle: {
    fontSize: wp('4.5%'),
    color: '#0D6EFD',
    fontFamily: PoppinsFonts.Bold,
    marginLeft: wp('2%'),
  },
  patientInfoGrid: {
    gap: hp('1.5%'),
  },
  patientInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('2%'),
    backgroundColor: '#F8F9FA',
    borderRadius: wp('2%'),
    borderLeftWidth: 3,
    borderLeftColor: '#0D6EFD',
  },
  patientInfoIconContainer: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  patientInfoContent: {
    flex: 1,
  },
  patientInfoLabel: {
    fontSize: wp('3.2%'),
    color: '#666666',
    fontFamily: PoppinsFonts.Regular,
    marginBottom: hp('0.3%'),
  },
  patientInfoValue: {
    fontSize: wp('3.8%'),
    color: '#333333',
    fontFamily: PoppinsFonts.SemiBold,
  },
  // Clinic Card Styles
  clinicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  clinicCardHeader: {
    marginBottom: hp('2%'),
    paddingBottom: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  clinicCardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clinicCardTitle: {
    fontSize: wp('4.5%'),
    color: '#0D6EFD',
    fontFamily: PoppinsFonts.Bold,
    marginLeft: wp('2%'),
  },
  clinicInfoGrid: {
    gap: hp('1.5%'),
  },
  clinicInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('2%'),
    backgroundColor: '#F8F9FA',
    borderRadius: wp('2%'),
    borderLeftWidth: 3,
    borderLeftColor: '#0D6EFD',
  },
  clinicInfoIconContainer: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  clinicInfoContent: {
    flex: 1,
  },
  clinicInfoLabel: {
    fontSize: wp('3.2%'),
    color: '#666666',
    fontFamily: PoppinsFonts.Regular,
    marginBottom: hp('0.3%'),
  },
  clinicInfoValue: {
    fontSize: wp('3.8%'),
    color: '#333333',
    fontFamily: PoppinsFonts.SemiBold,
  },
  // Payment Card Styles
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  paymentCardHeader: {
    marginBottom: hp('2%'),
    paddingBottom: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  paymentCardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentCardTitle: {
    fontSize: wp('4.5%'),
    color: '#0D6EFD',
    fontFamily: PoppinsFonts.Bold,
    marginLeft: wp('2%'),
  },
  paymentInfoGrid: {
    gap: hp('1.5%'),
  },
  paymentInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('2%'),
    backgroundColor: '#F8F9FA',
    borderRadius: wp('2%'),
    borderLeftWidth: 3,
    borderLeftColor: '#0D6EFD',
  },
  paymentInfoIconContainer: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  paymentInfoContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfoLabel: {
    fontSize: wp('3.2%'),
    color: '#666666',
    fontFamily: PoppinsFonts.Regular,
    flex: 1,
  },
  paymentInfoValue: {
    fontSize: wp('3.8%'),
    color: '#333333',
    fontFamily: PoppinsFonts.SemiBold,
  },
  paymentStatusBadge: {
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.3%'),
    borderRadius: wp('1.5%'),
  },
  paymentStatusText: {
    fontSize: wp('2.8%'),
    color: '#FFFFFF',
    fontFamily: PoppinsFonts.SemiBold,
  },
  // Appointment Details Card Styles
  appointmentDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  appointmentDetailsCardHeader: {
    marginBottom: hp('2%'),
    paddingBottom: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  appointmentDetailsCardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentDetailsCardTitle: {
    fontSize: wp('4.5%'),
    color: '#0D6EFD',
    fontFamily: PoppinsFonts.Bold,
    marginLeft: wp('2%'),
  },
  appointmentDetailsGrid: {
    gap: hp('1.5%'),
  },
  appointmentDetailsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('2%'),
    backgroundColor: '#F8F9FA',
    borderRadius: wp('2%'),
    borderLeftWidth: 3,
    borderLeftColor: '#0D6EFD',
  },
  appointmentDetailsItemFull: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('2%'),
    backgroundColor: '#F8F9FA',
    borderRadius: wp('2%'),
    borderLeftWidth: 3,
    borderLeftColor: '#0D6EFD',
  },
  appointmentDetailsIconContainer: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  appointmentDetailsContent: {
    flex: 1,
  },
  appointmentDetailsLabel: {
    fontSize: wp('3.2%'),
    color: '#666666',
    fontFamily: PoppinsFonts.Regular,
    marginBottom: hp('0.3%'),
  },
  appointmentDetailsValue: {
    fontSize: wp('3.8%'),
    color: '#333333',
    fontFamily: PoppinsFonts.SemiBold,
    lineHeight: wp('4.5%'),
  },
  // Feedback Form Styles
  feedbackCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: wp('4%'),
    padding: wp('2%'),
   // marginHorizontal: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  feedbackTitle: {
    fontSize: wp('4.5%'),
    color: '#333333',
    fontFamily: PoppinsFonts.Bold,
    textAlign: 'center',
    marginBottom: hp('2%'),
  },
  ratingSection: {
    marginBottom: hp('2%'),
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
    paddingVertical: hp('0.5%'),
  },
  ratingLabel: {
    fontSize: wp('4%'),
    color: '#333333',
    fontFamily: PoppinsFonts.SemiBold,
    flex: 1,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: wp('1%'),
    marginHorizontal: wp('0.5%'),
  },
  submitButton: {
    backgroundColor: '#0D6EFD',
    borderRadius: wp('2%'),
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#6C757D',
  },
  submitButtonText: {
    fontSize: wp('4%'),
    color: '#FFFFFF',
    fontFamily: PoppinsFonts.Bold,
  },
  submittedReviewInfo: {
    backgroundColor: '#E8F5E8',
    borderRadius: wp('2%'),
    padding: wp('3%'),
    marginBottom: hp('2%'),
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
  },
  submittedReviewText: {
    fontSize: wp('3.5%'),
    color: '#28a745',
    fontFamily: PoppinsFonts.SemiBold,
    textAlign: 'center',
  },
});

export default AppointmentDetailsScreen;

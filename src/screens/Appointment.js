import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { 
  getAppointmentBookingDetailsFromStorage, 
  formatAppointmentData,
  getAppointmentStatusColor,
  getAppointmentStatusText,
  formatAppointmentDate,
  formatAppointmentTime
} from '../services/appointmentBookingApi';
import { PoppinsFonts } from '../config/fonts';

const Appointment = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'upcoming', 'completed'
  const [formattedData, setFormattedData] = useState({
    appointments: [],
    totalAppointments: 0,
    upcomingAppointments: [],
    completedAppointments: [],
  });

  useEffect(() => {
    loadAppointmentDetails();
  }, []);

  const loadAppointmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== LOADING APPOINTMENT DETAILS ===');
      
      // First, let's check if we can get the patient ID
      const { getOTPResponse } = await import('../utils/otpStorage');
      const otpResponse = await getOTPResponse();
      console.log('OTP Response from storage:', otpResponse);
      
      if (!otpResponse || !otpResponse.data) {
        throw new Error('No user data found in storage. Please login again.');
      }
      
      const patientId = otpResponse.data.id;
      console.log('Patient ID found:', patientId);
      
      if (!patientId) {
        throw new Error('Patient ID not found in user data.');
      }
      
      console.log('📅 APPOINTMENT API - Calling appointment API with patient ID:', patientId);
      const response = await getAppointmentBookingDetailsFromStorage();
      
      console.log('📅 APPOINTMENT API - Raw Response:', JSON.stringify(response, null, 2));
      console.log('📅 APPOINTMENT API - Response Success:', response.success);
      console.log('📅 APPOINTMENT API - Response Status:', response.status);
      console.log('📅 APPOINTMENT API - Response Message:', response.message);
      
      if (response.success) {
        console.log('✅ APPOINTMENT API - Success! Data received:');
        console.log('✅ APPOINTMENT API - Data type:', typeof response.data);
        console.log('✅ APPOINTMENT API - Is array:', Array.isArray(response.data));
        console.log('✅ APPOINTMENT API - Data length:', response.data?.length);
        console.log('✅ APPOINTMENT API - Full data:', JSON.stringify(response.data, null, 2));
        
        // Log each appointment individually
        if (Array.isArray(response.data)) {
          response.data.forEach((appointment, index) => {
            console.log(`📅 APPOINTMENT ${index + 1} DETAILS:`);
            console.log(`📅 - ID: ${appointment.id}`);
            console.log(`📅 - Appointment ID: ${appointment.appointment_id}`);
            console.log(`📅 - Status: ${appointment.status}`);
            console.log(`📅 - Payment Status: ${appointment.payment_status}`);
            console.log(`📅 - Payment Amount: ${appointment.payment_amount}`);
            console.log(`📅 - Payment Mode: ${appointment.payment_mode}`);
            console.log(`📅 - Doctor: ${appointment.appointment?.doctor?.name || 'N/A'}`);
            console.log(`📅 - Hospital: ${appointment.appointment?.clinic?.name || 'N/A'}`);
            console.log(`📅 - Patient: ${appointment.appointment?.patient?.name || 'N/A'}`);
            console.log(`📅 - Date: ${appointment.appointment?.appointment_date || 'N/A'}`);
            console.log(`📅 - Time: ${appointment.appointment?.appointment_time || 'N/A'}`);
            console.log(`📅 - Full Appointment Object:`, JSON.stringify(appointment, null, 2));
          });
        }
        
        setAppointments(response.data);
        
        // Format the data for display
        const formatted = formatAppointmentData(response.data);
        setFormattedData(formatted);
        console.log('Formatted appointment data:', formatted);
        console.log('Upcoming appointments count:', formatted.upcomingAppointments.length);
        console.log('Completed appointments count:', formatted.completedAppointments.length);
        console.log('Upcoming appointments:', formatted.upcomingAppointments);
        console.log('Completed appointments:', formatted.completedAppointments);
        
        // If no appointments found, show empty state (not an error)
        if (formatted.totalAppointments === 0) {
          console.log('No appointments found in response - showing empty state');
          setError(null); // Clear any previous errors
        }
      } else {
        console.error('❌ APPOINTMENT API - API call failed:', response);
        console.error('❌ APPOINTMENT API - Error details:', JSON.stringify(response, null, 2));
        
        // Check if it's a "no appointments" response (404 or specific messages)
        if (response.status === 404 || 
            (response.message && (
              response.message.includes('No appointment details found') ||
              response.message.includes('No appointments') || 
              response.message.includes('not found')
            ))) {
          console.log('📅 APPOINTMENT API - No appointments found - showing empty state instead of error');
          setError(null);
          setFormattedData({
            appointments: [],
            totalAppointments: 0,
            upcomingAppointments: [],
            completedAppointments: [],
          });
        } else {
          // It's a real error
          console.error('❌ APPOINTMENT API - Real error occurred:', response.message);
          setError(response.message || 'Failed to load appointment details');
        }
      }
    } catch (err) {
      console.error('Error loading appointment details:', err);
      console.error('Error stack:', err.stack);
      
      // Check if it's a "no appointments" type error (404 or specific messages)
      if (err.status === 404 || 
          (err.message && (
            err.message.includes('No appointment details found') ||
            err.message.includes('No appointments') || 
            err.message.includes('not found')
          ))) {
        console.log('No appointments found - showing empty state instead of error');
        setError(null);
        setFormattedData({
          appointments: [],
          totalAppointments: 0,
          upcomingAppointments: [],
          completedAppointments: [],
        });
      } else {
        setError(err.message || 'Failed to load appointment details');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointmentDetails();
    setRefreshing(false);
  };

  // Get filtered appointments based on active filter
  const getFilteredAppointments = () => {
    switch (activeFilter) {
      case 'upcoming':
        return formattedData.upcomingAppointments;
      case 'completed':
        return formattedData.completedAppointments;
      default:
        return [...formattedData.upcomingAppointments, ...formattedData.completedAppointments];
    }
  };

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

  const renderAppointmentCard = (appointment, index) => {
    console.log('=== RENDERING APPOINTMENT CARD ===');
    console.log('Full appointment object:', appointment);
    
    // Get the nested appointment data from the new API response structure
    const appointmentData = appointment.appointment || appointment;
    const doctorData = appointmentData.doctor || appointment.doctor;
    const patientData = appointmentData.patient || appointment.patient;
    const clinicData = appointmentData.clinic || appointment.clinic;
    const subPatientData = appointmentData.sub_patient || appointment.sub_patient;
    
    console.log('Appointment data:', appointmentData);
    console.log('Doctor data:', doctorData);
    console.log('Patient data:', patientData);
    console.log('Clinic data:', clinicData);
    console.log('Sub patient data:', subPatientData);
    
    const statusColor = getAppointmentStatusColor(appointmentData.status || appointment.status);
    const statusText = getAppointmentStatusText(appointmentData.status || appointment.status);
    
    // Handle the actual API response structure
    const appointmentDate = formatAppointmentDate(
      appointmentData.appointment_date || 
      appointmentData.date || 
      appointmentData.created_at || 
      appointmentData.appointment_date_time ||
      appointmentData.updated_at
    );
    
    const appointmentTime = formatAppointmentTime(
      appointmentData.appointment_time || 
      appointmentData.time || 
      '09:00:00'
    );
    
    // Get doctor info from the nested doctor data
    const doctorName = doctorData?.name || 
                      appointment.doctor_name || 
                      appointmentData.doctor_name ||
                      'Dr. Unknown';
    
    // Get doctor specialization/category - prioritize the nested specialization object
    const doctorSpecialty = doctorData?.specialization?.name || 
      (doctorData?.specialization_id ? 
        getSpecializationName(doctorData.specialization_id) : 
        (doctorData?.specialization || 
         appointment.specialization ||
         appointmentData.specialization ||
         'General Medicine'));
    
    // Get clinic/hospital name
    const clinicName = clinicData?.name || 'Clinic';
    
    // Get patient name (main patient or sub-patient)
    const patientName = subPatientData?.name || patientData?.name || 'Patient';
    
    console.log('Doctor name:', doctorName);
    console.log('Doctor specialty:', doctorSpecialty);
    console.log('Doctor specialization_id:', doctorData?.specialization_id);
    console.log('Clinic name:', clinicName);
    console.log('Patient name:', patientName);
    
    // Format doctor image URL with base URL
    const baseUrl = 'https://spiderdesk.asia/healto/';
    const doctorImage = doctorData?.profile_image ? 
      `${baseUrl}${doctorData.profile_image}` :
      `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&background=0D6EFD&color=fff&size=100`;
    
    // Get payment status and amounts from appointment_detail
    const paymentStatus = appointment.payment_status || appointmentData.payment_status;
    const paymentAmount = appointment.payment_amount || appointmentData.payment_amount;
    const amountPaid = appointment.amount_paid || appointmentData.amount_paid;
    const balanceAmount = appointment.balance_amount || appointmentData.balance_amount;
    const token = appointment.token || appointmentData.token;
    
    console.log('Payment status:', paymentStatus);
    console.log('Payment amount:', paymentAmount);
    console.log('Amount paid:', amountPaid);
    console.log('Balance amount:', balanceAmount);
    console.log('Token:', token);
    
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
    
    return (
    <TouchableOpacity 
        key={appointment.id || index} 
        style={styles.appointmentCard}
        onPress={() => navigation.navigate('AppointmentDetails', { appointment })}
      >
        {/* Header Section with Doctor Info */}
        <View style={styles.cardHeader}>
          <View style={styles.doctorImageContainer}>
            <Image 
              source={{ uri: doctorImage }} 
              style={styles.doctorImage} 
            />
          </View>
          <View style={styles.doctorInfoSection}>
            <Text style={styles.doctorName}>{doctorName}</Text>
            <Text style={styles.doctorSpecialty}>{doctorSpecialty}</Text>
            <Text style={styles.hospitalName}>{clinicName}</Text>
          </View>
          <View style={styles.statusSection}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
            {paymentStatus && (
              <View style={[styles.paymentBadge, { 
                backgroundColor: paymentInfo.color
              }]}>
                <Text style={styles.paymentText}>
                  {paymentInfo.text}
                </Text>
              </View>
            )}
            {token && (
              <View style={styles.tokenRow}>
                <Icon name="ticket-alt" size={12} color="#0D6EFD" style={styles.detailIcon} />
                <Text style={styles.tokenText}>Token: {token}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.cardDetails}>
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeItem}>
              <Icon name="calendar-alt" size={14} color="#666" style={styles.detailIcon} />
              <Text style={styles.appointmentDate}>{appointmentDate}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Icon name="clock" size={14} color="#0D6EFD" style={styles.detailIcon} />
              <Text style={styles.appointmentTime}>{appointmentTime}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Helper function to get specialization name from ID
  const getSpecializationName = (specializationId) => {
    const specializationMap = {
      1: 'Cardiology',
      2: 'Orthopedics', 
      3: 'Pediatrics',
      4: 'Dermatology',
      5: 'Neurology',
      6: 'Neurology',
      7: 'Gynecology',
      8: 'Ophthalmology',
      9: 'ENT',
      10: 'Psychiatry'
    };
    return specializationMap[specializationId] || 'General Medicine';
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0D6EFD" />
      <Text style={styles.loadingText}>Loading appointment details...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon name="exclamation-triangle" size={50} color="#dc3545" />
      <Text style={styles.errorTitle}>Error Loading Appointments</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadAppointmentDetails}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="calendar-alt" size={50} color="#6c757d" />
      <Text style={styles.emptyTitle}>No Appointments Found</Text>
      <Text style={styles.emptyMessage}>You don't have any appointments yet.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#1A83FF" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1A83FF', '#003784']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0D6EFD']}
            tintColor="#0D6EFD"
          />
        }
      >
        {loading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        ) : formattedData.totalAppointments === 0 ? (
          renderEmptyState()
        ) : (
          <>

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  activeFilter === 'all' && styles.filterButtonActive
                ]}
                onPress={() => setActiveFilter('all')}
              >
                <Text style={[
                  styles.filterButtonText,
                  activeFilter === 'all' && styles.filterButtonTextActive
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  activeFilter === 'upcoming' && styles.filterButtonActive
                ]}
                onPress={() => setActiveFilter('upcoming')}
              >
                <Icon name="clock" size={14} color={activeFilter === 'upcoming' ? '#FFFFFF' : '#007bff'} />
                <Text style={[
                  styles.filterButtonText,
                  activeFilter === 'upcoming' && styles.filterButtonTextActive
                ]}>
                  Upcoming
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  activeFilter === 'completed' && styles.filterButtonActive
                ]}
                onPress={() => setActiveFilter('completed')}
              >
                <Icon name="check-circle" size={14} color={activeFilter === 'completed' ? '#FFFFFF' : '#28a745'} />
                <Text style={[
                  styles.filterButtonText,
                  activeFilter === 'completed' && styles.filterButtonTextActive
                ]}>
                  Completed
                </Text>
              </TouchableOpacity>
            </View>

            {/* Filtered Appointments List */}
            {(() => {
              const filteredAppointments = getFilteredAppointments();
              const hasAppointments = filteredAppointments.length > 0;
              
              if (!hasAppointments) {
                return (
                  <View style={styles.appointmentsSection}>
                    <Text style={styles.sectionTitle}>Your Appointments</Text>
                    <View style={styles.emptyContainer}>
                      <Icon name="calendar-alt" size={50} color="#6c757d" />
                      <Text style={styles.emptyTitle}>
                        {activeFilter === 'all' ? 'No Appointments Found' : 
                         activeFilter === 'upcoming' ? 'No Upcoming Appointments' : 
                         'No Completed Appointments'}
                      </Text>
                      <Text style={styles.emptyMessage}>
                        {activeFilter === 'all' ? 'You don\'t have any appointments yet.' :
                         activeFilter === 'upcoming' ? 'You don\'t have any upcoming appointments.' :
                         'You don\'t have any completed appointments.'}
                      </Text>
                    </View>
                  </View>
                );
              }

              return (
                <View style={styles.appointmentsSection}>
                  <View style={styles.sectionHeader}>
                    <Icon 
                      name={activeFilter === 'upcoming' ? 'clock' : activeFilter === 'completed' ? 'check-circle' : 'calendar-alt'} 
                      size={16} 
                      color={activeFilter === 'upcoming' ? '#007bff' : activeFilter === 'completed' ? '#28a745' : '#333333'} 
                    />
                    <Text style={styles.sectionTitle}>
                      {activeFilter === 'upcoming' ? 'Upcoming Appointments' :
                       activeFilter === 'completed' ? 'Completed Appointments' :
                       'Your Appointments'}
                    </Text>
                    <Text style={styles.sectionCount}>({filteredAppointments.length})</Text>
                  </View>
                  {filteredAppointments.map((appointment, index) => 
                    renderAppointmentCard(appointment, index)
                  )}
                </View>
              );
            })()}
          </>
        )}
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
    color: '#333333',
    marginBottom: hp('0.3%'),
    fontFamily: PoppinsFonts.Bold,
  },
  doctorSpecialty: {
    fontSize: wp('3.2%'),
    color: '#0D6EFD',
    marginBottom: hp('0.3%'),
    fontFamily: PoppinsFonts.SemiBold,
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
    fontFamily: PoppinsFonts.SemiBold,
  },
  navigateButton: {
    backgroundColor: '#0D6EFD',
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  // New styles for appointment cards
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('3%'),
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    alignItems: 'center',
    flex: 1,
    marginHorizontal: wp('1%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  summaryNumber: {
    fontSize: wp('6%'),
    color: '#0D6EFD',
    fontFamily: PoppinsFonts.Bold,
  },
  summaryLabel: {
    fontSize: wp('3%'),
    color: '#666666',
    marginTop: hp('0.5%'),
    fontFamily: 'Poppins-Regular',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: hp('3%'),
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    padding: wp('2%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('3%'),
    borderRadius: wp('2%'),
    marginHorizontal: wp('1%'),
    backgroundColor: '#F8F9FA',
  },
  filterButtonActive: {
    backgroundColor: '#0D6EFD',
  },
  filterButtonText: {
    fontSize: wp('3.5%'),
    color: '#666666',
    marginLeft: wp('1%'),
    fontFamily: PoppinsFonts.SemiBold,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  appointmentsSection: {
    marginBottom: hp('2%'),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    color: '#333333',
    marginLeft: wp('2%'),
    fontFamily: PoppinsFonts.Bold,
  },
  sectionCount: {
    fontSize: wp('3.5%'),
    color: '#666666',
    marginLeft: wp('2%'),
    fontFamily: 'Poppins-Regular',
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp('1.5%'),
  },
  cardDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: hp('1.5%'),
  },
  doctorImageContainer: {
    marginRight: wp('4%'),
  },
  doctorInfoSection: {
    flex: 1,
    marginRight: wp('2%'),
  },
  statusSection: {
    alignItems: 'flex-end',
  },
  appointmentDate: {
    fontSize: wp('3.5%'),
    color: '#666666',
    marginRight: wp('3%'),
    fontFamily: 'Poppins-Regular',
  },
  appointmentTime: {
    fontSize: wp('3.5%'),
    color: '#0D6EFD',
    fontFamily: PoppinsFonts.SemiBold,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.4%'),
    borderRadius: wp('1.5%'),
    marginBottom: hp('0.5%'),
  },
  statusText: {
    fontSize: wp('2.8%'),
    color: '#FFFFFF',
    fontFamily: PoppinsFonts.SemiBold,
  },
  paymentBadge: {
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    borderRadius: wp('1.2%'),
  },
  paymentText: {
    fontSize: wp('2.3%'),
    color: '#FFFFFF',
    fontFamily: PoppinsFonts.SemiBold,
  },
  descriptionText: {
    fontSize: wp('3%'),
    color: '#666666',
    marginTop: hp('0.5%'),
    fontStyle: 'italic',
    fontFamily: 'Poppins-Regular',
  },
  amountText: {
    fontSize: wp('3%'),
    color: '#0D6EFD',
    marginTop: hp('0.3%'),
    fontFamily: PoppinsFonts.SemiBold,
  },
  hospitalName: {
    fontSize: wp('3%'),
    color: '#666666',
    fontFamily: 'Poppins-Regular',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
    gap: wp('2%'),
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1%'),
    backgroundColor: '#f8f9fa',
    borderRadius: wp('2%'),
    marginHorizontal: wp('1%'),
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.5%'),
    justifyContent: 'flex-end',
  },
  detailIcon: {
    marginRight: wp('2%'),
  },
  patientName: {
    fontSize: wp('3%'),
    color: '#666666',
    marginBottom: hp('0.5%'),
    fontFamily: 'Poppins-Regular',
  },
  tokenText: {
    fontSize: wp('2.5%'),
    color: '#0D6EFD',
    fontFamily: PoppinsFonts.SemiBold,
  },
  paymentDetails: {
    marginTop: hp('0.5%'),
  },
  paidText: {
    fontSize: wp('2.8%'),
    color: '#28a745',
    marginTop: hp('0.2%'),
    fontFamily: PoppinsFonts.SemiBold,
  },
  balanceText: {
    fontSize: wp('2.8%'),
    color: '#dc3545',
    marginTop: hp('0.2%'),
    fontFamily: PoppinsFonts.SemiBold,
  },
  debugText: {
    fontSize: wp('2.5%'),
    color: '#999',
    marginTop: hp('0.5%'),
    fontFamily: 'Poppins-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('10%'),
  },
  loadingText: {
    fontSize: wp('4%'),
    color: '#666666',
    marginTop: hp('2%'),
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('10%'),
    paddingHorizontal: wp('10%'),
  },
  errorTitle: {
    fontSize: wp('5%'),
    color: '#dc3545',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
    fontFamily: PoppinsFonts.Bold,
  },
  errorMessage: {
    fontSize: wp('4%'),
    color: '#666666',
    textAlign: 'center',
    marginBottom: hp('3%'),
    fontFamily: 'Poppins-Regular',
  },
  retryButton: {
    backgroundColor: '#0D6EFD',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.SemiBold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('10%'),
    paddingHorizontal: wp('10%'),
  },
  emptyTitle: {
    fontSize: wp('5%'),
    color: '#6c757d',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
    fontFamily: PoppinsFonts.Bold,
  },
  emptyMessage: {
    fontSize: wp('4%'),
    color: '#666666',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
});

export default Appointment;

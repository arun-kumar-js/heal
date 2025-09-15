import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
 Platform,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import axios from 'axios';
import { APPOINTMENT_FETCH_URL, basicAuth } from '../config/config';
import BackButton from '../components/BackButton';

const DoctorAppointmentScreen = ({ navigation, route }) => {
  const { doctor } = route.params || {};
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDateObj, setSelectedDateObj] = useState(() => new Date());
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
const [doctorData, setDoctorData] = useState(doctor);
console.log('doctorData', doctorData);
const doctor_id = doctorData?.id;
console.log ('doctor_id', doctor_id);
const clinic_id = doctorData?.clinic_id;
console.log('clinic_id', clinic_id);

  // Generate calendar dates
  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = date.getDate().toString().padStart(2, '0');
      dates.push({
        day: dayName,
        number: dayNumber,
        full: `${dayName} ${dayNumber}`,
        date: date
      });
    }
    return dates;
  };

  const calendarDates = generateCalendarDates();

  // Month names for custom calendar
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper function to safely check if a date is selected
  const isDateSelected = (date) => {
    if (!selectedDateObj || !selectedDateObj.toDateString || !date || !date.toDateString) {
      return false;
    }
    return date.toDateString() === selectedDateObj.toDateString();
  };

  // Helper function to check if a date is in the past
  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return date < today;
  };

  // Helper function to check if a month/year combination is in the past
  const isPastMonth = (month, year) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    if (year < currentYear) return true;
    if (year === currentYear && month < currentMonth) return true;
    return false;
  };

  // Helper function to create dynamic API request data
  const createApiRequestData = (date) => {
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    console.log('📅 DATE FORMATTING:');
    console.log('  - Original Date:', date);
    console.log('  - Year:', year);
    console.log('  - Month:', month);
    console.log('  - Day:', day);
    console.log('  - Formatted Date:', formattedDate);
    
    return {
      doctor_id: doctor_id, // Using doctor.id (e.g., 7) as doctor_id
      clinics_id: clinic_id, // Using doctor.clinic_id (e.g., 1) as clinics_id
      date: formattedDate
    };
  };

  // Inline API function to fetch appointment availability
  const fetchAppointmentAvailability = async (doctor_id, clinics_id, date) => {
    try {
      console.log('=== APPOINTMENT API REQUEST ===');
      console.log('URL:', APPOINTMENT_FETCH_URL);
      console.log('Method: GET (No Authentication)');
      console.log('Query Parameters:', {
        doctor_id: doctor_id,
        clinics_id: clinics_id,
        date: date
      });
      
      const response = await axios.get(APPOINTMENT_FETCH_URL, {
        params: {
          doctor_id: doctor_id,
          clinics_id: clinics_id,
        date: date
        }
      });
      console.log("📅 API CALL DEBUG:");
      console.log("  - Date parameter:", date);
      console.log("  - Date type:", typeof date);
      console.log("  - Doctor ID:", doctor_id);
      console.log("  - Clinics ID:", clinics_id);
      console.log('=== APPOINTMENT API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', response.headers);
      console.log('Raw Response Data:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.all_slots) {
        console.log('✅ SUCCESS: Available slots found');
        console.log('📊 SUMMARY:');
        console.log('  - Total Slots:', response.data.all_slots?.length || 0);
        console.log('  - Response Data:', response.data);
        
        console.log('📋 ALL SLOTS RAW DATA:');
        console.log(JSON.stringify(response.data.all_slots, null, 2));
        
        // Log each slot individually for better debugging
        if (response.data.all_slots && Array.isArray(response.data.all_slots)) {
          console.log('🔍 INDIVIDUAL SLOT ANALYSIS:');
          response.data.all_slots.forEach((slot, index) => {
            console.log(`Slot ${index + 1}:`, {
              start_time: slot.start_time,
              end_time: slot.end_time,
              token: slot.token,
              is_booked: slot.is_booked,
              status: slot.status,
              raw_slot: slot
            });
          });
        }
        
        // Filter only available slots and format for display
        const availableSlots = response.data.all_slots
          .filter(slot => slot.status === 'available' && !slot.is_booked)
          .map(slot => ({
            time: slot.start_time,
            endTime: slot.end_time,
            token: slot.token,
            isBooked: slot.is_booked,
            status: slot.status
          }));
        
        console.log('✅ FILTERED AVAILABLE SLOTS (for UI):');
        console.log('Count:', availableSlots.length);
        console.log('Data:', JSON.stringify(availableSlots, null, 2));
        
        // Log each available slot for UI
        availableSlots.forEach((slot, index) => {
          console.log(`UI Slot ${index + 1}:`, {
            time: slot.time,
            endTime: slot.endTime,
            token: slot.token,
            isBooked: slot.isBooked,
            status: slot.status
          });
        });
        
        return {
          success: true,
          availableSlots: availableSlots,
          totalSlots: response.data.all_slots?.length || 0,
          availableCount: availableSlots.length,
          bookedCount: response.data.all_slots?.length - availableSlots.length || 0
        };
      } else {
        console.log('❌ No availability data received');
        console.log('Response data:', response.data);
        
        return {
          success: false,
          availableSlots: [],
          message: 'No available slots for this date',
          totalSlots: 0,
          availableCount: 0,
          bookedCount: 0
        };
      }
    } catch (error) {
      console.error('❌ Error fetching appointment availability:', error);
      
      if (error.response) {
        // Server responded with error status
        console.error('Error Status:', error.response.status);
        console.error('Error Data:', error.response.data);
        console.error('Error Headers:', error.response.headers || 'No headers available');
        
        return {
          success: false,
          availableSlots: [],
          message: `Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`,
          error: error.response.data
        };
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        
        return {
          success: false,
          availableSlots: [],
          message: 'Network error: No response from server',
          error: error.message
        };
      } else {
        // Something else happened
        console.error('Request setup error:', error.message);
        
        return {
          success: false,
          availableSlots: [],
          message: `Request error: ${error.message}`,
          error: error.message
        };
      }
    }
  };

  // Generate calendar days for selected month
  const generateMonthCalendar = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push({ day: '', number: '', isCurrentMonth: false, date: null });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = isDateSelected(date);
      const isPast = isPastDate(date);
      
      calendarDays.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        number: day.toString().padStart(2, '0'),
        full: `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${day.toString().padStart(2, '0')}`,
        date: date,
        isCurrentMonth: true,
        isToday: isToday,
        isSelected: isSelected,
        isPast: isPast
      });
    }
    
    return calendarDays;
  };

  // Generate horizontal date picker dates for selected month
  const generateHorizontalDates = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const horizontalDates = [];
    
    // Add only future and today's dates of the selected month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = isDateSelected(date);
      const isPast = isPastDate(date);
      
      // Only include future dates and today
      if (!isPast) {
        horizontalDates.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          number: day.toString().padStart(2, '0'),
          full: `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${day.toString().padStart(2, '0')}`,
          date: date,
          isCurrentMonth: true,
          isToday: isToday,
          isSelected: isSelected,
          isPast: isPast
        });
      }
    }
    
    return horizontalDates;
  };

  const monthCalendarDays = generateMonthCalendar(selectedMonth, selectedYear);
  const horizontalDates = generateHorizontalDates(selectedMonth, selectedYear);

  // Custom Calendar Component
  const CustomCalendarPicker = () => (
    <Modal
      visible={showCustomCalendar}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowCustomCalendar(false)}
    >
      <View style={styles.calendarModalOverlay}>
        <View style={styles.calendarModal}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity 
              style={[
                styles.yearNavButton,
                selectedYear <= new Date().getFullYear() && styles.disabledYearButton
              ]}
              onPress={() => {
                if (selectedYear > new Date().getFullYear()) {
                  setSelectedYear(selectedYear - 1);
                }
              }}
              disabled={selectedYear <= new Date().getFullYear()}
            >
              <Icon 
                name="chevron-left" 
                size={16} 
                color={selectedYear <= new Date().getFullYear() ? "#ccc" : "#666"} 
              />
            </TouchableOpacity>
            <Text style={styles.calendarHeaderText}>
              {monthNames[selectedMonth]}, {selectedYear}
            </Text>
            <TouchableOpacity 
              style={styles.yearNavButton}
              onPress={() => setSelectedYear(selectedYear + 1)}
            >
              <Icon name="chevron-right" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.monthsGrid}>
            {monthNames.map((month, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.monthButton,
                  selectedMonth === index && styles.selectedMonthButton,
                  isPastMonth(index, selectedYear) && styles.disabledMonthButton
                ]}
                onPress={() => {
                  if (!isPastMonth(index, selectedYear)) {
                    setSelectedMonth(index);
                  }
                }}
                disabled={isPastMonth(index, selectedYear)}
              >
                <Text style={[
                  styles.monthButtonText,
                  selectedMonth === index && styles.selectedMonthText,
                  isPastMonth(index, selectedYear) && styles.disabledMonthText
                ]}>
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.calendarFooter}>
            <TouchableOpacity
              style={styles.calendarCancelButton}
              onPress={() => setShowCustomCalendar(false)}
            >
              <Text style={styles.calendarCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.calendarOkButton}
              onPress={() => {
                // Update the selected month and year
                setSelectedMonth(selectedMonth);
                setSelectedYear(selectedYear);
                setShowCustomCalendar(false);
                
                // Reset selected date when changing month
                setSelectedDate('');
                setSelectedTime('');
                
                // Don't automatically select a date, just show the month calendar
                // User can then tap on a specific day to select it
              }}
            >
              <Text style={styles.calendarOkText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Handler function to fetch appointment availability
  const handleFetchAppointmentAvailability = async (doctorId, clinicsId, date) => {
    try {
      setLoading(true);
      
      console.log('🚀 STARTING TIME SLOT FETCH:');
      console.log('  - Doctor ID:', doctorId);
      console.log('  - Clinics ID:', clinicsId);
      console.log('  - Date:', date);
      console.log('  - Timestamp:', new Date().toISOString());
      
      // Log the raw data being sent to API
      const rawApiData = {
        doctor_id: doctorId,
        clinics_id: clinicsId,
        date: date
      };
      console.log('📤 RAW API DATA:', JSON.stringify(rawApiData, null, 2));
      
      const result = await fetchAppointmentAvailability(doctorId, clinicsId, date);
      
      console.log('📥 API RESULT RECEIVED:');
      console.log('  - Success:', result.success);
      console.log('  - Message:', result.message);
      console.log('  - Available Slots Count:', result.availableSlots?.length || 0);
      console.log('  - Total Slots:', result.totalSlots);
      console.log('  - Available Count:', result.availableCount);
      console.log('  - Booked Count:', result.bookedCount);
      
      if (result.success) {
        setAvailableSlots(result.availableSlots);
        console.log('✅ TIME SLOTS SET IN STATE:');
        console.log('  - State Updated: true');
        console.log('  - Slots Count:', result.availableSlots.length);
        console.log('  - Slots Data:', JSON.stringify(result.availableSlots, null, 2));
        
        // Log each slot that will be displayed
        result.availableSlots.forEach((slot, index) => {
          console.log(`  📅 Display Slot ${index + 1}:`, {
            time: slot.time,
            endTime: slot.endTime,
            token: slot.token,
            isBooked: slot.isBooked,
            status: slot.status
          });
        });
      } else {
        setAvailableSlots([]);
        console.log('❌ NO TIME SLOTS AVAILABLE:');
        console.log('  - Reason:', result.message);
        console.log('  - State Updated: empty array');
        
        // Show user-friendly message for no slots
        if (result.message.includes('No available slots')) {
          console.log(
            'No Available Slots',
            'No time slots are available for the selected date. Please choose a different date.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('❌ ERROR IN TIME SLOT FETCH:');
      console.error('  - Error Type:', error.constructor.name);
      console.error('  - Error Message:', error.message);
      console.error('  - Error Stack:', error.stack);
      console.error('  - Full Error:', error);
      
      setAvailableSlots([]);
      
      console.log(
        'Error',
        'Failed to fetch available time slots. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      console.log('🏁 TIME SLOT FETCH COMPLETED');
      console.log('  - Loading State: false');
      console.log('  - Timestamp:', new Date().toISOString());
    }
  };

  // Initial load - fetch time slots when component mounts
  useEffect(() => {
    console.log('🚀 COMPONENT MOUNTED - INITIAL TIME SLOT FETCH');
    console.log('📋 COMPLETE DOCTOR DATA:', JSON.stringify(doctor, null, 2));
    console.log('🔍 DOCTOR DATA ANALYSIS:');
    console.log('  - Doctor ID (will be used as doctor_id):', doctor_id);
    console.log('  - Clinic ID (will be used as clinics_id):', clinic_id);
    console.log('  - Doctor Name:', doctor?.name);
    console.log('  - Specialization:', doctor?.specialization?.name);
    console.log('  - Selected Date:', selectedDateObj.toISOString().split('T')[0]);
    
    // Validate required fields
    const hasDoctorId = doctor_id && typeof doctor_id === 'number';
    const hasClinicId = clinic_id && typeof clinic_id === 'number';
    
    console.log('✅ VALIDATION RESULTS:');
    console.log('  - Has Doctor ID:', hasDoctorId);
    console.log('  - Has Clinic ID:', hasClinicId);
    
    if (hasDoctorId && hasClinicId) {
      const apiData = createApiRequestData(selectedDateObj);
      console.log('✅ INITIATING AUTO-FETCH FOR TIME SLOTS');
      console.log('📤 DYNAMIC API REQUEST DATA:', JSON.stringify(apiData, null, 2));
      
      handleFetchAppointmentAvailability(doctor_id, clinic_id, apiData.date);
    } else {
      console.log('❌ CANNOT FETCH TIME SLOTS - Missing or invalid doctor data');
      console.log('  - Doctor ID (valid):', hasDoctorId, 'Value:', doctor?.id);
      console.log('  - Clinic ID (valid):', hasClinicId, 'Value:', doctor?.clinic_id);
    }
  }, []); // Empty dependency array - only run on mount

  // Fetch availability when date changes
  useEffect(() => {
    console.log('📅 DATE CHANGED - FETCHING NEW TIME SLOTS');
    console.log('  - New Date:', selectedDateObj.toISOString().split('T')[0]);
    console.log('  - Doctor ID:', doctor_id);
    console.log('  - Clinic ID:', clinic_id);
    
    if (doctor_id && clinic_id) {
      const apiData = createApiRequestData(selectedDateObj);
      console.log('📤 DYNAMIC API REQUEST (Date Change):', JSON.stringify(apiData, null, 2));
      
      handleFetchAppointmentAvailability(doctor_id, clinic_id, apiData.date);
    }
  }, [selectedDateObj]); // Only run when selectedDateObj changes

  // Fetch availability when doctor data changes (if loaded asynchronously)
  useEffect(() => {
    console.log('👨‍⚕️ DOCTOR DATA CHANGED - CHECKING FOR TIME SLOT FETCH');
    console.log('  - Doctor ID:', doctor_id);
    console.log('  - Clinic ID:', clinic_id);
    console.log('  - Doctor Name:', doctor?.name);
    
    if (doctor_id && clinic_id) {
      const apiData = createApiRequestData(selectedDateObj);
      console.log('✅ DOCTOR DATA AVAILABLE - FETCHING TIME SLOTS');
      console.log('📤 DYNAMIC API REQUEST (Doctor Data Change):', JSON.stringify(apiData, null, 2));
      
      handleFetchAppointmentAvailability(doctor_id, clinic_id, apiData.date);
    }
  }, [doctor?.id, doctor?.clinic_id]); // Only run when doctor data changes

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
    
    if (doctor?.specialization_id) {
      return specialtyMap[doctor.specialization_id] || 'Cardiology';
    }
    return 'Cardiology';
  };

  const renderStars = (rating) => {
    const numRating = parseFloat(rating) || 4.5;
    const stars = [];
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="star" size={14} color="#FFA500" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star-half-alt" size={14} color="#FFA500" />
      );
    }

    const emptyStars = 5 - Math.ceil(numRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star" size={14} color="#E0E0E0" />
      );
    }

    return stars;
  };

  // Handle date selection
  const handleDateSelection = (dateObj) => {
    console.log('🎯 DATE SELECTION DEBUG:');
    console.log('  - DateObj:', dateObj);
    console.log('  - DateObj.date:', dateObj?.date);
    console.log('  - DateObj.date type:', typeof dateObj?.date);
    
    if (!dateObj || !dateObj.date) {
      console.warn('Invalid date object provided to handleDateSelection');
      return;
    }
    
    // Prevent selection of past dates
    if (isPastDate(dateObj.date)) {
      console.warn('Cannot select past dates');
      return;
    }
    
    console.log('✅ UPDATING SELECTED DATE:');
    console.log('  - Old selectedDateObj:', selectedDateObj);
    console.log('  - New dateObj.date:', dateObj.date);
    
    setSelectedDateObj(dateObj.date);
    setSelectedDate(dateObj.full);
    setSelectedTime(''); // Reset selected time when date changes
    
    // Fetch availability for the new date
    if (doctor_id && clinic_id) {
      const apiData = createApiRequestData(dateObj.date);
      console.log('📤 DYNAMIC API REQUEST (Date Selection):', JSON.stringify(apiData, null, 2));
      
      handleFetchAppointmentAvailability(doctor_id, clinic_id, apiData.date);
    }
  };



  const handleScheduleAppointment = () => {
    if (!selectedTime) {
      Alert.alert('Please select a time slot', 'Choose an available time for your appointment.');
      return;
    }
    
    if (!reason.trim()) {
      Alert.alert('Please provide a reason', 'Please describe your reason for the visit.');
      return;
    }

    // Generate a dummy token number
    const tokenNumber = `T-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    console.log('🎫 BOOKING DATA:');
    console.log('  - Doctor:', doctor?.name);
    console.log('  - Selected Date:', selectedDate);
    console.log('  - Selected Time:', selectedTime);
    console.log('  - Reason:', reason);
    console.log('  - Token:', tokenNumber);

    // Navigate to BookingDetailsScreen with all the required data
    navigation.navigate('BookingDetails', {
      doctor: doctor,
      selectedDate: selectedDate,
      selectedTime: selectedTime,
      reason: reason,
      token: tokenNumber
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#ff6b6b" />
      

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Doctor Profile Section */}
        <View style={styles.doctorProfileContainer}>
          <Image
            source={getDoctorImage(doctor)}
            style={styles.doctorImage}
            resizeMode="cover"
          />
          
          {/* Doctor Info Overlay */}
          <View style={styles.doctorInfoOverlay}>
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName}>{doctor?.name || 'Dr. Aishwarya'}</Text>
              <Text style={styles.doctorSpecialty}>
                {getDoctorSpecialty(doctor)} From Kl Clinic
              </Text>
              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                  {renderStars(doctor?.rating || 4.5)}
                </View>
                <Text style={styles.ratingText}>4.5</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.callButton}>
              <Icon name="phone" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>200</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>800</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About.</Text>
          <Text style={styles.aboutText}>
            {doctor?.name || 'Dr. Aishwarya'} is a skilled and compassionate {getDoctorSpecialty(doctor).toLowerCase()} with over 12 years of clinical experience in the field of cardiovascular medicine. Her expertise spans preventive cardiology, heart failure management, interventional procedures, and post-operative care.
          </Text>
        </View>

        {/* Calendar Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.monthInfoContainer}>
            <Text style={styles.sectionTitle}>
                {monthNames[selectedMonth]}, {selectedYear}.
            </Text>
              {selectedMonth !== new Date().getMonth() || selectedYear !== new Date().getFullYear() ? (
                <View style={styles.monthFilterBadge}>
                  <Text style={styles.monthFilterText}>Filtered</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.calendarActions}>
              {selectedMonth !== new Date().getMonth() || selectedYear !== new Date().getFullYear() ? (
                <TouchableOpacity 
                  style={styles.clearFilterButton}
                  onPress={() => {
                    const currentDate = new Date();
                    setSelectedMonth(currentDate.getMonth());
                    setSelectedYear(currentDate.getFullYear());
                    setSelectedDate('');
                    setSelectedTime('');
                  }}
                >
                  <Icon name="times" size={12} color="#666" />
                </TouchableOpacity>
              ) : null}
            <TouchableOpacity 
              style={styles.calendarIcon}
                onPress={() => setShowCustomCalendar(true)}
            >
              <Icon name="calendar" size={16} color="#0D6EFD" />
            </TouchableOpacity>
            </View>
          </View>
          
          {/* Horizontal Date Picker */}
          <View style={styles.horizontalDateContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.horizontalDateScroll}
              contentContainerStyle={styles.horizontalDateContent}
            >
              {horizontalDates.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                      styles.datePillButton,
                      day.isSelected && styles.selectedDatePill
                  ]}
                    onPress={() => handleDateSelection(day)}
                >
                  <Text style={[
                      styles.datePillDay,
                      day.isSelected && styles.selectedDatePillDay
                  ]}>
                      {day.day}
                  </Text>
                    <View style={[
                      styles.datePillNumberContainer,
                      day.isSelected && styles.selectedDatePillNumberContainer
                    ]}>
                  <Text style={[
                        styles.datePillNumber,
                        day.isSelected && styles.selectedDatePillNumber
                  ]}>
                        {day.number}
                  </Text>
                    </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Availability Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Availability.</Text>
            <Text style={styles.slotsCount}>
              {loading ? 'Loading...' : `${availableSlots.length} Slots`}
            </Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0D6EFD" />
              <Text style={styles.loadingText}>Loading available time slots...</Text>
              <Text style={styles.loadingSubtext}>Fetching slots for {selectedDate || 'selected date'}</Text>
            </View>
          ) : availableSlots.length > 0 ? (
            <View style={styles.timeSlotsGrid}>
              {(() => {
                console.log('🎨 RENDERING TIME SLOTS:');
                console.log('  - Total Slots to Render:', availableSlots.length);
                console.log('  - Slots Data:', JSON.stringify(availableSlots, null, 2));
                return null;
              })()}
              {availableSlots.map((slot, index) => {
                // Log each slot being rendered
                console.log(`🎯 RENDERING SLOT ${index + 1}:`, {
                  originalTime: slot.time,
                  endTime: slot.endTime,
                  token: slot.token,
                  isBooked: slot.isBooked,
                  status: slot.status,
                  index: index
                });
                
                // Format time for display (convert 24h to 12h format)
                const formatTime = (time24) => {
                  const [hours, minutes] = time24.split(':');
                  const hour = parseInt(hours);
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  const hour12 = hour % 12 || 12;
                  return `${hour12}:${minutes} ${ampm}`;
                };
                
                const displayTime = formatTime(slot.time);
                console.log(`  📅 Formatted Time: ${slot.time} → ${displayTime}`);
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeSlotButton,
                      selectedTime === slot.time && styles.selectedTimeSlot
                    ]}
                    onPress={() => setSelectedTime(slot.time)}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      selectedTime === slot.time && styles.selectedTimeText
                    ]}>
                      {displayTime}
                    </Text>
                    {slot.endTime && (
                      <Text style={[
                        styles.timeSlotEndText,
                        selectedTime === slot.time && styles.selectedTimeText
                      ]}>
                        - {formatTime(slot.endTime)}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.noSlotsContainer}>
              <Icon name="calendar-times" size={40} color="#ccc" />
              <Text style={styles.noSlotsText}>No available slots for this date</Text>
              <Text style={styles.noSlotsSubtext}>Time slots were automatically checked. Please select a different date</Text>
            </View>
          )}
        </View>

        {/* Reason for Visit Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Reason For Visit.</Text>
          <TextInput
            style={styles.reasonInput}
            value={reason}
            onChangeText={setReason}
            multiline
            placeholder="Describe your symptoms or reason for visit..."
            placeholderTextColor="#999"
          />
        </View>

        {/* Schedule Appointment Button */}
        <TouchableOpacity 
          style={styles.scheduleButton}
          onPress={handleScheduleAppointment}
        >
          <Text style={styles.scheduleButtonText}>Schedule Appointment</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Calendar Picker */}
      <CustomCalendarPicker />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  doctorProfileContainer: {
    height: hp('35%'),
    backgroundColor: '#ff6b6b',
    position: 'relative',
  },
  doctorImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  doctorInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: wp('5%'),
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: hp('0.5%'),
  },
  doctorSpecialty: {
    fontSize: wp('3.5%'),
    color: '#FFFFFF',
    marginBottom: hp('1%'),
    opacity: 0.9,
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
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  callButton: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: '#0D6EFD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    backgroundColor: '#0D6EFD',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: hp('2%'),
    marginHorizontal: wp('4%'),
    marginTop: -hp('2%'),
    borderRadius: wp('3%'),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: hp('0.5%'),
  },
  statLabel: {
    fontSize: wp('3%'),
    color: '#FFFFFF',
    opacity: 0.9,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    padding: wp('4%'),
    borderRadius: wp('3%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#333',
  },
  calendarIcon: {
    padding: wp('2%'),
  },
  slotsCount: {
    fontSize: wp('3.5%'),
    color: '#0D6EFD',
    fontWeight: '600',
  },
  aboutText: {
    fontSize: wp('3.8%'),
    color: '#666',
    lineHeight: wp('5%'),
  },
  calendarScroll: {
    marginTop: hp('1%'),
  },
  dateButton: {
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('3%'),
    marginRight: wp('2%'),
    borderRadius: wp('2%'),
    backgroundColor: '#f8f9fa',
    minWidth: wp('15%'),
  },
  selectedDateButton: {
    backgroundColor: '#0D6EFD',
  },
  dateDay: {
    fontSize: wp('3%'),
    color: '#666',
    marginBottom: hp('0.5%'),
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
  dateNumber: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#333',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: hp('1%'),
  },
  timeSlotButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('2%'),
    marginRight: wp('3%'),
    marginBottom: hp('1%'),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedTimeSlot: {
    backgroundColor: '#0D6EFD',
    borderColor: '#0D6EFD',
  },
  timeSlotText: {
    fontSize: wp('3.5%'),
    color: '#333',
    fontWeight: '500',
  },
  timeSlotEndText: {
    fontSize: wp('2.8%'),
    color: '#666',
    marginTop: wp('0.5%'),
  },
  selectedTimeText: {
    color: '#FFFFFF',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: wp('2%'),
    padding: wp('4%'),
    fontSize: wp('3.8%'),
    color: '#333',
    textAlignVertical: 'top',
    minHeight: hp('8%'),
  },
  scheduleButton: {
    backgroundColor: '#0D6EFD',
    marginHorizontal: wp('4%'),
    marginVertical: hp('3%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
  },
  scheduleButtonText: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: hp('3%'),
  },
  loadingText: {
    marginTop: wp('2%'),
    fontSize: wp('3.5%'),
    color: '#666',
  },
  loadingSubtext: {
    marginTop: wp('1%'),
    fontSize: wp('3%'),
    color: '#999',
    textAlign: 'center',
  },
  noSlotsContainer: {
    alignItems: 'center',
    paddingVertical: hp('3%'),
  },
  noSlotsText: {
    fontSize: wp('4%'),
    color: '#666',
    marginTop: wp('2%'),
    fontWeight: '500',
  },
  noSlotsSubtext: {
    fontSize: wp('3%'),
    color: '#999',
    marginTop: wp('1%'),
  },
  // Next 7 Days Styles
  next7DaysContainer: {
    marginTop: hp('2%'),
  },
  next7DaysTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp('2%'),
  },
  // Custom Calendar Styles
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    width: wp('85%'),
    maxHeight: hp('70%'),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp('3%'),
    paddingHorizontal: wp('5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  yearNavButton: {
    padding: wp('2%'),
    borderRadius: wp('1%'),
  },
  calendarHeaderText: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: wp('4%'),
    justifyContent: 'space-between',
  },
  monthButton: {
    width: '30%',
    aspectRatio: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('2%'),
    borderRadius: wp('2%'),
    backgroundColor: '#F8F9FA',
  },
  selectedMonthButton: {
    backgroundColor: '#0D6EFD',
  },
  monthButtonText: {
    fontSize: wp('3.5%'),
    color: '#666',
    fontWeight: '500',
  },
  selectedMonthText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledMonthButton: {
    backgroundColor: '#f5f5f5',
    opacity: 0.5,
  },
  disabledMonthText: {
    color: '#999',
  },
  disabledYearButton: {
    opacity: 0.5,
  },
  calendarFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('5%'),
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    gap: wp('3%'),
  },
  calendarCancelButton: {
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
  },
  calendarCancelText: {
    fontSize: wp('4%'),
    color: '#666',
    fontWeight: '500',
  },
  calendarOkButton: {
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
  },
  calendarOkText: {
    fontSize: wp('4%'),
    color: '#0D6EFD',
    fontWeight: '600',
  },
  // Month Calendar Grid Styles
  monthCalendarContainer: {
    marginTop: hp('2%'),
  },
  dayHeadersRow: {
    flexDirection: 'row',
    marginBottom: hp('1%'),
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: wp('3%'),
    fontWeight: '600',
    color: '#666',
    paddingVertical: hp('1%'),
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayButton: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
    borderRadius: wp('2%'),
  },
  selectedCalendarDay: {
    backgroundColor: '#0D6EFD',
  },
  todayCalendarDay: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#0D6EFD',
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  calendarDayNumber: {
    fontSize: wp('3.5%'),
    fontWeight: '500',
    color: '#333',
  },
  selectedCalendarDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  todayCalendarDayText: {
    color: '#0D6EFD',
    fontWeight: '600',
  },
  otherMonthDayText: {
    color: '#CCC',
  },
  // Horizontal Date Picker Styles
  horizontalDateContainer: {
    marginTop: hp('2%'),
  },
  horizontalDateScroll: {
    marginTop: hp('1%'),
  },
  horizontalDateContent: {
    paddingHorizontal: wp('2%'),
  },
  datePillButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: wp('6%'),
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    marginRight: wp('3%'),
    alignItems: 'center',
    minWidth: wp('16%'),
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selectedDatePill: {
    backgroundColor: '#0D6EFD',
    borderColor: '#0D6EFD',
  },
  datePillDay: {
    fontSize: wp('3%'),
    color: '#666',
    fontWeight: '500',
    marginBottom: hp('0.5%'),
  },
  selectedDatePillDay: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  datePillNumberContainer: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDatePillNumberContainer: {
    backgroundColor: '#FFFFFF',
  },
  datePillNumber: {
    fontSize: wp('3.5%'),
    color: '#333',
    fontWeight: '600',
  },
  selectedDatePillNumber: {
    color: '#0D6EFD',
  },
  // Month Filter Styles
  monthInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  monthFilterBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('1%'),
    marginLeft: wp('2%'),
  },
  monthFilterText: {
    fontSize: wp('2.5%'),
    color: '#0D6EFD',
    fontWeight: '600',
  },
  calendarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearFilterButton: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('2%'),
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
});

export default DoctorAppointmentScreen;

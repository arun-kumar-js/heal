import React, { useState } from 'react';
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
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import BackButton from '../components/BackButton';

const BookingDetailsScreen = ({ navigation, route }) => {
  const { 
    doctor, 
    selectedDate, 
    selectedTime, 
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

  const handleNext = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    if (!mobileNumber.trim()) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    // Generate a random token if not provided
    const randomToken = token || Math.floor(Math.random() * 100).toString().padStart(2, '0');

    // Navigate to BookingConfirmScreen with all required data
    navigation.navigate('BookingConfirm', {
      doctor: doctor,
      selectedDate: selectedDate,
      selectedTime: selectedTime,
      reason: reasonForVisit,
      token: randomToken,
      personalInfo: {
        fullName,
        mobileNumber,
        email
      }
    });
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
                source={require('../Assets/Images/status1.png')} 
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

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Icon name="user" size={16} color="#0D6EFD" />
            </View>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Icon name="phone" size={16} color="#0D6EFD" />
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

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Icon name="envelope" size={16} color="#0D6EFD" />
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

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
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
    fontSize: wp('3.5%'),
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp('1%'),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: wp('2%'),
    marginBottom: hp('2%'),
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.5%'),
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
    fontWeight: '500',
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
    fontWeight: '600',
    color: '#fff',
  },
});

export default BookingDetailsScreen;

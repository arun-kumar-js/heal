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

const AppointmentDetailsScreen = ({ navigation, route }) => {
  const { doctor } = route.params || {};

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
            source={{ uri: doctor?.image || 'https://ui-avatars.com/api/?name=Dr+Aishwarya&background=0D6EFD&color=fff&size=100' }} 
            style={styles.doctorImage} 
          />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor?.name || 'Dr. Aishwarya'}</Text>
            <Text style={styles.doctorSpecialty}>
              {doctor?.specialty || 'Cardiology'} From {doctor?.clinic || 'Kl Clinic'}
            </Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>4.5</Text>
              <View style={styles.starsContainer}>
                {renderStars(4.5)}
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Icon name="phone" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <Icon name="user" size={16} color="#0D6EFD" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value="Tarun S"
              editable={false}
              placeholder="Full Name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="phone" size={16} color="#0D6EFD" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value="**********"
              editable={false}
              placeholder="Mobile Number"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="envelope" size={16} color="#0D6EFD" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value="taruntarun5@gmail.com"
              editable={false}
              placeholder="Email"
            />
          </View>
        </View>

        {/* Reason For Visit Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason For Visit</Text>
          <View style={styles.textAreaContainer}>
            <Text style={styles.textArea}>
              I've been experiencing frequent chest discomfort, occasional shortness of breath, and unusual fatigue even during light activity.
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
              value="10:30 AM"
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
              value="04th, June, Thursday, 2025"
              editable={false}
              placeholder="Date"
            />
          </View>
        </View>

        {/* Payment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.paymentContainer}>
            <Text style={styles.paymentText}>Full Payment</Text>
            <View style={styles.paidBadge}>
              <Text style={styles.paidText}>INR 1500 Paid</Text>
            </View>
          </View>
        </View>

        {/* Token Number Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Token Number</Text>
          <View style={styles.inputContainer}>
            <Icon name="bullseye" size={16} color="#0D6EFD" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value="26"
              editable={false}
              placeholder="Token Number"
            />
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
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
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
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: hp('0.5%'),
    fontFamily: 'Poppins-Bold',
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
    fontWeight: '600',
    marginRight: wp('2%'),
    fontFamily: 'Poppins-SemiBold',
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
    marginBottom: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: hp('1.5%'),
    fontFamily: 'Poppins-Bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    marginBottom: hp('1.5%'),
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
    padding: wp('4%'),
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  paymentText: {
    fontSize: wp('4%'),
    color: '#333333',
    fontFamily: 'Poppins-Regular',
  },
  paidBadge: {
    backgroundColor: '#28A745',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.8%'),
    borderRadius: wp('1.5%'),
  },
  paidText: {
    fontSize: wp('3.5%'),
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default AppointmentDetailsScreen;

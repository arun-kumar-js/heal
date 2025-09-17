import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { OTP_URL, basicAuth } from '../config/config.js';
import Toast from 'react-native-toast-message';
import { saveOTPResponse, getOTPResponse, clearOTPData } from '../utils/otpStorage';
import { PoppinsFonts } from '../config/fonts';
const OTP_LENGTH = 4;

const OTPScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputs = useRef([]);
  const navigation = useNavigation();

  // Function to retrieve OTP response from AsyncStorage
  const getStoredOTPResponse = async () => {
    return await getOTPResponse();
  };

  // Function to clear stored OTP response
  const clearStoredOTPResponse = async () => {
    return await clearOTPData();
  };

  const handleChange = (text, index) => {
    if (/^[0-9]?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      // Go to next input
      if (text && index < OTP_LENGTH - 1) {
        inputs.current[index + 1].focus();
      }
      // Go back if deleting
      if (!text && index > 0) {
        inputs.current[index - 1].focus();
      }
    }
  };

  const handleSubmit = async () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== OTP_LENGTH) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid OTP',
        visibilityTime: 2000,
      });
      return;
    }

    console.log('Submitting OTP:', enteredOtp);
    console.log('OTP URL:', OTP_URL);

    try {
      const response = await fetch(OTP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: basicAuth,
        },
        body: JSON.stringify({
          otp: enteredOtp,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('OTP Verification Response:', data);
      console.log('Response data type:', typeof data);
      console.log('Response keys:', Object.keys(data));

      if (response.ok && data.status === true) {
        // Save OTP response with timestamp using utility function
        const saveSuccess = await saveOTPResponse(data);
        if (saveSuccess) {
          console.log('OTP response saved successfully with timestamp');
        } else {
          console.error('Failed to save OTP response');
        }

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: data.message || 'OTP verified successfully!',
          visibilityTime: 1000,
          onHide: () => {
            navigation.navigate('MainApp');
          },
        });
      } else {
        const errorMessage = data.message || 'OTP verification failed';
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: errorMessage,
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.log('Network Error during OTP verification:', error);
      console.log('Error details:', error.message);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Please check your connection',
        visibilityTime: 2000,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header image */}
          <View style={styles.imageWrap}>
            <Image
              source={require('../Assets/Images/Login.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          {/* Welcome Text */}
          <Text style={styles.welcomeText}>
            Welcome to <Text style={styles.healtoText}>HEALTO</Text>
          </Text>

          <Text style={styles.subText}>
            Please enter your OTP Code sent to your{'\n'}Number
          </Text>

          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {[...Array(OTP_LENGTH)].map((_, i) => (
              <TextInput
                key={i}
                ref={ref => (inputs.current[i] = ref)}
                value={otp[i]}
                onChangeText={text => handleChange(text, i)}
                keyboardType="number-pad"
                maxLength={1}
                style={styles.otpInput}
                autoFocus={i === 0}
                textAlign="center"
              />
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={{ width: '100%', marginTop: hp('2%') }}
            onPress={handleSubmit}
          >
            <LinearGradient
              colors={['#003784', '#1A83FF']}
              start={{ x: 0.01, y: 0 }} // approximate 1.43%
              end={{ x: 0.96, y: 1 }} // approximate 96.11%
              style={styles.button}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Responsive styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp('6%'),
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 40,
  },
  imageWrap: {
    // marginTop: hp('2%'),
    // marginBottom: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: wp('100%'),
    height: hp('55%'),
  },
  welcomeText: {
    fontFamily: PoppinsFonts.Black,
    fontSize: wp('8%'), // Approximate 32px, responsive
   
    letterSpacing: 0, // 0% letter spacing
    textAlign: 'center',
    color: '#222', // or your preferred color
  },
  healtoText: {
    fontFamily: PoppinsFonts.Black,
    fontSize: wp('8%'), // responsive approximation of 32px
   
   
    textAlign: 'center',
    color: '#1977F3',
  },
  subText: {
    fontFamily: PoppinsFonts.Medium,
    fontSize: wp('3.5%'), // Approx 14px responsive
   
    letterSpacing: 0, // 0px
    textAlign: 'center',
    color: '#444',
    marginTop: hp('1%'),
    marginBottom: hp('4%'),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: hp('4%'),
  },
  otpInput: {
    height: wp('15%'),
    width: wp('15%'),
    borderRadius: wp('4%'),
    backgroundColor: '#F6F6F6',
    marginHorizontal: wp('2.2%'),
    fontSize: wp('7.5%'),
    fontFamily: PoppinsFonts.SemiBold,
    color: '#000',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 1,
    elevation: 2,
  },
  button: {
    height: hp('7%'),
    width: '100%',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontFamily: PoppinsFonts.Bold,
    fontSize: wp('3.5%'), // Approx 14px, responsive
    lineHeight: wp('3.5%'), // 100% line-height
    letterSpacing: 0, // 0 spacing
    textAlign: 'center', // center alignment
    color: '#FFFFFF', // text color, adjust as needed
  },
});

export default OTPScreen;

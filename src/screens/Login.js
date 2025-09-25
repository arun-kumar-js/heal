import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';
import { PoppinsFonts } from '../config/fonts';

// Accept navigation prop
import { sendOTP } from '../services/loginApi.js';
const Login = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');

  const handleGetOTP = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      console.log('Please enter a valid mobile number');
      return;
    }

    const result = await sendOTP(mobileNumber);

    if (result.success) {
      // Show success toast and navigate after toast completes
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: result.message,
        visibilityTime: 1000,
        onHide: () => {
          navigation.navigate('OtpPage', { phoneNumber: mobileNumber });
        },
      });
    } else {
      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: result.message,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <LinearGradient
        colors={['rgba(223, 239, 255, 0.5)', 'rgba(255, 255, 255, 0)']}
        style={styles.gradient}
      />

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
          <View style={styles.imageContainer}>
            <Image
              source={require('../Assets/Images/Login.png')}
              style={styles.image}
              alt="Doctor image"
            />
          </View>

          <View style={styles.contentContainer}>
            <View>
            <Text style={styles.welcomeText}>
            Welcome to <Text style={styles.healtoText}>HEALTO</Text>
          </Text>
              <Text style={styles.subtitle}>
                Join HEALTO to book appointments{'\n'}and manage your health in one
                place.
              </Text>

              <View style={styles.inputWrapper}>
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.countryCodeText}>+91</Text>
                  <Icon
                    name="chevron-down"
                    size={14}
                    color="#4A5568"
                    style={{ marginLeft: 6 }}
                  />
                </View>
                <TextInput
                  style={{
                    flex: 1,
                    fontFamily: PoppinsFonts.Medium,
                    fontSize: wp('4%'),
                    letterSpacing: 0,
                    textAlign: 'left',
                    paddingHorizontal: wp('4%'),
                    color: '#1A202C',
                    height: '100%',
                  }}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#858C98"
                  keyboardType="phone-pad"
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  maxLength={10}
                  returnKeyType="done"
                />
              </View>
            </View>

            <TouchableOpacity
              style={{ width: '100%', marginTop: hp('3%') }}
              onPress={handleGetOTP}
            >
              <LinearGradient
                start={{ x: 0.0143, y: 0 }} // approximate 1.43% along x-axis
                end={{ x: 0.9611, y: 1 }} // approximate 96.11% along x-axis
                colors={['#003784', '#1A83FF']}
                style={styles.button} // keep your button styling (borderRadius, height, alignment)
              >
                <Text style={styles.buttonText}>Get OTP</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    height: hp('35%'),
    width: wp('100%'),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: wp('6%'),
    justifyContent: 'flex-start',
    paddingBottom: hp('3%'),
    marginTop: hp('1%'),
  },
  title: {
    fontFamily: PoppinsFonts.Black,
    fontSize: wp('6.5%'),
    lineHeight: wp('8%'),
    letterSpacing: 0,
    textAlign: 'center',
    color: '#2D3748',
    marginBottom: hp('1%'),
    paddingHorizontal: wp('1%'),
    flexWrap: 'wrap',
  },
  titleText: {
    fontFamily: PoppinsFonts.Black,
    fontSize: wp('6.5%'),
    lineHeight: wp('8%'),
    letterSpacing: 0,
    color: '#2D3748',
  },
  subtitle: {
    fontFamily: PoppinsFonts.Medium,
    fontSize: wp('3.5%'),
    lineHeight: wp('4.5%'),
    letterSpacing: 0,
    textAlign: 'center',
    color: '#4A5568',
    marginTop: hp('1%'),
    marginBottom: hp('3%'),
    paddingHorizontal: wp('2%'),
  },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    borderRadius: 14,
    marginTop: hp('2%'),
    alignItems: 'center',
    height: hp('6%'),
    borderWidth: 1,
    borderColor: '#E8EDF2',
    paddingHorizontal: wp('2%'),
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    justifyContent: 'center',
  },
  smallBoldText: {
    fontFamily: PoppinsFonts.Bold,
    fontSize: wp('3%'), // Approx 12px responsive
    lineHeight: wp('3%'), // 100% line-height
    letterSpacing: 0, // 0 spacing
    textAlign: 'center', // center alignment
    color: '#2D3748', // your preferred color
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A202C',
    paddingHorizontal: 16,
    fontFamily: PoppinsFonts.Medium,
  },
  button: {
    backgroundColor: '#0D63F3',
    borderRadius: 14,
    height: hp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: hp('3%'),
  },
  buttonText: {
    fontFamily: PoppinsFonts.Bold,
    fontSize: wp('3.5%'), // Approx 14px, responsive
    lineHeight: wp('3.5%'), // 100% line-height
    letterSpacing: 0, // 0 spacing
    textAlign: 'center', // center alignment
    color: '#FFFFFF', // text color, adjust as needed
  },
  titleHighlight: {
    fontFamily: PoppinsFonts.Black,
    fontSize: wp('6.5%'),
    lineHeight: wp('8%'),
    letterSpacing: 0,
    textAlign: 'center',
    color: '#0b5ff0ff',
  },
  maskedView: {
    flexDirection: 'row',
    height: wp('8%'), // Match the font size
  },
  titleHighlightMask: {
    fontFamily: PoppinsFonts.Black,
    fontSize: wp('6.5%'),
    lineHeight: wp('8%'),
    letterSpacing: 0,
    textAlign: 'center',
    backgroundColor: 'transparent',
    color: 'black',
  },
  gradientText: {
    flex: 1,
    height: wp('8%'), // Match the font size
  }, welcomeText: {
    fontFamily: PoppinsFonts.Black,
    fontSize: wp('8%'), // Approximate 32px, responsive
  
    letterSpacing: 0, // 0% letter spacing
    textAlign: 'center',
    color: '#222', // or your preferred color
  }, healtoText: {
    fontFamily: PoppinsFonts.Black,
    fontSize: wp('8%'), // responsive approximation of 32px
   
    textAlign: 'center',
    color: '#1977F3',
  },
});

export default Login;

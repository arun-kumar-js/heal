import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
// Assume your green badge icon is in ./assets/success-badge.png
const ProfileCreatedScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Auto-navigate to MainApp after 2 seconds
    const timer = setTimeout(() => {
      navigation.navigate('MainApp');
    }, 2000);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Green Badge with Checkmark */}
      <View style={styles.iconContainer}>
        <Image
          source={require('../Assets/Images/Vector.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

      {/* Success Title */}
      <Text style={styles.title}>
        Your profile has been created successfully.
      </Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        You can now book appointments, consult with doctors, and manage your
        care.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MainApp')}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};
export default ProfileCreatedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('8%'),
  },
  iconContainer: {
    marginTop: hp('-10%'),
    marginBottom: hp('4%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: wp('45%'),
    height: wp('45%'),
  },
  title: {
    fontFamily: 'Work Sans', // Make sure Work Sans Bold is linked in your project
    fontWeight: '700', // Bold
    fontSize: wp('5%'), // Approx 20px responsive
    lineHeight: wp('5%'), // 100% of font size
    letterSpacing: 0, // 0 spacing
    textAlign: 'center', // center alignment
    color: '#333',
    marginBottom: hp('2%'),
    marginTop: hp('2%'),
  },
  subtitle: {
    fontFamily: 'Work Sans', // Ensure Work Sans SemiBold is linked in your project
    fontWeight: '600', // SemiBold
    fontSize: wp('3.5%'), // Approx 14px, responsive
    lineHeight: wp('3.5%'), // 100% of font size
    letterSpacing: 0, // 0px spacing
    textAlign: 'center', // centered text
    color: '#333', // text color
    marginTop: hp('0.8%'), // spacing from title
  },
  button: {
    backgroundColor: '#0D6EFD',
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('4%'),
    marginTop: hp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: wp('4%'),
    fontWeight: '600',
    fontFamily: 'Work Sans',
    textAlign: 'center',
  },
});

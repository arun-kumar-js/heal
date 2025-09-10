import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const Settings = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Configure your app preferences</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: wp('5%'),
  },
  title: {
    fontSize: wp('8%'),
    fontWeight: 'bold',
    color: '#0D6EFD',
    marginBottom: hp('2%'),
    fontFamily: 'Work Sans',
  },
  subtitle: {
    fontSize: wp('4%'),
    color: '#8E8E93',
    textAlign: 'center',
    fontFamily: 'Work Sans',
  },
});

export default Settings;

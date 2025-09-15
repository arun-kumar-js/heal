import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BackButton = ({ onPress, style, iconColor = '#FFFFFF' }) => {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.container,
        {
          top: Platform.OS === 'ios' ? insets.top + hp('1.5%') : hp('2.5%'),
        },
        style
      ]}
    >
      <Icon 
        name="arrow-left" 
        size={wp('5%')} 
        color={iconColor}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: wp('4%'),
    zIndex: 1000,
    padding: wp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BackButton;

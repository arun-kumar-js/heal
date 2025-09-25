import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Image } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import { PoppinsFonts } from '../../config/fonts';

// Import your screen components
import HomeScreen from '../Home';
import AppointmentScreen from '../Appointment';
import CategoryScreen from '../Category';
import SettingsScreen from '../Settings';

const Tab = createBottomTabNavigator();

const BottomTap = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconSource;

          if (route.name === 'Home') {
            iconSource = require('../../Assets/Images/Home_icon.png');
          } else if (route.name === 'Appointment') {
            iconSource = require('../../Assets/Images/Appointment_icon.png');
          } else if (route.name === 'Category') {
            iconSource = require('../../Assets/Images/Category_Icon.png');
          } else if (route.name === 'Settings') {
            iconSource = require('../../Assets/Images/Settings.png');
          }

          return (
            <View style={styles.iconContainer}>
              <Image
                source={iconSource}
                style={[
                  styles.tabIcon,
                  {
                    width: size,
                    height: size,
                    tintColor: color,
                  }
                ]}
                resizeMode="contain"
              />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          );
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: hp('12%'),
          paddingBottom: hp('2%'),
          paddingTop: hp('1%'),
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 0,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['#1A83FF', '#003784']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tabBarBackground}
          />
        ),
        tabBarLabelStyle: {
          fontSize: wp('3%'),
          fontFamily: PoppinsFonts.SemiBold,
          color: '#FFFFFF',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Appointment"
        component={AppointmentScreen}
        options={{
          tabBarLabel: 'Appointment',
        }}
      />
      <Tab.Screen
        name="Category"
        component={CategoryScreen}
        options={{
          tabBarLabel: 'Category',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
    marginHorizontal: wp('4%'),
    marginBottom: hp('2%'),
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabIcon: {
    marginBottom: hp('0.5%'),
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -hp('2.6%'),
    width: wp('8%'),
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
});

export default BottomTap;

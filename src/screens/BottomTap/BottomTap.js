import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';

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
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Appointment') {
            iconName = 'folder-open';
          } else if (route.name === 'Category') {
            iconName = 'th-large';
          } else if (route.name === 'Settings') {
            iconName = 'cog';
          }

          return (
            <View style={styles.iconContainer}>
              <Icon
                name={iconName}
                size={size}
                color={color}
                style={styles.tabIcon}
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
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['#0D6EFD', '#1A83FF']}
            style={styles.tabBarBackground}
          />
        ),
        tabBarLabelStyle: {
          fontSize: wp('3%'),
          fontWeight: '600',
          fontFamily: 'Work Sans',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
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

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/screens/Login';
import OTPScreen from './src/screens/OtpPage';
import ProfileCreatedScreen from './src/screens/ProfileCreatedScreen';
import BottomTap from './src/screens/BottomTap/BottomTap';
import ClinicsScreen from './src/screens/clinicsScreen';
import HospitalDetailsScreen from './src/screens/HospitalDetailsScreen';
import DoctorListScreen from './src/screens/DoctorListScreen';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

// Global toast configuration
const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: '#003784',
        borderLeftColor: '#1A83FF',
        borderRadius: 8,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
      }}
      text2Style={{
        fontSize: 14,
        color: '#FFFFFF',
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        backgroundColor: '#DC2626',
        borderLeftColor: '#EF4444',
        borderRadius: 8,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
      }}
      text2Style={{
        fontSize: 14,
        color: '#FFFFFF',
      }}
    />
  ),
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainApp">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OtpPage"
          component={OTPScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfileCreated"
          component={ProfileCreatedScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainApp"
          component={BottomTap}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ClinicsScreen"
          component={ClinicsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HospitalDetailsScreen"
          component={HospitalDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DoctorListScreen"
          component={DoctorListScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
      <Toast config={toastConfig} />
    </NavigationContainer>
  );
}

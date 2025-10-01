import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './src/screens/Login';
import OTPScreen from './src/screens/OtpPage';
import ProfileCreatedScreen from './src/screens/ProfileCreatedScreen';
import BottomTap from './src/screens/BottomTap/BottomTap';
import ClinicsScreen from './src/screens/clinicsScreen';
import HospitalDetailsScreen from './src/screens/HospitalDetailsScreen';
import DoctorListScreen from './src/screens/DoctorListScreen';
import DoctorListByHospitalScreen from './src/screens/DoctorListByHospitalScreen';
import DoctorAppointmentScreen from './src/screens/DoctorAppointmentScreen';
import BookingDetailsScreen from './src/screens/BookingDetailsScreen';
import BookingConfirmScreen from './src/screens/BookingConfirmScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import PaymentSuccessScreen from './src/screens/PaymentSuccessScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import Appointment from './src/screens/Appointment';
import AppointmentDetailsScreen from './src/screens/AppointmentDetailsScreen';
import HospitalListByCategoryScreen from './src/screens/HospitalListByCategoryScreen';
import Category from './src/screens/Category';
import DoctorBySpc from './src/screens/DoctorBySpc';
import FAQScreen from './src/screens/FAQScreen';
import SupportContentScreen from './src/screens/SupportContentScreen';

const Stack = createNativeStackNavigator();

// Authentication Check Component
interface AuthCheckProps {
  children: (props: { isAuthenticated: boolean }) => React.ReactNode;
}

const AuthCheck = ({ children }: AuthCheckProps) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const otpResponse = await AsyncStorage.getItem('otpResponse');
      if (otpResponse) {
        const parsedResponse = JSON.parse(otpResponse);
        if (parsedResponse.status === true) {
          console.log('User is authenticated, navigating to MainApp');
          setIsAuthenticated(true);
        } else {
          console.log('OTP response found but status is false');
          setIsAuthenticated(false);
        }
      } else {
        console.log('No OTP response found, user needs to login');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <ActivityIndicator size="large" color="#0D6EFD" />
      </View>
    );
  }

  return children({ isAuthenticated });
};

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
    <SafeAreaProvider>
      <Provider store={store}>
        <AuthCheck>
          {({ isAuthenticated }) => (
            <NavigationContainer>
              <Stack.Navigator 
                initialRouteName={isAuthenticated ? "MainApp" : "Login"}
                screenOptions={{ headerShown: false }}
              >
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
        <Stack.Screen
          name="DoctorListByHospitalScreen"
          component={DoctorListByHospitalScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DoctorAppointment"
          component={DoctorAppointmentScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BookingDetails"
          component={BookingDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BookingConfirm"
          component={BookingConfirmScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PaymentSuccess"
          component={PaymentSuccessScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Appointment"
          component={Appointment}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="AppointmentDetails"
          component={AppointmentDetailsScreen}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="ProfileCreatedScreen"
          component={ProfileCreatedScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HospitalListByCategoryScreen"
          component={HospitalListByCategoryScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Category"
          component={Category}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DoctorBySpc"
          component={DoctorBySpc}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FAQScreen"
          component={FAQScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SupportContentScreen"
          component={SupportContentScreen}
          options={{ headerShown: false }}
        />

              </Stack.Navigator>
            </NavigationContainer>
          )}
        </AuthCheck>
        <Toast config={toastConfig} />
      </Provider>
    </SafeAreaProvider>
  );
}

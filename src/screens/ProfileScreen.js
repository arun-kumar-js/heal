import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { getUserData, saveUserData } from '../utils/userStorage';
import { getLoginResponse } from '../utils/loginDataStorage';
import { getOTPResponse } from '../utils/otpStorage';
import { PoppinsFonts } from '../config/fonts';

const ProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user data from async storage on component mount
  useEffect(() => {
    loadUserData();
  }, []);


  const loadUserData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading user data from async storage...');
      
      // Priority order: OTP Response > Login Response > User Storage
      let profileData = null;
      let dataSource = '';
      
      // First try to get data from OTP response
      const otpResponse = await getOTPResponse();
      console.log('🔐 OTP response data:', otpResponse);
      
      if (otpResponse && otpResponse.data) {
        const userData = otpResponse.data;
        console.log('✅ Using OTP response data:', userData);
        
        profileData = {
          name: userData.name || userData.full_name || '',
          phone: userData.phone_number || userData.phone || '',
          email: userData.email || '',
          gender: userData.gender || ''
        };
        dataSource = 'OTP Response';
      } else {
        // Try login response
        const loginResponse = await getLoginResponse();
        console.log('📱 Login response data:', loginResponse);
        
        if (loginResponse && loginResponse.data) {
          const userData = loginResponse.data;
          console.log('✅ Using login response data:', userData);
          
          profileData = {
            name: userData.name || userData.full_name || '',
            phone: userData.phone_number || userData.phone || '',
            email: userData.email || '',
            gender: userData.gender || ''
          };
          dataSource = 'Login Response';
        } else {
          // Fallback to user storage
          console.log('📦 OTP/Login data not found, trying user storage...');
          const userData = await getUserData();
          console.log('💾 User storage data:', userData);
          
          profileData = {
            name: userData.name || '',
            phone: userData.phone || '',
            email: userData.email || '',
            gender: userData.gender || ''
          };
          dataSource = 'User Storage';
        }
      }
      
      console.log(`👤 Profile data from ${dataSource}:`, profileData);
      
      setName(profileData.name);
      setPhoneNumber(profileData.phone);
      setEmail(profileData.email);
      setGender(profileData.gender);
      
      console.log('✅ User data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      console.log('💾 Saving user data to async storage...');
      
      // Save updated user data to async storage
      const updatedUserData = {
        name: name.trim(),
        phone: phoneNumber.trim(),
        email: email.trim(),
        gender: gender,
      };

      console.log('📝 Data to be saved:', updatedUserData);

      const success = await saveUserData(updatedUserData);
      
      if (success) {
        console.log('✅ User data saved successfully to async storage');
    Alert.alert(
      'Success',
      'Profile updated successfully!',
      [
        {
          text: 'OK',
          onPress: () => setIsEditing(false)
        }
      ]
    );
      } else {
        console.log('❌ Failed to save user data to async storage');
        Alert.alert('Error', 'Failed to save profile data');
      }
    } catch (error) {
      console.error('❌ Error saving user data:', error);
      Alert.alert('Error', 'Failed to save profile data');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const getProfileImage = () => {
    return { 
      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=300&background=d4a574&color=fff&bold=true`
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0D6EFD" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6EFD" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleEdit}>
          <Icon name="edit" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureContainer}>
          <View style={styles.profilePictureWrapper}>
            <Image 
              source={getProfileImage()} 
              style={styles.profilePicture}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* User Information Card */}
        <View style={styles.infoCard}>
          {/* Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Name</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Icon name="user" size={16} color="#0D6EFD" />
              </View>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#999"
                editable={isEditing}
              />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Icon name="phone" size={16} color="#0D6EFD" />
              </View>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                editable={isEditing}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Icon name="envelope" size={16} color="#0D6EFD" />
              </View>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={isEditing}
              />
            </View>
          </View>

          {/* Gender */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <TouchableOpacity 
              style={styles.inputContainer}
              onPress={() => isEditing && setGender(gender === 'Male' ? 'Female' : 'Male')}
            >
              <View style={styles.inputIcon}>
                <Icon name="venus-mars" size={16} color="#0D6EFD" />
              </View>
              <Text style={[styles.input, !isEditing && styles.inputReadOnly]}>
                {gender}
              </Text>
              {isEditing && (
                <Icon name="chevron-down" size={14} color="#999" />
              )}
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Save Changes Button */}
      {isEditing && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#0D6EFD',
    borderBottomLeftRadius: wp('4%'),
    borderBottomRightRadius: wp('4%'),
  },
  backButton: {
    padding: wp('2%'),
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontFamily: PoppinsFonts.SemiBold,
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('5%'),
  },
  profilePictureContainer: {
    alignItems: 'center',
    paddingVertical: hp('4%'),
  },
  profilePictureWrapper: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('15%'),
    borderWidth: 3,
    borderColor: '#E0E0E0',
    padding: wp('1%'),
    backgroundColor: '#d4a574',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: wp('14%'),
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    padding: wp('5%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldContainer: {
    marginBottom: hp('3%'),
  },
  fieldLabel: {
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.SemiBold,
    color: '#333',
    marginBottom: hp('1%'),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.5%'),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: wp('3%'),
  },
  input: {
    flex: 1,
    fontSize: wp('4%'),
    color: '#333',
  },
  inputReadOnly: {
    color: '#666',
  },
  buttonContainer: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#0D6EFD',
    borderRadius: wp('2%'),
    paddingVertical: hp('2%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: wp('4.5%'),
    fontFamily: PoppinsFonts.SemiBold,
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: wp('4%'),
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
});

export default ProfileScreen;


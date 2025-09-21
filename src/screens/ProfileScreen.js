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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
// Removed fallback storage imports - only using Redux now
import { PoppinsFonts } from '../config/fonts';
import { updatePatientProfile, validatePatientData } from '../services/patientUpdateApi';
import { useDispatch, useSelector } from 'react-redux';
import { selectPatientId, selectPatientData, selectFormattedUserData, loadUserOTPResponse, updatePatientData, fetchUserProfile, selectUser } from '../store/slices/userSlice';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const patientId = useSelector(selectPatientId);
  const patientData = useSelector(selectPatientData);
  const userData = useSelector(selectFormattedUserData);
  const userState = useSelector(selectUser);
  
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasTriedFetching, setHasTriedFetching] = useState(false);

  // Load user data from Redux only on initial mount
  useEffect(() => {
    // Reset the fetching flag when patientId changes (new login)
    if (patientId) {
      setHasTriedFetching(false);
    }
    loadUserData();
  }, [patientId]);

  // Only refresh data when screen comes into focus if we don't have complete data and haven't tried fetching yet
  useFocusEffect(
    React.useCallback(() => {
      const hasCompleteData = userState.patientData && 
        userState.patientData.name && 
        userState.patientData.email && 
        userState.patientData.gender;
      
      // For new users, check if we have at least basic data (phone number)
      const hasBasicData = userState.patientData && 
        (userState.patientData.phone_number || userState.patientData.phone);
      
      if (!hasCompleteData && !hasTriedFetching && hasBasicData) {
        console.log('🔄 Profile screen focused - fetching profile for new user...');
        loadUserData();
      } else if (hasCompleteData) {
        console.log('✅ Profile screen focused - data already complete, skipping refresh');
      } else if (!hasBasicData) {
        console.log('⚠️ Profile screen focused - no basic data available, skipping fetch');
      } else {
        console.log('✅ Profile screen focused - already tried fetching, skipping');
      }
    }, [userState.patientData, hasTriedFetching])
  );

  // Sync form fields when Redux patient data changes
  useEffect(() => {
    if (patientData) {
      console.log('🔄 Syncing form fields with Redux patient data:', patientData);
      
      const newName = patientData.name || patientData.patient_name || '';
      const newPhone = patientData.phone_number || patientData.phone || '';
      const newEmail = patientData.email || '';
      const newGender = patientData.gender || '';
      
      // Only update if values have actually changed to prevent flicker
      if (name !== newName) setName(newName);
      if (phoneNumber !== newPhone) setPhoneNumber(newPhone);
      if (email !== newEmail) setEmail(newEmail);
      if (gender !== newGender) setGender(newGender);
      
      console.log('✅ Form fields synced with Redux data:', {
        name: newName,
        phone: newPhone,
        email: newEmail,
        gender: newGender
      });
    }
  }, [patientData]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setHasTriedFetching(true);
      console.log('🔄 Fetching user profile from API via Redux...');
      console.log('🔄 Current patientId from Redux:', patientId);
      console.log('🔄 Current userState:', userState);

      // If no patientId, try to get it from OTP response data
      let currentPatientId = patientId;
      if (!currentPatientId && userState.otpResponse?.data?.id) {
        currentPatientId = userState.otpResponse.data.id;
        console.log('🔄 Using patientId from OTP response:', currentPatientId);
      }

      // Check if we already have complete patient data
      const hasCompleteData = userState.patientData && 
        userState.patientData.name && 
        userState.patientData.email && 
        userState.patientData.gender;
      
      if (hasCompleteData) {
        console.log('✅ Patient data already complete, skipping API call');
      } else if (currentPatientId) {
        console.log('🔄 Fetching fresh profile data from API...');
        // Fetch user profile from API via Redux - pass patientId explicitly
        await dispatch(fetchUserProfile(currentPatientId));
      } else {
        console.log('⚠️ No patient ID available, cannot fetch profile');
      }


      // Only use Redux patient data - no fallbacks
      if (patientData) {
        const formName = patientData.name || patientData.patient_name || '';
        const formPhone = patientData.phone_number || patientData.phone || '';
        const formEmail = patientData.email || '';
        const formGender = patientData.gender || '';

        setName(formName);
        setPhoneNumber(formPhone);
        setEmail(formEmail);
        setGender(formGender);

        console.log('✅ Profile data loaded from API and Redux:', {
          name: formName,
          phone: formPhone,
          email: formEmail,
          gender: formGender
        });
      } else {
        console.log('⚠️ No patient data found in Redux store after API fetch - using empty values');
        // Set empty values as fallback for new users
        setName('');
        setPhoneNumber('');
        setEmail('');
        setGender('');
      }
    } catch (error) {
      console.error('❌ Error fetching user profile from API via Redux:', error);
      // Set empty values as fallback
      setName('');
      setPhoneNumber('');
      setEmail('');
      setGender('');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    // Validate input data
    const formData = {
      name: name.trim(),
      phone: phoneNumber.trim(),
      email: email.trim(),
      gender: gender,
    };

    const validation = validatePatientData(formData);
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    if (!patientId) {
      Alert.alert('Error', 'Patient ID not found in OTP response. Please login again.');
      return;
    }

    try {
      setSaving(true);
      console.log('🔄 Updating patient profile via API...');
      
      // Prepare data for API
      const apiData = {
        patient_id: patientId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
      };

      console.log('📝 Data to be sent to API:', apiData);

      // Call the API
      const result = await updatePatientProfile(apiData);
      
      if (result.success) {
        console.log('✅ Profile updated successfully via API');
        console.log('📝 API Response data:', result.data);
        
        // Use the complete API response data instead of just form data
        const updatedPatientData = {
          ...result.data, // Use complete API response data
          // Ensure we have the correct field mappings
          id: result.data.id,
          patient_unique_id: result.data.patient_unique_id,
          name: result.data.name,
          phone_number: result.data.phone_number,
          email: result.data.email,
          gender: result.data.gender,
          dob: result.data.dob,
          age: result.data.age,
          blood_group: result.data.blood_group,
          address: result.data.address,
          profile_image: result.data.profile_image,
          status: result.data.status,
          created_at: result.data.created_at,
          updated_at: result.data.updated_at,
          // Add timestamp for tracking
          lastUpdated: new Date().toISOString(),
        };
        
        // Clear old data and update with new data in Redux
        dispatch(updatePatientData(updatedPatientData));
        console.log('✅ Redux store cleared and updated with complete API response data:', updatedPatientData);
        
        // Force refresh the form data to ensure UI shows updated values
        setName(formData.name);
        setPhoneNumber(formData.phone);
        setEmail(formData.email);
        setGender(formData.gender);
        
        console.log('✅ Form data refreshed with updated values:', {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          gender: formData.gender
        });
        
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
        console.log('❌ Failed to update profile via API:', result.message);
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleBackPress = () => {
    // Reset editing state before going back to prevent flicker
    if (isEditing) {
      setIsEditing(false);
    }
    navigation.goBack();
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
          onPress={handleBackPress}
        >
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleEdit}>
          <Icon name="edit" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
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
                selectTextOnFocus={isEditing}
                clearButtonMode={isEditing ? "while-editing" : "never"}
              />
              {isEditing && email.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setEmail('')}
                >
                  <Icon name="times" size={14} color="#999" />
                </TouchableOpacity>
              )}
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
      </KeyboardAvoidingView>

      {/* Action Buttons */}
      {isEditing && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSaveChanges}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
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
  keyboardAvoidingView: {
    flex: 1,
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
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('2%'),
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
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldContainer: {
    marginBottom: hp('2.5%'),
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
  clearButton: {
    padding: wp('2%'),
    marginLeft: wp('2%'),
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#0D6EFD',
    borderRadius: wp('2%'),
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('6%'),
    alignItems: 'center',
    flex: 1,
    maxWidth: wp('80%'),
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
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
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


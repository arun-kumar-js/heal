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
import LinearGradient from 'react-native-linear-gradient';
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
import { formatMobileInput, validateMobileNumber } from '../utils/mobileValidation';
import { launchImageLibrary } from 'react-native-image-picker';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';

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
  const [bloodGroup, setBloodGroup] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasTriedFetching, setHasTriedFetching] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Load user data from Redux only on initial mount
  useEffect(() => {
    // Reset the fetching flag when patientId changes (new login)
    if (patientId) {
      setHasTriedFetching(false);
    }
    loadUserData();
  }, [patientId]);

  // Refresh data when screen comes into focus to ensure we have the latest data
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Profile screen focused - refreshing data...');
        loadUserData();
    }, [])
  );

  // Sync form fields when Redux patient data changes
  useEffect(() => {
    if (patientData) {
      console.log('🔄 Syncing form fields with Redux patient data:', patientData);
      
      const newName = patientData.name || patientData.patient_name || '';
      const newPhone = patientData.phone_number || patientData.phone || '';
      const newEmail = patientData.email || '';
      const newGender = patientData.gender || '';
      const newBloodGroup = patientData.blood_group || '';
      const newDob = patientData.dob || '';
      const newAddress = patientData.address || '';
      
      // Only update if values have actually changed to prevent flicker
      if (name !== newName) setName(newName);
      if (phoneNumber !== newPhone) setPhoneNumber(newPhone);
      if (email !== newEmail) setEmail(newEmail);
      if (gender !== newGender) setGender(newGender);
      if (bloodGroup !== newBloodGroup) setBloodGroup(newBloodGroup);
      if (dob !== newDob) setDob(newDob);
      if (address !== newAddress) setAddress(newAddress);
      
      console.log('✅ Form fields synced with Redux data:', {
        name: newName,
        phone: newPhone,
        email: newEmail,
        gender: newGender,
        bloodGroup: newBloodGroup,
        dob: newDob,
        address: newAddress
      });
    }
  }, [patientData]);

  // Helper function to format DOB for display
  const formatDOB = (dobString) => {
    if (!dobString) return '';
    try {
      const date = new Date(dobString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting DOB:', error);
      return dobString;
    }
  };

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

      // Always fetch fresh data from API to ensure we have the latest information
      if (currentPatientId) {
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
      dob: dob.trim(),
      blood_group: bloodGroup.trim(),
      address: address.trim(),
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
        dob: formData.dob,
        blood_group: formData.blood_group,
        address: formData.address,
        profile_image: profileImageUri ? {
          uri: profileImageUri,
          type: 'image/jpeg',
          name: 'profile_image.jpg'
        } : null, // Pass profile image as file object if exists
      };

      console.log('📝 Data to be sent to API:', apiData);

      // Call the API
      const result = await updatePatientProfile(apiData);
      
      if (result.success) {
        console.log('✅ Profile updated successfully via API');
        console.log('📝 API Response data:', result.data);
        
        // Use the patient data from API response (API returns {message, patient: {...}})
        const patientData = result.data.patient || result.data;
        const updatedPatientData = {
          ...patientData, // Use patient data from API response
          // Ensure we have the correct field mappings
          id: patientData.id,
          patient_unique_id: patientData.patient_unique_id,
          name: patientData.name,
          phone_number: patientData.phone_number,
          email: patientData.email,
          gender: patientData.gender,
          dob: patientData.dob,
          age: patientData.age,
          blood_group: patientData.blood_group,
          address: patientData.address,
          profile_image: patientData.profile_image,
          status: patientData.status,
          created_at: patientData.created_at,
          updated_at: patientData.updated_at,
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
        setDob(formData.dob);
        setBloodGroup(formData.blood_group);
        setAddress(formData.address);
        
        console.log('✅ Form data refreshed with updated values:', {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          gender: formData.gender,
          dob: formData.dob,
          blood_group: formData.blood_group,
          address: formData.address,
        });
        
        Alert.alert(
          'Success',
          'Profile updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsEditing(false);
                // Refresh the data to ensure UI shows updated values
                loadUserData();
                // Go back to the previous screen (MainApp)
                navigation.goBack();
              }
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

  // Request photo library permission
  const requestPhotoPermission = async () => {
    try {
      console.log('=== REQUESTING PHOTO PERMISSION ===');
      
      let permissions = [];
      
      if (Platform.OS === 'ios') {
        permissions = [PERMISSIONS.IOS.PHOTO_LIBRARY];
      } else {
        // For Android, we need to check the API level and request appropriate permissions
        permissions = [
          PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
          PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        ];
      }
      
      console.log('Platform:', Platform.OS);
      console.log('Permissions to check:', permissions);
      
      // Check all permissions first
      const permissionStatuses = {};
      for (const permission of permissions) {
        const status = await check(permission);
        permissionStatuses[permission] = status;
        console.log(`Permission ${permission}: ${status}`);
      }
      
      // Check if any permission is already granted
      const hasGrantedPermission = Object.values(permissionStatuses).some(status => status === RESULTS.GRANTED);
      if (hasGrantedPermission) {
        console.log('At least one permission already granted');
        return true;
      }
      
      // Request permissions that are denied
      const deniedPermissions = permissions.filter(permission => 
        permissionStatuses[permission] === RESULTS.DENIED
      );
      
      if (deniedPermissions.length > 0) {
        console.log('Requesting denied permissions:', deniedPermissions);
        
        for (const permission of deniedPermissions) {
          const result = await request(permission);
          console.log(`Permission ${permission} request result:`, result);
          
          if (result === RESULTS.GRANTED) {
            console.log('Permission granted successfully');
            return true;
          }
        }
        
        // If we get here, all permissions were denied
        console.log('All permissions denied by user');
        Alert.alert(
          'Permission Required',
          'Photo library access is required to select a profile picture. Please grant permission in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {
              console.log('User wants to go to settings');
            }}
          ]
        );
        return false;
      }
      
      // Check for blocked permissions
      const blockedPermissions = permissions.filter(permission => 
        permissionStatuses[permission] === RESULTS.BLOCKED
      );
      
      if (blockedPermissions.length > 0) {
        console.log('Permission blocked, need to go to settings');
        Alert.alert(
          'Permission Blocked',
          'Photo library access is blocked. Please enable it in app settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {
              console.log('User wants to go to settings');
            }}
          ]
        );
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting photo permission:', error);
      Alert.alert('Error', 'Failed to request permission. Please try again.');
      return false;
    }
  };

  // Handle phone number input with validation
  const handlePhoneNumberChange = (text) => {
    // Format the input to only allow digits and limit to 10 characters
    const formattedText = formatMobileInput(text);
    setPhoneNumber(formattedText);
    
    // Clear previous error
    setPhoneError('');
    
    // Validate the phone number
    if (formattedText.length > 0) {
      const validation = validateMobileNumber(formattedText);
      if (!validation.isValid) {
        setPhoneError(validation.error);
      }
    }
  };

  // Handle image picker
  const handleImagePicker = async () => {
    console.log('=== HANDLE IMAGE PICKER ===');
    console.log('isEditing:', isEditing);
    console.log('uploadingImage:', uploadingImage);
    
    if (!isEditing) {
      Alert.alert('Edit Mode Required', 'Please enable edit mode to change your profile picture.');
      return;
    }

    if (uploadingImage) {
      Alert.alert('Upload in Progress', 'Please wait for the current upload to complete.');
      return;
    }

    try {
      console.log('Requesting photo permission...');
      const hasPermission = await requestPhotoPermission();
      console.log('Permission granted:', hasPermission);
      
      if (!hasPermission) {
        console.log('Permission not granted, cannot open gallery');
        return;
      }

      console.log('Opening image library...');
      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
      };

      console.log('Image picker options:', options);
      
      launchImageLibrary(options, async (response) => {
        console.log('Image picker response:', response);
        
        if (response.didCancel) {
          console.log('Image picker cancelled by user');
          return;
        }
        
        if (response.errorMessage) {
          console.log('Image picker error:', response.errorMessage);
          Alert.alert('Error', `Failed to open gallery: ${response.errorMessage}`);
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          console.log('Selected asset:', asset);
          
          if (asset.uri) {
            console.log('Image selected:', asset.uri);
            
            // Create complete file object
            const imageFile = {
              uri: asset.uri,
              type: asset.type || 'image/jpeg',
              name: asset.fileName || 'profile_image.jpg'
            };
            
            // Set profile image URI for UI display
            setProfileImageUri(asset.uri);
            
            // Upload image to API with complete file information
            await uploadImageToAPI(imageFile);
          } else {
            console.log('No URI found in selected asset');
            Alert.alert('Error', 'Failed to get image URI');
          }
        } else {
          console.log('No assets in response');
          Alert.alert('Error', 'No image selected');
        }
      });
    } catch (error) {
      console.error('Error in handleImagePicker:', error);
      Alert.alert('Error', 'Failed to open image picker. Please try again.');
    }
  };

  // Upload image to API using the updated patientUpdateApi
  const uploadImageToAPI = async (imageFile) => {
    if (!patientId) {
      Alert.alert('Error', 'Patient ID not found. Please login again.');
      return;
    }

    try {
      setUploadingImage(true);
      console.log('Uploading profile image via patient update API...');
      
      // Prepare data for API with image file
      const apiData = {
        patient_id: patientId,
        name: name.trim(),
        phone: phoneNumber.trim(),
        email: email.trim(),
        gender: gender,
        dob: dob.trim(),
        blood_group: bloodGroup.trim(),
        address: address.trim(),
        profile_image: imageFile, // Pass complete file object
      };

      console.log('📝 Uploading profile data with image:', { ...apiData, profile_image: '[Image File Object]' });

      // Call the updated API that handles file uploads
      const result = await updatePatientProfile(apiData);
      
      if (result.success) {
        console.log('✅ Profile and image updated successfully via API');
        console.log('📝 API Response data:', result.data);
        
        // Update Redux store with patient data from API response
        const patientData = result.data.patient || result.data;
        const updatedPatientData = {
          ...patientData,
          id: patientData.id,
          patient_unique_id: patientData.patient_unique_id,
          name: patientData.name,
          phone_number: patientData.phone_number,
          email: patientData.email,
          gender: patientData.gender,
          dob: patientData.dob,
          age: patientData.age,
          blood_group: patientData.blood_group,
          address: patientData.address,
          profile_image: patientData.profile_image,
          status: patientData.status,
          created_at: patientData.created_at,
          updated_at: patientData.updated_at,
          lastUpdated: new Date().toISOString(),
        };
        
        dispatch(updatePatientData(updatedPatientData));
        console.log('✅ Redux store updated with complete API response data');
        
        Alert.alert('Success', 'Profile picture and data updated successfully!');
      } else {
        console.log('❌ Failed to upload profile image:', result.message);
        Alert.alert('Upload Failed', result.message || 'Failed to upload profile picture. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };



  const getProfileImage = () => {
    // If user selected a new image, use that
    if (profileImageUri) {
      return { uri: profileImageUri };
    }
    
    // If patient has a profile image from server, use that
    if (patientData?.profile_image) {
      const baseUrl = 'https://spiderdesk.asia/healto/';
      return { 
        uri: patientData.profile_image.startsWith('http') 
          ? patientData.profile_image 
          : `${baseUrl}${patientData.profile_image}`
      };
    }
    
    // Fallback to generated avatar
    return { 
      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=300&background=d4a574&color=fff&bold=true`
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1A83FF" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#1A83FF" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1A83FF', '#003784']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
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
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureContainer}>
          <TouchableOpacity 
            style={styles.profilePictureWrapper}
            onPress={handleImagePicker}
            disabled={!isEditing || uploadingImage}
          >
            <Image 
              source={getProfileImage()} 
              style={styles.profilePicture}
              resizeMode="cover"
            />
            {isEditing && (
              <View style={styles.editImageOverlay}>
                {uploadingImage ? (
                  <Icon name="spinner" size={20} color="#FFFFFF" />
                ) : (
                  <Icon name="camera" size={20} color="#FFFFFF" />
                )}
              </View>
            )}
          </TouchableOpacity>
          {isEditing && (
            <Text style={styles.editImageText}>Tap to change photo</Text>
          )}
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
                style={[styles.input, phoneError && styles.inputError]}
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                editable={isEditing}
                maxLength={10}
              />
              {phoneError ? (
                <Text style={styles.errorText}>{phoneError}</Text>
              ) : null}
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


          {/* Blood Group */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Blood Group</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Icon name="heartbeat" size={16} color="#0D6EFD" />
              </View>
              <TextInput
                style={[styles.input, !isEditing && styles.inputReadOnly]}
                value={bloodGroup}
                onChangeText={setBloodGroup}
                placeholder="Enter blood group (e.g., A+)"
                placeholderTextColor="#999"
                editable={isEditing}
                autoCapitalize="characters"
                maxLength={3}
              />
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Icon name="birthday-cake" size={16} color="#0D6EFD" />
              </View>
              <TextInput
                style={[styles.input, !isEditing && styles.inputReadOnly]}
                value={dob}
                onChangeText={setDob}
                placeholder="YYYY-MM-DD (e.g., 1990-01-15)"
                placeholderTextColor="#999"
                editable={isEditing}
                keyboardType="default"
                maxLength={10}
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Address</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Icon name="map-marker-alt" size={16} color="#0D6EFD" />
              </View>
              <TextInput
                style={[styles.input, !isEditing && styles.inputReadOnly]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                placeholderTextColor="#999"
                editable={isEditing}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
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
    position: 'relative',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: wp('14%'),
  },
  editImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: wp('14%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageText: {
    fontSize: wp('3.5%'),
    color: '#666',
    fontFamily: PoppinsFonts.Regular,
    marginTop: hp('1%'),
    textAlign: 'center',
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
  dobRawText: {
    fontSize: wp('2.8%'),
    color: '#999',
    fontFamily: PoppinsFonts.Regular,
    marginTop: wp('1%'),
    fontStyle: 'italic',
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
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 1,
  },
  errorText: {
    color: '#dc3545',
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Regular,
    marginTop: hp('0.5%'),
    marginLeft: wp('2%'),
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


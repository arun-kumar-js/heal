
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const Settings = ({ navigation }) => {
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('otpResponse');
              console.log('User logged out, cleared AsyncStorage');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Profile Information',
          icon: 'user',
          onPress: () => navigation.navigate('Profile'),
        },
      ],
    },
    {
      title: 'Appointments',
      items: [
        {
          id: 'history',
          title: 'Appointment History\'s',
          icon: 'calendar-alt',
          onPress: () => console.log('Appointment History'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help Centre',
          icon: 'headphones',
          onPress: () => console.log('Help Centre'),
        },
        {
          id: 'faq',
          title: 'FAQs',
          icon: 'question-circle',
          onPress: () => console.log('FAQs'),
        },
        {
          id: 'contact',
          title: 'Contact Support',
          icon: 'phone',
          onPress: () => console.log('Contact Support'),
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          id: 'terms',
          title: 'Terms & Condition',
          icon: 'file-alt',
          onPress: () => console.log('Terms & Condition'),
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          icon: 'shield-alt',
          onPress: () => console.log('Privacy Policy'),
        },
        {
          id: 'contact-legal',
          title: 'Contact Support',
          icon: 'phone',
          onPress: () => console.log('Contact Support'),
        },
      ],
    },
    {
      title: 'Logout',
      items: [
        {
          id: 'logout',
          title: 'Logout',
          icon: 'sign-out-alt',
          onPress: handleLogout,
        },
      ],
    },
  ];

  const renderSettingItem = (item, isLast = false) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingItem, !isLast && styles.settingItemBorder]}
      onPress={item.onPress}
    >
      <View style={styles.settingItemLeft}>
        <Icon 
          name={item.icon} 
          size={20} 
          color={item.id === 'logout' ? '#FF6B6B' : '#333333'} 
          style={styles.settingIcon} 
        />
        <Text style={[
          styles.settingText,
          item.id === 'logout' && styles.logoutText
        ]}>
          {item.title}
        </Text>
      </View>
      <Icon name="chevron-right" size={16} color="#8E8E93" />
    </TouchableOpacity>
  );

  const renderSection = (section) => (
    <View key={section.title} style={[
      styles.section,
      section.title === 'Logout' && styles.logoutSection
    ]}>
      <View style={[
        styles.sectionCard,
        section.title === 'Logout' && styles.logoutCard
      ]}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {section.items.map((item, index) => 
          renderSettingItem(item, index === section.items.length - 1)
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6EFD" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {settingsSections.map(renderSection)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#0D6EFD',
    paddingTop: hp('2%'),
    paddingBottom: hp('3%'),
    paddingHorizontal: wp('5%'),
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: wp('4%'),
    padding: wp('2%'),
  },
  headerTitle: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('25%'), // Increased padding to ensure logout button is completely visible above bottom tab
  },
  section: {
    marginBottom: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#333333',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: wp('4%'),
    width: wp('5%'),
    textAlign: 'center',
  },
  settingText: {
    fontSize: wp('4%'),
    color: '#333333',
    flex: 1,
  },
  logoutSection: {
    marginBottom: hp('20%'), // Extra margin for logout section to ensure visibility
  },
  logoutCard: {
    borderColor: '#FF6B6B', // Red border for logout card
    borderWidth: 1,
  },
  logoutText: {
    color: '#FF6B6B', // Red text color for logout
    fontWeight: 'bold',
  },
});

export default Settings;

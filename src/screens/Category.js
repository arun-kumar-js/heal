import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useDispatch } from 'react-redux';
import { setSelectedCategory } from '../store/slices/doctorsSlice';
import { PoppinsFonts } from '../config/fonts';
import { fetchHospitalsBySpecialization } from '../services/hospitalsBySpecializationApi';

const Category = ({ navigation }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      id: 1,
      name: 'Cardiology',
      image: require('../Assets/Images/heart.png'),
  
    },
    {
      id: 2,
      name: 'Neurology',
      image: require('../Assets/Images/brain.png'),

    },
    {
      id: 3,
      name: 'Orthopedics',
      image: require('../Assets/Images/bone.png'),
     
    },
    {
      id: 4,
      name: 'Pediatrics',
      image: require('../Assets/Images/baby.png'),
     
     
    },
    {
      id: 5,
      name: 'Gynecology',
      image: require('../Assets/Images/gyneric.png'),
    
    },
    {
      id: 6,
      name: 'Dermatology',
      image: require('../Assets/Images/Dermatology.png'),
    
    },
    {
      id: 7,
      name: 'Ophthalmology',
      image: require('../Assets/Images/Ophthalmology.png'),
     
    },
    {
      id: 8,
      name: 'ENT',
      image: require('../Assets/Images/ENT.png'),
    
    },
    {
      id: 9,
      name: 'Dentistry',
      image: require('../Assets/Images/Dentistry.png'),
      
    },
    {
      id: 10,
      name: 'Psychiatry',
      image: require('../Assets/Images/Psychiatry.png'),
    
    },
    {
      id: 11,
      name: 'Gastroenterology',
      image: require('../Assets/Images/Gastroenterology.png'),
    
    },
    {
      id: 12,
      name: 'Urology',
      image: require('../Assets/Images/Urology.png'),
    
    
    },
    {
      id: 13,
      name: 'Pulmonology',
      image: require('../Assets/Images/Pulmonology.png'),
  
    },
    {
      id: 14,
      name: 'Radiology',
      image: require('../Assets/Images/Radiology.png'),
     
    },
    {
      id: 15,
      name: '',
      image: null,
      isDummy: true,
    },
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryPress = async (category) => {
    try {
      // Set selected category in Redux
      dispatch(setSelectedCategory(category.name));
      
      // Show loading state
      console.log('🔍 CATEGORY DEBUG - Fetching hospitals for category:', category.name);
      console.log('🔍 CATEGORY DEBUG - Category object:', JSON.stringify(category, null, 2));
      
      // Make API call to get hospitals by specialization
      const result = await fetchHospitalsBySpecialization(category.name);
      
      console.log('🔍 CATEGORY DEBUG - API result:', JSON.stringify(result, null, 2));
      
      if (result.success && result.data) {
        console.log('✅ CATEGORY DEBUG - Hospitals fetched successfully:', result.data);
        console.log('✅ CATEGORY DEBUG - Data type:', typeof result.data);
        console.log('✅ CATEGORY DEBUG - Is array:', Array.isArray(result.data));
        console.log('✅ CATEGORY DEBUG - Data length:', result.data?.length);
        
        // Ensure data is an array
        const hospitalsData = Array.isArray(result.data) ? result.data : [];
        
        console.log('✅ CATEGORY DEBUG - Final hospitals data:', hospitalsData);
        console.log('✅ CATEGORY DEBUG - Navigating to HospitalListByCategoryScreen with:', {
          selectedCategory: category.name,
          hospitalsCount: hospitalsData.length
        });
        
        // Navigate to hospital list screen with the fetched data
        navigation.navigate('HospitalListByCategoryScreen', {
          selectedCategory: category.name,
          hospitals: hospitalsData
        });
      } else {
        console.error('❌ CATEGORY DEBUG - Failed to fetch hospitals:', result.error);
        console.error('❌ CATEGORY DEBUG - Result object:', JSON.stringify(result, null, 2));
        
        // Fallback to doctor list if hospital API fails
        console.log('🔄 CATEGORY DEBUG - Falling back to DoctorListScreen');
        navigation.navigate('DoctorListScreen');
      }
    } catch (error) {
      console.error('❌ CATEGORY DEBUG - Error in handleCategoryPress:', error);
      console.error('❌ CATEGORY DEBUG - Error stack:', error.stack);
      
      // Fallback to doctor list if there's an error
      console.log('🔄 CATEGORY DEBUG - Falling back to DoctorListScreen due to error');
      navigation.navigate('DoctorListScreen');
    }
  };

  const renderCategoryCard = (category) => {
    if (category.isDummy) {
      return <View key={category.id} style={styles.dummyCard} />;
    }
    
    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryCard, { backgroundColor: category.bgColor }]}
        onPress={() => handleCategoryPress(category)}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={category.image} 
            style={styles.categoryImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
      </TouchableOpacity>
    );
  };

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
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Lets Find Your Problem?</Text>
          <Text style={styles.headerSubtitle}>Select the Department</Text>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder="Search by Department"
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesGrid}>
          {filteredCategories.map(renderCategoryCard)}
        </View>
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
    paddingTop: hp('1%'),
    paddingBottom: hp('8%'),
    position: 'relative',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
  },
  backButton: {
    marginRight: wp('4%'),
    padding: wp('2%'),
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#FFFFFF',
    marginBottom: hp('0.5%'),
  },
  headerSubtitle: {
    fontSize: wp('4%'),
    color: '#FFFFFF',
    opacity: 0.9,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: wp('5%'),
    marginTop: hp('-7%'),
    marginBottom: hp('2%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.5%'),
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  searchIcon: {
    marginRight: wp('3%'),
  },
  searchInput: {
    flex: 1,
    fontSize: wp('4%'),
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('5%'),
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: hp('2%'),
  },
  categoryCard: {
    width: wp('28%'),
    aspectRatio: 1,
    borderRadius: wp('4%'),
    padding: wp('3%'),
    marginBottom: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  dummyCard: {
    width: wp('28%'),
    aspectRatio: 1,
    marginBottom: hp('2%'),
  },
  imageContainer: {
    width: wp('12%'),
    height: wp('12%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1%'),
  },
  categoryImage: {
    width: wp('20%'),
    height: wp('20%'),
    marginBottom: hp('3%'),
  },
  categoryName: {
    fontSize: wp('3.%'),
    fontFamily: PoppinsFonts.SemiBold,
    color: '#333333',
    textAlign: 'center',
    
  },
});

export default Category;

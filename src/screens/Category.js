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
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useDispatch } from 'react-redux';
import { setSelectedCategory } from '../store/slices/doctorsSlice';
import { PoppinsFonts } from '../config/fonts';

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

  const handleCategoryPress = (category) => {
    // Set selected category in Redux and navigate
    dispatch(setSelectedCategory(category.name));
    navigation.navigate('DoctorListScreen');
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
      <StatusBar barStyle="light-content" backgroundColor="#0D6EFD" />
      
  
      
      {/* Header */}
      <View style={styles.header}>
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
      </View>

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
    backgroundColor: '#0D6EFD',
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

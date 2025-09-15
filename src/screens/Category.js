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
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useDispatch } from 'react-redux';
import { setSelectedCategory } from '../store/slices/doctorsSlice';

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
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryPress = (category) => {
    // Set selected category in Redux and navigate
    dispatch(setSelectedCategory(category.name));
    navigation.navigate('DoctorListScreen');
  };

  const renderCategoryCard = (category) => (
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6EFD" />
      
      <BackButton onPress={() => navigation.goBack()} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Lets Find Your Problem?</Text>
          <Text style={styles.headerSubtitle}>Select the Department</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={16} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Department"
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0D6EFD',
    paddingTop: hp('2%'),
    paddingBottom: hp('3%'),
    paddingHorizontal: wp('5%'),
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginTop: hp('3%'), // Add top margin to account for back button
  },
  headerTitle: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: hp('0.5%'),
  },
  headerSubtitle: {
    fontSize: wp('3.5%'),
    color: '#FFFFFF',
    opacity: 0.9,
  },
  searchContainer: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
  },
  searchIcon: {
    marginRight: wp('3%'),
  },
  searchInput: {
    flex: 1,
    fontSize: wp('4%'),
    color: '#333333',
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
    fontSize: wp('3.2%'),
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    lineHeight: wp('4%'),
  },
});

export default Category;

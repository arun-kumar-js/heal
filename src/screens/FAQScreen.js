import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { PoppinsFonts } from '../config/fonts';
import { getFAQs } from '../services/faqApi';

const FAQScreen = ({ navigation }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching FAQs...');
      
      const result = await getFAQs();
      
      if (result.success) {
        console.log('✅ FAQs fetched successfully:', result.data);
        
        // Handle different response structures
        let faqData = result.data;
        
        // If data is an object with a faqs property
        if (faqData && typeof faqData === 'object' && !Array.isArray(faqData)) {
          if (faqData.faqs && Array.isArray(faqData.faqs)) {
            faqData = faqData.faqs;
          } else if (faqData.data && Array.isArray(faqData.data)) {
            faqData = faqData.data;
          } else {
            // Convert object to array if needed
            faqData = Object.values(faqData);
          }
        }
        
        // Ensure we have an array
        if (!Array.isArray(faqData)) {
          console.warn('⚠️ FAQ data is not an array:', faqData);
          faqData = [];
        }
        
        console.log('📋 Processed FAQ data:', faqData);
        setFaqs(faqData);
      } else {
        console.log('❌ Failed to fetch FAQs:', result.message);
        setFaqs([]);
      }
    } catch (error) {
      console.error('❌ Error fetching FAQs:', error);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFAQs();
    setRefreshing(false);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderFAQItem = (faq, index) => {
    const isExpanded = expandedId === (faq.id || index);
    
    return (
      <TouchableOpacity
        key={faq.id || index}
        style={styles.faqCard}
        onPress={() => toggleExpand(faq.id || index)}
        activeOpacity={0.7}
      >
        <View style={styles.faqHeader}>
          <View style={styles.questionContainer}>
            <Icon 
              name="question-circle" 
              size={20} 
              color="#0D6EFD" 
              style={styles.questionIcon}
            />
            <Text style={styles.questionText}>
              {faq.question || faq.title || 'Question'}
            </Text>
          </View>
          <Icon 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color="#666" 
          />
        </View>
        
        {isExpanded && (
          <View style={styles.answerContainer}>
            <Text style={styles.answerText}>
              {faq.answer || faq.description || 'No answer available'}
            </Text>
          </View>
        )}
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
        <Text style={styles.headerTitle}>FAQs</Text>
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D6EFD" />
          <Text style={styles.loadingText}>Loading FAQs...</Text>
        </View>
      ) : faqs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="question-circle" size={60} color="#CCC" />
          <Text style={styles.emptyText}>No FAQs available</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchFAQs}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0D6EFD']}
              tintColor="#0D6EFD"
            />
          }
        >
          <View style={styles.infoCard}>
            <Icon name="info-circle" size={20} color="#0D6EFD" />
            <Text style={styles.infoText}>
              Tap on any question to view the answer
            </Text>
          </View>

          {Array.isArray(faqs) && faqs.length > 0 ? (
            faqs.map((faq, index) => renderFAQItem(faq, index))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="question-circle" size={60} color="#CCC" />
              <Text style={styles.emptyText}>No FAQs available</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
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
    fontFamily: PoppinsFonts.Bold,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('5%'),
  },
  scrollContent: {
    paddingTop: hp('2%'),
    paddingBottom: hp('3%'),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Regular,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('10%'),
  },
  emptyText: {
    marginTop: hp('2%'),
    fontSize: wp('4.5%'),
    fontFamily: PoppinsFonts.Medium,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: hp('2%'),
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('1.5%'),
    backgroundColor: '#0D6EFD',
    borderRadius: wp('2%'),
  },
  retryButtonText: {
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Medium,
    color: '#FFFFFF',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F3FF',
    padding: wp('4%'),
    borderRadius: wp('2%'),
    marginBottom: hp('2%'),
  },
  infoText: {
    flex: 1,
    marginLeft: wp('3%'),
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Regular,
    color: '#0D6EFD',
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  questionIcon: {
    marginRight: wp('3%'),
  },
  questionText: {
    flex: 1,
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.SemiBold,
    color: '#333',
  },
  answerContainer: {
    marginTop: hp('1.5%'),
    paddingTop: hp('1.5%'),
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  answerText: {
    fontSize: wp('3.8%'),
    fontFamily: PoppinsFonts.Regular,
    color: '#666',
    lineHeight: wp('5.5%'),
  },
});

export default FAQScreen;


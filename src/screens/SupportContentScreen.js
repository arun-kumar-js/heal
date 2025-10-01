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
  Linking,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { PoppinsFonts } from '../config/fonts';
import RenderHtml from 'react-native-render-html';

// HTML rendering styles
const htmlTagsStyles = {
  body: {
    fontSize: wp('3.8%'),
    fontFamily: PoppinsFonts.Regular,
    color: '#333',
    lineHeight: wp('6%'),
  },
  p: {
    marginBottom: hp('1%'),
    fontSize: wp('3.8%'),
    color: '#333',
  },
  h1: {
    fontSize: wp('5.5%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#333',
    marginBottom: hp('1%'),
  },
  h2: {
    fontSize: wp('5%'),
    fontFamily: PoppinsFonts.Bold,
    color: '#333',
    marginBottom: hp('0.8%'),
  },
  h3: {
    fontSize: wp('4.5%'),
    fontFamily: PoppinsFonts.SemiBold,
    color: '#333',
    marginBottom: hp('0.8%'),
  },
  h4: {
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.SemiBold,
    color: '#333',
    marginBottom: hp('0.5%'),
  },
  ul: {
    marginLeft: wp('4%'),
    marginBottom: hp('1%'),
  },
  ol: {
    marginLeft: wp('4%'),
    marginBottom: hp('1%'),
  },
  li: {
    marginBottom: hp('0.5%'),
    fontSize: wp('3.8%'),
    color: '#333',
  },
  a: {
    color: '#0D6EFD',
    textDecorationLine: 'underline',
  },
  strong: {
    fontFamily: PoppinsFonts.Bold,
  },
  b: {
    fontFamily: PoppinsFonts.Bold,
  },
  em: {
    fontStyle: 'italic',
  },
  i: {
    fontStyle: 'italic',
  },
};

const SupportContentScreen = ({ navigation, route }) => {
  const { title, apiFunction, type } = route.params;
  const { width } = useWindowDimensions();
  
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      console.log(`📋 Fetching ${title}...`);
      
      const result = await apiFunction();
      
      if (result.success) {
        console.log(`✅ ${title} fetched successfully:`, result.data);
        setContent(result.data);
      } else {
        console.log(`❌ Failed to fetch ${title}:`, result.message);
        setContent(null);
      }
    } catch (error) {
      console.error(`❌ Error fetching ${title}:`, error);
      setContent(null);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContent();
    setRefreshing(false);
  };

  const handlePhonePress = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmailPress = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const renderContent = () => {
    if (!content) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="exclamation-circle" size={60} color="#CCC" />
          <Text style={styles.emptyText}>No content available</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchContent}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // For Contact Support screen
    if (type === 'contact') {
      return (
        <View style={styles.contactContainer}>
          {content.email && (
            <TouchableOpacity 
              style={styles.contactCard}
              onPress={() => handleEmailPress(content.email)}
            >
              <View style={styles.contactIconContainer}>
                <Icon name="envelope" size={24} color="#0D6EFD" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{content.email}</Text>
              </View>
              <Icon name="chevron-right" size={16} color="#999" />
            </TouchableOpacity>
          )}

          {content.phone && (
            <TouchableOpacity 
              style={styles.contactCard}
              onPress={() => handlePhonePress(content.phone)}
            >
              <View style={styles.contactIconContainer}>
                <Icon name="phone" size={24} color="#0D6EFD" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{content.phone}</Text>
              </View>
              <Icon name="chevron-right" size={16} color="#999" />
            </TouchableOpacity>
          )}

          {content.address && (
            <View style={styles.contactCard}>
              <View style={styles.contactIconContainer}>
                <Icon name="map-marker-alt" size={24} color="#0D6EFD" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue}>{content.address}</Text>
              </View>
            </View>
          )}

          {content.hours && (
            <View style={styles.contactCard}>
              <View style={styles.contactIconContainer}>
                <Icon name="clock" size={24} color="#0D6EFD" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Business Hours</Text>
                <Text style={styles.contactValue}>{content.hours}</Text>
              </View>
            </View>
          )}
        </View>
      );
    }

    // For Help Centre screen
    if (type === 'help' && Array.isArray(content)) {
      return (
        <View>
          {content.map((item, index) => {
            const htmlContent = item.description || item.answer || item.content || '';
            const isHtml = htmlContent.includes('<') && htmlContent.includes('>');
            
            return (
              <View key={index} style={styles.helpCard}>
                <View style={styles.helpHeader}>
                  <Icon name="question-circle" size={20} color="#0D6EFD" />
                  <Text style={styles.helpTitle}>{item.title || item.question}</Text>
                </View>
                {isHtml ? (
                  <RenderHtml
                    contentWidth={width - wp('18%')}
                    source={{ html: htmlContent }}
                    tagsStyles={htmlTagsStyles}
                  />
                ) : (
                  <Text style={styles.helpDescription}>{htmlContent}</Text>
                )}
              </View>
            );
          })}
        </View>
      );
    }

    // For Terms & Privacy screens
    const htmlContent = content.content || content.text || content.description || JSON.stringify(content, null, 2);
    const isHtml = htmlContent.includes('<') && htmlContent.includes('>');

    return (
      <View style={styles.contentCard}>
        {isHtml ? (
          <RenderHtml
            contentWidth={width - wp('10%')}
            source={{ html: htmlContent }}
            tagsStyles={htmlTagsStyles}
          />
        ) : (
          <Text style={styles.contentText}>{htmlContent}</Text>
        )}
      </View>
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
        <Text style={styles.headerTitle}>{title}</Text>
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D6EFD" />
          <Text style={styles.loadingText}>Loading {title}...</Text>
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
          {renderContent()}
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
    marginTop: hp('10%'),
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
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    padding: wp('5%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentText: {
    fontSize: wp('3.8%'),
    fontFamily: PoppinsFonts.Regular,
    color: '#333',
    lineHeight: wp('6%'),
  },
  helpCard: {
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
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  helpTitle: {
    flex: 1,
    marginLeft: wp('3%'),
    fontSize: wp('4.2%'),
    fontFamily: PoppinsFonts.SemiBold,
    color: '#333',
  },
  helpDescription: {
    fontSize: wp('3.8%'),
    fontFamily: PoppinsFonts.Regular,
    color: '#666',
    lineHeight: wp('5.5%'),
  },
  contactContainer: {
    paddingBottom: hp('2%'),
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  contactIconContainer: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: '#E7F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: wp('3.5%'),
    fontFamily: PoppinsFonts.Regular,
    color: '#999',
    marginBottom: hp('0.3%'),
  },
  contactValue: {
    fontSize: wp('4%'),
    fontFamily: PoppinsFonts.Medium,
    color: '#333',
  },
});

export default SupportContentScreen;


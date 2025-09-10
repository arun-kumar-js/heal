import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PoppinsFonts, FontStyles } from '../config/fonts';

const FontTest = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Poppins Font Test</Text>
      
      {/* Regular Weights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Regular Weights</Text>
        <Text style={[styles.text, { fontFamily: PoppinsFonts.Thin }]}>Thin - The quick brown fox</Text>
        <Text style={[styles.text, { fontFamily: PoppinsFonts.ExtraLight }]}>ExtraLight - The quick brown fox</Text>
        <Text style={[styles.text, { fontFamily: PoppinsFonts.Light }]}>Light - The quick brown fox</Text>
        <Text style={[styles.text, { fontFamily: PoppinsFonts.Regular }]}>Regular - The quick brown fox</Text>
        <Text style={[styles.text, { fontFamily: PoppinsFonts.Medium }]}>Medium - The quick brown fox</Text>
        <Text style={[styles.text, { fontFamily: PoppinsFonts.SemiBold }]}>SemiBold - The quick brown fox</Text>
        <Text style={[styles.text, { fontFamily: PoppinsFonts.Bold }]}>Bold - The quick brown fox</Text>
        <Text style={[styles.text, { fontFamily: PoppinsFonts.ExtraBold }]}>ExtraBold - The quick brown fox</Text>
        <Text style={[styles.text, { fontFamily: PoppinsFonts.Black }]}>Black - The quick brown fox</Text>
      </View>

      {/* Italic Weights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Italic Weights</Text>
        <Text style={[styles.text, { fontFamily: PoppinsFonts.ThinItalic }]}>Thin Italic - The quick brown fox</Text>
        <Text style={[styles.text, { fontFamily: PoppinsFonts.LightItalic }]}>Light Italic - The quick brown fox</Text>
        <Text style={[styles.text, { fontFamily: PoppinsFonts.Italic }]}>Regular Italic - The quick brown fox</Text>
        <Text style={[styles.text, { fontFamily: PoppinsFonts.MediumItalic }]}>Medium Italic - The quick brown fox</Text>
        <Text style={[styles.text, { fontFamily: PoppinsFonts.BoldItalic }]}>Bold Italic - The quick brown fox</Text>
      </View>

      {/* Predefined Styles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Predefined Styles</Text>
        <Text style={FontStyles.h1}>H1 Heading</Text>
        <Text style={FontStyles.h2}>H2 Heading</Text>
        <Text style={FontStyles.h3}>H3 Heading</Text>
        <Text style={FontStyles.body}>Body text with regular weight</Text>
        <Text style={FontStyles.label}>Label text with medium weight</Text>
        <Text style={FontStyles.caption}>Caption text with regular weight</Text>
        <Text style={FontStyles.button}>Button text with semi-bold weight</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontFamily: PoppinsFonts.Bold,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: PoppinsFonts.SemiBold,
    marginBottom: 10,
    color: '#666',
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
});

export default FontTest;

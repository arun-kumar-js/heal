import { Platform } from 'react-native';

// Poppins Font Family Mapping
export const PoppinsFonts = {
  // Regular weights
  Thin: Platform.OS === 'ios' ? 'Poppins-Thin' : 'Poppins-Thin',
  ExtraLight: Platform.OS === 'ios' ? 'Poppins-ExtraLight' : 'Poppins-ExtraLight',
  Light: Platform.OS === 'ios' ? 'Poppins-Light' : 'Poppins-Light',
  Regular: Platform.OS === 'ios' ? 'Poppins-Regular' : 'Poppins-Regular',
  Medium: Platform.OS === 'ios' ? 'Poppins-Medium' : 'Poppins-Medium',
  SemiBold: Platform.OS === 'ios' ? 'Poppins-SemiBold' : 'Poppins-SemiBold',
  Bold: Platform.OS === 'ios' ? 'Poppins-Bold' : 'Poppins-Bold',
  ExtraBold: Platform.OS === 'ios' ? 'Poppins-ExtraBold' : 'Poppins-ExtraBold',
  Black: Platform.OS === 'ios' ? 'Poppins-Black' : 'Poppins-Black',
  
  // Italic weights
  ThinItalic: Platform.OS === 'ios' ? 'Poppins-ThinItalic' : 'Poppins-ThinItalic',
  ExtraLightItalic: Platform.OS === 'ios' ? 'Poppins-ExtraLightItalic' : 'Poppins-ExtraLightItalic',
  LightItalic: Platform.OS === 'ios' ? 'Poppins-LightItalic' : 'Poppins-LightItalic',
  Italic: Platform.OS === 'ios' ? 'Poppins-Italic' : 'Poppins-Italic',
  MediumItalic: Platform.OS === 'ios' ? 'Poppins-MediumItalic' : 'Poppins-MediumItalic',
  SemiBoldItalic: Platform.OS === 'ios' ? 'Poppins-SemiBoldItalic' : 'Poppins-SemiBoldItalic',
  BoldItalic: Platform.OS === 'ios' ? 'Poppins-BoldItalic' : 'Poppins-BoldItalic',
  ExtraBoldItalic: Platform.OS === 'ios' ? 'Poppins-ExtraBoldItalic' : 'Poppins-ExtraBoldItalic',
  BlackItalic: Platform.OS === 'ios' ? 'Poppins-BlackItalic' : 'Poppins-BlackItalic',
};

// Common font styles for easy usage
export const FontStyles = {
  // Headers
  h1: {
    fontFamily: PoppinsFonts.Bold,
    fontSize: 32,
  },
  h2: {
    fontFamily: PoppinsFonts.Bold,
    fontSize: 28,
  },
  h3: {
    fontFamily: PoppinsFonts.SemiBold,
    fontSize: 24,
  },
  h4: {
    fontFamily: PoppinsFonts.SemiBold,
    fontSize: 20,
  },
  h5: {
    fontFamily: PoppinsFonts.Medium,
    fontSize: 18,
  },
  h6: {
    fontFamily: PoppinsFonts.Medium,
    fontSize: 16,
  },
  
  // Body text
  body: {
    fontFamily: PoppinsFonts.Regular,
    fontSize: 16,
  },
  bodySmall: {
    fontFamily: PoppinsFonts.Regular,
    fontSize: 14,
  },
  bodyLarge: {
    fontFamily: PoppinsFonts.Regular,
    fontSize: 18,
  },
  
  // Labels and captions
  label: {
    fontFamily: PoppinsFonts.Medium,
    fontSize: 14,
  },
  caption: {
    fontFamily: PoppinsFonts.Regular,
    fontSize: 12,
  },
  
  // Buttons
  button: {
    fontFamily: PoppinsFonts.SemiBold,
    fontSize: 16,
  },
  buttonSmall: {
    fontFamily: PoppinsFonts.Medium,
    fontSize: 14,
  },
  buttonLarge: {
    fontFamily: PoppinsFonts.Bold,
    fontSize: 18,
  },
};

// Helper function to get font family by weight
export const getPoppinsFont = (weight = 'Regular', italic = false) => {
  const weightKey = weight + (italic ? 'Italic' : '');
  return PoppinsFonts[weightKey] || PoppinsFonts.Regular;
};

// Helper function to create text style with Poppins font
export const createTextStyle = (fontWeight = 'Regular', fontSize = 16, color = '#000', italic = false) => ({
  fontFamily: getPoppinsFont(fontWeight, italic),
  fontSize,
  color,
});

export default PoppinsFonts;

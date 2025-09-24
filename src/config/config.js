export const BASE_URL = 'https://spiderdesk.asia/healto/api/';
export const USERNAME = 'admin';
export const PASSWORD = 'vamilenterprise2025!@#';
export const basicAuth = 'Basic ' + btoa(USERNAME + ':' + PASSWORD);
export const LOGIN_URL = BASE_URL + 'patient/send-otp';
export const OTP_URL = BASE_URL + 'patient/verify-otp';
export const DOCTORS_URL = BASE_URL + 'topdoctors';
export const DOCTORS_BY_SPECIALIZATION_CLINIC_URL = BASE_URL + 'doctors/by/specializationclinic';
export const APPOINTMENT_FETCH_URL = BASE_URL + 'appointmentFetch';
export const STORE_USER_DETAIL_URL = BASE_URL + 'storeUserDetail';
export const CLINICS_BY_DOCTORS_URL = BASE_URL + 'clinics/by/doctors';
export const CATEGORIES_URL = BASE_URL + 'categories';
export const HOSPITALS_BY_SPECIALIZATION_URL = BASE_URL + 'specialization/by/clinic';
export const PATIENT_UPDATE_URL = BASE_URL + 'patient-update';
export const PAYMENT_UPDATE_URL = BASE_URL + 'payment-update';
export const DOCTOR_DETAILS_URL = BASE_URL + 'doctorDetails';

// Google Maps API Keys
export const GOOGLE_MAPS_ANDROID_API_KEY = 'AIzaSyAXoi7Byq8PhEN2TusAaNRnnMBnOHzopJQ';
export const GOOGLE_MAPS_IOS_API_KEY = 'AIzaSyDhaELwftxhvXCSBZPdkOjHN_F3guOVDic';

// Firebase Configuration
export const FIREBASE_PROJECT_ID = 'com-healto';
export const FIREBASE_PROJECT_NUMBER = '389888340904';
export const FIREBASE_STORAGE_BUCKET = 'com-healto.firebasestorage.app';
export const FIREBASE_BUNDLE_ID = 'com.spiderindia.healto';

// Android Firebase
export const FIREBASE_ANDROID_API_KEY = 'AIzaSyDmQQfkf_feP4qTchknEeLbzPqVw7j8pVw';
export const FIREBASE_ANDROID_APP_ID = '1:389888340904:android:6420ad2ff84a80f12ca39d';

// iOS Firebase
export const FIREBASE_IOS_API_KEY = 'AIzaSyDMDIdwQk5vTEUEsjpC2qGdif4PcYZpmKI';
export const FIREBASE_IOS_APP_ID = '1:389888340904:ios:a262af11d87d9b9a2ca39d';
export const FIREBASE_GCM_SENDER_ID = '389888340904';

import { configureStore } from '@reduxjs/toolkit';
import doctorsReducer from './slices/doctorsSlice';
import categoriesReducer from './slices/categoriesSlice';
import appointmentDetailsReducer from './slices/appointmentDetailsSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    doctors: doctorsReducer,
    categories: categoriesReducer,
    appointmentDetails: appointmentDetailsReducer,
    user: userReducer,
  },
});

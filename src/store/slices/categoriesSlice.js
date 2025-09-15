import { createSlice } from '@reduxjs/toolkit';

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [
      { id: 1, name: 'Cardiology', icon: 'heart', color: '#FF6B6B' },
      { id: 2, name: 'Neurology', icon: 'brain', color: '#4ECDC4' },
      { id: 3, name: 'Orthopedics', icon: 'bone', color: '#45B7D1' },
      { id: 4, name: 'Pediatrics', icon: 'baby', color: '#96CEB4' },
      { id: 5, name: 'Gynecology', icon: 'female', color: '#FFEAA7' },
      { id: 6, name: 'Dermatology', icon: 'hand-holding-medical', color: '#DDA0DD' },
      { id: 7, name: 'Ophthalmology', icon: 'eye', color: '#98D8C8' },
      { id: 8, name: 'ENT', icon: 'ear', color: '#F7DC6F' },
      { id: 9, name: 'Psychiatry', icon: 'brain', color: '#BB8FCE' },
      { id: 10, name: 'General Medicine', icon: 'stethoscope', color: '#85C1E9' },
    ],
  },
  reducers: {
    // Add any category-related actions here if needed
  },
});

export default categoriesSlice.reducer;

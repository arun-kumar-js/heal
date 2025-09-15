import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { DOCTORS_URL, basicAuth } from '../../config/config';

// Async thunk for fetching doctors
export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching doctors from Redux slice...');
      console.log('API URL:', DOCTORS_URL);
      
      const response = await axios.get(DOCTORS_URL, {
        headers: {
          'Authorization': basicAuth,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Doctors fetched successfully:', response.data);
      // The API returns { message: "...", doctors: [...] }
      return response.data.doctors || response.data;
    } catch (error) {
      console.error('Error fetching doctors in Redux slice:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState: {
    doctors: [],
    loading: false,
    error: null,
    selectedCategory: null,
    searchQuery: '',
  },
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearFilters: (state) => {
      state.selectedCategory = null;
      state.searchQuery = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
        state.error = null;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : action.payload?.message || 'Failed to fetch doctors';
      });
  },
});

export const { setSelectedCategory, setSearchQuery, clearFilters } = doctorsSlice.actions;
export default doctorsSlice.reducer;

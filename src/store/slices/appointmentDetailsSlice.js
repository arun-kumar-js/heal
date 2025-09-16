import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { storeUserDetail } from '../../services/bookingApi';

// Async thunk for booking appointment
export const bookAppointment = createAsyncThunk(
  'appointmentDetails/bookAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      console.log('Booking appointment from Redux slice...');
      console.log('Appointment data:', appointmentData);
      
      const result = await storeUserDetail(appointmentData);
      
      if (result.success) {
        console.log('Appointment booked successfully:', result.data);
        return result.data;
      } else {
        console.error('Booking failed:', result.message);
        return rejectWithValue(result.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment in Redux slice:', error);
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

const appointmentDetailsSlice = createSlice({
  name: 'appointmentDetails',
  initialState: {
    // Current appointment being booked
    currentAppointment: null,
    
    // Form data for current booking
    formData: {
      doctor: null,
      selectedDate: null,
      selectedTime: null,
      selectedTimeSlot: null,
      reason: '',
      personalInfo: {
        fullName: '',
        mobileNumber: '',
        email: ''
      },
      amount: null,
      token: null
    },
    
    // Booking status
    isBooking: false,
    bookingError: null,
    
    // Successfully booked appointments
    bookedAppointments: [],
    
    // Last booking result
    lastBookingResult: null
  },
  reducers: {
    // Set form data for current booking
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
      console.log('📝 APPOINTMENT SLICE - Form data updated:', state.formData);
    },
    
    // Set doctor information
    setDoctor: (state, action) => {
      state.formData.doctor = action.payload;
      console.log('👨‍⚕️ APPOINTMENT SLICE - Doctor set:', action.payload);
    },
    
    // Set date and time
    setDateTime: (state, action) => {
      const { selectedDate, selectedTime, selectedTimeSlot } = action.payload;
      
      // Convert date format if needed
      let formattedDate = selectedDate;
      if (selectedDate && typeof selectedDate === 'string' && (selectedDate.includes('Wed') || selectedDate.includes('Mon') || 
          selectedDate.includes('Tue') || selectedDate.includes('Thu') || selectedDate.includes('Fri') || 
          selectedDate.includes('Sat') || selectedDate.includes('Sun'))) {
        // Handle short format like 'Wed 17'
        const dayMatch = selectedDate.match(/\d+/);
        if (dayMatch) {
          const day = parseInt(dayMatch[0]);
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth();
          
          console.log('📅 APPOINTMENT SLICE - Converting:', selectedDate);
          console.log('📅 APPOINTMENT SLICE - Extracted day:', day);
          console.log('📅 APPOINTMENT SLICE - Current date:', currentDate.toISOString());
          console.log('📅 APPOINTMENT SLICE - Current year:', currentYear);
          console.log('📅 APPOINTMENT SLICE - Current month (0-indexed):', currentMonth);
          console.log('📅 APPOINTMENT SLICE - Current month (1-indexed):', currentMonth + 1);
          
          const targetDate = new Date(currentYear, currentMonth, day);
          console.log('📅 APPOINTMENT SLICE - Target date created:', targetDate.toISOString());
          console.log('📅 APPOINTMENT SLICE - Target date day:', targetDate.getDate());
          
          const normalizedTarget = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
          const normalizedCurrent = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
          if (normalizedTarget < normalizedCurrent) {
            console.log('📅 APPOINTMENT SLICE - Day has passed, using next month');
            const nextMonth = currentMonth + 1;
            const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear;
            const actualNextMonth = nextMonth > 11 ? 0 : nextMonth;
            
            // Create a new date object to avoid issues with setMonth
            const newTargetDate = new Date(nextYear, actualNextMonth, day);
            targetDate.setTime(newTargetDate.getTime());
            
            console.log('📅 APPOINTMENT SLICE - After month change:', targetDate.toISOString());
            console.log('📅 APPOINTMENT SLICE - Day after month change:', targetDate.getDate());
          }
          
          // Use manual formatting to avoid timezone issues
          const year = targetDate.getFullYear();
          const month = String(targetDate.getMonth() + 1).padStart(2, '0');
          const dayStr = String(targetDate.getDate() + 1).padStart(2, '0'); // Add +1 to the day
          formattedDate = `${year}-${month}-${dayStr}`;
          
          console.log('📅 APPOINTMENT SLICE - Final year:', year);
          console.log('📅 APPOINTMENT SLICE - Final month (1-indexed):', targetDate.getMonth() + 1);
          console.log('📅 APPOINTMENT SLICE - Final day:', targetDate.getDate());
          console.log('📅 APPOINTMENT SLICE - Converted date from', selectedDate, 'to', formattedDate);
          console.log(`📅 DATE CONVERTER - Converted ${selectedDate} to ${formattedDate}`);
        }
      }
      
      state.formData.selectedDate = formattedDate;
      state.formData.selectedTime = selectedTime;
      state.formData.selectedTimeSlot = selectedTimeSlot;
      
      // Set amount from selectedTimeSlot - handle different data structures
      let timeSlotAmount = null;
      console.log('💰 APPOINTMENT SLICE - Checking selectedTimeSlot for amount:', selectedTimeSlot);
      
      if (selectedTimeSlot) {
        // Check for amount in different possible fields
        timeSlotAmount = selectedTimeSlot.amount || 
                        selectedTimeSlot.price || 
                        selectedTimeSlot.fee || 
                        selectedTimeSlot.cost;
        
        console.log('💰 APPOINTMENT SLICE - Initial timeSlotAmount check:', timeSlotAmount);
        
        // If no amount found, try to extract from other fields
        if (!timeSlotAmount) {
          // Check if there's a price field or similar
          const possibleAmountFields = ['amount', 'price', 'fee', 'cost', 'charge'];
          for (const field of possibleAmountFields) {
            if (selectedTimeSlot[field]) {
              timeSlotAmount = selectedTimeSlot[field];
              console.log('💰 APPOINTMENT SLICE - Found amount in field:', field, 'value:', timeSlotAmount);
              break;
            }
          }
        }
      }
      
      console.log('💰 APPOINTMENT SLICE - Final timeSlotAmount:', timeSlotAmount);
      
      if (timeSlotAmount) {
        state.formData.amount = timeSlotAmount;
        console.log('💰 APPOINTMENT SLICE - Amount set from timeSlot:', timeSlotAmount);
      } else {
        // Set default amount if no amount found in time slot
        const defaultAmount = 500; // Default consultation fee
        state.formData.amount = defaultAmount;
        console.log('⚠️ APPOINTMENT SLICE - No amount found in selectedTimeSlot:', selectedTimeSlot);
        console.log('💰 APPOINTMENT SLICE - Setting default amount:', defaultAmount);
      }
      
      // Ensure amount is always set, even if no time slot amount was found
      if (!state.formData.amount) {
        const defaultAmount = 500; // Default consultation fee
        state.formData.amount = defaultAmount;
        console.log('💰 APPOINTMENT SLICE - Fallback: Setting default amount:', defaultAmount);
      }
      
      console.log('📅 APPOINTMENT SLICE - Date/Time set:', {
        selectedDate: formattedDate,
        selectedTime,
        selectedTimeSlot,
        amount: timeSlotAmount,
        finalAmount: state.formData.amount
      });
    },
    
    // Set personal information
    setPersonalInfo: (state, action) => {
      state.formData.personalInfo = { ...state.formData.personalInfo, ...action.payload };
      console.log('👤 APPOINTMENT SLICE - Personal info set:', state.formData.personalInfo);
    },
    
    // Set reason for visit
    setReason: (state, action) => {
      state.formData.reason = action.payload;
      console.log('📝 APPOINTMENT SLICE - Reason set:', action.payload);
    },
    
    // Set amount
    setAmount: (state, action) => {
      state.formData.amount = action.payload;
      console.log('💰 APPOINTMENT SLICE - Amount set:', action.payload);
    },
    
    // Set token
    setToken: (state, action) => {
      state.formData.token = action.payload;
      console.log('🎫 APPOINTMENT SLICE - Token set:', action.payload);
    },
    
    // Clear current form data
    clearFormData: (state) => {
      state.formData = {
        doctor: null,
        selectedDate: null,
        selectedTime: null,
        selectedTimeSlot: null,
        reason: '',
        personalInfo: {
          fullName: '',
          mobileNumber: '',
          email: ''
        },
        amount: null,
        token: null
      };
      state.currentAppointment = null;
      state.bookingError = null;
      console.log('🗑️ APPOINTMENT SLICE - Form data cleared');
    },
    
    // Clear booking error
    clearBookingError: (state) => {
      state.bookingError = null;
    },
    
    // Add appointment to booked appointments list
    addBookedAppointment: (state, action) => {
      state.bookedAppointments.push(action.payload);
      console.log('✅ APPOINTMENT SLICE - Appointment added to booked list:', action.payload);
    },
    
    // Clear all booked appointments
    clearBookedAppointments: (state) => {
      state.bookedAppointments = [];
    },
    
    // Set current appointment
    setCurrentAppointment: (state, action) => {
      state.currentAppointment = action.payload;
      console.log('📋 APPOINTMENT SLICE - Current appointment set:', action.payload);
    },
    
    // Manually set amount if not found in time slot
    setManualAmount: (state, action) => {
      state.formData.amount = action.payload;
      console.log('💰 APPOINTMENT SLICE - Manual amount set:', action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(bookAppointment.pending, (state) => {
        state.isBooking = true;
        state.bookingError = null;
        console.log('⏳ APPOINTMENT SLICE - Booking started...');
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.isBooking = false;
        state.currentAppointment = action.payload;
        state.lastBookingResult = {
          success: true,
          data: action.payload,
          timestamp: new Date().toISOString()
        };
        state.bookingError = null;
        
        // Add to booked appointments list
        const bookedAppointment = {
          ...action.payload,
          formData: state.formData,
          bookedAt: new Date().toISOString()
        };
        state.bookedAppointments.push(bookedAppointment);
        
        console.log('✅ APPOINTMENT SLICE - Booking successful!');
        console.log('📋 APPOINTMENT SLICE - Current appointment:', action.payload);
        console.log('📝 APPOINTMENT SLICE - Form data saved:', state.formData);
        console.log('📚 APPOINTMENT SLICE - All booked appointments:', state.bookedAppointments);
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.isBooking = false;
        state.bookingError = action.payload;
        state.lastBookingResult = {
          success: false,
          error: action.payload,
          timestamp: new Date().toISOString()
        };
        console.log('❌ APPOINTMENT SLICE - Booking failed:', action.payload);
      });
  },
});

export const {
  setFormData,
  setDoctor,
  setDateTime,
  setPersonalInfo,
  setReason,
  setAmount,
  setToken,
  clearFormData,
  clearBookingError,
  addBookedAppointment,
  clearBookedAppointments,
  setCurrentAppointment,
  setManualAmount
} = appointmentDetailsSlice.actions;

export default appointmentDetailsSlice.reducer;

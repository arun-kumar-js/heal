import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectDoctors = (state) => state.doctors.doctors;
export const selectDoctorsLoading = (state) => state.doctors.loading;
export const selectDoctorsError = (state) => state.doctors.error;
export const selectSelectedCategory = (state) => state.doctors.selectedCategory;
export const selectSearchQuery = (state) => state.doctors.searchQuery;

// Memoized selectors
export const selectFilteredDoctors = createSelector(
  [selectDoctors, selectSelectedCategory, selectSearchQuery],
  (doctors, selectedCategory, searchQuery) => {
    // Ensure doctors is an array
    if (!doctors || !Array.isArray(doctors)) {
      return [];
    }
    
    let filtered = doctors;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.qualification.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected category
    if (selectedCategory) {
      filtered = filtered.filter(doctor => {
        const doctorSpecialty = getDoctorSpecialty(doctor);
        const normalizedSpecialty = doctorSpecialty.toLowerCase().trim();
        const normalizedCategory = selectedCategory.toLowerCase().trim();
        
        // Multiple comparison methods for better matching
        const exactMatch = normalizedSpecialty === normalizedCategory;
        const containsMatch = normalizedSpecialty.includes(normalizedCategory) || 
                            normalizedCategory.includes(normalizedSpecialty);
        
        return exactMatch || containsMatch;
      });
    }

    return filtered;
  }
);

// Helper function to get doctor specialty
const getDoctorSpecialty = (doctor) => {
  // First try to get specialization name from nested specialization object
  if (doctor.specialization && doctor.specialization.name) {
    return doctor.specialization.name.trim();
  }
  
  // Map specialization_id to actual specialty names as fallback
  const specialtyMap = {
    1: 'Cardiology',
    2: 'Orthopedics', 
    3: 'Pediatrics',
    4: 'Dermatology',
    5: 'Neurology',
    6: 'Neurology',
    7: 'Gynecology',
    8: 'Ophthalmology',
    9: 'ENT',
    10: 'Psychiatry'
  };
  
  // Use specialization_id if available, otherwise fallback to type
  if (doctor.specialization_id) {
    return specialtyMap[doctor.specialization_id] || 'General Medicine';
  }
  
  // Fallback to type-based mapping
  const typeMap = {
    'hospital': 'Cardiology',
    'clinic': 'General Medicine',
    'multispeciality': 'Multi Specialty'
  };
  
  return typeMap[doctor.type] || 'General Medicine';
};

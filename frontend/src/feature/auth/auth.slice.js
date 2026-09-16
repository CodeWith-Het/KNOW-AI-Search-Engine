import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    // ===============================
    // SET USER
    // ===============================
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    },

    // ===============================
    // CLEAR USER
    // ===============================
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },

    // ===============================
    // SET LOADING
    // ===============================
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // ===============================
    // SET ERROR
    // ===============================
    setError: (state, action) => {
      state.error = action.payload;
    },

    // ===============================
    // CLEAR ERROR
    // ===============================
    clearError: (state) => {
      state.error = null;
    },

    // ===============================
    // RESET AUTH
    // ===============================
    resetAuth: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
    },
  },
});

export const {
  setUser,
  clearUser,
  setLoading,
  setError,
  clearError,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;

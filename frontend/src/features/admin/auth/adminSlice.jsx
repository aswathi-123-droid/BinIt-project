import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../../api/axiosInstance";

// Admin Login Thunk
export const loginAdmin = createAsyncThunk(
  "adminAuth/loginAdmin",
  async (credentials, { rejectWithValue }) => {
    try {
      // Endpoint matches the admin route structure discussed earlier
      const res = await api.post("/admin/auth/login", credentials);
      // Expected response structure: { data: { admin: { ... } } }
      return res.data.admin;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Admin login failed");
    }
  }
);

// Admin Logout Thunk (Optional: if you need to clear server-side cookies)
export const logoutAdmin = createAsyncThunk(
  "adminAuth/logoutAdmin",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/admin/logout");
      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Logout failed");
    }
  }
);

export const getAdminProfile = createAsyncThunk(
  "auth/getAdminProfile",
  async(_,{ rejectWithValue })=>{
    try{
      const res = await api.get("/admin/users/profile");
      return res.data?.admin
    }catch(err) {
      return rejectWithValue(err.response?.data?.message || "Request failed");
    }
  }
)

const initialState = {
  admin: null,
  loading: true,
  error: null,
  success: false,
  message:""
};

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    // Local clear for the admin session
    clearAdminState: (state) => {
      state.admin = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearAdminError: (state) => {
      state.error = null;
    },
    resetAdminSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login Admin cases
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload; // Store admin info separately
        state.success = true;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Logout Admin cases
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.admin = null;
        state.success = false;
        state.error = null;
      })
        .addCase(getAdminProfile.pending, (state) =>{
              state.loading = true;
              state.error = null;
              state.message = null;
            })
            .addCase(getAdminProfile.fulfilled,(state,action)=>{
            
              state.loading = false;
              state.message = action.payload;
              state.admin = action.payload
              state.success = true;
            })
            .addCase(getAdminProfile.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
            })
  },
});

export const { clearAdminState, clearAdminError, resetAdminSuccess } = adminAuthSlice.actions;

export default adminAuthSlice.reducer;
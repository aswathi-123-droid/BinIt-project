import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../../api/axiosInstance"; // Adjust path if necessary




export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/register", formData);
      // Backend returns { success: true, message: "...", data: { ... } }
      return res.data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Signup failed");
    }
  }
);


export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", credentials);
      // Backend returns { success: true, data: { user: {...}, token: "..." } }
      console.log(res)
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async(data,{rejectWithValue})=>{
    try{
      const res = await api.post("/auth/verify-otp",data)
      return res.data.message
    }catch(err){
      return rejectWithValue(err.response?.data?.message || "Email Verification failed")
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/forgot-password",email);
      return res.data.message; // Return the email so we can store it
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Request failed");
    }
  }
);

// ================= SLICE =================

const initialState = {
  user: null, // No localStorage access
  token: null, // No localStorage access
  loading: false,
  error: null,
  success: false,
  message:null // Useful for redirects (e.g., after register)
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.success = false;
     
    },
    clearError: (state) => {
      state.error = null;
    },
    resetSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerUser.fulfilled, (state,action) => {
        state.loading = false;
        state.success = true;
        state.message=action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

     
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        state.success = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(verifyEmail.pending, (state) =>{
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(verifyEmail.fulfilled,(state,action)=>{
        state.loading = false;
        state.message = action.payload;
        state.success = true;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { logout, clearError, resetSuccess } = authSlice.actions;

export default authSlice.reducer;
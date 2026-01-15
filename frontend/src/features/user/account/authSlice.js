import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../../api/axiosInstance"; 




export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/register", formData);
      // { success: true, message: "...", data: { ... } }
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
      // { success: true, data: { user: {...}, token: "..." } }
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
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/forgot-password",data);
      return res.data.message; 
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Request failed");
    }
  }
);
export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async(_,{ rejectWithValue })=>{
    try{
      const res = await api.get("/account/profile");
      return res.data?.user
    }catch(err) {
      return rejectWithValue(err.response?.data?.message || "Request failed");
    }
  }
)


const initialState = {
  user: null,
  loading: true ,
  error: null,
  success: false,
  message:null, 
  isForget:false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.message = null;
      state.error = null;
      state.success = false;
    },
    setUser: (state,action) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetSuccess: (state) => {
      state.success = false;
    },
    setForgetPassword: (state,action) => {
      state.isForget = action.payload;
    }
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
        state.user = action.payload;
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

      .addCase(getProfile.pending, (state) =>{
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getProfile.fulfilled,(state,action)=>{
        console.log(action.payload,"profile")
        state.loading = false;
        state.message = action.payload;
        state.user = action.payload
        state.success = true;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { logout, clearError, resetSuccess ,setForgetPassword ,setUser} = authSlice.actions;

export default authSlice.reducer;
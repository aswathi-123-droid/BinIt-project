import {configureStore} from "@reduxjs/toolkit";
import adminAuthReducer from "../features/admin/auth/adminSlice"
import authReducer from "../features/user/account/authSlice"

export const store = configureStore({
    reducer :{
        adminAuth : adminAuthReducer,
        auth : authReducer
    }
})
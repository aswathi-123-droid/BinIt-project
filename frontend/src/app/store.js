import {configureStore} from "@reduxjs/toolkit";
import authReducer from "../features/user/account/authSlice"

export const store = configureStore({
    reducer :{
        auth : authReducer
    }
})
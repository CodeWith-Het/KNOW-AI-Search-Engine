
import { configureStore } from '@reduxjs/toolkit';
import authReducer from "../feature/auth/auth.slice.js"

export const store = configureStore({
    reducer: {
        auth: authReducer
    }
})
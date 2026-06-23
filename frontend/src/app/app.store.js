
import { configureStore } from '@reduxjs/toolkit';
import authReducer from "../feature/auth/auth.slice.js"
import chatReducer from "../feature/chat/chat.slice.js"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat:chatReducer
    }
})
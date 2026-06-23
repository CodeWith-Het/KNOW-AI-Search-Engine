import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        isLoading: false,
        chats: [],
        isActiveChatId : null,
        messages: [],
        isError: null
    },

    reducers: {
        setActiveChatId: (state, action) => {
            state.isActiveChatId = action.payload
        },
        setLoading: (state, action) => {
            state.isLoading=action.payload
        },
        setChats: (state, action) => {
            state.chats=action.payload
        },
        setClearChat: (state) => {
            state.isActiveChatId=null
            state.messages=[]

        },
        setMessages: (state, action) => {
            state.messages=action.payload
        },
        addNewMessages: (state, action) => {
            state.messages.push(action.payload)
        },
        setError: (state, action) => {
            state.isError=action.payload
        }
    }
})

export const {setActiveChatId,setLoading,setChats,setMessages,addNewMessages,setClearChat,setError} = chatSlice.actions
export default chatSlice.reducer
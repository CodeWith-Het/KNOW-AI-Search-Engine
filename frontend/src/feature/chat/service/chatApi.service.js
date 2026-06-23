import axios from "axios"

const api = axios.create({
    baseURL:"http://localhost:3000/api/chats",
    withCredentials:true
})

export const sendMessageApi = async ({message,chat:chatId}) =>{
    try{
        const response = await api.post("/message",{message,chatId})

        return response.data
    }
    catch(error){
        throw new Error(error.response?.data?.message || "Not send message",{cause:error});
    }
}

export const getChatsApi = async () =>{
    try{
        const response = await api.get("/")

        return response.data
    }
    catch(error){
        throw new Error(error.response?.data?.message || "Get not message",{cause:error});
        
    }
}

export const getMessagesApi = async (chatId) => {
    try{
        const response = await api.get(`/${chatId}/messages`)

        return response.data
    }
    catch(error){
        throw new Error(error.response?.data?.message || "Message not fetched",{cause:error});
    }
}

export const deleteChatApi = async (chatId) => {
    try{
        const response = await api.delete(`/delete/${chatId}`)

        return response.data
    }
    catch(error){
        throw new Error(error.response?.data?.message || "Chat Not Found",{cause:error});
    }
}
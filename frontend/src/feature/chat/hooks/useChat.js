import { useDispatch } from 'react-redux';
import { setActiveChatId,setLoading,setChats,setMessages,addNewMessages,setClearChat,setError } from '../chat.slice';
import { sendMessageApi,getChatsApi,getMessagesApi,deleteChatApi } from '../service/chatApi.service';

export const useChat = () => {
    const dispatch = useDispatch()

    const newChats = () => {
        dispatch(setClearChat()); 
    }

    const fetchAllChats = async () => {
        try {
            dispatch(setLoading(true))

            const response = await getChatsApi()
            dispatch(setChats(response))
        }
        catch (error) {
            dispatch(setError(error.message || "chats not fetch"))
        }
        finally {
            dispatch(setLoading(false))
        }
    }

    const loadMessages = async (chatId) => {
        try {
            dispatch(setLoading(true))

            const response = await getMessagesApi(chatId)
            dispatch(setMessages(response.messages))
            dispatch(setActiveChatId(chatId))
        }
        catch (error) {
            dispatch(setError(error.message || "messages not load"))
        }
        finally {
            dispatch(setLoading(false))
        }
    }

    const sendMessage = async (text,currentChatId) => {
        if (!text) return;

        dispatch(addNewMessages({ role: 'user', content: text })); 

        try {
            dispatch(setLoading(true));

            const response = await sendMessageApi({ message: text, chat: currentChatId });

            dispatch(addNewMessages({ role: 'ai', content: response.aiMessage.content }));

            if (!currentChatId && response.chat) {
                dispatch(setActiveChatId(response.chatId));
                fetchAllChats(); 
            }
        } catch (error) {
            dispatch(setError(error.message || "message not send"))
        }
        finally {
            dispatch(setLoading(false)); 
        }
    }

    const deleteChat = async (chatId,currentChatId) => {
        try {
            dispatch(setLoading(true))

            await deleteChatApi(chatId)
            fetchAllChats()

            if (currentChatId === chatId) {
                newChats()
            }
        }
        catch (error) {
            dispatch(setError(error.message || "error of delete chat"))
        }
        finally {
            dispatch(setLoading(false))
        }
    } 
        return { newChats, fetchAllChats,loadMessages,sendMessage,deleteChat}
}
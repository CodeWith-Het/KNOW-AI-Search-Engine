import { useDispatch } from 'react-redux';
import { setActiveChatId,setLoading,setChats,setMessages,addNewMessages,appendToLastMessage,setLastMessageDone,setLastMessageError,setLastMessageCitations,setClearChat,setError } from '../chat.slice';
import { getChatsApi,getMessagesApi,getSearchChatsApi,deleteChatApi } from '../service/chatApi.service';
import { useNavigate } from 'react-router-dom';

export const useChat = () => {
    const dispatch = useDispatch()

    const navigate = useNavigate()

    const newChats = () => {
        dispatch(setClearChat()); 
    }

    const fetchAllChats = async ({ silent = false } = {}) => {
        try {
        if (!silent) {
          dispatch(setLoading(true))
        }

            const response = await getChatsApi()
            dispatch(setChats(response.chats || response))
        }
        catch (error) {
            dispatch(setError(error.message || "chats not fetch"))
        }
        finally {
          if (!silent) {
            dispatch(setLoading(false))
          }
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

const sendMessage = async (text, currentChatId) => {
  dispatch(addNewMessages({ role: 'user', content: text }));
  dispatch(addNewMessages({ role: 'ai', content: '', citations: [], streaming: true }));

  dispatch(setLoading(true));

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chats/message/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message: text, chat: currentChatId }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Failed to stream chat response');
      throw new Error(errText || 'Failed to stream chat response');
    }

    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error('Streaming response is not available');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let streamCompleted = false;

    const handleEvent = (line) => {
      if (!line.startsWith('data:')) return;

      const payload = line.slice(5).trim();
      if (!payload) return;

      const event = JSON.parse(payload);

      if (event.type === 'token') {
        dispatch(appendToLastMessage(event.text || ''));
      }

      if (event.type === 'citations') {
        dispatch(setLastMessageCitations(event.citations || []));
      }

      if (event.type === 'meta' && event.chatId) {
        dispatch(setActiveChatId(event.chatId));
        navigate(`/chats/${event.chatId}`);
        awaitRefreshChats();
      }

      if (event.type === 'done') {
        streamCompleted = true;
        dispatch(setLastMessageDone());
      }

      if (event.type === 'error') {
        streamCompleted = true;
        dispatch(setError(event.message || 'Stream error'));
        dispatch(setLastMessageError(event.message || 'Sorry, I ran into an error while processing that. Please try asking again.'));
      }
    };

    const awaitRefreshChats = () => {
      void fetchAllChats({ silent: true });
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        buffer += decoder.decode();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || '';

      for (const event of events) {
        handleEvent(event);
      }
    }

    if (buffer.trim()) {
      handleEvent(buffer);
    }

    if (!streamCompleted) {
      dispatch(setLastMessageDone());
    }
  } catch (err) {
    dispatch(setError(err.message || 'Stream failed'));
    dispatch(setLastMessageError('Sorry, I ran into an error while processing that. Please try asking again.'));
  } finally {
    dispatch(setLoading(false));
  }
};
    const searchConversations = async (keyword) => {
        try {
        dispatch(setLoading(true))

        const response = await getSearchChatsApi(keyword);
        
        if (response.success) {
          return response.chats; // array me chat aayega 
        }

        return [];
        
    } catch (error) {

        dispatch(setError(error.message || "chat not found"))
        
        return []; // Error aane par khali array bhej do taaki UI crash na ho  
        }
        finally {
            dispatch(setLoading(false))
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
        return { newChats, fetchAllChats,loadMessages,sendMessage,searchConversations,deleteChat,streaming:true}
}
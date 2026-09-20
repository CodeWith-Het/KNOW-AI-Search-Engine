import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createChat as createChatRequest,
  deleteChat as deleteChatRequest,
  getChat,
  getChats,
  searchChats,
  togglePinChat as togglePinChatRequest,
  updateChatTitle as updateChatTitleRequest,
} from "./service/chatApi.service.js";

/* =====================================================
   INITIAL STATE
===================================================== */

const initialState = {
  chats: [],
  activeChat: null,
  messages: [],

  loading: false,
  creating: false,
  sending: false,
  deleting: false,
  searching: false,

  socketConnected: false,

  error: null,
};

/* =====================================================
   ASYNC THUNKS
===================================================== */

export const loadChats = createAsyncThunk(
  "chat/loadChats",
  async (_, { rejectWithValue }) => {
    try {
      return await getChats();
    } catch (error) {
      return rejectWithValue(error.message || "Unable to load chats");
    }
  },
);

export const findChats = createAsyncThunk(
  "chat/findChats",
  async (query, { rejectWithValue }) => {
    try {
      return await searchChats(query);
    } catch (error) {
      return rejectWithValue(error.message || "Unable to search chats");
    }
  },
);

export const createChat = createAsyncThunk(
  "chat/createChat",
  async (_, { rejectWithValue }) => {
    try {
      const chat = await createChatRequest();

      if (!chat?._id) {
        throw new Error("Server created chat but Chat ID is missing");
      }

      return chat;
    } catch (error) {
      return rejectWithValue(error.message || "Unable to create chat");
    }
  },
);

export const loadChat = createAsyncThunk(
  "chat/loadChat",
  async (chatId, { rejectWithValue }) => {
    try {
      if (!chatId) {
        throw new Error("Chat ID is required");
      }

      return await getChat(chatId);
    } catch (error) {
      return rejectWithValue(error.message || "Unable to load chat");
    }
  },
);

export const sendMessageStream = createAsyncThunk(
  "chat/sendMessageStream",
  async ({ chatId, message, mode }, { dispatch }) => {
    // MODE ADDED
    try {
      dispatch(setSending(true));

      dispatch(
        addMessage({
          _id: Date.now().toString(),
          role: "user",
          content: message,
        }),
      );

      const aiMessageId = (Date.now() + 1).toString();
      dispatch(
        addMessage({
          _id: aiMessageId,
          role: "assistant",
          content: "",
          status: "Thinking...",
          citations: [],
        }),
      );

      const activeChatId = chatId || "new";

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/chats/${activeChatId}/message/stream`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ message, mode }), // BHEJA MODE
        },
      );

      if (!response.body || !response.ok)
        throw new Error("Failed to connect to stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let newGeneratedChatId = chatId;

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
          const dataLine = event
            .split("\n")
            .find((line) => line.startsWith("data: "));
          if (!dataLine) continue;

          const parsedData = JSON.parse(dataLine.slice(6));

          if (parsedData.type === "chat_id") {
            newGeneratedChatId = parsedData.chatId;
            dispatch(setChatId(parsedData.chatId));
            window.history.replaceState({}, "", `/chats/${parsedData.chatId}`);
          }

          // 🔥 NEW STATUS & CITATION EVENTS
          if (parsedData.type === "status") {
            dispatch(
              updateMessageStatus({
                messageId: aiMessageId,
                status: parsedData.content,
              }),
            );
          }
          if (parsedData.type === "citations") {
            dispatch(
              updateMessageCitations({
                messageId: aiMessageId,
                citations: parsedData.citations,
              }),
            );
          }

          if (parsedData.type === "token") {
            dispatch(
              appendTokenToMessage({
                messageId: aiMessageId,
                token: parsedData.content,
              }),
            );
          }
          if (parsedData.type === "title")
            dispatch(updateChatTitle(parsedData.title));
          if (parsedData.type === "done") dispatch(setSending(false));
          if (parsedData.type === "error") throw new Error(parsedData.message);
        }
      }
      return newGeneratedChatId;
    } catch (error) {
      dispatch(setSending(false));
      throw error;
    }
  },
);

export const renameChat = createAsyncThunk(
  "chat/renameChat",
  async ({ chatId, title }, { rejectWithValue }) => {
    try {
      if (!chatId) throw new Error("Chat ID is required");
      const updatedChat = await updateChatTitleRequest(chatId, title);
      if (!updatedChat?._id) throw new Error("Chat rename response was invalid");
      return updatedChat;
    } catch (error) {
      return rejectWithValue(error.message || "Unable to rename chat");
    }
  },
);

export const toggleChatPin = createAsyncThunk(
  "chat/toggleChatPin",
  async ({ chatId, pinned }, { rejectWithValue }) => {
    try {
      if (!chatId) throw new Error("Chat ID is required");
      const updatedChat = await togglePinChatRequest(chatId, pinned);
      if (!updatedChat?._id) throw new Error("Chat pin response was invalid");
      return updatedChat;
    } catch (error) {
      return rejectWithValue(error.message || (pinned ? "Unable to pin chat" : "Unable to unpin chat"));
    }
  },
);

export const removeChat = createAsyncThunk(
  "chat/removeChat",
  async (chatId, { rejectWithValue }) => {
    try {
      if (!chatId) {
        throw new Error("Chat ID is required");
      }

      return await deleteChatRequest(chatId);
    } catch (error) {
      return rejectWithValue(error.message || "Unable to delete chat");
    }
  },
);

/* =====================================================
   HELPERS
===================================================== */

const upsertChat = (chats, chat) => {
  if (!chat?._id) {
    return chats;
  }

  const filtered = chats.filter((item) => item._id !== chat._id);

  return [chat, ...filtered];
};

const appendMessage = (messages, message) => {
  if (!message?._id) {
    return messages;
  }

  const exists = messages.some((item) => item._id === message._id);

  if (exists) {
    return messages;
  }

  return [...messages, message];
};

const appendMessages = (messages, newMessages = []) => {
  let result = messages;

  for (const message of newMessages) {
    result = appendMessage(result, message);
  }

  return result;
};

/* =====================================================
   SLICE
===================================================== */

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: [],
    activeChat: null,
    messages: [],
    loading: false,
    creating: false,
    sending: false,
    deleting: false,
    searching: false,
    socketConnected: false,
    error: null,
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    appendTokenToMessage: (state, action) => {
      const { messageId, token } = action.payload;
      const msg = state.messages.find((item) => item._id === messageId);
      if (msg) msg.content += token;
    },

    setChatId: (state, action) => {
      const chatId = action.payload;
      if (!chatId) return;
      state.activeChat =
        state.activeChat?._id === chatId
          ? state.activeChat
          : { _id: chatId, title: "New Chat" };
      state.chats = upsertChat(state.chats, state.activeChat);
    },

    updateMessageStatus: (state, action) => {
      const { messageId, status } = action.payload;
      const msg = state.messages.find((item) => item._id === messageId);
      if (msg) msg.status = status;
    },

    updateChatTitle: (state, action) => {
      const title = action.payload;
      if (!title) return;
      if (state.activeChat) state.activeChat.title = title;
      if (state.activeChat?._id) {
        state.chats = upsertChat(state.chats, {
          ...state.activeChat,
          title,
        });
      }
    },

    updateMessageCitations: (state, action) => {
      const { messageId, citations = [] } = action.payload || {};
      const msg = state.messages.find((item) => item._id === messageId);
      if (msg) msg.citations = citations;
    },

    setSending: (state, action) => {
      state.sending = action.payload;
    },

    /* -----------------------------------------------
       Clear Error
    ------------------------------------------------ */

    clearChatError: (state) => {
      state.error = null;
    },

    /* -----------------------------------------------
       Socket Connected
    ------------------------------------------------ */

    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload;
    },

    /* -----------------------------------------------
       Socket Message
    ------------------------------------------------ */

    receiveChatMessage: (state, action) => {
      const { chat, userMessage, assistantMessage } = action.payload || {};

      /* Update chat list */

      if (chat?._id) {
        state.chats = upsertChat(state.chats, chat);
      }

      /* Ignore messages from another chat */

      if (!state.activeChat?._id || state.activeChat._id !== chat?._id) {
        return;
      }

      /* Add messages without duplicates */

      state.messages = appendMessages(state.messages, [
        userMessage,
        assistantMessage,
      ]);
    },

    /* -----------------------------------------------
       Reset Active Chat
    ------------------------------------------------ */

    resetActiveChat: (state) => {
      state.activeChat = null;
      state.messages = [];
      state.sending = false;
      state.error = null;
    },

    /* -----------------------------------------------
       Clear Messages
    ------------------------------------------------ */

    clearMessages: (state) => {
      state.messages = [];
    },

    syncChatListItem: (state, action) => {
      const chat = action.payload;
      if (!chat?._id) return;
      state.chats = upsertChat(state.chats, chat);
      if (state.activeChat?._id === chat._id) {
        state.activeChat = { ...state.activeChat, ...chat };
      }
    },
  },

  /* =================================================
     ASYNC THUNKS
  ================================================= */

  extraReducers: (builder) => {
    builder

      /* =============================================
         LOAD CHATS
      ============================================== */

      .addCase(loadChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loadChats.fulfilled, (state, action) => {
        state.loading = false;

        state.chats = Array.isArray(action.payload) ? action.payload : [];
      })

      .addCase(loadChats.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || action.error.message;
      })

      /* =============================================
         SEARCH CHATS
      ============================================== */

      .addCase(findChats.pending, (state) => {
        state.searching = true;
        state.error = null;
      })

      .addCase(findChats.fulfilled, (state, action) => {
        state.searching = false;

        state.chats = Array.isArray(action.payload) ? action.payload : [];
      })

      .addCase(findChats.rejected, (state, action) => {
        state.searching = false;

        state.error = action.payload || action.error.message;
      })

      /* =============================================
         CREATE CHAT
      ============================================== */

      .addCase(createChat.pending, (state) => {
        state.creating = true;
        state.error = null;
      })

      .addCase(createChat.fulfilled, (state, action) => {
        state.creating = false;

        const chat = action.payload;

        if (!chat?._id) {
          state.error = "Created chat has no Chat ID";
          return;
        }

        state.chats = upsertChat(state.chats, chat);

        state.activeChat = chat;

        state.messages = [];
      })

      .addCase(createChat.rejected, (state, action) => {
        state.creating = false;

        state.error = action.payload || action.error.message;
      })

      /* =============================================
         LOAD SINGLE CHAT
      ============================================== */

      .addCase(loadChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loadChat.fulfilled, (state, action) => {
        state.loading = false;

        const { chat, messages } = action.payload;

        state.activeChat = chat || null;

        state.messages = Array.isArray(messages) ? messages : [];

        /* Keep sidebar updated */

        if (chat?._id) {
          state.chats = upsertChat(state.chats, chat);
        }
      })

      .addCase(loadChat.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || action.error.message;
      })

      /* =============================================
         SEND MESSAGE
      ============================================== */

      .addCase(sendMessageStream.pending, (state) => {
        state.sending = true;
        state.error = null;
      })

      .addCase(sendMessageStream.fulfilled, (state) => {
        state.sending = false;
      })

      .addCase(sendMessageStream.rejected, (state, action) => {
        state.sending = false;

        state.error = action.payload || action.error.message;
      })

      /* =============================================
         DELETE CHAT
      ============================================== */

      .addCase(renameChat.pending, (state) => {
        state.error = null;
      })

      .addCase(renameChat.fulfilled, (state, action) => {
        const updatedChat = action.payload;
        state.chats = upsertChat(state.chats, updatedChat);
        if (state.activeChat?._id === updatedChat._id) {
          state.activeChat = { ...state.activeChat, ...updatedChat };
        }
      })

      .addCase(renameChat.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      .addCase(toggleChatPin.pending, (state) => {
        state.error = null;
      })

      .addCase(toggleChatPin.fulfilled, (state, action) => {
        const updatedChat = action.payload;
        state.chats = upsertChat(state.chats, updatedChat);
        if (state.activeChat?._id === updatedChat._id) {
          state.activeChat = { ...state.activeChat, ...updatedChat };
        }
      })

      .addCase(toggleChatPin.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      .addCase(removeChat.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })

      .addCase(removeChat.fulfilled, (state, action) => {
        state.deleting = false;

        const deletedChatId = action.payload;

        state.chats = state.chats.filter((chat) => chat._id !== deletedChatId);

        if (state.activeChat?._id === deletedChatId) {
          state.activeChat = null;
          state.messages = [];
        }
      })

      .addCase(removeChat.rejected, (state, action) => {
        state.deleting = false;

        state.error = action.payload || action.error.message;
      });
  },
});

/* =====================================================
   ACTIONS
===================================================== */

export const {
  addMessage,
  appendTokenToMessage,
  updateMessageStatus,
  updateMessageCitations,
  setChatId,
  updateChatTitle,
  setSending,
  clearChatError,
  setSocketConnected,
  receiveChatMessage,
  resetActiveChat,
  clearMessages,
  syncChatListItem,
} = chatSlice.actions;

/* =====================================================
   SELECTORS
===================================================== */

export const selectChats = (state) => state.chat.chats;

export const selectActiveChat = (state) => state.chat.activeChat;

export const selectMessages = (state) => state.chat.messages;

export const selectChatLoading = (state) => state.chat.loading;

export const selectChatSending = (state) => state.chat.sending;

export const selectChatCreating = (state) => state.chat.creating;

export const selectChatDeleting = (state) => state.chat.deleting;

export const selectChatError = (state) => state.chat.error;

export const selectSocketConnected = (state) => state.chat.socketConnected;

export default chatSlice.reducer;

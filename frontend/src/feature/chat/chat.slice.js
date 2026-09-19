import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  createChat as createChatRequest,
  deleteChat as deleteChatRequest,
  getChat,
  getChats,
  searchChats,
  sendMessage as sendMessageRequest,
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
      return rejectWithValue(
        error.message || "Unable to load chats",
      );
    }
  },
);

export const findChats = createAsyncThunk(
  "chat/findChats",
  async (query, { rejectWithValue }) => {
    try {
      return await searchChats(query);
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to search chats",
      );
    }
  },
);

export const createChat = createAsyncThunk(
  "chat/createChat",
  async (_, { rejectWithValue }) => {
    try {
      const chat = await createChatRequest();

      if (!chat?._id) {
        throw new Error(
          "Server created chat but Chat ID is missing",
        );
      }

      return chat;
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to create chat",
      );
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
      return rejectWithValue(
        error.message || "Unable to load chat",
      );
    }
  },
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    { chatId, message },
    { rejectWithValue },
  ) => {
    try {
      if (!chatId) {
        throw new Error("Chat ID is required");
      }

      if (!message?.trim()) {
        throw new Error("Message is required");
      }

      return await sendMessageRequest({
        chatId,
        message: message.trim(),
      });
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to send message",
      );
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
      return rejectWithValue(
        error.message || "Unable to delete chat",
      );
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

  const filtered = chats.filter(
    (item) => item._id !== chat._id,
  );

  return [chat, ...filtered];
};

const appendMessage = (
  messages,
  message,
) => {
  if (!message?._id) {
    return messages;
  }

  const exists = messages.some(
    (item) => item._id === message._id,
  );

  if (exists) {
    return messages;
  }

  return [...messages, message];
};

const appendMessages = (
  messages,
  newMessages = [],
) => {
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

  initialState,

  reducers: {
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

    receiveChatMessage: (
      state,
      action,
    ) => {
      const {
        chat,
        userMessage,
        assistantMessage,
      } = action.payload || {};

      /* Update chat list */

      if (chat?._id) {
        state.chats = upsertChat(
          state.chats,
          chat,
        );
      }

      /* Ignore messages from another chat */

      if (
        !state.activeChat?._id ||
        state.activeChat._id !== chat?._id
      ) {
        return;
      }

      /* Add messages without duplicates */

      state.messages = appendMessages(
        state.messages,
        [
          userMessage,
          assistantMessage,
        ],
      );
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
  },

  /* =================================================
     ASYNC THUNKS
  ================================================= */

  extraReducers: (builder) => {
    builder

      /* =============================================
         LOAD CHATS
      ============================================== */

      .addCase(
        loadChats.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )

      .addCase(
        loadChats.fulfilled,
        (state, action) => {
          state.loading = false;

          state.chats =
            Array.isArray(action.payload)
              ? action.payload
              : [];
        },
      )

      .addCase(
        loadChats.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            action.error.message;
        },
      )

      /* =============================================
         SEARCH CHATS
      ============================================== */

      .addCase(
        findChats.pending,
        (state) => {
          state.searching = true;
          state.error = null;
        },
      )

      .addCase(
        findChats.fulfilled,
        (state, action) => {
          state.searching = false;

          state.chats =
            Array.isArray(action.payload)
              ? action.payload
              : [];
        },
      )

      .addCase(
        findChats.rejected,
        (state, action) => {
          state.searching = false;

          state.error =
            action.payload ||
            action.error.message;
        },
      )

      /* =============================================
         CREATE CHAT
      ============================================== */

      .addCase(
        createChat.pending,
        (state) => {
          state.creating = true;
          state.error = null;
        },
      )

      .addCase(
        createChat.fulfilled,
        (state, action) => {
          state.creating = false;

          const chat = action.payload;

          if (!chat?._id) {
            state.error =
              "Created chat has no Chat ID";
            return;
          }

          state.chats = upsertChat(
            state.chats,
            chat,
          );

          state.activeChat = chat;

          state.messages = [];
        },
      )

      .addCase(
        createChat.rejected,
        (state, action) => {
          state.creating = false;

          state.error =
            action.payload ||
            action.error.message;
        },
      )

      /* =============================================
         LOAD SINGLE CHAT
      ============================================== */

      .addCase(
        loadChat.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )

      .addCase(
        loadChat.fulfilled,
        (state, action) => {
          state.loading = false;

          const {
            chat,
            messages,
          } = action.payload;

          state.activeChat =
            chat || null;

          state.messages =
            Array.isArray(messages)
              ? messages
              : [];

          /* Keep sidebar updated */

          if (chat?._id) {
            state.chats = upsertChat(
              state.chats,
              chat,
            );
          }
        },
      )

      .addCase(
        loadChat.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            action.error.message;
        },
      )

      /* =============================================
         SEND MESSAGE
      ============================================== */

      .addCase(
        sendMessage.pending,
        (state) => {
          state.sending = true;
          state.error = null;
        },
      )

      .addCase(
        sendMessage.fulfilled,
        (state, action) => {
          state.sending = false;

          const {
            chat,
            userMessage,
            assistantMessage,
          } = action.payload;

          /* Update active chat */

          if (chat?._id) {
            state.activeChat = chat;

            state.chats = upsertChat(
              state.chats,
              chat,
            );
          }

          /* Prevent duplicate messages */

          state.messages = appendMessages(
            state.messages,
            [
              userMessage,
              assistantMessage,
            ],
          );
        },
      )

      .addCase(
        sendMessage.rejected,
        (state, action) => {
          state.sending = false;

          state.error =
            action.payload ||
            action.error.message;
        },
      )

      /* =============================================
         DELETE CHAT
      ============================================== */

      .addCase(
        removeChat.pending,
        (state) => {
          state.deleting = true;
          state.error = null;
        },
      )

      .addCase(
        removeChat.fulfilled,
        (state, action) => {
          state.deleting = false;

          const deletedChatId =
            action.payload;

          state.chats =
            state.chats.filter(
              (chat) =>
                chat._id !== deletedChatId,
            );

          if (
            state.activeChat?._id ===
            deletedChatId
          ) {
            state.activeChat = null;
            state.messages = [];
          }
        },
      )

      .addCase(
        removeChat.rejected,
        (state, action) => {
          state.deleting = false;

          state.error =
            action.payload ||
            action.error.message;
        },
      );
  },
});

/* =====================================================
   ACTIONS
===================================================== */

export const {
  clearChatError,
  setSocketConnected,
  receiveChatMessage,
  resetActiveChat,
  clearMessages,
} = chatSlice.actions;

/* =====================================================
   SELECTORS
===================================================== */

export const selectChats = (state) =>
  state.chat.chats;

export const selectActiveChat = (state) =>
  state.chat.activeChat;

export const selectMessages = (state) =>
  state.chat.messages;

export const selectChatLoading = (state) =>
  state.chat.loading;

export const selectChatSending = (state) =>
  state.chat.sending;

export const selectChatCreating = (state) =>
  state.chat.creating;

export const selectChatDeleting = (state) =>
  state.chat.deleting;

export const selectChatError = (state) =>
  state.chat.error;

export const selectSocketConnected = (
  state,
) => state.chat.socketConnected;

export default chatSlice.reducer;
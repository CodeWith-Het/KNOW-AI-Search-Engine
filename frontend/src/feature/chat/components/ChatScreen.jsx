import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../../auth/hook/useAuth";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import GlobalSearchModal from "./GlobalSearchModal";

// Helper function: Array of objects ko string mein badalne ke liye
const formatMessage = (content) => {
  if (typeof content === "string") return content;
  return Array.isArray(content)
    ? content.map((block) => block.text || "").join("")
    : JSON.stringify(content);
};

const ChatScreen = () => {
  const [chatInput, setChatInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  //  Global Search Modal control karne ke liye
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { isLoading, chats, isActiveChatId, messages } = useSelector(
    (state) => state.chat,
  );

  const { id } = useParams();
  const navigate = useNavigate();

  const { newChats, loadMessages, sendMessage, deleteChat } = useChat();
  const { logoutUser } = useAuth();

  const userInitial = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "U";

  const handleSend = async () => {
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput("");
    await sendMessage(text, isActiveChatId);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // URL ID Sync Logic
  useEffect(() => {
    if (id) {
      loadMessages(id);
    }
  }, [id]);

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 font-sans overflow-hidden relative">
      {/* MOBILE DRAWER OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* ⬅️ SIDEBAR */}
      <aside
        className={`fixed md:relative z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg transition-transform duration-300 ease-in-out 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:flex`}
      >
        {/* Mobile Close Button */}
        <div className="flex justify-end p-2 md:hidden border-b border-gray-100">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-500 hover:text-red-500 p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* 🎯 ACTION BUTTONS: New Chat & Search */}
        <div className="p-4 border-b border-gray-100 pt-2 md:pt-4 space-y-3">
          {/* New Chat Button */}
          <button
            onClick={() => {
              newChats();
              navigate("/");
              setIsSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-md transition-all font-medium text-sm cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            New Chat
          </button>

          {/* 🎯 GLOBAL SEARCH TRIGGER BUTTON */}
          <button
            onClick={() => setIsGlobalSearchOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-lg shadow-sm transition-all font-medium text-sm cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            Search Chats
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 mt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
            Recent Chats
          </p>

          {chats && chats.length > 0 ? (
            chats.map((c, index) => (
              <div
                key={index}
                onClick={() => {
                  loadMessages(c._id);
                  navigate(`/chat/${c._id}`);
                  setIsSidebarOpen(false);
                }}
                className={`group flex items-center justify-between px-3 py-2.5 text-sm rounded-md cursor-pointer border transition-colors ${
                  isActiveChatId === c._id
                    ? "bg-sky-100 border-sky-200 text-sky-800"
                    : "text-gray-700 border-transparent hover:bg-sky-50 hover:border-sky-100"
                }`}
              >
                <span className="truncate w-4/5 font-medium">
                  {c.title || "New Conversation"}
                </span>
                <svg
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(c._id, isActiveChatId);
                  }}
                  className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 px-2">No recent chats</p>
          )}
        </div>

        {/* Bottom: User Profile */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm border border-sky-200">
              {userInitial}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {user.username}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                await logoutUser();
                navigate("/login");
              } catch (logoutError) {
                console.error(logoutError);
              }
            }}
            className="w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* 🎯 MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative w-full h-full">
        {/* Header for mobile */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm md:hidden shrink-0">
          <span className="font-bold text-xl text-sky-600 tracking-tight">
            Perplexity Ai
          </span>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-600 hover:text-sky-500 focus:outline-none"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </header>

        {/* Chat Messages Display */}
        <div className="flex-1 overflow-y-scroll scroll-smooth p-4 md:p-8 max-w-4xl mx-auto w-full h-[calc(100vh-120px)] overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {!messages || messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-10">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-800 tracking-tight">
                What do you want to <span className="text-sky-500">know?</span>
              </h1>
              <p className="text-gray-500 text-lg">
                Ask anything to search, synthesize, and get direct answers.
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-20">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-4 max-w-[85%] md:max-w-[80%] rounded-2xl ${
                      msg.role === "user"
                        ? "bg-sky-100 text-sky-900 rounded-br-none"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm overflow-hidden"
                    }`}
                  >
                    {msg.role === "user" ? (
                      formatMessage(msg.content)
                    ) : (
                      <div className="prose prose-sm max-w-none text-gray-800 overflow-x-auto">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {formatMessage(msg.content)}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-4 bg-white border border-gray-200 rounded-2xl rounded-bl-none shadow-sm text-gray-500 animate-pulse">
                    AI is thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ⌨️ INPUT AREA */}
        <div className="p-4 md:p-6 w-full max-w-4xl mx-auto sticky bottom-0 bg-gray-100 bg-opacity-95 backdrop-blur-md z-30 shrink-0">
          <div className="relative border border-gray-300 rounded-xl shadow-lg bg-white focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100 transition-all">
            <textarea
              id="chat-input"
              name="chatInput"
              className="w-full bg-transparent p-4 pr-16 text-gray-800 outline-none resize-none font-medium [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              rows="2"
              placeholder="Ask anything..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            ></textarea>
            <button
              onClick={handleSend}
              disabled={isLoading || !chatInput.trim()}
              className="absolute right-3 bottom-3 p-2 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-md cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </button>
          </div>
          <div className="relative flex justify-between items-center mt-3 text-xs text-gray-500 font-medium px-2 hidden md:flex">
            <span className="absolute right-0">
              Use Shift + Enter for new line
            </span>
          </div>
        </div>
      </main>

      {/* 🎯 GLOBAL SEARCH MODAL YAHAN ATTACH KIYA HAI */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
      />
    </div>
  );
};

export default ChatScreen;

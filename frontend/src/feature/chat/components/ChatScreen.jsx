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

// Helper function: [1], [2] jaise citation markers ko clickable badges mein badalne ke liye
const renderWithCitations = (text, citations = []) => {
  if (!citations.length) return text;

  return text.split(/(\[\d+\])/g).map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (!match) return part;

    const citation = citations.find((c) => c.id === Number(match[1]));
    if (!citation) return part;

    return (
      <a
        key={i}
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        title={citation.title}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--violet)]/15 text-[var(--violet)] text-[10px] font-bold mx-0.5 align-middle hover:bg-[var(--violet)]/25 no-underline"
      >
        {match[1]}
      </a>
    );
  });
};

const ChatScreen = () => {
  const [chatInput, setChatInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  useEffect(() => {
    if (id) {
      loadMessages(id);
    }
  }, [id]);

  return (
    <div className="flex h-screen bg-[var(--paper)] text-[var(--ink)] font-['Inter',sans-serif] overflow-hidden relative">
      {/* MOBILE DRAWER OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* ⬅️ SIDEBAR — ink dark, premium */}
      <aside
        className={`fixed md:relative z-50 h-full w-72 bg-[var(--ink)] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:flex`}
      >
        {/* Mobile Close Button */}
        <div className="flex justify-end p-2 md:hidden border-b border-white/10">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-white/50 hover:text-white p-2"
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

        {/* Brand */}
        <div className="px-5 pt-6 pb-2 hidden md:block">
          <span className="font-mono-label text-[10px] tracking-[0.2em] text-[var(--amber)] uppercase">
            Perplexity AI
          </span>
        </div>

        {/* 🎯 ACTION BUTTONS */}
        <div className="p-4 pt-3 space-y-2.5">
          <button
            onClick={() => {
              newChats();
              navigate("/");
              setIsSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--violet)] hover:bg-[var(--violet-deep)] text-white rounded-xl shadow-lg shadow-[var(--violet)]/20 transition-all font-semibold text-sm cursor-pointer"
          >
            <svg
              className="w-4 h-4"
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

          <button
            onClick={() => setIsGlobalSearchOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-xl transition-all font-medium text-sm cursor-pointer"
          >
            <svg
              className="w-4 h-4"
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
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 mt-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <p className="font-mono-label text-[10px] text-white/30 uppercase tracking-widest mb-2 px-2">
            Recent
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
                className={`group flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${
                  isActiveChatId === c._id
                    ? "bg-[var(--violet)]/20 text-white border-l-2 border-[var(--amber)]"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90 border-l-2 border-transparent"
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
                  className="w-4 h-4 text-white/30 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
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
            <p className="text-xs text-white/30 px-2">No recent chats</p>
          )}
        </div>

        {/* Bottom: User Profile */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--violet)]/20 text-[var(--amber)] flex items-center justify-center font-bold text-sm border border-white/10">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user.username}
              </p>
              <p className="text-xs text-white/40 truncate">{user.email}</p>
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
            className="w-full rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 px-4 py-2 text-sm font-semibold text-white/70 hover:text-red-300 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* 🎯 MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative w-full h-full">
        {/* Header for mobile */}
        <header className="h-14 bg-[var(--ink)] flex items-center justify-between px-4 shadow-sm md:hidden shrink-0">
          <span className="font-display text-xl text-white tracking-tight">
            Perplexity <span className="text-[var(--amber)]">AI</span>
          </span>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-white/70 hover:text-white focus:outline-none"
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
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-10 animate-fade-up">
              <span className="font-mono-label text-xs tracking-[0.2em] text-[var(--violet)] uppercase">
                Ask anything
              </span>
              <h1 className="font-display text-3xl md:text-5xl text-[var(--ink)] tracking-tight">
                What do you want to{" "}
                <span className="italic text-[var(--violet)]">know?</span>
              </h1>
              <p className="text-[var(--ink-soft)] text-base md:text-lg max-w-md">
                Ask anything to search, synthesize, and get direct, sourced
                answers.
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-20">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}
                >
                  {msg.role === "user" ? (
                    <div className="p-4 max-w-[85%] md:max-w-[80%] rounded-2xl rounded-br-md bg-[var(--violet)] text-white shadow-lg shadow-[var(--violet)]/15">
                      {formatMessage(msg.content)}
                    </div>
                  ) : (
                    <div className="p-4 max-w-[85%] md:max-w-[80%] rounded-2xl rounded-bl-md bg-white border border-[var(--line)] border-l-4 border-l-[var(--amber)] shadow-sm overflow-hidden">
                      <div className="prose prose-sm max-w-none text-[var(--ink)] overflow-x-auto">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => (
                              <p>
                                {React.Children.map(children, (child) =>
                                  typeof child === "string"
                                    ? renderWithCitations(child, msg.citations)
                                    : child,
                                )}
                              </p>
                            ),
                          }}
                        >
                          {formatMessage(msg.content)}
                        </ReactMarkdown>
                      </div>

                      {/* 📚 Sources list — sirf tab dikhta hai jab citations available hon */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[var(--line)] space-y-1.5">
                          <p className="font-mono-label text-[10px] text-[var(--ink-soft)] uppercase tracking-widest mb-2">
                            Sources
                          </p>
                          {msg.citations.map((c) => (
                            <a
                              key={c.id}
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-2 text-xs text-[var(--ink-soft)] hover:text-[var(--violet)] transition-colors"
                            >
                              <span className="shrink-0 w-4 h-4 rounded-full bg-[var(--violet)]/10 text-[var(--violet)] text-[9px] font-bold flex items-center justify-center mt-0.5">
                                {c.id}
                              </span>
                              <span className="truncate">{c.title}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 p-4 bg-white border border-[var(--line)] border-l-4 border-l-[var(--amber)] rounded-2xl rounded-bl-md shadow-sm text-[var(--ink-soft)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--violet)] animate-node" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[var(--violet)] animate-node"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[var(--violet)] animate-node"
                      style={{ animationDelay: "0.4s" }}
                    />
                    <span className="text-sm ml-1">Synthesizing…</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ⌨️ INPUT AREA */}
        <div className="p-4 md:p-6 w-full max-w-4xl mx-auto sticky bottom-0 bg-[var(--paper)]/95 backdrop-blur-md z-30 shrink-0">
          <div className="relative border border-[var(--line)] rounded-2xl shadow-lg bg-white focus-within:border-[var(--violet)] focus-within:ring-4 focus-within:ring-[var(--violet)]/10 transition-all">
            <textarea
              id="chat-input"
              name="chatInput"
              className="w-full bg-transparent p-4 pr-16 text-[var(--ink)] outline-none resize-none font-medium [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              rows="2"
              placeholder="Ask anything…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            ></textarea>
            <button
              onClick={handleSend}
              disabled={isLoading || !chatInput.trim()}
              className="absolute right-3 bottom-3 p-2.5 bg-[var(--violet)] hover:bg-[var(--violet-deep)] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-md cursor-pointer"
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
          <div className="relative flex justify-between items-center mt-3 text-xs text-[var(--ink-soft)] font-mono-label px-2 hidden md:flex">
            <span className="absolute right-0">Shift + Enter for new line</span>
          </div>
        </div>
      </main>

      {/* 🎯 GLOBAL SEARCH MODAL */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
      />
    </div>
  );
};

export default ChatScreen;

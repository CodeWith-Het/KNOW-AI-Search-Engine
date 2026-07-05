import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../hooks/useChat";

const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();

  const { loadMessages, searchConversations } = useChat();

  // User ke rukne par hi API call hogi
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // user ruk janwe ke bad 400ms ke baad API call hogi
    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const matchChats = await searchConversations(query);
        setResults(matchChats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // KEYBOARD NAVIGATION: Up, Down, Enter
  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectChat(results[selectedIndex]._id);
    }
  };

  // jab koi user chat ko select kare to uska message load ho jaye
  // and search Model close ho jaye
  const handleSelectChat = (chatId) => {
    loadMessages(chatId);
    navigate(`/chat/${chatId}`);
    onClose();
    setQuery("");
    setSelectedIndex(-1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4">
      {/* Backdrop click se close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Main Search Container */}
      <div className="bg-white rounded-2xl shadow-[0_30px_70px_-20px_rgba(18,19,26,0.35)] border border-[var(--line)] w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[60vh] animate-fade-up">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--line)]">
          <svg
            className="w-5 h-5 text-[var(--violet)] mr-3 shrink-0"
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
          <input
            type="text"
            placeholder="Search all chats by title..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-[var(--ink)] outline-none text-base font-medium placeholder-[var(--ink-soft)]"
            autoFocus
          />
          <button
            onClick={onClose}
            className="font-mono-label text-[10px] font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] bg-[var(--paper)] border border-[var(--line)] px-2 py-1 rounded shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Results Box */}
        <div className="flex-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {loading && (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-[var(--ink-soft)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--violet)] animate-node" />
              <span
                className="w-1.5 h-1.5 rounded-full bg-[var(--violet)] animate-node"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-[var(--violet)] animate-node"
                style={{ animationDelay: "0.4s" }}
              />
              <span className="ml-1">Searching your chats…</span>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-6 text-center text-sm text-[var(--ink-soft)] italic">
              No old conversations match "{query}"
            </div>
          )}

          {!loading && !query && (
            <div className="p-6 text-center text-xs font-mono-label text-[var(--ink-soft)] uppercase tracking-widest">
              Start typing to search
            </div>
          )}

          {!loading &&
            results.map((chat, idx) => (
              <div
                key={chat._id}
                onClick={() => handleSelectChat(chat._id)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border-l-2 ${
                  idx === selectedIndex
                    ? "bg-[var(--violet)]/10 text-[var(--ink)] font-medium border-l-[var(--amber)]"
                    : "hover:bg-[var(--paper)] text-[var(--ink-soft)] border-l-transparent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--violet)]/10 text-[var(--violet)] flex items-center justify-center text-xs">
                    💬
                  </span>
                  <p className="text-sm truncate">
                    {chat.title || "Untitled Chat"}
                  </p>
                </div>
                <span className="font-mono-label text-[10px] text-[var(--ink-soft)] shrink-0 ml-3">
                  {new Date(chat.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;

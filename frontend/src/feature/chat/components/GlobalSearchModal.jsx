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

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

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

  const handleSelectChat = (chatId) => {
    loadMessages(chatId);
    navigate(`/chat/${chatId}`);
    onClose();
    setQuery("");
    setSelectedIndex(-1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4 transition-all duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Glassmorphism Search Container */}
      <div className="bg-white/95 dark:bg-neutral-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[60vh] animate-fade-up">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-4 border-b border-gray-200 dark:border-neutral-800">
          <svg
            className="w-5 h-5 text-emerald-500 mr-3 shrink-0"
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
            className="w-full bg-transparent text-gray-900 dark:text-white outline-none text-base font-medium placeholder-gray-400 dark:placeholder-gray-500"
            autoFocus
          />
          <button
            onClick={onClose}
            className="font-mono text-[10px] font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-2 py-1 rounded shrink-0 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results Box */}
        <div className="flex-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {loading && (
            <div className="flex items-center justify-center gap-3 p-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-5 h-5 border-2 border-emerald-200 dark:border-emerald-900 border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin"></div>

              <span>Searching your chats…</span>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400 italic">
              No old conversations match "{query}"
            </div>
          )}

          {!loading && !query && (
            <div className="p-6 text-center text-xs font-mono text-gray-400 dark:text-gray-500 uppercase tracking-widest">
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
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium border-l-emerald-500"
                    : "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 border-l-transparent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs">
                    💬
                  </span>
                  <p className="text-sm truncate">
                    {chat.title || "Untitled Chat"}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500 shrink-0 ml-3">
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

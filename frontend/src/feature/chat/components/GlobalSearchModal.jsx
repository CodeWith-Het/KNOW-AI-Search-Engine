import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSearchChatsApi } from "../service/chatApi.service";

const GlobalSearchModal = ({ isOpen, onClose, loadMessages }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();

  //User ke rukne par hi API call hogi
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const data = await getSearchChatsApi(query);
        if (data.success) setResults(data.chats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // 🎯 KEYBOARD NAVIGATION: Up, Down, Enter
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
    loadMessages(chatId); // 1. Us chat ke messages load karo Redux me
    navigate(`/chat/${chatId}`); // 2. URL badlo taaki ChatScreen load ho jaye
    onClose(); // 3. Search page band kar do
    setQuery("");
    setSelectedIndex(-1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4">
      {/* Backdrop click se close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Main Search Container */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[60vh] animate-fade-in">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-100">
          <svg
            className="w-5 h-5 text-gray-400 mr-3"
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
            className="w-full bg-transparent text-gray-800 outline-none text-base font-medium placeholder-gray-400"
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded"
          >
            ESC
          </button>
        </div>

        {/* Results Box */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading && (
            <div className="p-4 text-center text-sm text-gray-400 animate-pulse">
              Searching matching history...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-400 italic">
              No old conversations match "{query}"
            </div>
          )}

          {!loading &&
            results.map((chat, idx) => (
              <div
                key={chat._id}
                onClick={() => handleSelectChat(chat._id)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  idx === selectedIndex
                    ? "bg-sky-100 text-sky-900 font-medium border-l-4 border-l-sky-500"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span>💬</span>
                  <p className="text-sm truncate">
                    {chat.title || "Untitled Chat"}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
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

export default GlobalSearchModal
import React, { useEffect } from "react";
import { initialzeSocketConnection } from "../service/chat.socket.js";
import { useChat } from "../hooks/useChat.js";
import { Outlet } from "react-router-dom";
// Check kar lena agar tera ThemeToggle app/components me hai ya sirf components me
import ThemeToggle from "../../../app/components/ThemeToggle.jsx";

const Chatwrapper = () => {
  const { fetchAllChats } = useChat();

  useEffect(() => {
    initialzeSocketConnection();
    fetchAllChats();
  }, []); 

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300">
    
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] z-10 shadow-sm">
  
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-gray-900 dark:bg-white text-white dark:text-black flex justify-center items-center rounded-sm">
            K
          </div>
          KNOW <span className="text-emerald-500">AI</span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <button className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
            H 
          </button>
        </div>
      </header>

      <main className="flex-1 w-full overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
};

export default Chatwrapper;
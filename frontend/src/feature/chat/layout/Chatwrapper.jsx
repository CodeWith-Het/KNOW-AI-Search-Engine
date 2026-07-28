import React, { useEffect } from "react";
import { initialzeSocketConnection } from "../service/chat.socket.js";
import { useChat } from "../hooks/useChat.js";
import { Outlet } from "react-router-dom";

const Chatwrapper = () => {
  const { fetchAllChats } = useChat();

  useEffect(() => {
    initialzeSocketConnection();
    fetchAllChats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300">
      <main className="flex-1 w-full overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
};

export default Chatwrapper;

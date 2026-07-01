import React, { useEffect } from 'react';
import { initialzeSocketConnection } from "../service/chat.socket.js";
import { useChat } from '../hooks/useChat.js';
import { Outlet } from 'react-router-dom';

const Chatwrapper = () => {

    const { fetchAllChats } = useChat()
    
  useEffect(() => {
      initialzeSocketConnection(),
      fetchAllChats()
    }, [])
    

  return <Outlet />
}

export default Chatwrapper;

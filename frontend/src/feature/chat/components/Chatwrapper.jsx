import React, { useEffect } from 'react';
import { useChat } from '../hooks/useChat';

const Chatwrapper = ({children}) => {

    const { fetchAllChats } = useChat()
    
    useEffect(() => {
      fetchAllChats
    }, [])
    

  return children
}

export default Chatwrapper;

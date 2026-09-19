import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { receiveChatMessage, resetActiveChat, setSocketConnected } from "../chat.slice.js";
import { chatSocket, connectChatSocket, joinChatRoom, leaveChatRoom } from "../service/chatSocket.js";

const useChat = (chatId) => {
  const dispatch = useDispatch();
  const currentChatId = useRef(chatId);

  useEffect(() => {
    currentChatId.current = chatId;
  }, [chatId]);

  useEffect(() => {
    const handleConnect = () => {
      dispatch(setSocketConnected(true));
      if (currentChatId.current) joinChatRoom(currentChatId.current);
    };
    const handleDisconnect = () => dispatch(setSocketConnected(false));
    const handleConnectError = () => dispatch(setSocketConnected(false));
    const handleChatMessage = (payload) => dispatch(receiveChatMessage(payload));

    chatSocket.on("connect", handleConnect);
    chatSocket.on("disconnect", handleDisconnect);
    chatSocket.on("connect_error", handleConnectError);
    chatSocket.on("chat:message", handleChatMessage);

    connectChatSocket();

    return () => {
      chatSocket.off("connect", handleConnect);
      chatSocket.off("disconnect", handleDisconnect);
      chatSocket.off("connect_error", handleConnectError);
      chatSocket.off("chat:message", handleChatMessage);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!chatId) {
      dispatch(resetActiveChat());
      return;
    }
    if (chatSocket.connected) joinChatRoom(chatId);
    return () => leaveChatRoom(chatId);
  }, [chatId, dispatch]);

  return { socket: chatSocket, connected: chatSocket.connected };
};

export default useChat;
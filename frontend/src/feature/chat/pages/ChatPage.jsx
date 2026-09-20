import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Menu } from "lucide-react";

import {
  findChats,
  loadChat,
  loadChats,
  removeChat,
  renameChat,
  resetActiveChat,
  sendMessageStream,
  toggleChatPin,
} from "../chat.slice.js";
import useChat from "../hook/useChat.js";

import Sidebar from "../components/Sidebar.jsx";
import MessageList from "../components/MessageList.jsx";
import Composer from "../components/Composer.jsx";
import EmptyState from "../components/EmptyState.jsx";
import DeleteModal from "../components/DeleteModal.jsx";

const errorText = (error, fallback) =>
  typeof error === "string" ? error : error?.message || fallback;

const ChatPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chatId } = useParams();
  useChat(chatId);

  const { user } = useSelector((state) => state.auth);
  const { chats, activeChat, messages, loading, sending, deleting, error } =
    useSelector((state) => state.chat);

  const effectiveChatId = chatId || activeChat?._id || null;

  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // <-- DELETE MODAL KE LIYE NAYI STATE -->
  const [chatToDelete, setChatToDelete] = useState(null);

  /* ---------- effects ---------- */
  useEffect(() => {
    dispatch(loadChats());
  }, [dispatch]);

  useEffect(() => {
    if (!chatId) {
      dispatch(resetActiveChat());
      return;
    }
    const request = dispatch(loadChat(chatId));
    return () => request.abort();
  }, [chatId, dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event) => event.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  /* ---------- handlers ---------- */
  const handleNewChat = useCallback(() => {
    setDrawerOpen(false);
    dispatch(resetActiveChat());
    navigate("/chats");
  }, [dispatch, navigate]);

  const handleOpenChat = useCallback(
    (selectedChatId) => {
      setDrawerOpen(false);
      if (!selectedChatId || selectedChatId === chatId) return;
      navigate(`/chats/${selectedChatId}`);
    },
    [chatId, navigate],
  );

  const handleSend = useCallback(
    async (message, mode) => {
      // 🔥 MODE ACCEPT KIYA
      try {
        await dispatch(
          sendMessageStream({ chatId: effectiveChatId, message, mode }), // 🔥 MODE DISPATCH KIYA
        ).unwrap();
      } catch (err) {
        console.error("Message send failed:", err);
        toast.error(errorText(err, "Failed to send message"));
        throw err;
      }
    },
    [dispatch, effectiveChatId],
  );

  // <-- NAYA DELETE LOGIC (Modal open karne ke liye) -->
  const initiateDelete = useCallback(
    (targetChatId) => {
      const target = chats.find((chat) => chat._id === targetChatId);
      if (target) setChatToDelete(target);
    },
    [chats],
  );

  // <-- ASLI DELETE ACTION (Jab modal me confirm dabaayein) -->
  const confirmDelete = async () => {
    if (!chatToDelete || deleting) return;

    try {
      await dispatch(removeChat(chatToDelete._id)).unwrap();
      toast.success("Chat deleted");

      if (chatToDelete._id === chatId) {
        const remaining = chats.filter((chat) => chat._id !== chatToDelete._id);
        navigate(remaining.length ? `/chats/${remaining[0]._id}` : "/chats", {
          replace: true,
        });
      }
    } catch (err) {
      toast.error(errorText(err, "Unable to delete chat"));
    } finally {
      setChatToDelete(null); // Modal close kar do
    }
  };

  const handleSearch = useCallback(
    (value) => {
      setQuery(value);
      if (value.trim()) dispatch(findChats(value.trim()));
      else dispatch(loadChats());
    },
    [dispatch],
  );

  const handleRenameChat = useCallback(
    (targetChat) => {
      if (!targetChat) return;
      const nextTitle = window.prompt(
        "Rename chat",
        targetChat.title || "New Chat",
      );
      if (!nextTitle || !nextTitle.trim()) return;

      dispatch(
        renameChat({
          chatId: targetChat._id,
          title: nextTitle.trim(),
        }),
      )
        .unwrap()
        .then(() => toast.success("Chat renamed"))
        .catch((err) => toast.error(errorText(err, "Unable to rename chat")));
    },
    [dispatch],
  );

  const handleTogglePin = useCallback(
    async (targetChatId, pinned) => {
      const targetChat = chats.find((chat) => chat._id === targetChatId);
      if (!targetChat) return;

      try {
        const updatedChat = await dispatch(
          toggleChatPin({ chatId: targetChatId, pinned }),
        ).unwrap();
        toast.success(updatedChat?.pinned ? "Chat pinned" : "Chat unpinned");
      } catch (err) {
        toast.error(
          errorText(
            err,
            pinned ? "Unable to pin chat" : "Unable to unpin chat",
          ),
        );
      }
    },
    [chats, dispatch],
  );

  /* ---------- render ---------- */
  const isEmpty = !loading && !sending && messages.length === 0;

  const sidebarProps = {
    chats,
    loading,
    activeChatId: chatId,
    query,
    onQueryChange: handleSearch,
    onNewChat: handleNewChat,
    onOpenChat: handleOpenChat,
    onRenameChat: handleRenameChat,
    onTogglePin: handleTogglePin,
    onDeleteChat: initiateDelete,
    user,
  };

  return (
    <main className="h-screen w-full overflow-hidden bg-[#0f1113] font-[Inter,sans-serif] text-[#ece9e2]">
      <div className="flex h-full w-full">
        {/* Desktop sidebar */}
        <Sidebar {...sidebarProps} className="hidden lg:flex" />

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <Sidebar
              {...sidebarProps}
              className="flex shadow-2xl"
              onClose={() => setDrawerOpen(false)}
            />
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setDrawerOpen(false)}
              className="flex-1 bg-black/60"
            />
          </div>
        )}

        {/* Main workspace */}
        <section className="flex min-w-0 flex-1 flex-col relative pt-4">
          <button
            onClick={() => setDrawerOpen(true)}
            className="absolute left-4 top-4 z-10 rounded-lg p-2 text-[#ece9e2]/50 hover:bg-white/5 hover:text-[#ece9e2] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {isEmpty ? (
            <div className="flex flex-1 items-center justify-center overflow-y-auto pb-16 pt-8">
              <EmptyState onPick={handleSend}>
                <Composer onSend={handleSend} sending={sending} autoFocus />
              </EmptyState>
            </div>
          ) : (
            <>
              <MessageList
                chatId={chatId}
                messages={messages}
                loading={loading}
                sending={sending}
              />
              <div className="shrink-0 px-4 pb-4 pt-2 sm:px-8">
                <Composer
                  onSend={handleSend}
                  sending={sending}
                  autoFocus
                  placeholder="Ask a follow-up…"
                />
              </div>
            </>
          )}
        </section>
      </div>

      {/* <-- CUSTOM DELETE MODAL --> */}
      <DeleteModal
        isOpen={!!chatToDelete}
        onClose={() => setChatToDelete(null)}
        onConfirm={confirmDelete}
        title={chatToDelete?.title || "New chat"}
        deleting={deleting}
      />
    </main>
  );
};

export default ChatPage;

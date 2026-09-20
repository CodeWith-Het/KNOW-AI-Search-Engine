import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "react-hot-toast";

import {
  createChat,
  findChats,
  loadChat,
  loadChats,
  removeChat,
  resetActiveChat,
  sendMessageStream,
} from "../chat.slice.js";
import useChat from "../hook/useChat.js";

const ChatPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chatId } = useParams();
  useChat(chatId);

  const { user } = useSelector((state) => state.auth);
  const {
    chats,
    activeChat,
    messages,
    loading,
    creating,
    sending,
    deleting,
    error,
  } = useSelector((state) => state.chat);
  const effectiveChatId = chatId || activeChat?._id || null;

  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [menuChatId, setMenuChatId] = useState(null);
  const messageEnd = useRef(null);
  const newChatLock = useRef(false);

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
    messageEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleNewChat = async () => {
    if (creating || newChatLock.current) return;
    newChatLock.current = true;
    try {
      const chat = await dispatch(createChat()).unwrap();
      setDraft("");
      setMenuChatId(null);
      navigate(`/chats/${chat._id}`);
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Unable to create chat",
      );
    } finally {
      newChatLock.current = false;
    }
  };

  const handleOpenChat = (selectedChatId) => {
    if (!selectedChatId || selectedChatId === chatId) {
      setMenuChatId(null);
      return;
    }
    setDraft("");
    setMenuChatId(null);
    navigate(`/chats/${selectedChatId}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const message = draft.trim();

    if (!message || sending) return;

    setDraft("");

    const textarea = event.currentTarget.querySelector("textarea");
    if (textarea) {
      textarea.style.height = "auto";
    }

    try {
      await dispatch(
        sendMessageStream({
          chatId: effectiveChatId,
          message,
        }),
      ).unwrap();
    } catch (error) {
      console.error("Message send failed:", error);

      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to send message",
      );

      setDraft(message);
    }
  };

  const handleDeleteChat = async (targetChatId) => {
    if (!targetChatId || deleting) return;
    const targetChat = chats.find((chat) => chat._id === targetChatId);
    if (!targetChat) return;

    if (!window.confirm(`Delete "${targetChat.title || "New Chat"}"?`)) {
      setMenuChatId(null);
      return;
    }

    try {
      await dispatch(removeChat(targetChatId)).unwrap();
      setMenuChatId(null);
      toast.success("Chat deleted");
      if (targetChatId === chatId) {
        const remainingChats = chats.filter(
          (chat) => chat._id !== targetChatId,
        );
        if (remainingChats.length > 0)
          navigate(`/chats/${remainingChats[0]._id}`, { replace: true });
        else navigate("/chats", { replace: true });
      }
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Unable to delete chat",
      );
    }
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setQuery(value);
    if (value.trim()) dispatch(findChats(value.trim()));
    else dispatch(loadChats());
  };

  return (
    // FIX 1: min-h-screen hata kar h-screen aur overflow-hidden lagaya taaki global scrollbar na aaye
    <main className="h-screen w-full bg-[#101214] text-[#f5f3ed] overflow-hidden">
      <div className="flex h-full w-full">
        {/* SIDEBAR */}
        <aside className="hidden w-80 shrink-0 flex-col border-r border-white/10 bg-[#17191b] lg:flex h-full">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 shrink-0">
            <div>
              <p className="font-mono-label text-[10px] uppercase tracking-[0.28em] text-[#e8a33d]">
                KNOW AI
              </p>
              <h1 className="font-display text-2xl">Conversations</h1>
            </div>
            <button
              type="button"
              onClick={handleNewChat}
              disabled={creating}
              className="rounded-full bg-[#e8a33d] px-3 py-2 text-xs font-bold text-[#17191b] transition hover:bg-[#f2bc65] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "..." : "+"}
            </button>
          </div>
          <div className="px-5 py-4 shrink-0">
            <input
              value={query}
              onChange={handleSearch}
              placeholder="Search conversations"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[#e8a33d]"
            />
          </div>

          {/* FIX 3: Sidebar scroll area with custom thin scrollbar */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
            {loading && !chats.length && (
              <div className="px-3 py-5 text-center text-xs text-white/30">
                Loading chats...
              </div>
            )}
            {chats.map((chat) => (
              <div key={chat._id} className="group relative">
                <button
                  type="button"
                  onClick={() => handleOpenChat(chat._id)}
                  className={`w-full rounded-lg px-3 py-3 pr-12 text-left transition ${chat._id === chatId ? "bg-white/10" : "hover:bg-white/5"}`}
                >
                  <span className="block truncate text-sm font-medium">
                    {chat.title || "New Chat"}
                  </span>
                  <span className="mt-1 block font-mono-label text-[10px] uppercase tracking-wider text-white/35">
                    {chat.updatedAt
                      ? new Date(chat.updatedAt).toLocaleDateString()
                      : ""}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuChatId((c) => (c === chat._id ? null : chat._id));
                  }}
                  className="absolute right-2 top-2 rounded-md px-2 py-1 text-lg leading-none text-white/40 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
                >
                  ⋯
                </button>
                {menuChatId === chat._id && (
                  <div className="absolute right-2 top-10 z-50 w-32 overflow-hidden rounded-lg border border-white/10 bg-[#202326] shadow-xl">
                    <button
                      type="button"
                      onClick={() => handleDeleteChat(chat._id)}
                      className="w-full px-3 py-2 text-left text-xs text-red-300 transition hover:bg-red-500/10"
                    >
                      Delete chat
                    </button>
                  </div>
                )}
              </div>
            ))}
            {!loading && !chats.length && (
              <div className="px-3 py-8 text-center text-xs text-white/30">
                No conversations
              </div>
            )}
          </nav>

          <div className="border-t border-white/10 px-5 py-4 text-sm text-white/60 shrink-0">
            {user?.username || user?.email}
          </div>
        </aside>

        {/* MAIN CHAT */}
        <section className="flex min-w-0 flex-1 flex-col h-full relative">
          <header className="border-b border-white/10 px-4 py-4 sm:px-8 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono-label text-[10px] uppercase tracking-[0.25em] text-[#e8a33d]">
                  Live workspace
                </p>
                <h2 className="truncate font-display text-2xl sm:text-3xl">
                  {activeChat?.title || "New conversation"}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={chatId || ""}
                  onChange={(e) => handleOpenChat(e.target.value)}
                  className="max-w-32 rounded-lg border border-white/15 bg-[#191c1f] px-2 py-2 text-xs outline-none lg:hidden"
                >
                  <option value="">Chats</option>
                  {chats.map((chat) => (
                    <option key={chat._id} value={chat._id}>
                      {chat.title || "New Chat"}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleNewChat}
                  disabled={creating}
                  className="rounded-lg border border-white/15 px-3 py-2 text-xs transition hover:border-[#e8a33d] disabled:opacity-50"
                >
                  {creating ? "Creating..." : "New"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteChat(chatId)}
                  disabled={!chatId || deleting}
                  className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/60 transition hover:border-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </header>

          {/* FIX 2: Only Chat area will scroll now, with a sleek custom scrollbar */}
          <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-10 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
            <div className="mx-auto max-w-3xl space-y-7">
              {loading && !messages.length && (
                <div className="py-16 text-center font-mono-label text-xs uppercase tracking-[0.2em] text-white/35">
                  Loading conversation
                </div>
              )}
              {!loading && !messages.length && (
                <div className="py-20 text-center">
                  <p className="font-display text-4xl">
                    What are you thinking about?
                  </p>
                  <p className="mt-3 text-sm text-white/45">
                    Ask KNOW AI to research, explain, or build something.
                  </p>
                </div>
              )}
              {messages.map((message) => (
                <article
                  key={message._id}
                  className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-5 py-4 text-[15px] leading-7 ${message.role === "user" ? "bg-[#e8a33d] text-[#17191b]" : "border border-white/10 bg-[#191c1f] text-white/85"}`}
                  >
                    <p className="mb-2 font-mono-label text-[10px] uppercase tracking-[0.18em] opacity-55">
                      {message.role === "user" ? "You" : "KNOW AI"}
                    </p>
                    {message.role === "assistant" ? (
                      <div className="prose prose-invert max-w-none prose-p:my-2 prose-pre:overflow-x-auto">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </article>
              ))}
              {sending && (
                <div className="flex items-center gap-3 text-sm text-white/45">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#e8a33d]" />{" "}
                  KNOW AI is thinking...
                </div>
              )}
              <div ref={messageEnd} />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 bg-[#141618] px-4 py-4 sm:px-10 shrink-0"
          >
            <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-2 focus-within:border-[#e8a33d]/70">
              <textarea
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  event.target.style.height = "auto";
                  event.target.style.height = event.target.scrollHeight + "px";
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form.requestSubmit();
                  }
                }}
                rows={1}
                placeholder="Message KNOW AI..."
                disabled={sending}
                className="max-h-36 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-3 text-sm outline-none placeholder:text-white/30 disabled:cursor-not-allowed disabled:opacity-50 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20"
              />
              <button
                type="submit"
                disabled={!draft.trim() || sending}
                className="rounded-lg bg-[#e8a33d] px-4 py-3 text-sm font-bold text-[#17191b] transition hover:bg-[#f2bc65] disabled:cursor-not-allowed disabled:opacity-40 mb-1"
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
            <p className="mx-auto mt-2 max-w-3xl text-[11px] text-white/30">
              Enter to send · Shift + Enter for a new line
            </p>
          </form>
        </section>
      </div>
    </main>
  );
};

export default ChatPage;

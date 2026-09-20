import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Home,
  Compass,
  History,
  Bookmark,
  FileText,
  Search,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Trash2,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../../auth/hook/useAuth";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home, active: true },
  { key: "discover", label: "Discover", icon: Compass, active: false },
  { key: "history", label: "History", icon: History, active: false },
  { key: "saved", label: "Saved", icon: Bookmark, active: false },
  { key: "files", label: "Files", icon: FileText, active: false },
];

const ChatMenu = ({ chat, onRename, onTogglePin, onDelete, onClose }) => (
  <div
    className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-lg border border-white/10 bg-[#17191c] shadow-xl"
    onMouseLeave={onClose}
  >
    <button
      type="button"
      onClick={() => {
        onClose();
        onRename(chat);
      }}
      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#ece9e2]/70 hover:bg-white/5"
    >
      <Pencil className="h-3.5 w-3.5" />
      Rename
    </button>
    <button
      type="button"
      onClick={() => {
        onClose();
        onTogglePin(chat._id, !chat.pinned);
      }}
      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#ece9e2]/70 hover:bg-white/5"
    >
      {chat.pinned ? (
        <PinOff className="h-3.5 w-3.5" />
      ) : (
        <Pin className="h-3.5 w-3.5" />
      )}
      {chat.pinned ? "Unpin" : "Pin"}
    </button>
    <button
      type="button"
      onClick={() => {
        onClose();
        onDelete(chat._id);
      }}
      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Delete
    </button>
  </div>
);

const ChatRow = ({
  chat,
  activeChatId,
  openMenuId,
  setOpenMenuId,
  onOpenChat,
  onRenameChat,
  onTogglePin,
  onDeleteChat,
}) => (
  <div key={chat._id} className="group relative">
    <button
      type="button"
      onClick={() => onOpenChat(chat._id)}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
        activeChatId === chat._id
          ? "bg-[#e8a33d]/10 text-[#ece9e2] border-l-2 border-[#e8a33d]"
          : "border-l-2 border-transparent text-[#ece9e2]/60 hover:bg-white/[0.04] hover:text-[#ece9e2]/85"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2 truncate pr-2">
        {chat.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-[#e8a33d]" />}
        <span className="truncate">{chat.title || "New Chat"}</span>
      </span>
      <MoreHorizontal
        className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-60"
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId(chat._id);
        }}
      />
    </button>
    {openMenuId === chat._id && (
      <ChatMenu
        chat={chat}
        onRename={onRenameChat}
        onTogglePin={onTogglePin}
        onDelete={onDeleteChat}
        onClose={() => setOpenMenuId(null)}
      />
    )}
  </div>
);

const Sidebar = ({
  chats,
  loading,
  activeChatId,
  query,
  onQueryChange,
  onNewChat,
  onOpenChat,
  onRenameChat,
  onTogglePin,
  onDeleteChat,
  user,
  className = "",
  onClose,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  const pinnedChats = chats.filter((chat) => chat.pinned);
  const recentChats = chats.filter((chat) => !chat.pinned);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside
      className={`w-72 shrink-0 flex-col border-r border-white/8 bg-[#121417] ${className}`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <span className="font-['Inter',sans-serif] text-lg font-bold tracking-tight text-[#ece9e2]">
            KNOW <span className="text-[#e8a33d]">AI</span>
          </span>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ece9e2]/35">
            AI Search Engine
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#ece9e2]/50 hover:bg-white/5 hover:text-[#ece9e2] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* NEW SEARCH */}
      <div className="px-4">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e8a33d] px-4 py-2.5 text-sm font-semibold text-[#101214] transition-colors hover:bg-[#f0b563]"
        >
          <Plus className="h-4 w-4" />
          New Search
        </button>
      </div>

      {/* NAV */}
      <nav className="mt-5 px-3">
        {NAV_ITEMS.map(({ key, label, icon: Icon, active }) => (
          <button
            key={key}
            type="button"
            disabled={!active}
            onClick={active ? onNewChat : undefined}
            className={`mb-0.5 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "text-[#ece9e2]/80 hover:bg-white/5 hover:text-[#ece9e2]"
                : "cursor-not-allowed text-[#ece9e2]/25"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Icon className="h-4 w-4" />
              {label}
            </span>
            {!active && (
              <span className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#ece9e2]/30">
                Soon
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* SEARCH CONVERSATIONS */}
      <div className="mt-5 px-4">
        <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-[#ece9e2]/40" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search conversations"
            className="w-full bg-transparent text-xs text-[#ece9e2] placeholder-[#ece9e2]/35 outline-none"
          />
        </div>
      </div>

      {/* PINNED + RECENT */}
      <div className="mt-5 flex-1 overflow-y-auto px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading && (
          <div className="space-y-1.5 px-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-8 animate-pulse rounded-lg bg-white/[0.04]"
              />
            ))}
          </div>
        )}

        {!loading && !chats.length && (
          <p className="px-2 py-2 text-xs text-[#ece9e2]/30">No recent chats</p>
        )}

        {!loading && (
          <>
            {pinnedChats.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between px-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e8a33d]">
                    Pinned
                  </p>
                  <span className="rounded-full border border-[#e8a33d]/20 bg-[#e8a33d]/10 px-1.5 py-0.5 text-[9px] text-[#e8a33d]">
                    {pinnedChats.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {pinnedChats.map((chat) => (
                    <ChatRow
                      key={chat._id}
                      chat={chat}
                      activeChatId={activeChatId}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      onOpenChat={onOpenChat}
                      onRenameChat={onRenameChat}
                      onTogglePin={onTogglePin}
                      onDeleteChat={onDeleteChat}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ece9e2]/30">
                Recent
              </p>
              <div className="space-y-1.5">
                {recentChats.length === 0 && pinnedChats.length > 0 ? (
                  <p className="px-2 py-2 text-xs text-[#ece9e2]/30">
                    No recent chats
                  </p>
                ) : (
                  recentChats.map((chat) => (
                    <ChatRow
                      key={chat._id}
                      chat={chat}
                      activeChatId={activeChatId}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      onOpenChat={onOpenChat}
                      onRenameChat={onRenameChat}
                      onTogglePin={onTogglePin}
                      onDeleteChat={onDeleteChat}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* USER / LOGOUT (Settings Removed) */}
      <div className="border-t border-white/8 p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8a33d]/15 text-xs font-bold text-[#e8a33d]">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[#ece9e2]">
              {user?.username || "User"}
            </p>
            <p className="truncate text-[10px] text-[#ece9e2]/40">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs text-[#ece9e2]/60 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

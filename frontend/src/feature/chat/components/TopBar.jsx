import React from "react";
import { Menu, Share2, Trash2 } from "lucide-react";

const TopBar = ({
  title,
  hasChat,
  deleting,
  onOpenSidebar,
  onNewChat,
  onDelete,
}) => {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-lg p-1.5 text-[#ece9e2]/60 hover:bg-white/5 hover:text-[#ece9e2] lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-sm font-medium text-[#ece9e2]/85">
          {title}
        </h1>
      </div>

      {hasChat && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-2 text-[#ece9e2]/50 hover:bg-white/5 hover:text-[#ece9e2]"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="rounded-lg p-2 text-[#ece9e2]/50 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
            aria-label="Delete chat"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  );
};

export default TopBar;
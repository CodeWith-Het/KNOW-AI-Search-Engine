import React from "react";

const DeleteModal = ({ isOpen, onClose, onConfirm, title, deleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1c1e22] p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-[#ece9e2]">Delete Chat</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#ece9e2]/60">
          Are you sure you want to delete{" "}
          <span className="font-medium text-[#ece9e2]">"{title}"</span>? This
          action cannot be undone.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#ece9e2]/70 transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
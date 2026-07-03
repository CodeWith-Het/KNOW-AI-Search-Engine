import React, { useEffect } from "react";

const PopupBox = ({ isOpen, message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-[#111827] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[100] animate-fade-in-down border border-gray-700 min-w-[320px]">
      {/* Green Checkmark Icon */}
      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 shadow-lg">
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      </div>

      {/* Text Content */}
      <div className="flex-1">
        <h4 className="font-bold text-sm tracking-wide">Success!</h4>
        <p className="text-xs text-gray-300 mt-0.5">{message}</p>
      </div>

      {/* Animated Timer Bar */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-emerald-500 rounded-b-2xl"
        style={{ animation: `shrink ${duration}ms linear forwards` }}
      ></div>
    </div>
  );
};

export default PopupBox;
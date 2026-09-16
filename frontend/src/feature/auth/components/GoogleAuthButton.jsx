import React from "react";

const GoogleAuthButton = () => {
   const handleGoogleAuth = () => {
     window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
   };

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      className="w-full flex items-center justify-center gap-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-900 dark:text-white font-semibold rounded-xl px-4 py-3.5 transition-all duration-200"
    >
      {/* Google Icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#4285F4"
          d="M21.35 12.27c0-.79-.07-1.54-.23-2.27H12v4.3h5.21a4.45 4.45 0 0 1-1.93 2.92v2.42h3.12c1.83-1.69 2.95-4.18 2.95-7.37Z"
        />
        <path
          fill="#34A853"
          d="M12 21.99c2.61 0 4.8-.86 6.4-2.35l-3.12-2.42c-.86.58-1.96.92-3.28.92-2.52 0-4.66-1.7-5.43-3.99H3.35v2.5A9.66 9.66 0 0 0 12 21.99Z"
        />
        <path
          fill="#FBBC05"
          d="M6.57 14.15A5.8 5.8 0 0 1 6.27 12c0-.75.13-1.47.3-2.15v-2.5H3.35A9.98 9.98 0 0 0 2.25 12c0 1.61.39 3.13 1.1 4.5l3.22-2.35Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.86c1.42 0 2.69.49 3.69 1.45l2.77-2.77C16.8 2.97 14.61 2 12 2a9.66 9.66 0 0 0-8.65 5.35l3.22 2.5 1.61-1.25C7.34 7.56 9.48 5.86 12 5.86Z"
        />
      </svg>

      Continue with Google
    </button>
  );
};

export default GoogleAuthButton;
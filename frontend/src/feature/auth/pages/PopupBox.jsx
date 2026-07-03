import { useEffect, useRef, useState } from "react";

const TOTAL_SECONDS = 15 * 60;

const PopupBox = ({ isOpen, email, onClose, onLogin, onResend }) => {
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      const exitTimer = window.setTimeout(() => setIsVisible(false), 180);
      return () => window.clearTimeout(exitTimer);
    }

    setIsVisible(true);
    setTimeLeft(TOTAL_SECONDS);
    setIsExpired(false);

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    document.body.style.overflow = "hidden";

    return () => {
      window.clearInterval(timer);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const focusableElements = dialogRef.current.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0];
    firstElement?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== "Tab") return;

      if (!focusableElements.length) {
        event.preventDefault();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialogRef.current.addEventListener("keydown", handleKeyDown);

    return () =>
      dialogRef.current?.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen && !isVisible) return null;

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  const progressPercent = (timeLeft / TOTAL_SECONDS) * 100;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-xl transition-all duration-300 ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        className={`w-full max-w-2xl scale-100 rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 sm:p-8 lg:p-10 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_45%)]" />

        <div className="relative flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/10 sm:h-20 sm:w-20">
            <svg
              className="h-8 w-8 sm:h-10 sm:w-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2
            id="popup-title"
            className="text-2xl font-semibold text-white sm:text-3xl"
          >
            Account Created Successfully
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            We&apos;ve sent a verification email to{" "}
            {email || "your registered email address"}. Please verify your
            account within 15 minutes.
          </p>

          <div className="mt-8 flex w-full flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-slate-900/70 shadow-inner shadow-black/30">
              <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  stroke="#10b981"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={
                    2 * Math.PI * 48 * (1 - progressPercent / 100)
                  }
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-2xl font-semibold text-white">
                  {minutes}:{seconds}
                </div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                  Minutes
                </div>
              </div>
            </div>

            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-4 text-left sm:p-5">
              <p className="text-sm font-medium text-white">
                Verification status
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                {isExpired
                  ? "Verification link expired."
                  : "Your verification link remains valid for the countdown shown above."}
              </p>
            </div>
          </div>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                onLogin?.();
                onClose?.();
              }}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Go to Login
            </button>
            <button
              type="button"
              onClick={() => onResend?.()}
              disabled={!isExpired}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Resend Verification Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupBox;

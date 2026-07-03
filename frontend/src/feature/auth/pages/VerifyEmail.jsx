import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const AUTO_REDIRECT_SECONDS = 6;

const reasonMessages = {
  TOKEN_NOT_PROVIDED: "Verification link is missing its token.",
  INVALID_TOKEN: "This link is invalid or has expired.",
  USER_NOT_FOUND: "We couldn't find an account for this link.",
  SERVER_ERROR: "Something went wrong on our end. Please try again.",
};

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status"); // "success" | "error"
  const username = searchParams.get("username");
  const already = searchParams.get("already") === "true";
  const reason = searchParams.get("reason");

  const isSuccess = status === "success";
  const [secondsLeft, setSecondsLeft] = useState(AUTO_REDIRECT_SECONDS);

  useEffect(() => {
    if (!isSuccess) return;
    if (secondsLeft <= 0) {
      navigate("/login", { replace: true });
      return;
    }
    const tick = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(tick);
  }, [isSuccess, secondsLeft, navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--paper)] font-['Inter',sans-serif] px-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[var(--violet)]/10 blur-3xl animate-orb" />
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[var(--amber)]/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--line)] bg-white shadow-[0_30px_70px_-20px_rgba(18,19,26,0.15)] overflow-hidden animate-fade-up">
        <div className="p-9 text-center">
          {isSuccess ? (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-[var(--violet)]/10 flex items-center justify-center mb-5">
                <svg
                  className="w-8 h-8 text-[var(--violet)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <span className="font-mono-label text-[10px] tracking-[0.2em] text-[var(--amber)] uppercase">
                {already ? "Already verified" : "Verified"}
              </span>
              <h1 className="font-display text-[var(--ink)] text-2xl mt-2">
                {already ? "You're all set" : "Email verified"}
              </h1>
              <p className="mt-3 text-sm text-[var(--ink-soft)] leading-relaxed">
                {already ? (
                  "This account was already verified."
                ) : (
                  <>
                    Welcome aboard
                    {username ? (
                      <>
                        ,{" "}
                        <span className="font-semibold text-[var(--ink)]">
                          {username}
                        </span>
                      </>
                    ) : null}
                    . Your account is active now.
                  </>
                )}
              </p>

              <button
                onClick={() => navigate("/login", { replace: true })}
                className="mt-7 w-full rounded-xl bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[var(--violet-deep)]"
              >
                Sign in now
              </button>

              <p className="mt-5 font-mono-label text-xs text-[var(--ink-soft)]">
                Redirecting to sign in in{" "}
                <span className="font-semibold text-[var(--ink)]">
                  {secondsLeft}s
                </span>
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <span className="font-mono-label text-[10px] tracking-[0.2em] text-red-400 uppercase">
                Verification failed
              </span>
              <h1 className="font-display text-[var(--ink)] text-2xl mt-2">
                Link didn't work
              </h1>
              <p className="mt-3 text-sm text-[var(--ink-soft)] leading-relaxed">
                {reasonMessages[reason] || "We couldn't verify your email."}
              </p>

              <div className="mt-7 flex flex-col gap-3">
                <Link
                  to="/register"
                  className="w-full rounded-xl bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[var(--violet-deep)] text-center"
                >
                  Register again
                </Link>
                <Link
                  to="/login"
                  className="w-full rounded-xl border border-[var(--line)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition-all hover:border-[var(--violet)] hover:text-[var(--violet)] text-center"
                >
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>

        {isSuccess && (
          <div className="h-1 w-full bg-[var(--line)]">
            <div
              className="h-full bg-[var(--amber)]"
              style={{
                animation: `shrink ${AUTO_REDIRECT_SECONDS}s linear forwards`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

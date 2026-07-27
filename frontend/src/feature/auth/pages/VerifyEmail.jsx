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

  const status = searchParams.get("status");
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
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-950 font-sans px-4 relative overflow-hidden text-neutral-100">
      {/* Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="p-8 sm:p-10 text-center">
          {isSuccess ? (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 text-emerald-400">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <span className="font-mono text-xs tracking-[0.2em] text-emerald-400 uppercase font-semibold">
                {already ? "ALREADY VERIFIED" : "VERIFIED"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                {already ? "You're all set" : "Email verified"}
              </h1>
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                {already ? (
                  "This account was already verified."
                ) : (
                  <>
                    Welcome aboard
                    {username ? (
                      <>
                        ,{" "}
                        <span className="font-semibold text-white">
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
                className="mt-7 w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-neutral-950 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:bg-emerald-400 transition-all"
              >
                Sign in now
              </button>

              <p className="mt-5 font-mono text-xs text-neutral-500">
                Redirecting to sign in in{" "}
                <span className="font-semibold text-emerald-400">
                  {secondsLeft}s
                </span>
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 text-red-400">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <span className="font-mono text-xs tracking-[0.2em] text-red-400 uppercase font-semibold">
                VERIFICATION FAILED
              </span>
              <h1 className="text-2xl font-bold text-white mt-1">
                Link didn't work
              </h1>
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                {reasonMessages[reason] || "We couldn't verify your email."}
              </p>

              <div className="mt-7 flex flex-col gap-3">
                <Link
                  to="/register"
                  className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-neutral-950 hover:bg-emerald-400 transition-all text-center"
                >
                  Register again
                </Link>
                <Link
                  to="/login"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 py-3 text-sm font-semibold text-neutral-300 hover:border-neutral-700 hover:text-white transition-all text-center"
                >
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Dynamic Progress Bar for Auto Redirect */}
        {isSuccess && (
          <div className="h-1 w-full bg-neutral-800">
            <div
              className="h-full bg-emerald-400 transition-all duration-1000 ease-linear"
              style={{
                width: `${(secondsLeft / AUTO_REDIRECT_SECONDS) * 100}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
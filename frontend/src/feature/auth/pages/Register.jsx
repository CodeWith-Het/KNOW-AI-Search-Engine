import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const citationNotes = [
  { n: "01", text: "Every answer is traced back to its source." },
  { n: "02", text: "No noise, no scroll. Just the synthesis." },
  { n: "03", text: "Ask once, follow the thread anywhere." },
];

const fields = ["username", "email", "password"];

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resending, setResending] = useState(false);

  const { registerUser, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (user && !loading && !registered) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setResendMessage("");
    toast("Check your mail inbox for verification", { icon: "📩" });
    try {
      await registerUser(formData);
      setRegistered(true);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMessage("");
    try {
      await resendVerificationEmail(formData.email);
      setResendMessage("Verification email resent.");
    } catch (error) {
      setResendMessage(error.message || "Unable to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--paper)] font-['Inter',sans-serif]">
      {/* LEFT — signature panel, hidden on mobile */}
      <div className="relative hidden md:flex md:w-[44%] lg:w-[40%] flex-col justify-between overflow-hidden bg-[var(--ink)] px-12 py-14">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[var(--violet)]/30 blur-3xl animate-orb" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[var(--amber)]/10 blur-3xl" />

        <div className="relative z-10">
          <span className="font-mono-label text-xs tracking-[0.2em] text-[var(--amber)] uppercase">
            KNOW AI
          </span>
          <h1 className="font-display text-white text-4xl lg:text-[2.75rem] leading-[1.1] mt-6">
            Join the
            <br />
            <span className="italic text-[var(--amber)]">next generation</span>
            <br />
            of search.
          </h1>
        </div>

        <div className="relative z-10 space-y-6">
          {citationNotes.map((note, i) => (
            <div key={note.n} className="flex items-start gap-4">
              <div className="relative mt-1 flex flex-col items-center">
                <span
                  className="w-2.5 h-2.5 rounded-full bg-[var(--amber)] animate-node"
                  style={{ animationDelay: `${i * 0.4}s` }}
                />
                {i !== citationNotes.length - 1 && (
                  <span className="w-px h-10 bg-white/35 mt-2" />
                )}
              </div>
              <p className="text-white/70 text-sm leading-relaxed pt-0.5">
                <span className="font-mono-label text-[var(--amber)] mr-2">
                  {note.n}
                </span>
                {note.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — form (stays mounted, blurred behind the popup once registered) */}
      <div
        className={`flex-1 flex items-center justify-center px-6 py-14 transition-all duration-300 ${
          registered
            ? "blur-sm scale-[0.99] pointer-events-none select-none"
            : ""
        }`}
      >
        {
          <div className="w-full max-w-md animate-fade-up">
            <div className="mb-9">
              <span className="font-mono-label text-xs tracking-[0.2em] text-[var(--ink-soft)] uppercase md:hidden">
                kNOW AI
              </span>
              <h2 className="font-display text-[var(--ink)] text-3xl md:text-[2.25rem] mt-2">
                Create account
              </h2>
              <p className="mt-3 text-sm text-[var(--ink-soft)]">
                Join to experience the next generation of search.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {fields.map((field) => (
                <div key={field}>
                  <label
                    htmlFor={field}
                    className="mb-2 block text-xs font-semibold text-[var(--ink)] uppercase tracking-wide"
                  >
                    {field}
                  </label>
                  <input
                    type={
                      field === "password"
                        ? "password"
                        : field === "email"
                          ? "email"
                          : "text"
                    }
                    id={field}
                    name={field}
                    placeholder={
                      field === "email"
                        ? "you@example.com"
                        : field === "password"
                          ? "••••••••"
                          : "your_username"
                    }
                    value={formData[field]}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-[var(--ink)] outline-none transition-all focus:ring-4 focus:ring-[var(--violet)]/15 focus:border-[var(--violet)] ${
                      errors[field]
                        ? "border-red-400 focus:ring-red-100 focus:border-red-500"
                        : "border-[var(--line)]"
                    }`}
                  />
                  {errors[field] && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors[field]}
                    </p>
                  )}
                </div>
              ))}

              {errors.submit && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 font-medium">
                  {errors.submit}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded-xl bg-[var(--ink)] px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(91,79,233,0.5)] transition-all hover:bg-[var(--violet-deep)] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isLoading ? "Creating…" : "Sign up"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-[var(--ink-soft)]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[var(--violet)] hover:text-[var(--violet-deep)] font-semibold"
              >
                Sign in
              </Link>
            </div>
          </div>
        }
      </div>

      {/* 📩 EMAIL VERIFICATION POPUP */}
      {registered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div className="relative w-full max-w-md rounded-2xl border border-[var(--line)] bg-white shadow-[0_30px_70px_-20px_rgba(18,19,26,0.35)] overflow-hidden animate-fade-up">
            <div className="p-8 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-[var(--violet)]/10 flex items-center justify-center mb-5">
                <svg
                  className="w-7 h-7 text-[var(--violet)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <span className="font-mono-label text-[10px] tracking-[0.2em] text-[var(--amber)] uppercase">
                One more step
              </span>
              <h2 className="font-display text-[var(--ink)] text-2xl mt-2">
                Verify your email
              </h2>
              <p className="mt-3 text-sm text-[var(--ink-soft)] leading-relaxed">
                We've sent a verification link to{" "}
                <span className="font-semibold text-[var(--ink)]">
                  {formData.email}
                </span>
                . Open your inbox and click it to activate your account — then
                come back and sign in.
              </p>

              {resendMessage && (
                <p className="mt-4 text-xs font-medium text-[var(--violet)]">
                  {resendMessage}
                </p>
              )}

              <div className="mt-7 flex flex-col gap-3">
                <button
                  onClick={() => navigate("/login", { replace: true })}
                  className="w-full rounded-xl bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[var(--violet-deep)]"
                >
                  Sign in now
                </button>
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full rounded-xl border border-[var(--line)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition-all hover:border-[var(--violet)] hover:text-[var(--violet)] disabled:opacity-50"
                >
                  {resending ? "Resending…" : "Didn't get it? Resend email"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
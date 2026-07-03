import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "./../hook/useAuth";

const citationNotes = [
  { n: "01", text: "Every answer is traced back to its source." },
  { n: "02", text: "No noise, no scroll. Just the synthesis." },
  { n: "03", text: "Ask once, follow the thread anywhere." },
];

const Login = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { loginUser } = useAuth();
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.emailOrUsername.trim())
      newErrors.emailOrUsername = "Identifier is required";
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
    try {
      await loginUser({
        loginId: formData.emailOrUsername,
        password: formData.password,
      });
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--paper)] font-['Inter',sans-serif]">
      {/* LEFT — signature panel, hidden on mobile */}
      <div className="relative hidden md:flex md:w-[44%] lg:w-[40%] flex-col justify-between overflow-hidden bg-[var(--ink)] px-12 py-14">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[var(--violet)]/30 blur-3xl animate-orb" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[var(--amber)]/10 blur-3xl" />

        <div className="relative z-10">
          <span className="font-mono-label text-2xl tracking-[0.2em] text-[var(--amber)] uppercase">
            KNOW AI
          </span>
          <h1 className="font-display text-white text-4xl lg:text-[2.75rem] leading-[1.1] mt-6">
            Every question
            <br />
            deserves a{" "}
            <span className="italic text-[var(--amber)]">traced</span>
            <br />
            answer.
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
                  <span className="w-px h-10 bg-white/15 mt-2" />
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

      {/* RIGHT — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-9">
            <span className="font-mono-label text-2xl tracking-[0.2em] text-[var(--ink-soft)] uppercase md:hidden">
              KNOW AI
            </span>
            <h2 className="font-display text-[var(--ink)] text-3xl md:text-[2.25rem] mt-2">
              Welcome back
            </h2>
            <p className="mt-3 text-sm text-[var(--ink-soft)]">
              Sign in to continue your research.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="emailOrUsername"
                className="mb-2 block text-xs font-semibold text-[var(--ink)] uppercase tracking-wide"
              >
                Email or Username
              </label>
              <input
                type="text"
                id="emailOrUsername"
                name="emailOrUsername"
                placeholder="you@example.com"
                value={formData.emailOrUsername}
                onChange={handleChange}
                className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-[var(--ink)] outline-none transition-all focus:ring-4 focus:ring-[var(--violet)]/15 focus:border-[var(--violet)] ${
                  errors.emailOrUsername
                    ? "border-red-400 focus:ring-red-100 focus:border-red-500"
                    : "border-[var(--line)]"
                }`}
              />
              {errors.emailOrUsername && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {errors.emailOrUsername}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold text-[var(--ink)] uppercase tracking-wide"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-[var(--ink)] outline-none transition-all focus:ring-4 focus:ring-[var(--violet)]/15 focus:border-[var(--violet)] ${
                  errors.password
                    ? "border-red-400 focus:ring-red-100 focus:border-red-500"
                    : "border-[var(--line)]"
                }`}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

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
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-[var(--ink-soft)]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[var(--violet)] hover:text-[var(--violet-deep)] font-semibold"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

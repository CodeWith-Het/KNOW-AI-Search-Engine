import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom"; // 🎯 Navigate import kiya
import { useSelector } from "react-redux"; // 🎯 useSelector import kiya
import { useAuth } from "./../hook/useAuth";

const Login = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { loginUser } = useAuth();

  // 🎯 NAYA LOGIC: Redux se user check karo
  const user = useSelector((state) => state.auth.user);

  // Agar user pehle se login hai, toh seedha Home par bhej do!
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.emailOrUsername.trim()) {
      newErrors.emailOrUsername = "Email or username is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.55)] backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="inline-flex rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-sm shadow-violet-500/20">
            Login
          </p>
          <h1 className="mt-6 text-3xl font-semibold text-white">
            Welcome Back
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Sign in to your account to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="emailOrUsername"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Email or Username
            </label>
            <input
              type="text"
              id="emailOrUsername"
              name="emailOrUsername"
              placeholder="Enter your email or username"
              value={formData.emailOrUsername}
              onChange={handleChange}
              className={`w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 ${errors.emailOrUsername ? "border-rose-500 ring-rose-500/20" : ""}`}
            />
            {errors.emailOrUsername && (
              <p className="mt-2 text-sm text-rose-400">
                {errors.emailOrUsername}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 ${errors.password ? "border-rose-500 ring-rose-500/20" : ""}`}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-rose-400">{errors.password}</p>
            )}
          </div>

          {errors.submit && (
            <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-3xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-violet-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-3 text-center text-sm text-slate-400">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-white hover:text-violet-300"
            >
              Sign Up 
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
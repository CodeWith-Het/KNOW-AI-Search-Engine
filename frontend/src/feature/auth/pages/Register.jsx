import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import { useSelector } from "react-redux";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { registerUser } = useAuth()
  
  const user = useSelector((state) => state.auth.user)
  const loading = useSelector((state) => state.auth.loading)
  
  if (user && !loading) {
    return <Navigate to="/login" replace />
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

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
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
      await registerUser({
        username: formData.username,
        email: formData.email,
        password:formData.password
      })
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
            Register
          </p>
          <h1 className="mt-6 text-3xl font-semibold text-white">
            Create Account
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Join us today and get access to everything.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 ${errors.username ? "border-rose-500 ring-rose-500/20" : ""}`}
            />
            {errors.username && (
              <p className="mt-2 text-sm text-rose-400">{errors.username}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 ${errors.email ? "border-rose-500 ring-rose-500/20" : ""}`}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-rose-400">{errors.email}</p>
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
              placeholder="Create a strong password"
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
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-3 text-center text-sm text-slate-400">
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-white hover:text-violet-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

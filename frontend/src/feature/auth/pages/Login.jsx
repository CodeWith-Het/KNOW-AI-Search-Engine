import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login Data:", formData);
    // navigate("/chat");
  };

  const loginIcon = (
    <svg
      className="w-8 h-8 text-emerald-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
      ></path>
    </svg>
  );

  return (
    <AuthLayout
      leftTitle={
        <>
          Welcome back to <br />{" "}
          <span className="text-emerald-500">Your Workspace.</span>
        </>
      }
      leftSubtitle="Sign in to continue your research, track live stock data, and command your AI agent."
      icon={loginIcon}
    >
      <div className="mb-10">
        {/* Mobile only logo */}
        <div className="lg:hidden w-10 h-10 bg-white text-black font-bold text-xl flex justify-center items-center rounded-sm mb-6">
          K
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Sign In</h2>
        <p className="text-sm text-gray-400 mt-2">
          Enter your details to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-400">
              Password
            </label>
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-white text-black hover:bg-gray-200 font-semibold rounded-xl px-4 py-3.5 mt-6 transition-all duration-200 shadow-lg shadow-white/10"
        >
          Sign In
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-8">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-white hover:text-emerald-400 font-medium transition-colors"
        >
          Sign up for free
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
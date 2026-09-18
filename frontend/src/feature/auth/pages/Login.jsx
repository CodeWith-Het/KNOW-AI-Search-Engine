import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

import AuthLayout from "./AuthLayout";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";
import { useAuth } from "../hook/useAuth.js";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
  });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");

    if (error === "EMAIL_ALREADY_REGISTERED") {
      toast.error(
        "An account already exists with this email. Please login using your email and password.",
      );

      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const user = await loginUser({
        loginId: formData.loginId.trim(),
        password: formData.password,
      });

      toast.success("Signed in successfully.");

      navigate(`/chats/${user.id}`, {
        replace: true,
      });
    } catch (error) {
      toast.error(error?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3v1"
      />
    </svg>
  );

  return (
    <>
      <Toaster position="top-right" />

      <AuthLayout
        leftTitle={
          <>
            Welcome back to <br />
            <span className="text-emerald-500">Your Workspace.</span>
          </>
        }
        leftSubtitle="Sign in to continue your research, track live stock data, and command your AI agent."
        icon={loginIcon}
      >
        <div className="mb-10">
          <div className="lg:hidden w-10 h-10 bg-white text-black font-bold text-xl flex justify-center items-center rounded-sm mb-6">
            K
          </div>

          <h2 className="text-3xl font-bold tracking-tight dark:text-white">
            Sign In
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Enter your details to access your account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Login ID */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Email or Username
            </label>

            <input
              type="text"
              name="loginId"
              value={formData.loginId}
              onChange={handleChange}
              placeholder="you@example.com or username"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all"
              required
            />
          </div>

          {/* Password */}
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

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full dark:bg-blue-500 dark:text-white bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-70 font-semibold rounded-xl px-4 py-3.5 mt-6 transition-all duration-200 shadow-lg shadow-white/10"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10"></div>

          <span className="text-xs text-gray-500 uppercase">Or</span>

          <div className="h-px flex-1 bg-white/10"></div>
        </div>

        {/* Google Login */}
        <GoogleAuthButton />

        {/* Register */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-gray-900 dark:text-white hover:text-emerald-400 font-medium transition-colors"
          >
            Sign up for free
          </Link>
        </p>
      </AuthLayout>
    </>
  );
};

export default Login;

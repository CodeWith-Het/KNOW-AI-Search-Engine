import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom"; 
import { useSelector } from "react-redux"; 
import { useAuth } from "./../hook/useAuth";

const Login = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { loginUser } = useAuth();

  const user = useSelector((state) => state.auth.user)
  const loading = useSelector((state)=>state.auth.loading)

  if (user && !loading) {
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        
        <div className="mb-8 text-center">
          <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-600">
            Login
          </p>
          <h1 className="mt-5 text-3xl font-bold text-gray-800">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to your account to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="emailOrUsername"
              className="mb-1 block text-sm font-medium text-gray-700"
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
              className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 ${errors.emailOrUsername ? "border-red-500 ring-2 ring-red-100" : ""}`}
            />
            {errors.emailOrUsername && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.emailOrUsername}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
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
              className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 ${errors.password ? "border-red-500 ring-2 ring-red-100" : ""}`}
            />
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {errors.submit && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Login in..." : "Login"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-sky-500 hover:text-sky-600 hover:underline"
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
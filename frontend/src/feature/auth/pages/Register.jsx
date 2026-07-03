import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import { useSelector } from "react-redux";
import PopupBox from "./PopupBox";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const { registerUser, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (user && !loading && !showPopup) {
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
    try {
      await registerUser(formData);
      setShowPopup(true);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setShowPopup(false);
    navigate("/login", { replace: true });
  };

  const handleResend = async () => {
    try {
      await resendVerificationEmail(formData.email);
      setResendMessage("Verification email resent successfully.");
    } catch (error) {
      setResendMessage(error.message || "Unable to resend verification email.");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F9FAFB] px-4 py-10 font-sans">
      {showPopup && (
        <PopupBox
          isOpen={showPopup}
          email={formData.email}
          onClose={() => setShowPopup(false)}
          onLogin={handleLogin}
          onResend={handleResend}
        />
      )}

      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Create Account
            </h1>
            <p className="mt-3 text-sm text-gray-500">
              Join to experience the next generation of search.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {["username", "email", "password"].map((field) => (
              <div key={field}>
                <label
                  htmlFor={field}
                  className="mb-1.5 block text-sm font-semibold text-gray-700 capitalize"
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
                  placeholder={`Enter your ${field}`}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm text-gray-900 outline-none transition-all focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
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
              disabled={isLoading || showPopup}
              className="mt-6 w-full rounded-2xl bg-[#111827] px-5 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-gray-800 disabled:bg-gray-300"
            >
              {isLoading ? "Creating..." : "Sign up"}
            </button>
          </form>

          {resendMessage && (
            <p className="mt-4 text-center text-sm font-medium text-emerald-600">
              {resendMessage}
            </p>
          )}

          <div className="mt-8 text-center text-sm font-medium text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-gray-900 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

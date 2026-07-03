import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import { useSelector } from "react-redux";
import PopupBox from "./PopupBox"; 

const Register = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // 🎯 Popup State

  const { registerUser } = useAuth();
  const navigate = useNavigate();
  
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    else if (formData.username.length < 3) newErrors.username = "At least 3 characters needed";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email address";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "At least 6 characters needed";

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
      await registerUser(formData);
      setShowPopup(true); 
      
      // Wait for popup animation then redirect
      setTimeout(() => {
        setShowPopup(false)
        navigate("/login");
      }, 5000);
      
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 py-10 font-sans relative">
      
      {/* 🎯 POPUP COMPONENT */}
      <PopupBox 
        isOpen={showPopup} 
        message="Verification mail sent! Redirecting to login..." 
        onClose={() => setShowPopup(false)} 
      />

      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h1>
          <p className="mt-3 text-sm text-gray-500">Join to experience the next generation of search.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {["username", "email", "password"].map((field) => (
            <div key={field}>
              <label htmlFor={field} className="mb-1.5 block text-sm font-semibold text-gray-700 capitalize">
                {field}
              </label>
              <input
                type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                id={field}
                name={field}
                placeholder={`Enter your ${field}`}
                value={formData[field]}
                onChange={handleChange}
                className={`w-full rounded-2xl border bg-gray-50/50 px-4 py-3.5 text-sm text-gray-900 outline-none transition-all focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 ${
                  errors[field] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-200"
                }`}
              />
              {errors[field] && <p className="mt-1.5 text-xs font-medium text-red-500">{errors[field]}</p>}
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
            className="mt-6 w-full rounded-2xl bg-[#111827] px-5 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : showPopup ? "Success!" : "Sign up"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-900 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
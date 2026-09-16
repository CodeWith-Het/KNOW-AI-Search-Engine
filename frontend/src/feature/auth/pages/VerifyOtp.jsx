import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";

import AuthLayout from "./AuthLayout";
import { verifyOtp } from "../service/auth.api";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (!email) {
      toast.error("Email is missing. Please register again.");

      navigate("/register", {
        replace: true,
      });
    }
  }, [email, navigate]);

  const onSubmit = async (data) => {
    if (!email) {
      toast.error("Email is missing.");
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyOtp({
        email,
        otp: data.otp,
      });

      toast.success("Email verified successfully.");

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      toast.error(
        error?.message || "OTP verification failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyIcon = (
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
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 12c0 5.591 3.824 10.29 9 11.622C17.176 22.29 21 17.591 21 12c0-1.599-.312-3.126-.882-4.516z"
      />
    </svg>
  );

  return (
    <>
      <Toaster position="top-right" />

      <AuthLayout
        leftTitle={
          <>
            Verify your <br />
            <span className="text-emerald-500">Email Address.</span>
          </>
        }
        leftSubtitle="Enter the verification code sent to your email to complete your KNOW AI account setup."
        icon={verifyIcon}
      >
        <div className="mb-10">
          <div className="lg:hidden w-10 h-10 bg-white text-black font-bold text-xl flex justify-center items-center rounded-sm mb-6">
            K
          </div>

          <h2 className="text-3xl font-bold tracking-tight dark:text-white">
            Verify Email
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            We sent a 6-digit verification code to
          </p>

          <p className="text-sm text-white font-medium mt-1 break-all">
            {email}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Verification Code
            </label>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              {...register("otp", {
                required: "OTP is required",
                pattern: {
                  value: /^\d{6}$/,
                  message: "OTP must be exactly 6 digits",
                },
              })}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-center text-2xl tracking-[0.5em] placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all"
            />

            {errors.otp && (
              <p className="text-red-400 text-sm mt-2">{errors.otp.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-70 text-white font-semibold rounded-xl px-4 py-3.5 transition-all duration-200 shadow-lg shadow-emerald-600/20"
          >
            {isSubmitting ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">Entered the wrong email?</p>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-sm text-white hover:text-emerald-400 font-medium mt-1 transition-colors"
          >
            Create account again
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already verified?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-white hover:text-emerald-400 font-medium transition-colors"
          >
            Sign in
          </button>
        </p>
      </AuthLayout>
    </>
  );
};

export default VerifyOtp;
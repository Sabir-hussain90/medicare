"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the token from the URL (e.g., /reset-password?token=abc123)
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!token) {
      setErrorMsg("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please try again.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    // Validation for 10 chars and special char (based on your login page rule)
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (password.length < 10) {
      setErrorMsg("Password must be at least 10 characters long.");
      return;
    }
    if (!specialCharRegex.test(password)) {
      setErrorMsg("Password must contain at least one special character (!@#$%^&*).");
      return;
    }

    setIsLoading(true);

    try {
      // Send request to NestJS Backend
      const response = await fetch("http://localhost:4000/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password. The link may be expired.");
      }

      alert("Password reset successfully! You can now login with your new password.");
      router.push("/login");
      
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#e6f7f9] relative overflow-hidden p-4">
      
      {/* Decorative Background Shapes */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-[#b2e8e6] rounded-full opacity-40 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#b2e8e6] rounded-full opacity-40 blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-[1100px] flex flex-col md:flex-row items-center justify-between gap-10 z-10">
        
        {/* LEFT SIDE: Text & Illustration */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-4 md:pl-10">
          
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-white rounded-lg p-1.5 shadow-sm">
               <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-extrabold text-[#004b5c] leading-tight">MediCare</h1>
              <span className="text-[10px] text-[#008c9e] font-semibold uppercase tracking-wider">Your Health, Our Priority</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Illustration Placeholder */}
            <div className="w-48 h-48 shrink-0 relative">
              <img 
                src="https://img.freepik.com/free-vector/reset-password-concept-illustration_114360-7991.jpg" 
                alt="Reset Password"
                className="w-full h-full object-contain mix-blend-multiply opacity-90"
              />
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#00384d] mb-3">
                Set New Password
              </h2>
              <p className="text-[#1a5b6b] text-sm md:text-base font-medium max-w-sm">
                Enter your new password below to secure your account.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: White Form Card */}
        <div className="w-full md:w-[480px] bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl relative">
          
          <div className="flex items-center gap-3 mb-8">
            {/* Lock Icon */}
            <div className="w-10 h-10 bg-[#e0f7f5] rounded-xl flex items-center justify-center text-[#00b8a9]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#002b3d]">Set New Password</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Error Message */}
            {errorMsg && (
              <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-lg">
                {errorMsg}
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-sm font-bold text-[#002b3d] mb-1.5">New Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter new password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008c9e] focus:border-[#008c9e] outline-none transition-all text-sm bg-[#f8fafc] focus:bg-white"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-[#002b3d] mb-1.5">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Confirm new password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008c9e] focus:border-[#008c9e] outline-none transition-all text-sm bg-[#f8fafc] focus:bg-white"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showConfirmPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#008c9e] hover:bg-[#007787] text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  Reset Password
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute border-t border-gray-100 w-full"></div>
            <span className="bg-white px-4 text-gray-400 text-xs font-medium relative z-10">or</span>
          </div>

          {/* Back to Login */}
          <Link 
            href="/login"
            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-[#008c9e] hover:underline transition-colors py-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Login
          </Link>

        </div>

      </div>
    </main>
  );
}

// Next.js requires useSearchParams to be wrapped in a Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#e6f7f9]">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
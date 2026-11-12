"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      // Send request to NestJS Backend
      const response = await fetch("http://localhost:4000/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }

      // Show success screen
      setIsSent(true);
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#e6f7f9] relative overflow-hidden p-4">
      
      {/* Background Decorative Shapes */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-[#b2e8e6] rounded-full opacity-30 blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#b2e8e6] rounded-full opacity-30 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-white rounded-full opacity-40 blur-2xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-[1000px] flex flex-col md:flex-row items-center justify-between gap-10 z-10">
        
        {/* LEFT SIDE: Text & Illustration */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-4">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-white rounded-lg p-1.5 shadow-sm">
               <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-extrabold text-[#004b5c] leading-tight">MediCare</h1>
              <span className="text-[10px] text-[#008c9e] font-semibold uppercase tracking-wider">Your Health, Our Priority</span>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-[#00384d] mb-4 leading-tight">
            Forgot Password?
          </h2>
          <p className="text-[#1a5b6b] text-sm md:text-base font-medium mb-8 max-w-sm">
            Don't worry! It happens. Enter your email address and we'll send you a reset link.
          </p>

          {/* Illustration Placeholder */}
          <div className="relative w-full max-w-[300px] h-[200px] hidden md:block">
             <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="https://img.freepik.com/free-vector/forgot-password-concept-illustration_114360-1123.jpg" 
                  alt="Forgot Password Illustration" 
                  className="w-full h-full object-contain mix-blend-multiply opacity-80"
                />
             </div>
          </div>
        </div>

        {/* RIGHT SIDE: White Form Card */}
        <div className="w-full md:w-[450px] bg-white rounded-[2rem] p-8 shadow-2xl relative">
          
          <div className="flex flex-col items-center text-center mb-8">
            {/* Envelope Icon */}
            <div className="w-14 h-14 bg-[#00b8a9] rounded-xl flex items-center justify-center text-white mb-4 shadow-md rotate-3">
              <svg className="w-7 h-7 -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#002b3d]">Reset Your Password</h3>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#002b3d] mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <input 
                    type="email" 
                    placeholder="Enter your Gmail address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008c9e] focus:border-[#008c9e] outline-none transition-all text-sm bg-[#f8fafc] focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#008c9e] hover:bg-[#007787] text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h4 className="text-lg font-bold text-[#002b3d] mb-2">Check your Email</h4>
              <p className="text-sm text-gray-500">We have sent a password reset link to <br/><strong>{email}</strong></p>
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute border-t border-gray-100 w-full"></div>
            <span className="bg-white px-4 text-gray-400 text-xs font-medium relative z-10">or</span>
          </div>

          {/* Back to Login Button */}
          <Link 
            href="/login"
            className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3.5 text-sm font-bold text-[#002b3d] hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Login
          </Link>

          {/* Footer Note */}
          <p className="text-center text-[10px] text-gray-400 mt-6">
            Check your Gmail inbox for the password reset link.
          </p>

        </div>

      </div>
    </main>
  );
}
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function ActivateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!token) return setErrorMsg("Invalid activation link.");
    if (password !== confirmPassword) return setErrorMsg("Passwords do not match.");

    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (password.length < 10) return setErrorMsg("Password must be at least 10 characters long.");
    if (!specialCharRegex.test(password)) return setErrorMsg("Password must contain at least one special character.");

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4000/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Activation failed");

      alert("Account Activated! You can now login.");
      router.push("/login");
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-[#e6f7f9] overflow-hidden">
      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-[2rem] shadow-xl p-8 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-8">
          <div className="flex items-center gap-2"><Image src="/logo.png" alt="Logo" width={32} height={32} /><h2 className="text-xl font-bold text-[#004b5c]">MediCare</h2></div>
          <Link href="/login" className="text-sm font-semibold text-[#004b5c]">← Back</Link>
        </div>
        
        <h1 className="text-2xl font-extrabold text-[#002b3d] mb-2">Set Your Password</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Your Gmail is ready. Please set a new password to activate.</p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {errorMsg && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{errorMsg}</div>}
          
          <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008c9e] outline-none" required />
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008c9e] outline-none" required />
          
          <button type="submit" disabled={isLoading} className="w-full bg-[#007a8a] text-white font-bold py-3.5 rounded-xl disabled:opacity-70">
            {isLoading ? "Activating..." : "Activate Account"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ActivatePage() {
  return <Suspense fallback={<div>Loading...</div>}><ActivateForm /></Suspense>;
}
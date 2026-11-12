"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  const handleConfirmLogout = () => {
    // Clear auth tokens/cookies here if you have them
    router.push("/login");
  };

  return (
    // The full-screen overlay with a dark transparent background and blur
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#002b3d]/40 backdrop-blur-sm px-4">
      
      {/* The White Modal Card */}
      <div className="bg-white rounded-[1.5rem] w-full max-w-[420px] p-8 relative flex flex-col items-center text-center shadow-2xl">
        
        {/* Close (X) Button */}
        <Link 
          href="/dashboard" 
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </Link>

        {/* Teal Logout Icon */}
        <div className="w-[72px] h-[72px] rounded-full bg-[#00b8a9] flex items-center justify-center text-white mb-5 mt-2">
          <svg className="w-9 h-9 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </div>

        {/* Text Content */}
        <h2 className="text-xl font-bold text-[#002b3d] mb-2">
          Confirm Logout
        </h2>
        <p className="text-sm text-gray-500 mb-8 max-w-[250px]">
          Are you sure you want to logout<br />from your account?
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full">
          {/* Cancel Button */}
          <Link 
            href="/dashboard" 
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </Link>

          {/* Logout Button */}
          <button 
            onClick={handleConfirmLogout}
            className="flex-1 py-2.5 rounded-xl bg-[#008c9e] hover:bg-[#007787] text-white font-bold transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}
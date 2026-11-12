import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    // Changed to min-h-screen (minimum height) and removed overflow-hidden so scrollbar works
    <main className="relative w-full min-h-screen flex flex-col md:flex-row bg-[#e6f7f9]">
      
      {/* LEFT SIDE: Text Content (Scrolls naturally) */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start px-8 md:px-16 lg:px-24 py-16 z-10">
        <div className="max-w-xl">
          <h1 className="text-[3.5rem] md:text-[4.5rem] lg:text-[5rem] font-extrabold text-[#004b5c] leading-[1.1] mb-6 tracking-tight">
            Your Health <br /> Our Priority
          </h1>
          
          <p className="text-lg md:text-xl text-[#1a5b6b] mb-10 font-medium">
            Get the best medical care with modern telemedicine.
          </p>

          <Link href="/login">
            <button className="bg-[#008c9e] hover:bg-[#007787] text-white font-semibold py-4 px-8 rounded-full text-lg inline-flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl w-fit">
              Start Your Journey 
              <span className="text-xl">→</span>
            </button>
          </Link>

          {/* Trusted by Section */}
          <div className="mt-16 flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 overflow-hidden">
                <img src="https://i.pravatar.cc/100?img=1" alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 overflow-hidden">
                <img src="https://i.pravatar.cc/100?img=3" alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 overflow-hidden">
                <img src="https://i.pravatar.cc/100?img=5" alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
            <p className="text-[#004b5c] font-semibold text-sm md:text-base">
              Trusted by 50K+ patients
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: The Image (Full mobile show, no cutting off) */}
      <div className="relative w-full md:w-1/2 h-[60vh] md:h-auto md:min-h-screen">
        <Image
          src="/mainbackground.png" 
          alt="MediCare Doctor"
          fill
          priority
          // object-contain ensures the image is fully visible without cutting off the phone on desktop
          // object-cover is used for mobile to fill the space nicely
          className="object-contain md:object-contain lg:object-cover object-bottom md:object-right" 
        />
      </div>

    </main>
  );
}
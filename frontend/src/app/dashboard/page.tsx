"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  const [doctors, setDoctors] = useState<any[]>([]);
  const [upcomingAppointment, setUpcomingAppointment] = useState<any>(null);
  const [patientData, setPatientData] = useState<any>(null);
  
  // 🔥 STATS STATE
  const [stats, setStats] = useState({
    appointments: 0,
    consultations: 0,
    messages: 0,
  });

  useEffect(() => {
    const userStr = localStorage.getItem("medicare_user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);

    // 1. Fetch Patient Profile
    fetch(`http://localhost:4000/users/profile?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setPatientData({
            name: data.name || "Patient",
            profileImage: data.patientProfile?.profileImage || "https://i.pravatar.cc/150?img=5"
          });
        }
      });

    // 2. 🔥 Fetch Stats (Appointments, Consultations, Messages)
    fetch(`http://localhost:4000/users/dashboard-stats?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setStats(data);
        }
      })
      .catch(err => console.error("Stats error:", err));

    // 3. Fetch Available Doctors
    fetch("http://localhost:4000/doctors")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDoctors(data.slice(0, 4));
      });

    // 4. Fetch Patient Appointments (For Upcoming Card)
    fetch(`http://localhost:4000/appointments?userId=${user.id}&role=PATIENT`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setUpcomingAppointment(data[0]);
        }
      });
  }, [router]);

  const handleConfirmLogout = () => {
    localStorage.removeItem("medicare_token");
    localStorage.removeItem("medicare_user");
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-[#f4f9fb] font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#005f6b] text-white flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="h-20 flex items-center px-6 gap-2 border-b border-white/10">
            <div className="bg-white rounded-lg p-1">
               <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-wide">MediCare</span>
            </div>
          </div>
          <nav className="mt-6 flex flex-col gap-1 px-3">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#00b8a9] text-white font-medium shadow-sm transition-all">Dashboard</Link>
            <Link href="/doctors" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">Doctors</Link>
            <Link href="/appointments" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">Appointments</Link>
            <Link href="/chat" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">Chat</Link>
            <Link href="/health-records" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">Health Records</Link>
            <Link href="/profile" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">Profile</Link>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">Settings</Link>
          </nav>
        </div>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => setIsLogoutModalOpen(true)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all w-full text-left">Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-20 bg-white flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm shrink-0">
          <div className="relative w-full max-w-md">
            <input type="text" placeholder="Search doctors, appointments..." className="w-full bg-[#f4f9fb] text-sm text-gray-700 rounded-full py-2.5 pl-10 pr-4 outline-none" />
          </div>
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
              <img src={patientData?.profileImage} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-700">
              {patientData?.name}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#002b3d] mb-1 flex items-center gap-2">
                Hello, {patientData?.name || "Patient"}! <span className="text-2xl">👋</span>
              </h1>
              <p className="text-gray-500 text-sm">Take care of your health today</p>
            </div>
            <Link href="/doctors" className="bg-[#005f6b] hover:bg-[#004b54] text-white font-semibold py-2.5 px-6 rounded-lg text-sm shadow-md">Book Appointment</Link>
          </div>

          {/* 🔥 STATS CARDS - Now shows REAL data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-1">Total Appointments</p>
              <h2 className="text-3xl font-bold text-[#002b3d] mb-2">{stats.appointments}</h2>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-1">Consultations</p>
              <h2 className="text-3xl font-bold text-[#002b3d] mb-2">{stats.consultations}</h2>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-1">Messages</p>
              <h2 className="text-3xl font-bold text-[#002b3d] mb-2">{stats.messages}</h2>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-1">Health Score</p>
              <h2 className="text-3xl font-bold text-[#002b3d] mb-2">92%</h2>
            </div>
          </div>

          {/* Upcoming Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-gradient-to-r from-[#d4f5f5] to-[#eafcfc] rounded-2xl p-8 flex items-center justify-between relative overflow-hidden shadow-sm">
              <div className="z-10 max-w-sm">
                <h2 className="text-2xl font-bold text-[#002b3d] mb-2">Your Health<br/>Our Priority</h2>
                <p className="text-gray-600 text-sm mb-6">Get expert medical care from the comfort of your home.</p>
                <Link href="/doctors" className="inline-block bg-[#005f6b] text-white font-semibold py-2 px-6 rounded-lg text-sm">Book Now →</Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#002b3d] mb-4">Upcoming Appointment</h3>
                {upcomingAppointment ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100">
                        <img src={upcomingAppointment.doctor?.profileImage || `https://i.pravatar.cc/150?u=${upcomingAppointment.doctor?.id}`} alt="Doctor" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#002b3d]">{upcomingAppointment.doctor?.user?.name || "Doctor"}</h4>
                        <p className="text-xs text-gray-500">{upcomingAppointment.doctor?.specialization || "Specialist"}</p>
                      </div>
                    </div>
                    <div className="bg-[#f4f9fb] p-3 rounded-lg text-sm font-medium text-[#005f6b]">
                      {new Date(upcomingAppointment.date).toLocaleDateString()} • {upcomingAppointment.timeSlot}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No upcoming appointments.</p>
                )}
              </div>
              <Link href="/appointments" className="text-sm font-semibold text-[#005f6b] hover:underline text-right mt-4">View All →</Link>
            </div>
          </div>

          {/* Available Doctors */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#002b3d]">Available Doctors</h2>
              <Link href="/doctors" className="text-sm font-semibold text-[#005f6b] hover:underline">See All →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {doctors.map((doc) => (
                <div key={doc.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 border-2 border-gray-100">
                     <img src={doc.profileImage || `https://i.pravatar.cc/150?u=${doc.id}`} alt={doc.user?.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-sm text-[#002b3d]">{doc.user?.name || "Doctor"}</h4>
                  <p className="text-xs text-gray-500 mb-3">{doc.specialization}</p>
                  <Link href="/doctors" className="block w-full py-2 bg-[#f4f9fb] hover:bg-[#e0f2f1] text-[#005f6b] text-xs font-bold rounded-lg transition-all">Book Now</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* LOGOUT MODAL */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#002b3d]/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[1.5rem] w-full max-w-[400px] p-8 relative flex flex-col items-center text-center shadow-2xl">
            <h2 className="text-xl font-bold text-[#002b3d] mb-2">Confirm Logout</h2>
            <p className="text-sm text-gray-500 mb-8">Are you sure you want to logout?</p>
            <div className="flex items-center gap-3 w-full">
              <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 py-2.5 rounded-xl border text-gray-700 font-bold">Cancel</button>
              <button onClick={handleConfirmLogout} className="flex-1 py-2.5 rounded-xl bg-[#008c9e] text-white font-bold">Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
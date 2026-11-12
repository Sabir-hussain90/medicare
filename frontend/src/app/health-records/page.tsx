"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function HealthRecordsPage() {
  const [activeTab, setActiveTab] = useState("Medical Reports");
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [patientData, setPatientData] = useState<any>(null);

  const tabs = ["Medical Reports", "Prescriptions", "Lab Tests", "Vaccination", "Visit History"];

  useEffect(() => {
    const userStr = localStorage.getItem("medicare_user");
    if (!userStr) {
      window.location.href = "/login";
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

    // 2. Fetch Health Records
    fetch(`http://localhost:4000/health-records?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("🔍 Records fetched from DB:", data); // Check console
        if (Array.isArray(data)) setRecords(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setIsLoading(false);
      });
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "BLOOD_TEST":
        return <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
      case "X_RAY":
        return <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
      case "PRESCRIPTION":
        return <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      default:
        return <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f9fb] font-sans overflow-hidden">
      <aside className="w-64 bg-[#005f6b] text-white flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="h-20 flex items-center px-6 gap-2 border-b border-white/10">
            <Image src="/logo.png" alt="Logo" width={24} height={24} />
            <span className="font-bold text-lg">MediCare</span>
          </div>
          <nav className="mt-6 flex flex-col gap-1 px-3">
            <Link href="/dashboard" className="px-3 py-3 rounded-lg text-white/80 hover:bg-white/10">Dashboard</Link>
            <Link href="/doctors" className="px-3 py-3 rounded-lg text-white/80 hover:bg-white/10">Doctors</Link>
            <Link href="/appointments" className="px-3 py-3 rounded-lg text-white/80 hover:bg-white/10">Appointments</Link>
            <Link href="/chat" className="px-3 py-3 rounded-lg text-white/80 hover:bg-white/10">Chat</Link>
            <Link href="/health-records" className="px-3 py-3 rounded-lg bg-[#00b8a9] text-white font-medium">Health Records</Link>
            <Link href="/profile" className="px-3 py-3 rounded-lg text-white/80 hover:bg-white/10">Profile</Link>
            <Link href="/settings" className="px-3 py-3 rounded-lg text-white/80 hover:bg-white/10">Settings</Link>
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-20 bg-white flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm shrink-0">
          <input type="text" placeholder="Search anything..." className="w-full max-w-md bg-[#f4f9fb] text-sm rounded-full py-2.5 pl-10 pr-4 outline-none" />
          <div className="flex items-center gap-3">
            <img src={patientData?.profileImage} alt="User" className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover" />
            <span className="font-semibold text-sm">{patientData?.name}</span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <h1 className="text-3xl font-bold text-[#002b3d] mb-6">Health Records</h1>
          
          <div className="flex gap-2 mb-8">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-lg text-sm font-semibold border ${activeTab === tab ? "bg-[#008c9e] text-white" : "bg-white text-gray-600"}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {isLoading ? (
              <div className="col-span-full text-center py-10 text-gray-500">Loading records...</div>
            ) : records.length > 0 ? (
              records.map((record) => (
                <div key={record.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div className="flex flex-col items-center text-center mb-4 mt-2">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                      {getIcon(record.type)}
                    </div>
                    <h3 className="font-bold text-[#002b3d] text-sm mb-1">{record.title}</h3>
                    <p className="text-xs text-gray-400">{new Date(record.recordDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
                    <a href={record.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#008c9e] hover:underline">View</a>
                    <span className="text-gray-300">|</span>
                    <a href={record.fileUrl} download="report" className="text-xs font-bold text-[#008c9e] hover:underline">Download</a>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                No health records found. 
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
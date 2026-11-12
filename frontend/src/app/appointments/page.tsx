"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function BookAppointmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryDoctorId = searchParams.get("doctorId") || "";

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [isLoading, setIsLoading] = useState(false);
  const [dates, setDates] = useState<{day: string, date: string, fullDate: string}[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(queryDoctorId || "");

  useEffect(() => {
    const generatedDates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      generatedDates.push({
        day: nextDate.toLocaleDateString('en-US', { weekday: 'short' }),
        date: nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: nextDate.toISOString().split('T')[0]
      });
    }
    setDates(generatedDates);
    setSelectedDate(generatedDates[0].fullDate);
  }, []);

  useEffect(() => {
    // 1. Automatically seed doctors (creates them if they don't exist)
    fetch("http://localhost:4000/appointments/seed-doctors", { method: "POST" })
      .then(() => {
        // 2. Then fetch the doctors
        return fetch("http://localhost:4000/doctors");
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDoctors(data);
          if (!queryDoctorId) {
            setSelectedDoctorId(data[0].id);
          }
        } else {
          setErrorMsg("No doctors could be created. Check backend logs.");
        }
      })
      .catch(err => {
        console.error("Error:", err);
        setErrorMsg("Failed to load doctors. Please check backend.");
      });
  }, [queryDoctorId]);

  const handleConfirm = async () => {
    setIsLoading(true);
    setErrorMsg("");

    const userStr = localStorage.getItem("medicare_user");
    if (!userStr) {
      alert("Please login first.");
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);

    if (!selectedDoctorId) {
      setErrorMsg("Please select a doctor first.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create Patient Profile if missing
      await fetch("http://localhost:4000/users/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      // 2. Fetch the Patient Profile
      const profileRes = await fetch(`http://localhost:4000/users/profile?userId=${user.id}`);
      const profileData = await profileRes.json();
      const patientId = profileData.patientProfile?.id;

      if (!patientId) throw new Error("Could not create patient profile. Please try again.");

      // 3. Book the appointment
      const response = await fetch("http://localhost:4000/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patientId,
          doctorId: selectedDoctorId,
          date: selectedDate,
          timeSlot: selectedTime,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to book appointment");

      alert(`Appointment Confirmed!`);
      router.push("/dashboard"); 
    } catch (error: any) {
      setErrorMsg(error.message);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const times = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM"];

  return (
    <div className="min-h-screen bg-[#f4f9fb]">
      <header className="bg-white h-20 flex items-center justify-between px-6 lg:px-10 shadow-sm sticky top-0 z-20">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="MediCare Logo" width={32} height={32} className="object-contain" />
          <div className="flex flex-col">
            <span className="font-bold text-lg text-[#005f6b] leading-tight tracking-wide">MediCare</span>
            <span className="text-[9px] text-gray-400 uppercase tracking-widest">Your Health, Our Priority</span>
          </div>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Link href="/doctors" className="inline-flex items-center gap-2 text-gray-600 font-semibold text-sm hover:text-[#005f6b] mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center h-fit">
            <h3 className="font-bold text-[#002b3d] mb-4">Available Doctors</h3>
            <div className="w-full space-y-2">
              {doctors.map(doc => (
                <button 
                  key={doc.id}
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${selectedDoctorId === doc.id ? "border-[#00b8a9] bg-[#e0f2f1]" : "border-gray-200 hover:bg-gray-50"}`}
                >
                  <p className="font-bold text-sm text-[#002b3d]">{doc.user?.name || "Doctor"}</p>
                  <p className="text-xs text-gray-500">{doc.specialization}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
            <h1 className="text-2xl font-bold text-[#002b3d] mb-6">Select Appointment Time</h1>
            
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{errorMsg}</div>
            )}

            <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
              {dates.map((item) => (
                <button
                  key={item.fullDate}
                  onClick={() => setSelectedDate(item.fullDate)}
                  className={`flex flex-col items-center justify-center min-w-[80px] py-3 rounded-xl border transition-all ${
                    selectedDate === item.fullDate ? "border-[#00b8a9] bg-[#e0f2f1] text-[#002b3d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-sm font-semibold">{item.day}</span>
                  <span className="text-xs mt-1">{item.date}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {times.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                    selectedTime === time ? "border-[#00b8a9] bg-[#e0f2f1] text-[#002b3d]" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            <button onClick={handleConfirm} disabled={isLoading || !selectedDoctorId} className="w-full bg-[#008c9e] hover:bg-[#007787] text-white font-bold py-4 rounded-xl shadow-md disabled:opacity-70">
              {isLoading ? "Booking..." : "Confirm Appointment"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BookAppointmentPage() {
  return <Suspense fallback={<div>Loading...</div>}><BookAppointmentForm /></Suspense>;
}
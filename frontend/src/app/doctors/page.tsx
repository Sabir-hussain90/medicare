"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [activePatient, setActivePatient] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");

  // 1. Fetch Doctors
  useEffect(() => {
    fetch("http://localhost:4000/doctors")
      .then((res) => res.json())
      .then(async (data) => {
        if (Array.isArray(data)) {
          const formatted = await Promise.all(data.map(async (doc: any) => {
            const unreadRes = await fetch(`http://localhost:4000/chat/unread-count?doctorId=${doc.userId}`);
            const unreadData = await unreadRes.json();
            
            return {
              id: doc.id,
              userId: doc.userId,
              name: doc.user?.name || "Doctor",
              specialty: doc.specialization || "Specialist",
              // 🔥 DOCTOR IMAGE FALLBACK
              image: doc.profileImage || `https://i.pravatar.cc/300?u=${doc.id}`,
              unreadCount: unreadData.count || 0,
            };
          }));
          setDoctors(formatted);
        }
      });
  }, []);

  // 2. Open Inbox & Fetch Patients
  const handleOpenConversations = (doctor: any) => {
    setSelectedDoctor(doctor);
    fetch(`http://localhost:4000/chat/doctor-patients?doctorId=${doctor.userId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map((p: any) => ({
            ...p,
            // 🔥 PATIENT REAL IMAGE (Passed from backend)
            img: p.profileImage || `https://i.pravatar.cc/150?u=${p.id}`,
          }));
          setPatients(formatted);
          if (formatted.length > 0) handleSelectPatient(formatted[0], doctor.userId);
        }
      });
  };

  // 3. Select Patient & Load History
  const handleSelectPatient = (patient: any, doctorUserId: string) => {
    setActivePatient(patient);
    fetch("http://localhost:4000/chat/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: patient.id, receiverId: doctorUserId }),
    });

    fetch(`http://localhost:4000/chat/history?user1Id=${doctorUserId}&user2Id=${patient.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data.map((msg: any) => ({
            id: msg.id,
            sender: msg.senderId === doctorUserId ? "doctor" : "patient",
            text: msg.content,
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          })));
        }
      });
  };

  // 4. Send Reply
  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activePatient) return;

    const newMsg = { id: Date.now(), sender: "doctor", text: inputText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMsg]);

    fetch("http://localhost:4000/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: selectedDoctor.userId, receiverId: activePatient.id, content: inputText }),
    });

    setInputText("");
  };

  return (
    <div className="min-h-screen bg-[#f4f9fb] relative">
      <header className="bg-white h-20 flex items-center justify-between px-6 lg:px-10 shadow-sm sticky top-0 z-20">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="MediCare Logo" width={32} height={32} />
          <span className="font-bold text-lg text-[#005f6b]">MediCare</span>
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <h1 className="text-3xl font-bold text-[#002b3d] mb-8">Our Expert Doctors</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <img src={doctor.image} alt={doctor.name} className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-[#f4f9fb]" />
              <h3 className="font-bold text-[#002b3d] text-base mb-1">{doctor.name}</h3>
              <p className="text-gray-500 text-xs mb-3">{doctor.specialty}</p>
              
              <div className="w-full flex flex-col gap-2 mt-2">
                <Link href={`/chat?doctorId=${doctor.userId}`}>
                  <button className="w-full bg-white border border-[#008c9e] text-[#008c9e] text-xs font-semibold py-2.5 rounded-lg">Message</button>
                </Link>
                <button onClick={() => handleOpenConversations(doctor)} className="w-full bg-[#008c9e] text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 relative">
                  View Inbox
                  {doctor.unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full absolute -top-2 -right-2">{doctor.unreadCount}</span>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl flex overflow-hidden shadow-2xl relative">
            <button onClick={() => setSelectedDoctor(null)} className="absolute top-4 right-4 z-10 bg-white rounded-full p-1 shadow">✕</button>
            
            <aside className="w-1/3 bg-[#f4f9fb] border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b bg-white"><h3 className="font-bold">Inbox: {selectedDoctor.name}</h3></div>
              {patients.map(p => (
                <div key={p.id} onClick={() => handleSelectPatient(p, selectedDoctor.userId)} className={`p-4 border-b cursor-pointer flex gap-3 items-center ${activePatient?.id === p.id ? 'bg-white border-l-4 border-l-[#00b8a9]' : 'hover:bg-gray-100'}`}>
                  <img src={p.img} className="w-10 h-10 rounded-full object-cover" />
                  <div><h4 className="font-bold text-sm">{p.name}</h4><p className="text-xs text-gray-500 truncate">{p.lastMessage}</p></div>
                </div>
              ))}
            </aside>

            <main className="flex-1 flex flex-col bg-white">
              {activePatient && (
                <>
                  <header className="p-4 border-b flex items-center gap-3">
                    <img src={activePatient.img} className="w-10 h-10 rounded-full object-cover" />
                    <h3 className="font-bold">{activePatient.name}</h3>
                  </header>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fafcfc]">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === "doctor" ? "justify-end" : "justify-start"}`}>
                        <div className={`p-3 rounded-xl max-w-[70%] text-sm ${msg.sender === "doctor" ? "bg-[#008c9e] text-white" : "bg-gray-200 text-gray-800"}`}>{msg.text}</div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleReply} className="p-4 border-t flex gap-2">
                    <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type reply..." className="flex-1 border rounded-full px-4 py-2 outline-none" />
                    <button type="submit" className="bg-[#008c9e] text-white px-6 py-2 rounded-full font-bold">Send</button>
                  </form>
                </>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
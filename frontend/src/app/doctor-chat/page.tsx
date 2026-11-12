"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";

function DoctorChatContent() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [activeChat, setActiveChat] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  
  const searchParams = useSearchParams();
  // The doctor's ID will be passed in the URL (e.g., /doctor-chat?doctorId=123)
  const doctorUserId = searchParams.get("doctorId"); 

  const socketRef = useRef<Socket | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current || !doctorUserId) return;
    hasInitialized.current = true;

    // 1. Fetch all patients who have messaged this doctor
    fetch(`http://localhost:4000/chat/doctor-patients?doctorId=${doctorUserId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map((p: any) => ({
            ...p,
            img: `https://i.pravatar.cc/150?u=${p.id}`,
          }));
          setPatients(formatted);
          if (formatted.length > 0) setActiveChat(formatted[0]);
        }
      });

  }, [doctorUserId]);

  useEffect(() => {
    if (!doctorUserId || !activeChat) return;

    // Connect socket to listen to new messages
    socketRef.current = io("http://localhost:4000");
    socketRef.current.emit("register", doctorUserId);

    // Load chat history
    fetch(`http://localhost:4000/chat/history?user1Id=${doctorUserId}&user2Id=${activeChat.id}`)
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

    // Mark as read
    fetch("http://localhost:4000/chat/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: activeChat.id, receiverId: doctorUserId }),
    });
    
    // Clear local notification badge
    setPatients(prev => prev.map(p => p.id === activeChat.id ? { ...p, unreadCount: 0 } : p));

    // Listen for new messages from patients
    socketRef.current.on("newMessage", (msg: any) => {
      if (msg.senderId === activeChat.id || msg.receiverId === activeChat.id) {
        setMessages((prev) => [...prev, {
          id: msg.id,
          sender: msg.senderId === doctorUserId ? "doctor" : "patient",
          text: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      }
    });

    socketRef.current.on("messageSent", (msg: any) => {
       if (msg.receiverId === activeChat.id) {
         setMessages((prev) => [...prev, {
          id: msg.id,
          sender: "doctor",
          text: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
       }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [activeChat, doctorUserId]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current || !activeChat) return;

    socketRef.current.emit("sendMessage", {
      senderId: doctorUserId, // The doctor
      receiverId: activeChat.id, // The patient
      content: inputText,
    });

    setInputText("");
  };

  if (!doctorUserId) return <div className="p-8 text-center text-red-500">Invalid Link. No Doctor ID found.</div>;

  return (
    <div className="h-screen w-full bg-[#f4f9fb] flex overflow-hidden">
      {/* SIDEBAR: List of Patients */}
      <aside className="w-full md:w-80 bg-white border-r border-gray-100 flex flex-col shadow-sm z-10">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-[#002b3d]">Patient Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {patients.map((chat) => (
            <div 
              key={chat.id} 
              onClick={() => setActiveChat(chat)}
              className={`flex items-center gap-3 p-4 cursor-pointer border-b border-gray-50 transition-colors ${
                activeChat?.id === chat.id ? "bg-[#e0f7f5] border-l-4 border-l-[#00b8a9]" : "hover:bg-gray-50 border-l-4 border-l-transparent"
              }`}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                <img src={chat.img} alt={chat.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold truncate text-gray-800">{chat.name}</h3>
                <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
              </div>
              {chat.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {chat.unreadCount}
                </span>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT AREA */}
      <main className="hidden md:flex flex-1 flex-col bg-white">
        {activeChat ? (
          <>
            <header className="h-20 px-6 border-b border-gray-100 flex items-center gap-4 bg-white shrink-0">
              <div className="w-11 h-11 rounded-full overflow-hidden">
                <img src={activeChat.img} alt={activeChat.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#002b3d]">{activeChat.name}</h2>
                <p className="text-xs text-gray-500 font-medium">Patient</p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fafcfc]">
              {messages.length === 0 && <div className="text-center text-gray-400 mt-10">No messages yet.</div>}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 max-w-[75%] ${msg.sender === "doctor" ? "ml-auto flex-row-reverse" : ""}`}>
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1">
                    <img src={msg.sender === "doctor" ? `https://i.pravatar.cc/100?u=${doctorUserId}` : activeChat.img} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className={`p-4 rounded-2xl text-sm ${msg.sender === "doctor" ? "bg-[#008c9e] text-white rounded-tr-sm" : "bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm"}`}>
                      {msg.text}
                    </div>
                    <div className={`flex items-center gap-1 mt-1 text-[10px] text-gray-400 ${msg.sender === "doctor" ? "justify-end" : "justify-start"}`}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSendReply} className="relative flex items-center">
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type your reply..." className="w-full bg-[#f4f9fb] text-sm text-gray-700 rounded-full py-4 pl-6 pr-14 outline-none border border-transparent focus:border-[#00b8a9] focus:bg-white shadow-sm" />
                <button type="submit" className="absolute right-2 w-10 h-10 bg-[#008c9e] hover:bg-[#007787] text-white rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Select a patient to view messages.</div>
        )}
      </main>
    </div>
  );
}

export default function DoctorChatPage() {
  return <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}><DoctorChatContent /></Suspense>;
}
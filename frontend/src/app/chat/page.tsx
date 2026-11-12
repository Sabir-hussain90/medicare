"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";

function ChatContent() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [activeChat, setActiveChat] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [patientImage, setPatientImage] = useState<string>("https://i.pravatar.cc/100?img=5");
  
  // WebRTC States
  const [socket, setSocket] = useState<Socket | null>(null);
  const [callActive, setCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  const searchParams = useSearchParams();
  const doctorUserId = searchParams.get("doctorId"); 

  // 1. Load User Data & Connect Socket
  useEffect(() => {
    const userStr = localStorage.getItem("medicare_user");
    if (!userStr) { window.location.href = "/login"; return; }
    const user = JSON.parse(userStr);
    setCurrentUser(user);

    // Connect to Socket for WebRTC & Chat
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);
    newSocket.emit("register", user.id);

    // Fetch Patient Image
    fetch(`http://localhost:4000/users/profile?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data?.patientProfile?.profileImage) setPatientImage(data.patientProfile.profileImage);
      });

    // Fetch Doctor Data
    if (doctorUserId) {
      fetch(`http://localhost:4000/doctors`)
        .then(res => res.json())
        .then(data => {
          const doc = data.find((d: any) => d.userId === doctorUserId);
          if (doc) {
            setActiveChat({
              id: doc.userId, 
              name: doc.user?.name || "Doctor",
              specialization: doc.specialization,
              img: doc.profileImage || `https://i.pravatar.cc/150?u=${doc.id}`
            });
          }
        });
    }

    // 🔥 WebRTC Listeners
    newSocket.on("webrtc-offer", (data: any) => {
      setIncomingCall({ from: data.senderId, offer: data.offer });
    });

    newSocket.on("webrtc-answer", async (data: any) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    newSocket.on("webrtc-ice-candidate", async (data: any) => {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    newSocket.on("webrtc-end-call", () => {
      alert("Call ended by the other user.");
      endCall();
    });

    return () => { newSocket.disconnect(); };
  }, [doctorUserId]);

  // 2. Load Chat History
  useEffect(() => {
    if (!currentUser || !activeChat) return;
    fetch(`http://localhost:4000/chat/history?user1Id=${currentUser.id}&user2Id=${activeChat.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data.map((msg: any) => ({
            id: msg.id,
            sender: msg.senderId === currentUser.id ? "user" : "doctor",
            text: msg.content,
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          })));
        }
      });
  }, [activeChat, currentUser]);

  // 3. WebRTC Logic
  const createPeerConnection = async () => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("webrtc-ice-candidate", {
          senderId: currentUser.id,
          receiverId: activeChat.id,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    } catch (err) {
      alert("Camera/Microphone access denied. Please allow permissions.");
      return null;
    }

    peerConnection.current = pc;
    return pc;
  };

  const startVideoCall = async () => {
    const pc = await createPeerConnection();
    if (!pc) return;
    
    setCallActive(true);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    socket?.emit("webrtc-offer", {
      senderId: currentUser.id,
      receiverId: activeChat.id,
      offer: offer
    });
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    const pc = await createPeerConnection();
    if (!pc) return;

    setCallActive(true);
    await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket?.emit("webrtc-answer", {
      senderId: currentUser.id,
      receiverId: incomingCall.from,
      answer: answer
    });
    setIncomingCall(null);
  };

  const endCall = () => {
    setCallActive(false);
    setIncomingCall(null);
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }
  };

  // 4. Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser || !activeChat) return;

    const textToSend = inputText;
    setInputText("");

    const newMsg = { id: Date.now(), sender: "user", text: textToSend, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMsg]);

    try {
      await fetch("http://localhost:4000/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUser.id,     
          receiverId: activeChat.id,    
          content: textToSend,
        }),
      });
    } catch (err: any) {
      console.log("Message failed");
    }
  };

  if (!currentUser || !activeChat) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="h-screen w-full bg-[#f4f9fb] flex overflow-hidden relative">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-80 bg-white border-r flex flex-col shadow-sm z-10">
        <div className="p-5 border-b">
          <Link href="/doctors" className="text-gray-500 hover:text-[#005f6b] mb-4 block">← Back</Link>
          <h1 className="text-xl font-bold text-[#002b3d]">Messages</h1>
        </div>
        <div className="p-4 bg-[#e0f7f5] border-l-4 border-l-[#00b8a9] flex gap-3 items-center">
          <img src={activeChat.img} alt={activeChat.name} className="w-12 h-12 rounded-full object-cover" />
          <div>
            <h3 className="text-sm font-bold text-[#005f6b]">{activeChat.name}</h3>
            <p className="text-xs text-gray-400">{activeChat.specialization}</p>
          </div>
        </div>
      </aside>

      {/* MAIN CHAT */}
      <main className="hidden md:flex flex-1 flex-col bg-white">
        <header className="h-20 px-6 border-b flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <img src={activeChat.img} alt={activeChat.name} className="w-11 h-11 rounded-full object-cover" />
            <div>
              <h2 className="text-base font-bold text-[#002b3d]">{activeChat.name}</h2>
              <p className="text-xs text-green-500">{activeChat.specialization}</p>
            </div>
          </div>

          {/* 🔥 CALL BUTTONS */}
          <div className="flex items-center gap-3">
            <button 
              onClick={startVideoCall}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#f4f9fb] text-[#00b8a9] hover:bg-[#e0f2f1] transition-colors"
              title="Start Video Call"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fafcfc]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 max-w-[75%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}>
              <img 
                src={msg.sender === "user" ? patientImage : activeChat.img} 
                className="w-8 h-8 rounded-full object-cover mt-1 border border-gray-200" 
                alt="Avatar"
              />
              <div>
                <div className={`p-4 rounded-2xl text-sm ${msg.sender === "user" ? "bg-[#008c9e] text-white rounded-tr-sm" : "bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm"}`}>
                  {msg.text}
                </div>
                <div className={`text-[10px] text-gray-400 mt-1 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input 
              type="text" 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              placeholder="Type a message..." 
              className="w-full bg-[#f4f9fb] text-sm text-gray-700 rounded-full py-4 pl-6 pr-14 outline-none border border-transparent focus:border-[#00b8a9]" 
            />
            <button 
              type="submit" 
              className="absolute right-2 w-10 h-10 bg-[#008c9e] hover:bg-[#007787] text-white rounded-full flex items-center justify-center transition-all shadow-md"
            >
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </form>
        </div>
      </main>

      {/* 🔥 INCOMING CALL MODAL */}
      {incomingCall && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 mb-6 animate-pulse">
            <img src={activeChat.img} alt="Caller" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-3xl font-bold mb-2">{activeChat.name}</h2>
          <p className="text-lg text-gray-300 mb-8">Incoming Video Call...</p>
          <div className="flex gap-6">
            <button onClick={() => setIncomingCall(null)} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 shadow-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <button onClick={acceptCall} className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 shadow-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </button>
          </div>
        </div>
      )}

      {/* 🔥 ACTIVE VIDEO CALL SCREEN */}
      {callActive && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col">
          <div className="flex-1 relative">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover bg-gray-900" />
            <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 w-32 h-48 bg-gray-800 rounded-lg object-cover border-2 border-white shadow-xl" />
          </div>
          <div className="h-24 bg-gray-900 flex items-center justify-center">
            <button onClick={() => { endCall(); socket?.emit("webrtc-end-call", { senderId: currentUser.id, receiverId: activeChat.id }); }} className="bg-red-500 text-white px-8 py-3 rounded-full font-bold hover:bg-red-600">
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><ChatContent /></Suspense>;
}
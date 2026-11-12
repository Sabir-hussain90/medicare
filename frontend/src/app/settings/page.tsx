"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Personal Info");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const tabs = ["Personal Info", "Change Password", "Notifications", "Privacy"];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    profileImage: "https://i.pravatar.cc/300?img=5"
  });

  // Password States (Added separate toggles for each field)
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification & Privacy State
  const [notifications, setNotifications] = useState({ email: true, sms: false, app: true });
  const [privacy, setPrivacy] = useState({ showProfile: true, shareData: false });

  // 1. Fetch real data
  useEffect(() => {
    const userStr = localStorage.getItem("medicare_user");
    if (!userStr) {
      window.location.href = "/login";
      return;
    }
    const user = JSON.parse(userStr);

    fetch(`http://localhost:4000/users/profile?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.patientProfile?.phone || "",
            specialization: data.doctorProfile?.specialization || "Patient",
            profileImage: data.patientProfile?.profileImage || "https://i.pravatar.cc/300?img=5"
          });
        }
        setIsFetching(false);
      })
      .catch(err => {
        console.error("Error fetching profile:", err);
        setIsFetching(false);
      });
  }, []);

  // 2. Handle Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Handle Save based on Tab
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userStr = localStorage.getItem("medicare_user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      // VALIDATION FOR PASSWORD CHANGE
      if (activeTab === "Change Password") {
        if (passwordData.new !== passwordData.confirm) {
          throw new Error("New passwords do not match.");
        }
        if (passwordData.new.length < 10) {
          throw new Error("Password must be at least 10 characters.");
        }
        
        // Note: You need to add a backend route for this
        alert("Password change API needs to be connected in the backend.");
        setIsLoading(false);
        return;
      }

      // SAVE FOR PERSONAL INFO (Includes Name, Phone, and Image)
      if (activeTab === "Personal Info") {
        const response = await fetch("http://localhost:4000/users/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            name: formData.name,
            phone: formData.phone,
            profileImage: formData.profileImage
          }),
        });

        if (!response.ok) throw new Error("Failed to update profile.");
        
        const updatedUser = { ...user, name: formData.name };
        localStorage.setItem("medicare_user", JSON.stringify(updatedUser));
      }

      alert(`${activeTab} saved successfully!`);
      window.location.reload();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="flex h-screen bg-[#f4f9fb] font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#005f6b] text-white flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="h-20 flex items-center px-6 gap-2 border-b border-white/10">
            <div className="bg-white rounded-lg p-1">
               <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
            </div>
            <span className="font-bold text-lg leading-tight tracking-wide">MediCare</span>
          </div>

          <nav className="mt-6 flex flex-col gap-1 px-3">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">Dashboard</Link>
            <Link href="/doctors" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">Doctors</Link>
            <Link href="/appointments" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">Appointments</Link>
            <Link href="/chat" className="flex items-center justify-between px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">
              <span>Chat</span>
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
            </Link>
            <Link href="/health-records" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">Health Records</Link>
            <Link href="/profile" className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-all">Profile</Link>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#00b8a9] text-white font-medium shadow-sm transition-all">Settings</Link>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-20 bg-white flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm shrink-0">
          <div className="relative w-full max-w-md">
            <input type="text" placeholder="Search anything..." className="w-full bg-[#f4f9fb] text-sm text-gray-700 rounded-full py-2.5 pl-10 pr-4 outline-none" />
          </div>
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
              <img src={formData.profileImage} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-700">
              {formData.name}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#002b3d] mb-1">Profile Settings</h1>
            <p className="text-gray-500 text-sm">Manage your account information</p>
          </div>

          {/* TABS */}
          <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                  activeTab === tab 
                    ? "bg-white border-[#002b3d] text-[#002b3d] shadow-sm" 
                    : "bg-transparent border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-10">
            
            <div className="flex flex-col items-center shrink-0">
              <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-[#f4f9fb] shadow-sm relative group">
                <img src={formData.profileImage} alt="User" className="w-full h-full object-cover" />
                <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                  <span className="text-white text-xs font-bold">Change</span>
                </div>
              </div>
              
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />

              <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-[#008c9e] hover:bg-[#007787] text-white font-semibold py-2 px-6 rounded-full text-sm transition-all shadow-md mb-2">
                Change Photo
              </button>
              <p className="text-[10px] text-gray-400">JPG, PNG up to 2MB</p>
            </div>

            <form onSubmit={handleSave} className="flex-1 space-y-5">
              
              {/* TAB 1: PERSONAL INFO */}
              {activeTab === "Personal Info" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold mb-1">Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border rounded-xl py-3 px-4" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Email</label>
                    <input type="email" value={formData.email} disabled className="w-full bg-gray-50 border rounded-xl py-3 px-4" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Phone</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border rounded-xl py-3 px-4" />
                  </div>
                </div>
              )}

              {/* TAB 2: CHANGE PASSWORD (WITH EYE ICONS FOR ALL) */}
              {activeTab === "Change Password" && (
                <div className="space-y-4 max-w-md">
                  
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-bold mb-1">Current Password</label>
                    <div className="relative">
                      <input 
                        type={showCurrentPassword ? "text" : "password"} 
                        value={passwordData.current} 
                        onChange={(e) => setPasswordData({...passwordData, current: e.target.value})} 
                        className="w-full border rounded-xl py-3 px-4 pr-12" 
                      />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                        {showCurrentPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-bold mb-1">New Password</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? "text" : "password"} 
                        value={passwordData.new} 
                        onChange={(e) => setPasswordData({...passwordData, new: e.target.value})} 
                        className="w-full border rounded-xl py-3 px-4 pr-12" 
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                        {showNewPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-bold mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        value={passwordData.confirm} 
                        onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})} 
                        className="w-full border rounded-xl py-3 px-4 pr-12" 
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NOTIFICATIONS */}
              {activeTab === "Notifications" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-bold">Email Notifications</h4>
                      <p className="text-xs text-gray-500">Receive updates via Email</p>
                    </div>
                    <input type="checkbox" checked={notifications.email} onChange={(e) => setNotifications({...notifications, email: e.target.checked})} className="w-5 h-5 accent-[#00b8a9]" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-bold">SMS Notifications</h4>
                      <p className="text-xs text-gray-500">Receive updates via SMS</p>
                    </div>
                    <input type="checkbox" checked={notifications.sms} onChange={(e) => setNotifications({...notifications, sms: e.target.checked})} className="w-5 h-5 accent-[#00b8a9]" />
                  </div>
                </div>
              )}

              {/* TAB 4: PRIVACY */}
              {activeTab === "Privacy" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-bold">Public Profile</h4>
                      <p className="text-xs text-gray-500">Allow doctors to see your profile</p>
                    </div>
                    <input type="checkbox" checked={privacy.showProfile} onChange={(e) => setPrivacy({...privacy, showProfile: e.target.checked})} className="w-5 h-5 accent-[#00b8a9]" />
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-8">
                <button type="submit" disabled={isLoading} className="bg-[#008c9e] text-white font-semibold py-2.5 px-8 rounded-xl disabled:opacity-70">
                  {isLoading ? "Saving..." : `Save ${activeTab}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
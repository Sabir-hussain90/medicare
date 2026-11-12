"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Data States
  const [users, setUsers] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  // Add Record Form States
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [testName, setTestName] = useState("");
  const [recordType, setRecordType] = useState("BLOOD_TEST");
  
  // 🔥 File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSaving, setIsSaving] = useState(false);

  // 20 Common Medical Tests
  const medicalTests = [
    "Complete Blood Count (CBC)",
    "Lipid Profile",
    "Blood Sugar (Fasting)",
    "Thyroid Function Test",
    "Liver Function Test",
    "Kidney Function Test",
    "Urine Routine",
    "X-Ray Chest",
    "X-Ray Spine",
    "MRI Brain",
    "MRI Spine",
    "CT Scan Head",
    "Ultrasound Abdomen",
    "ECG (Electrocardiogram)",
    "Echocardiogram",
    "COVID-19 RT-PCR",
    "Vitamin D Test",
    "Vitamin B12 Test",
    "HbA1c (Diabetes)",
    "Allergy Panel"
  ];

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === "users") {
      fetch("http://localhost:4000/users").then(res => res.json()).then(data => setUsers(data));
    } else if (activeTab === "doctors") {
      fetch("http://localhost:4000/doctors").then(res => res.json()).then(data => setDoctors(data));
    } else if (activeTab === "appointments") {
      fetch("http://localhost:4000/appointments?userId=all&role=ADMIN").then(res => res.json()).then(data => setAppointments(data));
    } else if (activeTab === "add-record") {
      fetch("http://localhost:4000/users")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPatients(data.filter((u: any) => u.role === "PATIENT" && u.patientProfile));
          }
        });
    }
  }, [activeTab]);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // If it's an image, show a preview
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null); // Not an image (e.g., PDF)
      }
    }
  };

  // Handle Save Record
  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !testName || !file) {
      alert("Please fill all fields and select a file.");
      return;
    }

    setIsSaving(true);
    
    // Convert file to Base64 to save in DB (for demo purposes)
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Url = reader.result as string;

      try {
        const res = await fetch("http://localhost:4000/health-records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: selectedPatient,
            title: testName,
            type: recordType,
            fileUrl: base64Url, // Saving the file as base64 string
          }),
        });

        if (res.ok) {
          alert("Record added successfully!");
          setTestName("");
          setFile(null);
          setFilePreview(null);
          setActiveTab("dashboard");
        } else {
          throw new Error("Failed to add record");
        }
      } catch (err: any) {
        alert(err.message);
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-screen bg-[#f4f9fb] font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#005f6b] text-white flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="h-20 flex items-center px-6 gap-2 border-b border-white/10">
            <div className="bg-white rounded-lg p-1"><Image src="/logo.png" alt="Logo" width={24} height={24} /></div>
            <span className="font-bold text-lg">MediCare</span>
          </div>
          <nav className="mt-6 flex flex-col gap-1 px-3">
            <button onClick={() => setActiveTab("dashboard")} className={`px-3 py-3 rounded-lg text-left ${activeTab === 'dashboard' ? 'bg-[#00b8a9]' : 'hover:bg-white/10'}`}>Dashboard</button>
            <button onClick={() => setActiveTab("users")} className={`px-3 py-3 rounded-lg text-left ${activeTab === 'users' ? 'bg-[#00b8a9]' : 'hover:bg-white/10'}`}>Users</button>
            <button onClick={() => setActiveTab("doctors")} className={`px-3 py-3 rounded-lg text-left ${activeTab === 'doctors' ? 'bg-[#00b8a9]' : 'hover:bg-white/10'}`}>Doctors</button>
            <button onClick={() => setActiveTab("appointments")} className={`px-3 py-3 rounded-lg text-left ${activeTab === 'appointments' ? 'bg-[#00b8a9]' : 'hover:bg-white/10'}`}>Appointments</button>
            <button onClick={() => setActiveTab("add-record")} className={`px-3 py-3 rounded-lg text-left ${activeTab === 'add-record' ? 'bg-[#00b8a9]' : 'hover:bg-white/10'}`}>Add Health Record</button>
          </nav>
        </div>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => setIsLogoutModalOpen(true)} className="px-3 py-3 rounded-lg text-left w-full hover:bg-white/10">Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-20 bg-white flex items-center px-8 sticky top-0 z-20 shadow-sm shrink-0">
          <h1 className="text-2xl font-bold text-[#002b3d] capitalize">
            {activeTab === 'dashboard' ? 'Admin Dashboard' : activeTab.replace('-', ' ')}
          </h1>
        </header>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#002b3d] mb-4">Welcome Admin</h2>
              <p className="text-gray-500">Manage your platform from the sidebar.</p>
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#f8fafc] text-gray-500 text-sm">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-4 font-medium">{user.name || "N/A"}</td>
                      <td className="p-4 text-gray-600">{user.email}</td>
                      <td className="p-4 text-gray-600">{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DOCTORS */}
        {activeTab === 'doctors' && (
          <div className="p-8 max-w-7xl mx-auto w-full">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {doctors.map((doc) => (
                 <div key={doc.id} className="bg-white p-6 rounded-2xl shadow-sm border text-center">
                   <h3 className="font-bold text-lg">{doc.user?.name || "Doctor"}</h3>
                   <p className="text-sm text-gray-500">{doc.specialization}</p>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#f8fafc] text-gray-500 text-sm">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Time</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="border-b">
                      <td className="p-4 font-medium">{new Date(apt.date).toLocaleDateString()}</td>
                      <td className="p-4 text-gray-600">{apt.timeSlot}</td>
                      <td className="p-4 text-gray-600">{apt.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🔥 ADD HEALTH RECORD (FULL WORKING FORM) */}
        {activeTab === 'add-record' && (
          <div className="p-8 max-w-2xl mx-auto w-full">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-[#002b3d] mb-6">Upload Patient Record</h2>
              
              <form onSubmit={handleAddRecord} className="space-y-5">
                
                {/* Select Patient */}
                <div>
                  <label className="block text-sm font-bold text-[#002b3d] mb-1.5">Select Patient</label>
                  <select 
                    value={selectedPatient} 
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none"
                    required
                  >
                    <option value="">-- Choose a Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.patientProfile?.id}>
                        {p.name} ({p.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Test Name (20 Dropdown) */}
                <div>
                  <label className="block text-sm font-bold text-[#002b3d] mb-1.5">Test Name</label>
                  <select 
                    value={testName} 
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none"
                    required
                  >
                    <option value="">-- Choose a Test --</option>
                    {medicalTests.map((test, index) => (
                      <option key={index} value={test}>{test}</option>
                    ))}
                  </select>
                </div>

                {/* Select Record Type */}
                <div>
                  <label className="block text-sm font-bold text-[#002b3d] mb-1.5">Record Category</label>
                  <select 
                    value={recordType} 
                    onChange={(e) => setRecordType(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl py-3 px-4 outline-none"
                  >
                    <option value="BLOOD_TEST">Blood Test</option>
                    <option value="X_RAY">X-Ray</option>
                    <option value="PRESCRIPTION">Prescription</option>
                    <option value="MRI">MRI</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* 🔥 File Upload Box */}
                <div>
                  <label className="block text-sm font-bold text-[#002b3d] mb-1.5">Upload File (Image / PDF)</label>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all"
                  >
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                    
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="h-32 object-contain mb-2" />
                    ) : file ? (
                      <div className="text-[#008c9e] font-bold mb-2">File Selected: {file.name}</div>
                    ) : (
                      <>
                        <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <p className="text-sm text-gray-500">Click to upload Image or PDF</p>
                      </>
                    )}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full bg-[#008c9e] text-white font-bold py-3 rounded-xl disabled:opacity-70 mt-4"
                >
                  {isSaving ? "Saving..." : "Save Record to Patient"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* LOGOUT MODAL */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-8 rounded-2xl text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Logout</h2>
            <div className="flex gap-3">
              <button onClick={() => setIsLogoutModalOpen(false)} className="px-6 py-2 border rounded-lg">Cancel</button>
              <Link href="/login" className="px-6 py-2 bg-[#008c9e] text-white rounded-lg">Logout</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
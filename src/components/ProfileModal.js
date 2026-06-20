"use client";

import { X, Camera, Save, LogOut, User, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { auth, storage } from "../libs/firebase.config";
import { updateProfile, onAuthStateChanged, signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";

export const ProfileModal = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [partnerCodeToJoin, setPartnerCodeToJoin] = useState("");
  const [collabMembers, setCollabMembers] = useState(1);
  const fileInputRef = useRef(null);

  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.displayName || "");
        setEmail(currentUser.email || "");
        setPhotoURL(currentUser.photoURL || "");

        // Load extended profile from local storage
        const storedProfile = localStorage.getItem(`xpnsr_profile_${currentUser.uid}`);
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          setPhone(parsed.phone || "");
          setBudget(parsed.budget || "");
          setCurrency(parsed.currency || "USD");
        }

        // Fetch Collab info
        fetch(`/api/collab?userId=${currentUser.uid}`)
          .then(res => res.json())
          .then(data => {
            if (data.inviteCode) setInviteCode(data.inviteCode);
            if (data.users) setCollabMembers(data.users.length);
          })
          .catch(err => console.error("Failed to fetch collab"));
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [isOpen]);

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setIsUploadingImage(true);
    try {
      // Create a reference to Firebase Storage
      const fileRef = ref(storage, `profiles/${user.uid}_${Date.now()}_${file.name}`);
      // Upload the file
      await uploadBytes(fileRef, file);
      // Get the downloaded URL
      const downloadURL = await getDownloadURL(fileRef);
      // Set to local state
      setPhotoURL(downloadURL);
    } catch (error) {
      console.error("Error uploading image: ", error);
      alert("Image upload failed. Please ensure Firebase Storage is configured and rules allow uploads.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleJoinCollab = async () => {
    if (!partnerCodeToJoin || !auth.currentUser) return;
    try {
      const res = await fetch('/api/collab/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: auth.currentUser.uid, inviteCode: partnerCodeToJoin })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Successfully joined collab!");
        setCollabMembers(data.users.length);
        setPartnerCodeToJoin("");
      } else {
        alert(data.error || "Failed to join");
      }
    } catch (err) {
      alert("Failed to join");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (auth.currentUser) {
        // Update Firebase profile
        await updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: photoURL,
        });

        // Update local storage for extended fields
        localStorage.setItem(
          `xpnsr_profile_${auth.currentUser.uid}`,
          JSON.stringify({
            phone,
            budget,
            currency,
          })
        );

        onClose();
      }
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" style={{ zIndex: 999999 }}>
      <div className="bg-[#1C1C1E] border border-white/10 w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
        
        {/* Left Column: Avatar & Basic Info */}
        <div className="w-full md:w-[35%] bg-black/20 p-8 border-r border-white/5 flex flex-col items-center justify-center relative">
          
          <div className="absolute top-4 left-4 md:hidden">
            <h2 className="text-[17px] font-semibold text-foreground tracking-tight">Edit Profile</h2>
          </div>

          <button onClick={onClose} className="absolute top-4 right-4 md:hidden p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            className="hidden"
          />

          <div 
            onClick={triggerFileInput}
            className="relative group cursor-pointer w-32 h-32 rounded-full ring-4 ring-white/10 overflow-hidden flex items-center justify-center mb-6 mt-8 md:mt-0 shadow-lg transition-transform hover:scale-105"
          >
            {isUploadingImage ? (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin" />
              </div>
            ) : null}

            {photoURL ? (
              <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-white/30" />
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
              <Camera className="w-8 h-8 text-white mb-2" />
              <span className="absolute bottom-4 text-[10px] uppercase tracking-wider font-medium text-white/70">Upload</span>
            </div>
          </div>
          
          <div className="w-full text-center space-y-1 mb-8">
            <h3 className="text-[19px] font-semibold text-foreground tracking-tight truncate px-2">{name || "Unnamed User"}</h3>
            <p className="text-[13px] text-white/50 truncate px-2">{email || "No Email Provided"}</p>
          </div>

          <div className="mt-auto w-full">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-red-500 hover:bg-red-500/10 rounded-[16px] transition-colors text-[15px] font-medium tracking-wide"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Right Column: Form Fields */}
        <div className="w-full md:w-[65%] p-8 flex flex-col relative">
          
          <div className="hidden md:flex justify-between items-center mb-8">
            <h2 className="text-[22px] font-semibold text-foreground tracking-tight">Account Settings</h2>
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6 flex-grow flex flex-col">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-auto">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium tracking-wider uppercase text-white/50 mb-2 ml-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-[16px] focus:ring-1 focus:ring-[#0A84FF] focus:border-[#0A84FF] outline-none text-foreground transition-all text-[15px] placeholder-white/20"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium tracking-wider uppercase text-white/50 mb-2 ml-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-[16px] focus:ring-1 focus:ring-[#0A84FF] focus:border-[#0A84FF] outline-none text-foreground transition-all text-[15px] placeholder-white/20"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium tracking-wider uppercase text-white/50 mb-2 ml-1">Monthly Target</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-[16px] focus:ring-1 focus:ring-[#0A84FF] focus:border-[#0A84FF] outline-none text-foreground transition-all text-[15px] placeholder-white/20"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium tracking-wider uppercase text-white/50 mb-2 ml-1">Primary Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-[16px] focus:ring-1 focus:ring-[#0A84FF] focus:border-[#0A84FF] outline-none text-foreground transition-all text-[15px] appearance-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              {/* Collab Section */}
              <div className="md:col-span-2 pt-4 mt-4 border-t border-white/5">
                <h3 className="text-sm font-semibold text-foreground tracking-tight mb-4 flex items-center justify-between">
                  Household Collaboration
                  {collabMembers > 1 && (
                    <span className="bg-[#32D74B]/20 text-[#32D74B] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                      Linked
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white/5 border border-white/10 rounded-[16px] p-4 flex flex-col justify-center">
                    <p className="text-[11px] font-medium tracking-wider uppercase text-white/50 mb-1">Your Invite Code</p>
                    <p className="font-mono text-xl text-white tracking-widest">{inviteCode || "..."}</p>
                    <p className="text-[10px] text-white/40 mt-1">Share this code with your partner</p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <label className="block text-[11px] font-medium tracking-wider uppercase text-white/50 mb-2 ml-1">Join a Partner</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={partnerCodeToJoin}
                        onChange={(e) => setPartnerCodeToJoin(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-[12px] focus:ring-1 focus:ring-[#0A84FF] focus:border-[#0A84FF] outline-none text-foreground transition-all text-[13px] placeholder-white/20 uppercase font-mono"
                        placeholder="ENTER CODE"
                      />
                      <button
                        type="button"
                        onClick={handleJoinCollab}
                        disabled={!partnerCodeToJoin}
                        className="px-4 py-3 bg-[#0A84FF] text-white rounded-[12px] text-[13px] font-medium hover:bg-opacity-90 disabled:opacity-50 transition-all"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={isSaving || isUploadingImage}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-white font-medium tracking-wide text-[15px] rounded-full transition-all duration-300 shadow-sm bg-[#0A84FF] hover:bg-opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Preferences"}
                {!isSaving && <Save className="w-5 h-5 ml-2" />}
              </button>
            </div>
          </form>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in > div {
          animation: fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
};

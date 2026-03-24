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
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ zIndex: 999999 }}>
      <div className="bg-[#0f0f0f] border border-neutral-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
        
        {/* Left Column: Avatar & Basic Info */}
        <div className="w-full md:w-[35%] bg-[#141414] p-8 border-r border-neutral-800/50 flex flex-col items-center justify-center relative">
          
          <div className="absolute top-4 left-4 md:hidden">
            <h2 className="text-xl font-bold text-white tracking-wide">Edit Profile</h2>
          </div>

          <button onClick={onClose} className="absolute top-4 right-4 md:hidden p-2 bg-neutral-800/50 rounded-full hover:bg-neutral-700 text-gray-400 hover:text-white transition">
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
            className="relative group cursor-pointer w-32 h-32 rounded-full ring-4 ring-green-500/20 overflow-hidden flex items-center justify-center mb-6 mt-8 md:mt-0 shadow-[0_0_30px_rgba(74,222,128,0.1)] transition-transform hover:scale-105"
          >
            {isUploadingImage ? (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
              </div>
            ) : null}

            {photoURL ? (
              <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-green-500/50" />
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
              <Camera className="w-8 h-8 text-white mb-2" />
              <span className="absolute bottom-4 text-[10px] uppercase tracking-widest font-mono text-gray-300 font-bold">Upload</span>
            </div>
          </div>
          
          <div className="w-full text-center space-y-1 mb-8">
            <h3 className="text-lg font-bold text-white truncate px-2">{name || "Unnamed User"}</h3>
            <p className="text-xs font-mono text-gray-500 truncate px-2">{email || "No Email Provided"}</p>
          </div>

          <div className="mt-auto w-full">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 border border-red-500/10 rounded-xl transition-colors text-sm font-bold uppercase tracking-widest font-mono"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Right Column: Form Fields */}
        <div className="w-full md:w-[65%] p-8 flex flex-col relative">
          
          <div className="hidden md:flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white tracking-wide">Account Settings</h2>
            <button onClick={onClose} className="p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:border-green-500/30 text-gray-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6 flex-grow flex flex-col">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-auto">
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 ml-1 font-mono">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-3.5 bg-[#141414] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none text-white transition-all text-sm font-mono placeholder-[#333]"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 ml-1 font-mono">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-5 py-3.5 bg-[#141414] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none text-white transition-all text-sm font-mono placeholder-[#333]"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 ml-1 font-mono">Monthly Target</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-5 py-3.5 bg-[#141414] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none text-white transition-all text-sm font-mono placeholder-[#333]"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 ml-1 font-mono">Primary Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-5 py-3.5 bg-[#141414] border border-neutral-800 rounded-xl focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none text-white transition-all text-sm font-mono appearance-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800/50 flex justify-end">
              <button
                type="submit"
                disabled={isSaving || isUploadingImage}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-black font-bold uppercase tracking-widest text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)] bg-green-500 hover:bg-green-400 hover:shadow-[0_0_30px_rgba(74,222,128,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
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

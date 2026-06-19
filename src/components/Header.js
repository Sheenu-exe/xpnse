import { User } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { auth } from "../libs/firebase.config"
import { onAuthStateChanged } from "firebase/auth"
import { ProfileModal } from "./ProfileModal"

export const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [name, setName] = useState("")
  const [photoURL, setPhotoURL] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setName(currentUser.displayName || "")
        setPhotoURL(currentUser.photoURL || "")
      } else {
        setName("")
        setPhotoURL("")
      }
    })
    return () => unsubscribe()
  }, [])

  return (
    <>
      <div className="flex justify-between items-center mb-6 relative z-50">
        {/* Logo & Brand Name */}
        <div className="flex items-center gap-3">
          <Image className="object-contain" width={140} height={40} src={"/logo.png"} alt="Xpnsr Logo" />
        </div>

        {/* Settings & Profile */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="p-1 pl-1.5 pr-4 bg-[#1C1C1E] border border-white/10 rounded-full hover:bg-[#2C2C2E] transition-all duration-300 flex items-center gap-3 shadow-sm group active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="h-4 w-4 text-white/70" />
              )}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block tracking-tight transition-colors duration-300">
              {name || "Profile"}
            </span>
          </button>
        </div>
      </div>

      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </>
  )
}



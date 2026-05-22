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
            className="p-1 pl-1.5 pr-4 bg-forest-800 rounded-full hover:bg-forest-700 transition flex items-center gap-3 shadow-luxury group"
          >
            <div className="w-9 h-9 rounded-full bg-forest-600 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="h-4 w-4 text-sage" />
              )}
            </div>
            <span className="text-sm font-bold text-cream/90 hidden sm:block font-mono tracking-tight group-hover:text-cream transition-colors">
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



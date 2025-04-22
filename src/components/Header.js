import { Bell, Settings } from "lucide-react"
import Image from "next/image"

export const Header = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      {/* Logo & Brand Name */}
      <div className="flex items-center gap-3">
        <Image className="p-2 bg-green-800 rounded-lg" width={40} height={40} src={"/logo.svg"} alt="Xpnsr Logo" />
        <h1 className="text-2xl font-bold text-white tracking-wide">XPNSR</h1>
      </div>

      {/* Notifications & Settings */}
      <div className="flex items-center gap-4">
        <button className="p-3 bg-neutral-800 rounded-full hover:bg-neutral-700 transition">
          <Bell className="h-5 w-5 text-gray-300" />
        </button>
        <button className="p-3 bg-neutral-800 rounded-full hover:bg-neutral-700 transition">
          <Settings className="h-5 w-5 text-gray-300" />
        </button>
      </div>
    </div>
  )
}


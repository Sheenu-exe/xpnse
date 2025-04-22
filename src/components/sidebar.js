import { PieChart, TrendingUp, Receipt } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const BottomNav = ({ children }) => {
  const pathname = usePathname() // Get current route

  const navItems = [
    { label: "Dashboard", icon: PieChart, key: "dashboard", src: "/home" },
    { label: "Expenses", icon: Receipt, key: "expenses", src: "/expense" },
    { label: "Analytics", icon: TrendingUp, key: "analytics", src: "/analytics" },
  ]

  return (
    <div className="flex flex-col bg-black">
      {/* Dynamic Content */}
      <div className="flex-1">{children}</div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-5 flex justify-center items-center">
        <div className="w-fit backdrop-blur-xl p-3 rounded-xl flex gap-6 shadow shadow-green-800/20">
          {navItems.map((item) => (
            <Link
              href={item.src}
              key={item.key}
              className={`flex flex-col items-center p-2 transition-all ${
                pathname === item.src ? "text-green-400" : "text-gray-400"
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BottomNav


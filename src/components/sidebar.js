import { PieChart, TrendingUp, Receipt, CreditCard } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const BottomNav = ({ children }) => {
  const pathname = usePathname() // Get current route

  const navItems = [
    { label: "Dashboard", icon: PieChart, key: "dashboard", src: "/home" },
    { label: "Subscriptions", icon: CreditCard, key: "subscriptions", src: "/subscriptions" },
    { label: "Expenses", icon: Receipt, key: "expenses", src: "/expense" },
    { label: "Analytics", icon: TrendingUp, key: "analytics", src: "/analytics" },
  ]

  return (
    <div className="flex flex-col bg-[#050505] min-h-screen">
      {/* Dynamic Content with extra padding so dock doesn't hide text at the bottom */}
      <div className="flex-1 pb-28">{children}</div>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex justify-center items-center pointer-events-none">
        <div className="w-fit bg-neutral-900/80 backdrop-blur-2xl p-2 px-6 rounded-3xl flex gap-10 border border-neutral-800 shadow-2xl shadow-green-500/10 pointer-events-auto items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.src
            return (
              <Link
                href={item.src}
                key={item.key}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all group ${
                  isActive ? "text-green-400" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-green-400/10 shadow-[0_0_15px_rgba(74,222,128,0.2)]" : ""}`}>
                  <item.icon className={`h-6 w-6 transition-all ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                </div>
                <span className={`text-[10px] mt-1 font-mono uppercase tracking-widest transition-all ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 absolute -bottom-4"}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BottomNav


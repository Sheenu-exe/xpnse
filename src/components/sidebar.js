import React, { useState } from "react"
import { PieChart, TrendingUp, Receipt, CreditCard, PiggyBank, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const BottomNav = ({ children }) => {
  const pathname = usePathname() // Get current route
  const [isNavExpanded, setIsNavExpanded] = useState(false)

  const navItems = [
    { label: "Dashboard", icon: PieChart, key: "dashboard", src: "/home" },
    { label: "Spends", icon: Receipt, key: "expenses", src: "/expense" },
    { label: "Stash", icon: PiggyBank, key: "savings", src: "/savings" },
    { label: "Subs", icon: CreditCard, key: "subscriptions", src: "/subscriptions" },
    { label: "Analytics", icon: TrendingUp, key: "analytics", src: "/analytics" },
  ]

  return (
    <div className="flex flex-col bg-forest-900 min-h-screen">
      {/* Dynamic Content with extra padding so dock doesn't hide text at the bottom */}
      <div className="flex-1 pb-28">{children}</div>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex justify-center items-center pointer-events-none w-[90%] md:w-auto">
        
        {/* Desktop Dock (Always expanded) */}
        <div className="hidden md:flex w-fit bg-forest-800/90 backdrop-blur-2xl p-2 px-6 rounded-luxury justify-center gap-10 shadow-luxury pointer-events-auto items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.src
            return (
              <Link
                href={item.src}
                key={item.key}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all group ${
                  isActive ? "text-sage" : "text-cream/50 hover:text-cream/80"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-sage/10 shadow-[0_0_15px_rgba(167,209,174,0.2)]" : ""}`}>
                  <item.icon className={`h-6 w-6 transition-all ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                </div>
                <span className={`text-[10px] mt-1 font-mono uppercase tracking-widest transition-all ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 absolute -bottom-4"}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Mobile Dock (Collapsable) */}
        <div className="md:hidden flex flex-col items-center pointer-events-auto relative">
          
          {/* Expanded Menu */}
          <div className={`bg-forest-800/95 backdrop-blur-2xl rounded-3xl p-3 shadow-luxury mb-4 transition-all duration-300 origin-bottom flex gap-3 overflow-x-auto max-w-[90vw] no-scrollbar ${isNavExpanded ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-10 pointer-events-none absolute bottom-12'}`}>
            {navItems.map((item) => {
              const isActive = pathname === item.src
              return (
                <Link
                  href={item.src}
                  key={item.key}
                  onClick={() => setIsNavExpanded(false)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all min-w-[60px] ${
                    isActive ? "bg-sage/10 text-sage border border-sage/20" : "text-cream/50 hover:bg-forest-700 hover:text-cream"
                  }`}
                >
                  <item.icon className={`h-6 w-6 mb-1 ${isActive ? "scale-110" : ""}`} />
                  <span className="text-[9px] font-mono uppercase tracking-widest">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Toggle Button */}
          <button 
            onClick={() => setIsNavExpanded(!isNavExpanded)}
            className="w-14 h-14 bg-forest-800/95 backdrop-blur-2xl border border-forest-600 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-full flex items-center justify-center text-sage transition-all hover:scale-105 active:scale-95 z-50 relative"
          >
            {isNavExpanded ? (
              <X className="w-6 h-6 animate-in spin-in-180" />
            ) : (
              // Find active icon to display
              (() => {
                const activeItem = navItems.find(item => pathname === item.src) || navItems[0];
                const ActiveIcon = activeItem.icon;
                return <ActiveIcon className="w-6 h-6 text-sage" />;
              })()
            )}
            
            {/* Notification Dot */}
            {!isNavExpanded && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-forest-800 rounded-full"></span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BottomNav


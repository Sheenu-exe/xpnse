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
    <div className="flex flex-col min-h-screen">
      {/* Dynamic Content with extra padding so dock doesn't hide text at the bottom */}
      <div className="flex-1 pb-28">{children}</div>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex justify-center items-center w-[90%] md:w-auto">
        
        {/* Universal Dock (Collapsible) */}
        <div className="flex flex-col items-center relative w-full md:w-auto pointer-events-auto">
          
          {/* Expanded Menu */}
          <div className={`glass-panel-heavy rounded-[32px] p-4 mb-4 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] flex gap-2 md:gap-4 overflow-x-auto max-w-[90vw] md:max-w-[60vw] no-scrollbar ${isNavExpanded ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-8 pointer-events-none absolute bottom-12'}`}>
            {navItems.map((item) => {
              const isActive = pathname === item.src
              return (
                <Link
                  href={item.src}
                  key={item.key}
                  onClick={() => setIsNavExpanded(false)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all min-w-[60px] md:min-w-[70px] ${
                    isActive ? "bg-white/10 text-foreground" : "text-white/40 hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <item.icon className={`h-6 w-6 mb-1.5 transition-transform ${isActive ? "scale-110 text-[#0A84FF]" : ""}`} />
                  <span className="text-[10px] md:text-[11px] font-medium tracking-wide">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Toggle Button (Minimized View) */}
          <button 
            onClick={() => setIsNavExpanded(!isNavExpanded)}
            className="w-14 h-14 md:w-16 md:h-16 glass-panel-heavy rounded-full flex items-center justify-center text-foreground transition-all duration-300 hover:scale-105 active:scale-95 z-50 relative"
          >
            {isNavExpanded ? (
              <X className="w-6 h-6 md:w-7 md:h-7 text-white/70 animate-in spin-in-180 duration-300" />
            ) : (
              // Find active icon to display
              (() => {
                const activeItem = navItems.find(item => pathname === item.src) || navItems[0];
                const ActiveIcon = activeItem.icon;
                return <ActiveIcon className="w-6 h-6 md:w-7 md:h-7 text-[#0A84FF]" />;
              })()
            )}
            
            {/* Notification Dot */}
            {!isNavExpanded && (
              <span className="absolute top-1 right-1 md:top-1.5 md:right-1.5 w-2.5 h-2.5 md:w-3 md:h-3 bg-[#0A84FF] rounded-full shadow-[0_0_8px_rgba(10,132,255,0.6)]"></span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BottomNav


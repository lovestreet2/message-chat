"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  User,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Messages", href: "/chat", icon: MessageSquare },
  { name: "Users", href: "/users", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="
          lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg
          bg-gradient-to-br from-[#0a3cff] via-[#00c6ff] to-[#0a3cff]
          text-white shadow-lg cursor-pointer
          transition-all duration-300
          hover:scale-110 hover:shadow-cyan-400/40
          active:scale-95
        "
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col
          bg-gradient-to-br from-[#020617] via-[#020b2d] to-[#0a3cff]
          shadow-2xl
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${mobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}  lg:translate-x-0  lg:hover:w-64 lg:w-16 overflow-hidden
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-4 py-6 border-b border-white/20 group relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition-transform duration-300 group-hover:rotate-6">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="
    flex flex-col overflow-hidden whitespace-nowrap
    transition-all duration-300

    lg:max-w-0 lg:opacity-0
    lg:group-hover:max-w-xs lg:group-hover:opacity-100

    max-w-xs opacity-100
  ">
              <h1 className="text-lg font-bold text-white tracking-wide">
                Message App
              </h1>
              <p className="text-xs text-white/70">
                Chat Platform
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    group cursor-pointer
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-300 overflow-hidden 
                    ${isActive
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-white/70 hover:bg-white/10 hover:translate-x-1"
                    }
                  `}
                >
                  <item.icon
                    className="
                      h-5 w-5
                      transition-transform duration-300
                      group-hover:scale-110 group-hover:rotate-3
                    "
                  />
                  <span
                    className="
                       flex-1 whitespace-nowrap overflow-hidden
            lg:opacity-0 lg:w-0 transition-all duration-300
            lg:group-hover:opacity-100 lg:group-hover:w-full opacity-100 w-full
                    "
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Profile Dropdown */}
          <div className="border-t border-white/20 p-4 relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="
                group cursor-pointer
                flex items-center gap-3 w-full px-4 py-3 rounded-lg
                bg-white/10 hover:bg-white/20
                transition-all duration-300  hover:shadow-lg hover:shadow-cyan-400/20
              "
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate transition-all duration-300
          group-hover:text-cyan-300 group-hover:tracking-wide">
                  {session?.user?.name || session?.user?.email || "User"}
                </p>
                <p className="text-xs text-white/70 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </button>

            {profileOpen && (
              <div
                className="
                  absolute left-0 bottom-full mb-2 w-full
                  bg-white/10 backdrop-blur-xl
                  border border-white/20
                  rounded-xl shadow-2xl
                  flex flex-col z-50
                  animate-in fade-in slide-in-from-bottom-3
                "
              >
                <Link
                  href="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="
                    group cursor-pointer
                    px-4 py-3 text-sm text-white
                    flex items-center gap-3
                    hover:bg-white/20
                    transition-all duration-300 transform
                  "
                >
                  <User className="h-4 w-4 transition-all duration-300
            group-hover:scale-125 group-hover:text-cyan-300" />
                  <span className="group-hover:text-cyan-300 group-hover:tracking-wide">
                    Profile
                  </span>
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="
                    group cursor-pointer
                    px-4 py-3 text-sm
                    hover:bg-red-500/20
                    text-red-400
                    flex items-center gap-3
                    rounded-b-xl
                    transition-all cursor-pointer duration-300
          hover:shadow-inner hover:shadow-red-500/30
                  "
                >
                  <LogOut className="h-4 w-4 transition-all duration-300
            group-hover:scale-125 group-hover:-rotate-12" /> <span className="group-hover:text-red-300 group-hover:tracking-wide">
                    Logout
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden cursor-pointer"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

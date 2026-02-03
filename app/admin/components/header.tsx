"use client";

import { Bell, Search, User } from 'lucide-react';

interface HeaderProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
}

export default function Header({ user }: HeaderProps) {
  return (
    /* Updated gradient: 
       bg-gradient-to-b (top to bottom)
       from-[#23538a] (Deep Blue)
       to-[#8a9db0]   (Slate Grey)
    */
    <header className="bg-gradient-to-b from-[#23538a] to-[#8a9db0] shadow-md border-b border-white/10 rounded-b-2xl">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Search Section */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-white/60" />
              </div>
              <input
                type="search"
                className="block w-full pl-10 pr-3 py-2 border border-white/20 rounded-lg leading-5 bg-black/30 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:ring-1 focus:ring-white/30 sm:text-sm backdrop-blur-md"
                placeholder="Search..."
              />
            </div>
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-white/80 hover:bg-white/10 transition-all focus:outline-none">
              <Bell className="h-6 w-6" />
            </button>
            
            {/* User Profile Pill */}
            <div className="flex items-center space-x-3 bg-black/10 p-1 pr-4 rounded-full border border-white/10">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-inner">
                  <User className="h-5 w-5 text-[#23538a]" />
                </div>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-[10px] uppercase tracking-tighter text-white/70">
                  {user?.role}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
"use client";

import { 
  Home, 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  MessageCircle,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    router.push('/auth/login');
  };

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      {/* Sidebar background updated to match header gradient */}
      <div className="flex flex-col flex-grow bg-gradient-to-b from-[#23538a] to-[#8a9db0] border-r border-white/10 pt-5 pb-4 overflow-y-auto">
        
        {/* Logo Section */}
        <div className="flex items-center flex-shrink-0 px-6">
          <Shield className="h-8 w-8 text-white" />
          <span className="ml-2 text-xl font-bold text-white">Admin Panel</span>
        </div>
        
        <div className="mt-8 flex-1 flex flex-col">
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  /* Updated active/hover states for glassmorphism effect */
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/30'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-white' : 'text-white/60 group-hover:text-white/90'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* Logout Button Section */}
          <div className="px-4 mt-4 border-t border-white/10 pt-4">
            <button
              onClick={handleLogout}
              /* Modified red to be more visible against the slate background */
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-200 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-300" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
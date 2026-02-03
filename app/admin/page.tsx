"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  User, 
  Users, 
  PlusCircle, 
  Edit, 
  Trash2,
  BarChart3,
  Shield
} from 'lucide-react';

interface AdminData {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setAdmin(parsedUser);
      fetchUsers(token);
    } catch (error) {
      console.error('Error:', error);
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const fetchUsers = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.data) setUsers(data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth/login');
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure?')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) fetchUsers(token || '');
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#23538a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    /* MAIN WRAPPER: Added fixed background image with a gradient overlay.
       Replace 'your-image-url.jpg' with your actual image path.
    */
    <div className="relative min-h-screen w-full overflow-x-hidden bg-fixed bg-cover bg-center" 
         style={{ backgroundImage: `linear-gradient(to bottom, rgba(35, 83, 138, 0.9), rgba(138, 157, 176, 0.8)), url('../public/images/image.jpg')` }}>
      
      {/* Navbar - Styled with matching gradient */}
      <nav className="bg-gradient-to-r from-[#23538a] to-[#2d66a1] shadow-lg sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white tracking-tight">Admin Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 py-1.5 px-3 rounded-full border border-white/20">
                <div className="h-7 w-7 bg-white rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-[#23538a]" />
                </div>
                <span className="text-white text-sm font-medium">
                  {admin?.firstName}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-100 rounded-lg hover:bg-red-500/40 transition-all border border-red-500/30"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="mb-10 text-white drop-shadow-md">
          <h1 className="text-4xl font-extrabold mb-2">
            Welcome back, {admin?.firstName}!
          </h1>
          <p className="text-white/80 font-medium">
            System Overview & User Management
          </p>
        </div>

        {/* Stats Cards - Added glassmorphism style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Users', val: users.length, Icon: Users, color: 'bg-blue-500' },
            { label: 'Active Today', val: '12', Icon: BarChart3, color: 'bg-emerald-500' },
            { label: 'Admins', val: users.filter(u => u.role === 'admin').length, Icon: Shield, color: 'bg-purple-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20 transform transition hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-4xl font-black text-gray-900 mt-1">{stat.val}</p>
                </div>
                <div className={`h-14 w-14 ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <stat.Icon className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Users Table - Glassy White */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-800">User Directory</h2>
            <button
              onClick={() => router.push('/admin/users/create')}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[#23538a] text-white rounded-xl hover:bg-[#1a3e68] transition-all shadow-lg active:scale-95"
            >
              <PlusCircle className="h-5 w-5" />
              <span className="font-bold">Add New Member</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-100/50 text-gray-600">
                  <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-widest">User Details</th>
                  <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-widest">Email Address</th>
                  <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-widest">Permission</th>
                  <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#23538a] to-[#8a9db0] flex items-center justify-center text-white font-bold shadow-sm">
                          {user.firstName[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-gray-400">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-600 font-medium">{user.email}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 space-x-3">
                      <button onClick={() => router.push(`/admin/users/${user._id}/edit`)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit className="h-5 w-5" /></button>
                      <button onClick={() => handleDeleteUser(user._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="h-5 w-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
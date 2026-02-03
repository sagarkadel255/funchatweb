"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, MessageSquare, Settings, Bell, LogOut, 
  Phone, Video, MoreVertical, Paperclip, Smile, Mic, ChevronRight, Send,
  Search, X, CheckCheck, Check
} from 'lucide-react';

// --- MOCK DATA ---
const dummyBoy = "https://api.dicebear.com/7.x/avataaars/svg?seed=Buster"; // Consistent "Dummy Boy" image

const mockUsers = {
  'ayush': {
    id: 'ayush',
    name: 'Ayush',
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayush",
    online: true,
    lastSeen: 'Active Now',
    status: '✨ Working on new features',
  },
  'helen': {
    id: 'helen',
    name: 'Helen',
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Helen",
    online: true,
    lastSeen: 'Active Now',
    status: '📱 In a meeting',
  },
  'adhar': {
    id: 'adhar',
    name: 'Adhar',
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adhar",
    online: false,
    lastSeen: '2 hours ago',
    status: '🎯 Available later',
  },
  'yauson': {
    id: 'yauson',
    name: 'Yauson',
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yauson",
    online: true,
    lastSeen: 'Active Now',
    status: '🚀 Ready to collaborate',
  },
};

const mockMessages = {
  'ayush': [
    { id: '1', senderId: 'ayush', text: "Hi there, How are you?", timestamp: "9:20 AM", isMe: false, read: true },
    { id: '2', senderId: 'me', text: "I am great, Thanks!", timestamp: "9:23 AM", isMe: true, read: true },
    { id: '3', senderId: 'helen', text: "Can you send me my newest work schedule?", timestamp: "9:25 AM", isMe: false, read: true },
    { id: '4', senderId: 'me', text: "Sure! Just sent it to your email", timestamp: "9:26 AM", isMe: true, read: true },
  ],
  'helen': [
    { id: '1', senderId: 'helen', text: "The files are ready", timestamp: "10:15 AM", isMe: false, read: false },
    { id: '2', senderId: 'me', text: "Perfect! I'll review them now", timestamp: "10:17 AM", isMe: true, read: true },
  ],
};

const groupChats = [
  { id: 'dev-team', name: 'Development Team', lastMsg: 'Sprint ends Friday', online: true, avatar: '👨‍💻' },
  { id: 'design-sync', name: 'Design Sync', lastMsg: 'Check the new UI', online: true, avatar: '🎨' },
];


export default function AdvancedChatApplication() {
  const [selectedChat, setSelectedChat] = useState('ayush');
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNav, setActiveNav] = useState('messages');
  const [messages, setMessages] = useState(mockMessages['ayush']);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSelectChat = (Id: string) => {
    setSelectedChat(Id);
    setMessages(mockMessages[Id as keyof typeof mockMessages] || []);
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      read: true
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  const filteredContacts = Object.values(mockUsers).filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentUser = mockUsers[selectedChat as keyof typeof mockUsers];

  return (
    <div className="flex h-screen w-full bg-[#f4f7f9] overflow-hidden p-0 md:p-4 gap-0 md:gap-4">
      
      {/* === 1. SIDEBAR NAVIGATION (With Steel Gradient) === */}
      <nav className="hidden lg:flex w-24 bg-gradient-to-b from-[#23538a] to-[#3a6da3] flex-col items-center py-8 shadow-2xl rounded-r-none md:rounded-[32px] border-r border-white/10">
        <div className="h-14 w-14 rounded-full bg-white/20 overflow-hidden border-2 border-white/40 mb-12 cursor-pointer hover:scale-105 transition-transform shadow-lg">
          <img src={dummyBoy} alt="Me" className="w-full h-full" />
        </div>
        
        <div className="flex-1 flex flex-col gap-8">
          <NavIcon icon={Home} active={activeNav === 'home'} onClick={() => setActiveNav('home')} tooltip="Home" />
          <NavIcon icon={MessageSquare} active={activeNav === 'messages'} onClick={() => setActiveNav('messages')} tooltip="Messages" />
          <NavIcon icon={Bell} active={activeNav === 'notifications'} onClick={() => setActiveNav('notifications')} tooltip="Alerts" badge={3} />
          <NavIcon icon={Settings} active={activeNav === 'settings'} onClick={() => setActiveNav('settings')} tooltip="Settings" />
        </div>

        <button className="text-white/60 hover:text-red-300 transition-colors p-3 mt-auto">
          <LogOut className="w-6 h-6" />
        </button>
      </nav>

      {/* === 2. CONTACTS PANE (Glassmorphism over background) === */}
      <div className="w-full md:w-96 flex flex-col gap-4 bg-white/70 backdrop-blur-xl md:rounded-[32px] border-x md:border border-slate-200 overflow-hidden p-6 shadow-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#23538a]/30 transition-all text-slate-700"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Pinned Groups</h3>
            <div className="space-y-2">
              {groupChats.map((group) => (
                <div key={group.id} className="flex items-center gap-3 p-3 bg-white/40 hover:bg-white rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-200">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-[#8a9db0] to-[#23538a] flex items-center justify-center text-lg shadow-sm">{group.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#1A3E68] truncate">{group.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{group.lastMsg}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Direct Messages</h3>
            <div className="space-y-2">
              {filteredContacts.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectChat(user.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedChat === user.id ? 'bg-gradient-to-r from-[#23538a] to-[#456d9a] text-white shadow-lg' : 'hover:bg-white/80'}`}
                >
                  <div className="relative">
                    <img src={user.avatar} className="h-11 w-11 rounded-full bg-slate-200 ring-2 ring-white/20" alt="" />
                    {user.online && <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className={`text-sm font-bold truncate ${selectedChat === user.id ? 'text-white' : 'text-slate-800'}`}>{user.name}</h4>
                    <p className={`text-[10px] truncate ${selectedChat === user.id ? 'text-white/70' : 'text-slate-500'}`}>{user.lastSeen}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* === 3. MAIN CHAT AREA (With Steel Gradient Header) === */}
      <main className="hidden md:flex flex-1 bg-white md:rounded-[40px] shadow-2xl flex-col overflow-hidden border border-slate-200">
        {currentUser && (
          <>
            <header className="px-8 py-5 flex justify-between items-center bg-gradient-to-r from-[#23538a] to-[#8a9db0] text-white">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl overflow-hidden ring-2 ring-white/30 shadow-md">
                  <img src={currentUser.avatar} alt="" className="w-full h-full" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{currentUser.name}</h3>
                  <p className="text-white/70 text-xs">{currentUser.online ? 'Online' : currentUser.lastSeen}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-white/10 rounded-xl transition"><Phone className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-white/10 rounded-xl transition"><Video className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-white/10 rounded-xl transition"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-[#f8fafc]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[70%] px-5 py-3 rounded-2xl shadow-sm text-sm font-medium ${
                    msg.isMe 
                    ? 'bg-gradient-to-br from-[#23538a] to-[#456d9a] text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                  }`}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 px-1 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {msg.isMe && (msg.read ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3" />)}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100">
              <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 shadow-inner">
                  <Paperclip className="text-slate-400 w-5 h-5 cursor-pointer hover:text-[#23538a]" />
                  <input 
                    type="text" placeholder="Type your message..."
                    className="bg-transparent border-none focus:ring-0 text-slate-700 placeholder-slate-400 flex-1 px-4 text-sm"
                    value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Smile className="text-slate-400 w-5 h-5 cursor-pointer hover:text-[#23538a]" />
                </div>
                <button type="submit" className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#23538a] to-[#456d9a] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                  {inputValue ? <Send className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

function NavIcon({ icon: Icon, active, onClick, tooltip, badge }: any) {
  return (
    <div className="relative group">
      <button onClick={onClick} className={`p-3 rounded-2xl transition-all ${active ? 'bg-white/20 text-white shadow-xl ring-1 ring-white/30' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
        <Icon className="w-6 h-6" />
        {badge && <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-md">{badge}</span>}
      </button>
      <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {tooltip}
      </div>
    </div>
  );
}
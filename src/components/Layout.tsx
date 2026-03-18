"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  ExternalLink
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { isDemoMode, supabase } from '@/lib/supabase';

export const Layout = ({ children, user }: { children: React.ReactNode, user: { name: string, email: string } }) => {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    if (isDemoMode) {
      document.cookie = "demo-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      router.push("/login");
      return;
    }
    await supabase.auth.signOut();
    router.push("/login");
  };

  const menuItems = [
    { icon: <LayoutDashboard size={22} />, label: 'Dashboard', href: '/' },
    { icon: <Users size={22} />, label: 'Clientes', href: '/clientes' },
    { icon: <Package size={22} />, label: 'Produtos', href: '/produtos' },
    { icon: <ShoppingCart size={22} />, label: 'Pedidos', href: '/pedidos' },
    { icon: <ExternalLink size={22} />, label: 'Catálogo Público', href: '/catalogo', public: true },
    { icon: <FileText size={22} />, label: 'Arquivo Fiscal', href: '/nf' },
    { icon: <BarChart3 size={22} />, label: 'Relatórios', href: '/relatorios' },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 lg:relative
        ${isSidebarOpen ? 'w-72' : 'w-24'} 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-[#1a3a70] text-white transition-all duration-500 ease-in-out 
        flex flex-col shadow-2xl
      `}>
        {/* Toggle Button */}
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)} 
          className="absolute -right-3 top-10 bg-[#ff6b35] text-white p-1 rounded-full border-2 border-[#f8fafc] shadow-lg hover:scale-110 transition-transform hidden lg:block"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="p-8 flex items-center justify-center border-b border-white/5 h-44">
          {isSidebarOpen ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-56 h-28 transform transition-all hover:scale-110 duration-500">
                 <Image 
                   src="/brand-final.png" 
                   alt="GAMA Logo Official" 
                   fill
                   className="object-contain"
                   priority
                 />
              </div>
            </div>
          ) : (
            <div className="relative w-14 h-14 flex-shrink-0 p-1">
              <Image 
                src="/brand-final.png" 
                alt="GAMA" 
                fill
                className="object-contain"
              />
            </div>
          )}
        </div>
        
        <nav className="flex-1 mt-8 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <a 
                key={idx} 
                href={item.href} 
                target={(item as any).public ? "_blank" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center p-4 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-linear-to-r from-[#ff6b35] to-[#f97316] text-white shadow-lg shadow-orange-500/30' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'}
                  ${!isSidebarOpen && 'lg:justify-center'}
                `}
              >
                <div className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  {item.icon}
                </div>
                {isSidebarOpen && <span className="ml-4 font-semibold text-sm">{item.label}</span>}
              </a>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 bg-white/5">
          {isSidebarOpen ? (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-indigo-600 border-2 border-white/20 p-0.5 shadow-lg">
                <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                   <div className="text-sm font-bold">{user.name.charAt(0)}</div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{user.name}</p>
                <p className="text-[10px] opacity-50 truncate tracking-wide">{user.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-indigo-600 border-2 border-white/20 flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold">{user.name.charAt(0)}</span>
               </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <header className="h-24 px-4 lg:px-10 flex items-center justify-between border-b border-white/60 bg-white/40 backdrop-blur-3xl sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setMobileMenuOpen(true)}
               className="lg:hidden p-2 text-[#1a3a70] hover:bg-white/50 rounded-lg transition-colors"
             >
               <LayoutDashboard size={24} />
             </button>
             <h2 className="text-lg lg:text-xl font-black tracking-tight text-[#1a3a70] truncate max-w-[200px] lg:max-w-none">
               Bem-vindo de volta, <span className="text-[#ff6b35]">{user.name.split(' ')[0]}</span>!
             </h2>
             {isDemoMode && (
               <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-orange-200">
                 Modo Demonstração
               </span>
             )}
          </div>
           <div className="flex items-center gap-6 relative">
             <button 
               onClick={() => setNotificationsOpen(!isNotificationsOpen)}
               className="relative p-2 text-gray-400 hover:text-[#1a3a70] transition-all group active:scale-95"
             >
               <Bell size={22} />
               <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-125 transition-transform" />
             </button>

             {isNotificationsOpen && (
               <>
                 <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
                 <div className="absolute top-full right-0 mt-4 w-80 glass-card rounded-[1.5rem] shadow-2xl shadow-[#1a3a70]/10 border border-white/60 p-6 z-20 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="text-sm font-black text-[#1a3a70] uppercase tracking-widest">Notificações</h3>
                     <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-lg font-black">2 Novas</span>
                   </div>
                   
                   <div className="space-y-4">
                     {[
                       { title: "Meta de Vendas!", desc: "Atingimos 85% do objetivo mensal.", time: "5 min atrás", icon: "🚀", color: "bg-orange-50" },
                       { title: "Estoque Baixo", desc: "Snapback Classic (G) está abaixo de 10 unidades.", time: "2h atrás", icon: "⚠️", color: "bg-red-50" },
                     ].map((note, i) => (
                       <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-white/40 transition-colors cursor-pointer group">
                         <div className={`h-10 w-10 shrink-0 rounded-xl ${note.color} flex items-center justify-center text-lg`}>
                           {note.icon}
                         </div>
                         <div>
                           <p className="text-xs font-black text-[#1a3a70] group-hover:text-[#ff6b35] transition-colors">{note.title}</p>
                           <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-0.5">{note.desc}</p>
                           <p className="text-[9px] text-gray-300 font-bold uppercase mt-1">{note.time}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                   
                   <button className="w-full mt-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a3a70] hover:bg-gray-50 rounded-xl transition-all border border-gray-100/50">
                     Limpar Tudo
                   </button>
                 </div>
               </>
             )}
             <div className="h-8 w-[1px] bg-gray-100" />
             <div className="flex items-center gap-3">
               <div className="text-right flex flex-col items-end">
                 <p className="text-xs font-bold text-[#1a3a70]">GAMA CRM PRO</p>
                 <p className="text-[10px] text-gray-400">v1.2 // March 2026</p>
               </div>
             </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

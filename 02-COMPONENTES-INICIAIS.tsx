"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Menu, 
  X,
  Plus
} from 'lucide-react';

/**
 * CRM GAMA BONÉS - COMPONENTE DE LAYOUT BASE
 */
export const Layout = ({ children, user }: { children: React.ReactNode, user: { name: string, email: string } }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/' },
    { icon: <Users size={20} />, label: 'Clientes', href: '/clientes' },
    { icon: <Package size={20} />, label: 'Produtos', href: '/produtos' },
    { icon: <ShoppingCart size={20} />, label: 'Pedidos', href: '/pedidos' },
    { icon: <FileText size={20} />, label: 'Notas Fiscais', href: '/nf' },
    { icon: <BarChart3 size={20} />, label: 'Relatórios', href: '/relatorios' },
  ];

  return (
    <div className="flex h-screen bg-[#f5f5f5] text-[#1a3a70]">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#1a3a70] text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex justify-between items-center border-b border-white/10">
          {isSidebarOpen && <span className="font-bold text-xl tracking-wider">GAMA BONÉS</span>}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/10 rounded">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 mt-4">
          {menuItems.map((item, idx) => (
            <a key={idx} href={item.href} className="flex items-center p-4 hover:bg-[#ff6b35] transition-colors gap-4">
              {item.icon}
              {isSidebarOpen && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 text-xs">
          {isSidebarOpen && (
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="opacity-60">{user.email}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
};

/**
 * CABEÇALHO DE PÁGINA
 */
export const PageHeader = ({ title, action }: { title: string, action?: { label: string, onClick: () => void } }) => (
  <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h1 className="text-2xl font-bold">{title}</h1>
    {action && (
      <button 
        onClick={action.onClick}
        className="bg-[#ff6b35] hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-opacity"
      >
        <Plus size={20} />
        {action.label}
      </button>
    )}
  </div>
);

/**
 * CARD DE ESTATÍSTICA
 */
export const StatCard = ({ label, value, trend }: { label: string, value: string, trend?: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <p className="text-gray-500 text-sm font-medium">{label}</p>
    <h3 className="text-3xl font-bold mt-2">{value}</h3>
    {trend && <p className="text-green-500 text-sm mt-2 font-semibold">{trend}</p>}
  </div>
);

/**
 * TABELA REUTILIZÁVEL
 */
export const Table = ({ columns, data, actions }: { 
  columns: { key: string, label: string }[], 
  data: any[],
  actions?: { label: string, onClick: (item: any) => void }[]
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          {columns.map(col => (
            <th key={col.key} className="p-4 font-semibold text-sm">{col.label}</th>
          ))}
          {actions && <th className="p-4 font-semibold text-sm text-right">Ações</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50/50 transition-colors">
            {columns.map(col => (
              <td key={col.key} className="p-4 text-sm">{row[col.key]}</td>
            ))}
            {actions && (
              <td className="p-4 text-right">
                {actions.map((act, j) => (
                  <button 
                    key={j} 
                    onClick={() => act.onClick(row)}
                    className="text-[#ff6b35] hover:underline font-medium text-sm ml-4"
                  >
                    {act.label}
                  </button>
                ))}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

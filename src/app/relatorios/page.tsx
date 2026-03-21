"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

export default function RelatatoriosPage() {
  const data = [
    { name: "Jan", vendas: 4000, meta: 2400 },
    { name: "Fev", vendas: 3000, meta: 1398 },
    { name: "Mar", vendas: 2000, meta: 9800 },
    { name: "Abr", vendas: 2780, meta: 3908 },
    { name: "Mai", vendas: 1890, meta: 4800 },
    { name: "Jun", vendas: 3390, meta: 3800 },
  ];

  const categoryData = [
    { name: 'Eletrônicos', value: 45 },
    { name: 'Utilidades', value: 25 },
    { name: 'Acessórios', value: 20 },
    { name: 'Vestuário', value: 10 },
  ];

  const COLORS = ['#1a3a70', '#ff6b35', '#2563eb', '#10b981'];

  return (
    <div>
      <PageHeader title="Relatórios e Análises" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass-card p-10 rounded-[2.5rem] shadow-2xl shadow-[#1a3a70]/5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-[#1a3a70] tracking-tighter">Crescimento de Vendas</h2>
            <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
              Alta de 12% vs Mês Ant.
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff6b35" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontWeight: 700, fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontWeight: 700, fontSize: 10}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="meta" stroke="#1a3a70" fillOpacity={1} fill="#f3f4f6" />
                <Area type="monotone" dataKey="vendas" stroke="#ff6b35" fillOpacity={1} fill="url(#colorVendas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl shadow-[#1a3a70]/5">
           <h2 className="text-xl font-black text-[#1a3a70] mb-8 tracking-tighter">Mix de Produtos</h2>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={categoryData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={8}
                   dataKey="value"
                 >
                   {categoryData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
                 <Legend verticalAlign="bottom" height={36}/>
               </PieChart>
             </ResponsiveContainer>
           </div>
            <div className="glass-card p-8 rounded-[2rem] shadow-sm transform hover:scale-105 transition-all animate-in fade-in zoom-in duration-500 delay-100">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">Top Categoria</p>
              <p className="text-2xl font-black text-[#1a3a70] text-center">Eletrônicos <span className="text-[#ff6b35]">(45%)</span></p>
            </div>
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl shadow-[#1a3a70]/5">
             <h3 className="text-xl font-black text-[#1a3a70] mb-6 tracking-tighter">Top Cidades</h3>
             <ul className="space-y-6">
               {[
                 { city: "São Paulo", val: "R$ 45.000", p: "45%" },
                 { city: "Rio de Janeiro", val: "R$ 28.000", p: "28%" },
                 { city: "Belo Horizonte", val: "R$ 12.000", p: "12%" },
               ].map((item, i) => (
                 <li key={i} className="flex justify-between items-center text-sm group">
                   <span className="font-bold text-gray-500 group-hover:text-[#1a3a70] transition-colors">{item.city}</span>
                   <div className="flex items-center gap-6">
                     <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden hidden lg:block">
                        <div className="h-full bg-[#ff6b35]" style={{width: item.p}} />
                     </div>
                     <span className="text-gray-400 font-bold tabular-nums">{item.p}</span>
                     <span className="font-black text-[#1a3a70] min-w-20 text-right">{item.val}</span>
                   </div>
                 </li>
               ))}
             </ul>
           </div>
           
         <div className="bg-[#1a3a70] p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/40 text-white flex flex-col justify-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/10 transition-colors" />
           <p className="text-white/50 text-[10px] uppercase font-black tracking-[0.3em] mb-4 text-center">Retorno Sobre Investimento (ROI)</p>
           <p className="text-7xl font-black text-center text-[#ff6b35] tracking-tighter drop-shadow-lg scale-110">4.8<span className="text-3xl text-white">x</span></p>
           <div className="mt-10 flex flex-col items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">Performance Excepcional</p>
              <p className="text-white/30 text-[8px] mt-2 italic">Calculado com base em dados de ads simulados</p>
           </div>
         </div>
        </div>
    </div>
  );
}

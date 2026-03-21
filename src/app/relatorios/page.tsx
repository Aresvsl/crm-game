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
  Legend,
  BarChart,
  Bar
} from "recharts";
import { TrendingUp, DollarSign, Users, Award, Download, Calendar } from "lucide-react";

export default function RelatoriosPage() {
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
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <PageHeader title="Painel Estratégico Elite" />
          <p className="text-gray-400 font-medium text-sm -mt-6">Análise de performance em tempo real da Gama Variedades.</p>
        </div>
        <button 
          onClick={() => alert("Gerando relatório executivo...")}
          className="px-6 py-3 bg-[#1a3a70] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-900/20 flex items-center gap-3"
        >
          <Download size={14} />
          Exportar Relatório
        </button>
      </div>
      
      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { icon: <TrendingUp />, label: "Crescimento", val: "+24.8%", sub: "vs mês anterior", color: "emerald" },
          { icon: <DollarSign />, label: "Ticket Médio", val: "R$ 184,50", sub: "Estável", color: "blue" },
          { icon: <Users />, label: "Novos Clientes", val: "142", sub: "+12 novos hoje", color: "orange" },
          { icon: <Award />, label: "Taxa de Conversão", val: "3.2%", sub: "Acima da meta", color: "purple" },
        ].map((kpi, i) => (
          <div key={i} className="glass-card p-6 rounded-[2rem] shadow-sm transform hover:-translate-y-1 transition-all">
            <div className={`p-3 rounded-2xl mb-4 w-fit bg-gray-50 text-[#1a3a70]`}>
              {kpi.icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-2xl font-black text-[#1a3a70] tracking-tighter">{kpi.val}</p>
            <p className="text-[10px] text-gray-500 font-bold mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
        <div className="lg:col-span-2 glass-card p-10 rounded-[2.5rem] shadow-2xl shadow-[#1a3a70]/5 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
               <div className="w-1.5 h-8 bg-[#ff6b35] rounded-full" />
               <h2 className="text-2xl font-black text-[#1a3a70] tracking-tighter">Fluxo de Faturamento</h2>
            </div>
            <div className="flex gap-2">
               <div className="px-3 py-1.5 bg-gray-50 text-[#1a3a70]/40 rounded-lg text-[8px] font-black uppercase tracking-widest border border-gray-100">Meta</div>
               <div className="px-3 py-1.5 bg-[#ff6b35]/10 text-[#ff6b35] rounded-lg text-[8px] font-black uppercase tracking-widest border border-orange-100">Realizado</div>
            </div>
          </div>
          <div className="h-80 w-full group-hover:scale-[1.01] transition-transform duration-700">
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
                <Tooltip 
                  cursor={{stroke: '#1a3a70', strokeWidth: 1}}
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '15px'}} 
                />
                <Area type="monotone" dataKey="meta" stroke="#1a3a70" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="transparent" />
                <Area type="monotone" dataKey="vendas" stroke="#ff6b35" strokeWidth={4} fillOpacity={1} fill="url(#colorVendas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl shadow-[#1a3a70]/5 flex flex-col">
           <h2 className="text-xl font-black text-[#1a3a70] mb-8 tracking-tighter">Mix de Categorias</h2>
           <div className="h-64 w-full mb-6">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={categoryData}
                   cx="50%"
                   cy="50%"
                   innerRadius={65}
                   outerRadius={85}
                   paddingAngle={10}
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
            <div className="mt-auto glass-card p-6 rounded-2xl bg-indigo-50/30 border border-indigo-100/50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Top Categoria</p>
              <p className="text-xl font-black text-[#1a3a70]">Eletrônicos <span className="text-[#ff6b35] text-sm ml-2">45% do Mix</span></p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl shadow-[#1a3a70]/5">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-black text-[#1a3a70] tracking-tighter">Geolocalização de Vendas</h3>
             <Calendar size={18} className="text-gray-300" />
          </div>
          <ul className="space-y-6">
            {[
              { city: "São Paulo", val: "R$ 45.000", p: "45%", color: "#1a3a70" },
              { city: "Rio de Janeiro", val: "R$ 28.000", p: "28%", color: "#3b82f6" },
              { city: "Belo Horizonte", val: "R$ 12.000", p: "12%", color: "#60a5fa" },
              { city: "Curitiba", val: "R$ 8.500", p: "8%", color: "#93c5fd" },
            ].map((item, i) => (
              <li key={i} className="flex justify-between items-center text-sm group">
                <span className="font-bold text-gray-500 group-hover:text-[#1a3a70] transition-colors">{item.city}</span>
                <div className="flex items-center gap-6">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden hidden lg:block">
                     <div className="h-full group-hover:animate-pulse transition-all" style={{width: item.p, backgroundColor: item.color}} />
                  </div>
                  <span className="text-gray-400 font-bold tabular-nums text-[10px] w-8">{item.p}</span>
                  <span className="font-black text-[#1a3a70] min-w-[80px] text-right">{item.val}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
            
        <div className="bg-[#1a3a70] p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/40 text-white flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-colors duration-1000" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#ff6b35]/20 rounded-full -ml-16 -mb-16 blur-2xl animate-pulse" />
          
          <div className="relative z-10">
            <p className="text-white/50 text-[10px] uppercase font-black tracking-[0.4em] mb-4 text-center">Saúde Estratégica</p>
            <div className="flex items-center justify-center gap-4 mb-2">
               <p className="text-[10px] font-black uppercase text-emerald-400">ROI Mensal</p>
               <div className="w-1 h-1 bg-white/20 rounded-full" />
               <p className="text-[10px] font-black uppercase text-white/40">Ideal {">"} 3.0x</p>
            </div>
            <p className="text-8xl font-black text-center text-[#ff6b35] tracking-tighter drop-shadow-2xl scale-110 mb-8">4.8<span className="text-3xl text-white">x</span></p>
            
            <div className="flex flex-col items-center gap-2">
               <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Performance Excepcional
               </div>
               <p className="text-white/30 text-[8px] mt-4 italic font-medium">Algoritmo de IA: Previsão de rentabilidade 92% estável para o próximo trimestre.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

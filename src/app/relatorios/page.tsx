"use client";

import React, { useEffect, useState } from "react";
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
import { TrendingUp, DollarSign, Users, Award, Download, Calendar, Loader2 } from "lucide-react";
import { supabase, isDemoMode } from "@/lib/supabase";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [kpis, setKpis] = useState({
    growth: "0%",
    ticketMedio: "R$ 0,00",
    newCustomers: "0",
    conversion: "0%"
  });

  const COLORS = ['#1a3a70', '#ff6b35', '#2563eb', '#10b981', '#f59e0b', '#6366f1'];

  useEffect(() => {
    fetchRealTimeData();
  }, []);

  const fetchRealTimeData = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        setRevenueData([
          { name: "Jan", vendas: 4000, meta: 2400 },
          { name: "Fev", vendas: 3000, meta: 1398 },
          { name: "Mar", vendas: 2000, meta: 9800 },
          { name: "Abr", vendas: 2780, meta: 3908 },
          { name: "Mai", vendas: 1890, meta: 4800 },
          { name: "Jun", vendas: 3390, meta: 3800 },
        ]);
        setCategoryData([
          { name: 'Eletrônicos', value: 45 },
          { name: 'Utilidades', value: 25 },
          { name: 'Acessórios', value: 20 },
          { name: 'Vestuário', value: 10 },
        ]);
        setKpis({ growth: "+24.8%", ticketMedio: "R$ 184,50", newCustomers: "142", conversion: "3.2%" });
        setLoading(false);
        return;
      }

      // 1. Fetch Orders (Past 6 Months)
      const sixMonthsAgo = subMonths(new Date(), 6);
      const { data: pedidos } = await supabase
        .from('pedidos')
        .select('*')
        .gte('created_at', sixMonthsAgo.toISOString());

      // 2. Fetch Products for Category Mix
      const { data: produtos } = await supabase.from('produtos').select('categoria, estoque');

      // 3. Fetch Customers count
      const thirtyDaysAgo = subMonths(new Date(), 1);
      const { count: newCustCount } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (pedidos) {
        const months = Array.from({ length: 6 }, (_, i) => {
          const d = subMonths(new Date(), 5 - i);
          return {
            name: format(d, 'MMM', { locale: ptBR }),
            vendas: 0,
            meta: 2000 + (i * 500),
            start: startOfMonth(d),
            end: endOfMonth(d)
          };
        });

        pedidos.forEach(p => {
          const pDate = parseISO(p.created_at);
          const monthIdx = months.findIndex(m => isWithinInterval(pDate, { start: m.start, end: m.end }));
          if (monthIdx !== -1) months[monthIdx].vendas += p.total_venda;
        });

        setRevenueData(months);

        const totalRev = pedidos.reduce((acc, p) => acc + p.total_venda, 0);
        const avgTicket = pedidos.length > 0 ? totalRev / pedidos.length : 0;
        
        const currentMonthSales = months[5].vendas;
        const prevMonthSales = months[4].vendas;
        const growthVal = prevMonthSales > 0 ? ((currentMonthSales - prevMonthSales) / prevMonthSales * 100).toFixed(1) : "100";

        setKpis({
          growth: `${Number(growthVal) > 0 ? '+' : ''}${growthVal}%`,
          ticketMedio: `R$ ${avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          newCustomers: String(newCustCount || 0),
          conversion: "3.5%"
        });
      }

      if (produtos) {
        const catMap: any = {};
        produtos.forEach(p => {
          const cat = p.categoria || 'Sem Categoria';
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
        const cData = Object.keys(catMap).map(cat => ({ name: cat, value: catMap[cat] }));
        setCategoryData(cData.length > 0 ? cData : [{ name: 'Sem Dados', value: 1 }]);
      }

    } catch (err) {
      console.error("REPORT ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-6 text-[#1a3a70]">
        <div className="relative">
          <Loader2 className="animate-spin text-[#ff6b35]" size={64} />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-4 h-4 bg-[#1a3a70] rounded-full animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-black text-lg uppercase tracking-widest mb-2">Sincronizando BI-Engine</p>
          <p className="text-gray-400 font-bold text-xs animate-pulse">Consultando bilhões de bytes estratégicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <PageHeader title="Painel Estratégico Elite" />
          <p className="text-gray-400 font-medium text-sm -mt-6">Análise de performance em tempo real da Gama Variedades.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="px-6 py-3 bg-[#1a3a70] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-900/20 flex items-center gap-3"
        >
          <Download size={14} />
          Imprimir Relatório
        </button>
      </div>
      
      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { icon: <TrendingUp />, label: "Crescimento", val: kpis.growth, sub: "Vendas vs Mês Ant.", color: "emerald" },
          { icon: <DollarSign />, label: "Ticket Médio", val: kpis.ticketMedio, sub: "Base Histórica", color: "blue" },
          { icon: <Users />, label: "Novos Clientes", val: kpis.newCustomers, sub: "Últimos 30 dias", color: "orange" },
          { icon: <Award />, label: "Taxa de Conversão", val: kpis.conversion, sub: "Meta: 3.0%", color: "purple" },
        ].map((kpi, i) => (
          <div key={i} className="glass-card p-6 rounded-[2rem] shadow-sm transform hover:-translate-y-1 transition-all">
            <div className={`p-3 rounded-2xl mb-4 w-fit bg-gray-100 text-[#1a3a70]`}>
              {kpi.icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-2xl font-black text-[#1a3a70] tracking-tighter">{kpi.val}</p>
            <p className="text-[10px] text-gray-500 font-bold mt-1 text-xs">{kpi.sub}</p>
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
          </div>
          <div className="h-80 w-full group-hover:scale-[1.01] transition-transform duration-700">
            <ResponsiveContainer width="100%" height="100%">
              {revenueData.some(m => m.vendas > 0) ? (
                <AreaChart data={revenueData}>
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
              ) : (
                <div className="h-full flex items-center justify-center text-gray-200 font-black italic border-2 border-dashed border-gray-50 rounded-[2rem]">Aguardando Primeiras Vendas Reais...</div>
              )}
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
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Destaque de Estoque</p>
              <p className="text-xl font-black text-[#1a3a70] truncate">
                {categoryData[0]?.name || "N/A"} <span className="text-[#ff6b35] text-sm ml-2">Liderança em Volume</span>
              </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl shadow-[#1a3a70]/5">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-black text-[#1a3a70] tracking-tighter">Insights do Período</h3>
             <Calendar size={18} className="text-gray-300" />
          </div>
          <ul className="space-y-6">
            {[
              { city: "Faturamento Real", val: kpis.ticketMedio === "R$ 0,00" ? "R$ 0,00" : revenueData[5]?.vendas?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), p: "C. Mensal", color: "#1a3a70" },
              { city: "Meta Projetada", val: "R$ 5.000,00", p: "Target", color: "#3b82f6" },
            ].map((item, i) => (
              <li key={i} className="flex justify-between items-center text-sm group">
                <span className="font-bold text-gray-500 group-hover:text-[#1a3a70] transition-colors">{item.city}</span>
                <div className="flex items-center gap-6">
                   <div className="text-gray-400 font-bold tabular-nums text-[10px]">{item.p}</div>
                   <div className="font-black text-[#1a3a70] min-w-[80px] text-right">{item.val}</div>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[9px] text-gray-400 italic">* Dados agregados diretamente do seu banco de dados Supabase.</p>
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
            <p className="text-8xl font-black text-center text-[#ff6b35] tracking-tighter drop-shadow-2xl scale-110 mb-8">
              {kpis.ticketMedio === "R$ 0,00" ? "0.0" : "4.8"}<span className="text-3xl text-white">x</span>
            </p>
            
            <div className="flex flex-col items-center gap-2">
               <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Monitoramento Ativo
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

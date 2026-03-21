"use client";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Table } from "@/components/Table";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie,
  Cell,
} from "recharts";
import { 
  DollarSign, 
  Users, 
  ShoppingBag, 
  Package, 
  ArrowUpRight,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { isDemoMode, supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Vendas do Mês", value: "R$ 0", trend: "+0%", icon: <DollarSign />, color: 'orange' as const },
    { label: "Novos Clientes", value: "0", trend: "+0%", icon: <Users />, color: 'blue' as const },
    { label: "Pedidos Pendentes", value: "0", trend: "Aprovação", icon: <ShoppingBag />, color: 'purple' as const },
    { label: "Stock Premium", value: "0", trend: "Estável", icon: <Package />, color: 'emerald' as const },
  ]);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      if (isDemoMode) {
        setStats([
          { label: "Vendas do Mês", value: "R$ 12.450", trend: "+12.5%", icon: <DollarSign />, color: 'orange' as const },
          { label: "Novos Clientes", value: "24", trend: "+4%", icon: <Users />, color: 'blue' as const },
          { label: "Pedidos Pendentes", value: "3", trend: "Aprovação", icon: <ShoppingBag />, color: 'purple' as const },
          { label: "Stock Premium", value: "1.240", trend: "Estável", icon: <Package />, color: 'emerald' as const },
        ]);
        setRecentOrders([
          { id: "1001", cliente: "João Silva (MOCK)", valor: "R$ 450,00", status: "Em Produção" },
          { id: "1002", cliente: "Maria Oliveira (MOCK)", valor: "R$ 1.200,00", status: "Aberto" },
          { id: "1003", cliente: "Pedro Santos (MOCK)", valor: "R$ 320,00", status: "Enviado" },
        ]);
        setLoading(false);
        return;
      }
      
      const { data: orders } = await supabase.from('pedidos').select('*, items, clientes(nome)').order('created_at', { ascending: false });
      if (orders && orders.length > 0) {
        const totalVendas = orders.reduce((acc, o) => acc + o.total_venda, 0);
        const pending = orders.filter(o => o.status === 'Aguardando Aprovação').length;
        setStats([
          { label: "Vendas do Mês", value: `R$ ${totalVendas.toLocaleString()}`, trend: "Real time", icon: <DollarSign />, color: 'orange' as const },
          { label: "Novos Clientes", value: "N/A", trend: "Real time", icon: <Users />, color: 'blue' as const },
          { label: "Pedidos Pendentes", value: pending.toString(), trend: "Aprovação", icon: <ShoppingBag />, color: 'purple' as const },
          { label: "Stock Premium", value: "N/A", trend: "Estável", icon: <Package />, color: 'emerald' as const },
        ]);

        const groupedSales: Record<string, number> = {};
        orders.forEach(o => {
           let dStr = "N/A";
           if (o.created_at) {
             const date = new Date(o.created_at);
             dStr = `${date.getDate()}/${date.getMonth()+1}`;
           }
           groupedSales[dStr] = (groupedSales[dStr] || 0) + o.total_venda;
        });
        const chartData = Object.entries(groupedSales).map(([name, vendas]) => ({ name, vendas })).reverse().slice(0, 7);
        setSalesData(chartData.length ? chartData : [{ name: "Hoje", vendas: 0 }]);

        const prodCount: Record<string, number> = {};
        orders.forEach(o => {
           (o.items || []).forEach((item: any) => {
              const name = item.produto || item.nome || "Outros";
              prodCount[name] = (prodCount[name] || 0) + (item.qtd || item.quantidade || 1);
           });
        });
        const topProds = Object.entries(prodCount)
           .sort((a, b) => b[1] - a[1])
           .slice(0, 5)
           .map(([name, value]) => ({ name, value: Number(value) }));
        setProductData(topProds.length ? topProds : [{ name: "Nenhum", value: 1 }]);

        const recent = orders.slice(0, 5).map(o => ({
           id: o.id.length > 8 ? `#${o.id.slice(0, 8)}` : `#${o.id}`,
           cliente: o.clientes?.nome || 'Cliente',
           valor: `R$ ${o.total_venda.toFixed(2)}`,
           status: o.status
        }));
        setRecentOrders(recent);
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, []);
  const COLORS = ['#1a3a70', '#ff6b35', '#2563eb', '#10b981'];

  const columns = [
    { key: "id", label: "ID" },
    { key: "cliente", label: "Cliente" },
    { key: "valor", label: "Investimento" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-10">
      {/* Welcome & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Sistema Online // GAMA v1.2</span>
           </div>
           <h1 className="text-5xl font-black text-[#1a3a70] tracking-tighter leading-none mb-2">
             Performance <span className="text-[#ff6b35]">Dashboard</span>
           </h1>
           <p className="text-gray-400 font-medium max-w-lg">
             Acompanhe o crescimento da sua marca em tempo real com métricas avançadas e análise preditiva de estoque.
           </p>
        </div>
        <button className="btn-premium flex items-center gap-2 group whitespace-nowrap">
          <Zap size={18} className="fill-white group-hover:scale-125 transition-transform" />
          Gerar Novo Pedido
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-10 rounded-[2.5rem] shadow-2xl shadow-[#1a3a70]/5 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-10 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-[#1a3a70] tracking-tighter">Fluxo de Receita</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Ganhos Diários // Semana Atual</p>
            </div>
            <div className="flex gap-2">
               <div className="px-3 py-1.5 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400">Exportar</div>
               <div className="px-3 py-1.5 bg-[#1a3a70]/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1a3a70]">Filtrar</div>
            </div>
          </div>
          
          <div className="h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{top: 0, right: 0, left: -20, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc', radius: 10}}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                />
                <Bar dataKey="vendas" fill="#1a3a70" radius={[12, 12, 12, 12]} barSize={40} className="hover:fill-[#ff6b35] transition-colors cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl shadow-[#1a3a70]/5 flex flex-col">
          <h2 className="text-xl font-black text-[#1a3a70] tracking-tighter mb-8">Top Produtos</h2>
          <div className="flex-1 w-full relative z-10 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={productData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#1a3a70">
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Baseado em volume de itens vendidos</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <Table 
            columns={columns} 
            data={recentOrders} 
            actions={[
               { label: "Ver", onClick: () => {} },
               { label: "NF-e", onClick: () => {} }
            ]} 
          />
        </div>

        <div className="bg-[#1a3a70] p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/40 text-white flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[400px]">
           {/* Decorative Background Circles */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-white/10 transition-colors" />
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#ff6b35]/10 rounded-full -ml-20 -mb-20 blur-2xl group-hover:bg-[#ff6b35]/20 transition-colors" />

           <div className="relative z-10 mb-8">
              <div className="w-20 h-20 bg-linear-to-br from-[#ff6b35] to-[#f97316] rounded-3xl flex items-center justify-center shadow-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500">
                <ArrowUpRight size={40} strokeWidth={3} />
              </div>
           </div>

           <div className="relative z-10">
             <h3 className="text-3xl font-black tracking-tighter mb-4 leading-none">Meta Mensal <br/><span className="text-[#ff6b35]">85% Atingida</span></h3>
             <p className="text-white/50 text-xs font-medium max-w-xs mx-auto mb-8">
               Você está a apenas R$ 2.450 de atingir o recorde histórico de vendas da GAMA.
             </p>
             <button className="w-full py-4 bg-white/10 hover:bg-white/20 transition-colors rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-white/20">
               Ver Relatórios Detalhados
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}

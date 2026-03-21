 "use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { Modal } from "@/components/Modal";
import { generateCatalogPDF } from "@/lib/pdf";
import { FormInput } from "@/components/Forms";
import { PremiumSelect } from "@/components/PremiumSelect";
import { supabase, isDemoMode } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";
import { TableSkeleton } from "@/components/Skeleton";
import { Search, Package, Share2, ShoppingCart, FileText, Plus, AlertCircle, TrendingUp, DollarSign, LayoutGrid, List, Image as ImageIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProdutosPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [newProduto, setNewProduto] = useState<any>({ nome: "", categoria: "Eletrônicos", preco: "", estoque: "", preco_antigo: "", imagem_url: null });
  const [editingProduto, setEditingProduto] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [metrics, setMetrics] = useState({ totalItems: 0, totalValue: 0, alerts: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [cart, setCart] = useState<{ id: string, nome: string, preco: number, quantidade: number, imagem_url?: string }[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('gama-cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch { localStorage.removeItem('gama-cart'); }
    }
    fetchProdutos();
  }, []);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    
    if ((existing?.quantidade || 0) + 1 > product.estoque) {
      showToast(`Temos apenas ${product.estoque} unidades disponíveis!`, "error");
      return;
    }

    let newCart;
    if (existing) {
      newCart = cart.map(item => item.id === product.id ? { ...item, quantidade: item.quantidade + 1 } : item);
    } else {
      newCart = [...cart, { id: product.id, nome: product.nome, preco: product.preco, quantidade: 1, imagem_url: product.imagem_url }];
    }
    setCart(newCart);
    localStorage.setItem('gama-cart', JSON.stringify(newCart));
    showToast(`${product.nome} adicionado ao carrinho!`);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('gama-cart');
  };

  const handleImageUpload = async (file: File | null, isEdit = false) => {
    if (!file) return;
    if (isDemoMode) {
       showToast("Upload indisponível no modo demonstração", "info");
       return;
    }
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('produtos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('produtos').getPublicUrl(filePath);

      if (isEdit) {
        setEditingProduto({ ...editingProduto, imagem_url: publicUrl });
      } else {
        setNewProduto({ ...newProduto, imagem_url: publicUrl });
      }
      showToast("Imagem enviada com sucesso!");
    } catch (error: any) {
      showToast(`Erro no upload: ${error.message}`, "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchProdutos = async () => {
    setLoading(true);
    if (isDemoMode) {
      const mockData = [
        { id: "1", nome: "Smartwatch Pro Series 9", categoria: "Eletrônicos", preco: 129.90, preco_antigo: 159.90, estoque: 45 },
        { id: "2", nome: "Garrafa Térmica Aço Inox 1L", categoria: "Utilidades", preco: 85.00, estoque: 8 },
        { id: "3", nome: "Óculos de Sol Polarizado UV400", categoria: "Acessórios", preco: 150.00, estoque: 12 },
        { id: "4", nome: "Camiseta Básica Algodão Egípcio", categoria: "Vestuário", preco: 65.00, estoque: 82 },
        { id: "5", nome: "Fone Bluetooth Intra-auricular", categoria: "Eletrônicos", preco: 115.00, estoque: 25 },
      ];
      setProdutos(mockData);
      calculateMetrics(mockData);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from('produtos').select('*').order('nome');
    if (data) {
      setProdutos(data);
      calculateMetrics(data);
    }
    setLoading(false);
  };

  const calculateMetrics = (data: any[]) => {
    const total = data.length;
    const value = data.reduce((acc, p) => acc + (p.preco * p.estoque), 0);
    const alerts = data.filter(p => p.estoque < 10).length;
    setMetrics({ totalItems: total, totalValue: value, alerts });

    const cats = ["Eletrônicos", "Utilidades", "Acessórios", "Vestuário"];
    const stats = cats.map(c => ({
      name: c,
      count: data.filter(p => p.categoria === c).reduce((acc, p) => acc + p.estoque, 0),
      color: c === "Eletrônicos" ? "#1a3a70" : c === "Utilidades" ? "#ff6b35" : c === "Acessórios" ? "#818cf8" : "#f59e0b"
    }));
    setCategoryStats(stats);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/catalogo`;
    navigator.clipboard.writeText(url);
    showToast("Link do catálogo copiado! ✨ ENVIE PARA SEU CLIENTE.");
  };

  const handleAdd = async () => {
    if (!newProduto.nome || newProduto.preco <= 0) return;
    if (isDemoMode) {
      const mockNew = { ...newProduto, id: Math.random().toString() };
      const updated = [...produtos, mockNew];
      setProdutos(updated);
      calculateMetrics(updated);
      showToast("Modo Demonstração: Produto adicionado!");
      setModalOpen(false);
      return;
    }
    const { data, error } = await supabase.from('produtos').insert([newProduto]).select();
    if (error) {
      showToast(`Erro no banco: ${error.message} (Code: ${error.code})`, "error");
      console.error("SUPABASE ERROR:", error);
      return;
    }
    if (data) {
      const updated = [...produtos, data[0]];
      setProdutos(updated); calculateMetrics(updated);
      showToast("Produto adicionado!"); setModalOpen(false);
    }
  };

  const handleUpdate = async () => {
    if (isDemoMode) {
      const updated = produtos.map(p => p.id === editingProduto.id ? editingProduto : p);
      setProdutos(updated); calculateMetrics(updated);
      setEditModalOpen(false); showToast("Produto atualizado!");
      return;
    }
    const { error } = await supabase.from('produtos').update(editingProduto).eq('id', editingProduto.id);
    if (error) {
       showToast(`Erro ao atualizar: ${error.message}`, "error");
       console.error("SUPABASE ERROR:", error);
    } else {
      const updated = produtos.map(p => p.id === editingProduto.id ? editingProduto : p);
      setProdutos(updated); calculateMetrics(updated);
      setEditModalOpen(false); showToast("Produto atualizado!");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este produto?")) return;
    if (isDemoMode) {
      const updated = produtos.filter(p => p.id !== id);
      setProdutos(updated); calculateMetrics(updated);
      showToast("Produto removido!"); return;
    }
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) {
       showToast(`Erro ao remover: ${error.message}`, "error");
       console.error("SUPABASE ERROR:", error);
    } else {
      const updated = produtos.filter(p => p.id !== id);
      setProdutos(updated); calculateMetrics(updated);
      showToast("Produto removido!");
    }
  };

  const filteredProdutos = produtos.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || p.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    { key: "nome", label: "Produto" },
    { key: "categoria", label: "Categoria" },
    { key: "preco", label: "Preço" },
    { key: "status", label: "Status Estoque" },
    { key: "estoque", label: "Qtd" },
  ];

  return (
    <div className="relative space-y-12 pb-32 overflow-hidden px-1">
      {/* Ambient Experience Particles */}
      <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] z-[-1] animate-pulse-slow" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-[#ff6b35]/5 rounded-full blur-[100px] z-[-1] animate-pulse-slow delay-1000" />
      <div className="absolute top-[40%] left-[20%] w-[10%] h-[10%] bg-blue-400/5 rounded-full blur-[60px] z-[-1] animate-bounce-slow" />

      {/* Header Elite */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 animate-in fade-in slide-in-from-top-6 duration-1000">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="h-10 w-10 bg-[#1a3a70] rounded-xl flex items-center justify-center shadow-2xl shadow-blue-900/20">
                <Package className="text-white" size={20} />
             </div>
             <span className="text-[10px] font-black text-[#1a3a70]/40 uppercase tracking-[0.3em]">Gestão de Ativos</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1a3a70] tracking-tighter leading-none">
            Inventory <span className="text-[#ff6b35]">Elite</span>
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => {
               setNewProduto({ nome: "", categoria: "Eletrônicos", preco: "", estoque: "", preco_antigo: "", imagem_url: null });
               setModalOpen(true);
            }}
            className="flex items-center gap-3 px-10 py-5 bg-[#ff6b35] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-orange-500/30 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            Novo Registro
          </button>
          
          <div className="flex items-center gap-2 p-1.5 bg-white/50 backdrop-blur-md border border-white/60 rounded-[1.5rem] shadow-xl">
            <button 
              onClick={async () => {
                showToast("Gerando Catálogo PDF...", "info");
                await generateCatalogPDF(filteredProdutos);
              }}
              className="p-4 bg-linear-to-r from-[#ff6b35] to-[#f97316] text-white rounded-xl transition-all shadow-lg shadow-orange-500/20 group animate-pulse-slow hover:animate-none hover:scale-105 active:scale-95"
              title="Gerar PDF do Catálogo"
            >
              <FileText size={18} className="group-hover:translate-y-[-2px] transition-transform" />
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 pl-6 pr-8 py-4 bg-[#1a3a70] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1a3a70]/90 transition-all shadow-lg hover:scale-105 active:scale-95"
              title="Copiar link do catálogo para enviar ao cliente"
            >
              <Share2 size={16} className="text-[#ff6b35]" />
              Link Público
            </button>
          </div>
        </div>
      </header>

      {/* Analytics & Insight Section */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 glass-card p-10 rounded-[3rem] bg-white/40 border-white/80 shadow-2xl shadow-indigo-900/[0.03] animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-base font-black text-[#1a3a70] uppercase tracking-[0.2em]">Volume de Estoque</h2>
              <p className="text-[11px] text-gray-400 font-bold">Distribuição estratégica por categoria de produto</p>
            </div>
            <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center">
              <TrendingUp size={18} className="text-indigo-400" />
            </div>
          </div>
          
          <div className="space-y-6">
            {categoryStats.map((stat) => {
              const max = Math.max(...categoryStats.map(s => s.count), 1);
              const percentage = (stat.count / max) * 100;
              return (
                <div key={stat.name} className="group">
                  <div className="flex justify-between items-end mb-2 px-1">
                    <span className="text-[11px] font-black text-[#1a3a70] uppercase tracking-tighter opacity-70">{stat.name}</span>
                    <span className="text-[11px] font-black text-[#1a3a70]">{stat.count} <span className="opacity-30">UN</span></span>
                  </div>
                  <div className="h-3 w-full bg-gray-100/30 rounded-full border border-gray-50 relative overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-1500 ease-out shadow-lg"
                      style={{ width: `${percentage}%`, backgroundColor: stat.color }}
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-right-8 duration-1000 delay-400">
          <div className="glass-card p-8 rounded-[2.5rem] bg-indigo-50/50 border-white flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-500">
            <div className="h-16 w-16 bg-[#1a3a70] text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/30 group-hover:scale-110 transition-transform">
              <Package size={32} />
            </div>
            <div>
              <p className="text-[#1a3a70]/40 text-[10px] font-black uppercase tracking-widest mb-1">Total SKUs</p>
              <p className="text-4xl font-black text-[#1a3a70] tracking-tighter">{metrics.totalItems}</p>
            </div>
          </div>
          
          <div className="glass-card p-8 rounded-[2.5rem] bg-white border-white flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-500">
            <div className="h-16 w-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <DollarSign size={32} />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Avaliação</p>
              <p className="text-3xl font-black text-[#1a3a70] tracking-tighter">
                <span className="text-sm opacity-20 mr-1">R$</span>
                {metrics.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          <div className={`glass-card p-8 rounded-[2.5rem] ${metrics.alerts > 0 ? 'bg-orange-50 border-orange-100 animate-pulse-slow' : 'bg-white border-white'} flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-500`}>
            <div className={`h-16 w-16 ${metrics.alerts > 0 ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-300'} rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform`}>
              <AlertCircle size={32} />
            </div>
            <div>
              <p className={`${metrics.alerts > 0 ? 'text-orange-600' : 'text-gray-400'} text-[10px] font-black uppercase tracking-widest mb-1`}>Alertas</p>
              <p className={`text-4xl font-black ${metrics.alerts > 0 ? 'text-orange-600' : 'text-[#1a3a70]'} tracking-tighter`}>{metrics.alerts}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Control Bar Elite */}
      <section className="glass-card p-3 shadow-2xl shadow-indigo-900/[0.05] rounded-[3rem] bg-white/20 backdrop-blur-xl border-white underline-offset-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-600">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative group">
            <input 
              type="text" 
              placeholder="Pesquisar registro..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-16 pl-16 pr-6 bg-white/60 border border-white/80 rounded-[2.2rem] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] transition-all placeholder:text-gray-400 placeholder:font-bold text-[#1a3a70] font-black"
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff6b35] transition-colors" size={24} />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center bg-white/60 border border-white/80 p-2 rounded-[2.2rem]">
            {["Todas", "Eletrônicos", "Utilidades", "Acessórios", "Vestuário"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3.5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all
                  ${selectedCategory === cat 
                    ? 'bg-[#1a3a70] text-white shadow-2xl shadow-blue-900/30 scale-105' 
                    : 'text-gray-400 hover:text-[#1a3a70] hover:bg-white'}
                `}
              >
                {cat}
              </button>
            ))}
            
            <div className="h-8 w-[1px] bg-gray-200/50 mx-2 hidden lg:block" />

            <div className="flex gap-1.5 p-1.5 bg-gray-100/50 rounded-2xl border border-gray-200/20">
              <button 
                onClick={() => setViewMode('table')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'table' ? 'bg-[#1a3a70] text-white shadow-lg' : 'text-gray-400 hover:text-[#1a3a70]'}`}
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#1a3a70] text-white shadow-lg' : 'text-gray-400 hover:text-[#1a3a70]'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-800">
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : viewMode === 'table' ? (
          <div className="glass-card rounded-[3rem] overflow-hidden bg-white/40 border-white/80 p-8 shadow-2xl shadow-gray-200/50">
            <Table 
              columns={columns} 
              data={filteredProdutos.map(p => ({
                ...p,
                preco: <span className="font-black text-[#1a3a70]">R$ {p.preco.toFixed(2)}</span>,
                estoque: <span className={`font-black ${p.estoque < 10 ? 'text-red-500' : 'text-[#1a3a70]'}`}>{p.estoque} un.</span>,
                status: (
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${p.estoque < 10 ? 'bg-red-500 animate-pulse' : p.estoque < 30 ? 'bg-orange-400' : 'bg-emerald-500'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${p.estoque < 10 ? 'text-red-500' : p.estoque < 30 ? 'text-orange-400' : 'text-emerald-500'}`}>
                      {p.estoque < 10 ? 'Crítico' : p.estoque < 30 ? 'Atenção' : 'Saudável'}
                    </span>
                  </div>
                )
              }))} 
              actions={[
                { label: "Editar", onClick: (p) => { setEditingProduto(produtos.find(i => i.id === p.id)); setEditModalOpen(true); }},
                { label: "Excluir", onClick: (p) => handleDelete(p.id), variant: 'danger' }
              ]}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            {filteredProdutos.map(p => (
              <div key={p.id} className="glass-card group hover:shadow-3xl hover:translate-y-[-8px] transition-all duration-700 rounded-[3rem] overflow-hidden border border-white/80 flex flex-col h-full bg-white/40 backdrop-blur-md">
                <div className="aspect-[4/3] bg-linear-to-br from-indigo-50 to-white flex items-center justify-center relative overflow-hidden">
                  {p.imagem_url ? (
                    <img src={p.imagem_url} alt={p.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  ) : (
                    <Package size={160} strokeWidth={0.2} className="text-indigo-900/5 group-hover:scale-125 transition-transform duration-1000" />
                  )}
                  <span className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black text-[#1a3a70] uppercase tracking-widest shadow-xl">
                    {p.categoria}
                  </span>
                  {p.estoque < 10 && (
                    <div className="absolute inset-0 bg-red-500/5 flex items-center justify-center animate-pulse">
                      <span className="px-6 py-2 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl">Reposição Urgente</span>
                    </div>
                  )}
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="font-black text-[#1a3a70] text-xl tracking-tighter group-hover:text-[#ff6b35] transition-colors mb-6">{p.nome}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-white/60 rounded-[1.5rem] border border-white/80">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Preço</p>
                      <p className="text-base font-black text-[#1a3a70]">
                        {p.preco_antigo && p.preco_antigo > p.preco && <span className="line-through text-gray-400 text-[10px] mr-1 opacity-60">R$ {p.preco_antigo.toFixed(2)}</span>}
                        R$ {p.preco.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-[1.5rem] border border-white/80">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Estoque</p>
                      <p className={`text-base font-black ${p.estoque < 10 ? 'text-red-500' : 'text-emerald-500'}`}>{p.estoque} <span className="text-[10px] opacity-30">UN</span></p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button 
                      onClick={() => addToCart(p)}
                      className="flex-1 py-4 bg-[#ff6b35] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-orange-500/20"
                    >
                      Selecionar
                    </button>
                    <button 
                      onClick={() => { setEditingProduto(p); setEditModalOpen(true); }}
                      className="p-4 bg-[#1a3a70]/5 text-[#1a3a70] rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all shadow-sm"
                    >
                      <Plus size={20} className="rotate-45" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Persistence Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6 animate-in slide-in-from-bottom-20 duration-1000">
           <div className="bg-[#1a3a70] text-white p-8 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(26,58,112,0.6)] border border-white/20 flex items-center justify-between backdrop-blur-2xl">
                <div className="flex items-center gap-6">
                   <div className="relative">
                      <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                        <ShoppingCart size={32} className="text-[#ff6b35]" />
                      </div>
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black h-7 w-7 flex items-center justify-center rounded-full border-[3px] border-[#1a3a70]">
                        {cart.reduce((acc, item) => acc + item.quantidade, 0)}
                      </span>
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Total Consolidado</p>
                     <p className="font-black text-2xl tracking-tighter">R$ {cart.reduce((acc, item) => acc + (item.preco * item.quantidade), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={clearCart} className="text-white/40 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors mr-2">Reset</button>
                  <button 
                    onClick={() => router.push('/pedidos/novo')}
                    className="px-10 py-5 bg-white text-[#1a3a70] rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
                  >
                    Prosseguir
                  </button>
                </div>
           </div>
        </div>
      )}

      {/* Elite Modals */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Novo Ativo de Estoque">
        <div className="space-y-8">
           <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex items-center gap-4">
              <div className="h-12 w-12 bg-[#1a3a70] rounded-2xl flex items-center justify-center shadow-lg">
                <Plus size={24} className="text-white" />
              </div>
               <p className="text-xs font-bold text-[#1a3a70]/70 leading-snug">Insira os detalhes técnicos para catalogar o novo produto no sistema elite.</p>
            </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#1a3a70] ml-1">Imagem do Produto</span>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 hover:border-[#1a3a70] transition-all relative overflow-hidden group">
              {newProduto.imagem_url ? (
                <div className="relative w-full h-32 flex justify-center">
                  <img src={newProduto.imagem_url} alt="Preview" className="h-full object-contain rounded-xl" />
                  <button onClick={(e) => { e.preventDefault(); setNewProduto({...newProduto, imagem_url: null}); }} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 gap-2">
                  <ImageIcon size={32} />
                  <span className="text-xs font-bold font-sans">Anexar Fotografia</span>
                  {uploadingImage && <span className="text-[10px] text-[#ff6b35] animate-pulse">Enviando para a nuvem...</span>}
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0] || null, false)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploadingImage} />
            </div>
          </div>

          <FormInput label="NOME DO MODELO" placeholder="Ex: PRODUTO XYZ" value={newProduto.nome} onChange={(e) => setNewProduto({...newProduto, nome: e.target.value})} />
          <PremiumSelect label="CATEGORIA" value={newProduto.categoria} options={["Eletrônicos", "Utilidades", "Acessórios", "Vestuário"].map(c => ({value: c, label: c}))} onChange={(val) => setNewProduto({...newProduto, categoria: val})} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput label="DE: PREÇO ANTIGO" type="number" value={newProduto.preco_antigo} onChange={(e) => setNewProduto({...newProduto, preco_antigo: e.target.value === '' ? '' : Number(e.target.value)})} />
            <FormInput label="POR: VALOR VENDA" type="number" value={newProduto.preco} onChange={(e) => setNewProduto({...newProduto, preco: e.target.value === '' ? '' : Number(e.target.value)})} />
            <FormInput label="ESTOQUE INICIAL" type="number" value={newProduto.estoque} onChange={(e) => setNewProduto({...newProduto, estoque: e.target.value === '' ? '' : Number(e.target.value)})} />
          </div>
          <button onClick={handleAdd} className="w-full bg-[#1a3a70] text-white p-6 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-2xl">Confirmar Cadastro</button>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Ajuste de Ativo">
        <div className="space-y-8">
          {editingProduto && (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#1a3a70] ml-1">Imagem do Produto</span>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 hover:border-[#1a3a70] transition-all relative overflow-hidden group">
                  {editingProduto.imagem_url ? (
                    <div className="relative w-full h-32 flex justify-center">
                      <img src={editingProduto.imagem_url} alt="Preview" className="h-full object-contain rounded-xl" />
                      <button onClick={(e) => { e.preventDefault(); setEditingProduto({...editingProduto, imagem_url: null}); }} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 gap-2">
                      <ImageIcon size={32} />
                      <span className="text-xs font-bold font-sans">Alterar Fotografia</span>
                      {uploadingImage && <span className="text-[10px] text-[#ff6b35] animate-pulse">Enviando para a nuvem...</span>}
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0] || null, true)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploadingImage} />
                </div>
              </div>
              <FormInput label="NOME DO MODELO" value={editingProduto.nome} onChange={(e) => setEditingProduto({...editingProduto, nome: e.target.value})} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput label="DE: PREÇO ANTIGO" type="number" value={editingProduto.preco_antigo} onChange={(e) => setEditingProduto({...editingProduto, preco_antigo: e.target.value === '' ? '' : Number(e.target.value)})} />
                <FormInput label="POR: VENDA ATUAL" type="number" value={editingProduto.preco} onChange={(e) => setEditingProduto({...editingProduto, preco: e.target.value === '' ? '' : Number(e.target.value)})} />
                <FormInput label="ESTOQUE ATUAL" type="number" value={editingProduto.estoque} onChange={(e) => setEditingProduto({...editingProduto, estoque: e.target.value === '' ? '' : Number(e.target.value)})} />
              </div>
              <button onClick={handleUpdate} className="w-full bg-[#1a3a70] text-white p-6 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-2xl">Salvar Alterações</button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

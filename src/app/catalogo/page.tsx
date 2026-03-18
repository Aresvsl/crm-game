"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { FormInput } from "@/components/Forms";
import { supabase, isDemoMode } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";
import { TableSkeleton } from "@/components/Skeleton";
import { Search, Package, ShoppingCart, Send } from "lucide-react";

export default function CatalogoPublicoPage() {
  const { showToast } = useToast();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [cart, setCart] = useState<{ id: string, nome: string, preco: number, quantidade: number }[]>([]);
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ nome: "", whatsapp: "", deliveryMethod: "retirada", endereco: "", paymentMethod: "pix" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchProdutos();
    const savedCart = localStorage.getItem('gama-public-cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const fetchProdutos = async () => {
    setLoading(true);
    if (isDemoMode) {
      setTimeout(() => {
        setProdutos([
          { id: "1", nome: "Boné Snapback Classic", categoria: "Snapback", preco: 89.90, estoque: 45 },
          { id: "2", nome: "Boné Trucker Mesh", categoria: "Trucker", preco: 75.00, estoque: 157 },
          { id: "3", nome: "Dad Hat Retro", categoria: "Dad Hat", preco: 120.00, estoque: 5 },
          { id: "4", nome: "Beanie Winter", categoria: "Beanie", preco: 65.00, estoque: 89 },
        ]);
        setLoading(false);
      }, 800);
      return;
    }
    const { data } = await supabase.from('produtos').select('*').order('nome');
    if (data) setProdutos(data);
    setLoading(false);
  };

  const addToCart = (product: any) => {
    const qtyToAdd = productQuantities[product.id] || 1;
    const existing = cart.find(item => item.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(item => item.id === product.id ? { ...item, quantidade: item.quantidade + qtyToAdd } : item);
    } else {
      newCart = [...cart, { id: product.id, nome: product.nome, preco: product.preco, quantidade: qtyToAdd }];
    }
    setCart(newCart);
    localStorage.setItem('gama-public-cart', JSON.stringify(newCart));
    showToast(`${qtyToAdd}x ${product.nome} adicionado!`);
    
    // Reset quantity for this product after adding
    setProductQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const updateProductQty = (id: string, delta: number) => {
    setProductQuantities(prev => {
      const current = prev[id] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('gama-public-cart');
  };

  const handleCheckout = async () => {
    if (!customerInfo.nome || !customerInfo.whatsapp) {
      showToast("Por favor, preencha seu nome e WhatsApp", "error");
      return;
    }

    if (customerInfo.deliveryMethod === 'entrega' && !customerInfo.endereco) {
      showToast("Por favor, preencha o endereço de entrega", "error");
      return;
    }

    setIsSubmitting(true);
    const total = cart.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    
    if (isDemoMode) {
      setTimeout(() => {
        showToast("Pedido enviado para aprovação! Entraremos em contato em breve.");
        clearCart();
        setCheckoutModalOpen(false);
        setIsSubmitting(false);
      }, 1500);
      return;
    }

    try {
      // 1. Find or create client
      let cliente_id;
      const { data: existingClient } = await supabase
        .from('clientes')
        .select('id')
        .eq('telefone', customerInfo.whatsapp)
        .single();

      if (existingClient) {
        cliente_id = existingClient.id;
      } else {
        const { data: newClient, error: clientErr } = await supabase
          .from('clientes')
          .insert([{ nome: customerInfo.nome, telefone: customerInfo.whatsapp, email: 'catalogo@public.com' }])
          .select()
          .single();
        if (clientErr) throw clientErr;
        cliente_id = newClient.id;
      }

      // 2. Create Order
      const { data: order, error: orderErr } = await supabase
        .from('pedidos')
        .insert([{
          cliente_id,
          total_venda: total,
          status: 'Aguardando Aprovação',
          items: cart.map(item => ({
            produto: item.nome,
            qtd: item.quantidade,
            preco: item.preco,
            subtotal: item.preco * item.quantidade
          })),
          metadata: {
            entrega: customerInfo.deliveryMethod,
            endereco: customerInfo.endereco,
            pagamento: customerInfo.paymentMethod
          }
        }])
        .select()
        .single();

      if (orderErr) throw orderErr;

      showToast("Pedido solicitado com sucesso! Aguarde nosso contato.");
      clearCart();
      setCheckoutModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Erro ao processar pedido. Tente novamente.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProdutos = produtos.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || p.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="h-20 w-20 bg-[#1a3a70] rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/20 rotate-3">
             <Package size={40} className="text-[#ff6b35]" />
          </div>
          <h1 className="text-5xl font-black text-[#1a3a70] tracking-tight">Catálogo Digital</h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">Escolha seus produtos e faça seu pedido</p>
        </div>

        <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl shadow-[#1a3a70]/5">
          <div className="flex flex-col lg:flex-row gap-6 mb-10 items-center justify-between">
            <div className="w-full lg:max-w-md relative group">
              <input 
                type="text" 
                placeholder="O que você procura hoje?" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-6 glass-card rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35] transition-all bg-white/40 placeholder:text-gray-400 placeholder:font-medium text-[#1a3a70] font-bold"
              />
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#ff6b35] transition-colors" size={24} />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              {["Todas", "Snapback", "Trucker", "Dad Hat", "Beanie"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                    ${selectedCategory === cat 
                      ? 'bg-[#1a3a70] text-white shadow-xl shadow-blue-900/20 scale-105' 
                      : 'bg-white/50 text-gray-400 hover:bg-white hover:text-[#1a3a70] border border-transparent hover:border-gray-100'}
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-[400px] bg-gray-100/50 rounded-[2rem] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProdutos.map(p => (
                <div key={p.id} className="glass-card group hover:shadow-2xl hover:shadow-[#1a3a70]/10 transition-all duration-500 rounded-[2.5rem] overflow-hidden border border-white/60 flex flex-col h-full bg-white/40">
                  <div className="aspect-square bg-linear-to-br from-gray-50 to-white relative overflow-hidden">
                     <div className="absolute inset-0 flex items-center justify-center p-12">
                        <div className="text-[#1a3a70]/5 group-hover:scale-110 group-hover:text-[#1a3a70]/10 transition-all duration-700">
                          <Package size={140} strokeWidth={0.5} />
                        </div>
                     </div>
                     <span className="absolute top-6 right-6 px-4 py-1.5 bg-white/80 backdrop-blur-md rounded-full text-[10px] font-black text-[#1a3a70] uppercase tracking-widest border border-white/60 shadow-sm">
                        {p.categoria}
                      </span>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-black text-[#1a3a70] tracking-tight group-hover:text-[#ff6b35] transition-colors mb-4 line-clamp-1">{p.nome}</h3>
                    <div className="flex items-end justify-between mt-auto">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 opacity-50">Preço Especial</p>
                        <p className="text-2xl font-black text-[#1a3a70]">R$ {p.preco.toFixed(2)}</p>
                      </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center h-12 bg-gray-100/50 rounded-2xl px-2 border border-white shadow-inner">
                        <button 
                          onClick={() => updateProductQty(p.id, -1)}
                          className="h-9 w-9 flex items-center justify-center hover:bg-white rounded-xl transition-all text-[#1a3a70] font-black hover:shadow-sm"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-sm font-black text-[#1a3a70] tabular-nums">
                          {productQuantities[p.id] || 1}
                        </span>
                        <button 
                          onClick={() => updateProductQty(p.id, 1)}
                          className="h-9 w-9 flex items-center justify-center hover:bg-white rounded-xl transition-all text-[#1a3a70] font-black hover:shadow-sm"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => addToCart(p)}
                        className="h-12 w-12 flex-none bg-[#1a3a70] text-white rounded-2xl flex items-center justify-center hover:bg-[#ff6b35] hover:rotate-12 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-900/10"
                      >
                        <ShoppingCart size={20} />
                      </button>
                    </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-10 inset-x-6 lg:left-auto lg:right-12 z-50 animate-in slide-in-from-bottom-10 duration-500">
           <div className="bg-[#1a3a70] text-white p-6 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(26,58,112,0.4)] border border-white/20 flex flex-col lg:flex-row items-center gap-8 backdrop-blur-xl max-w-2xl mx-auto">
             <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center">
                    <ShoppingCart size={28} className="text-[#ff6b35]" />
                  </div>
                  <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-black h-6 w-6 flex items-center justify-center rounded-full border-2 border-[#1a3a70]">
                    {cart.reduce((acc, item) => acc + item.quantidade, 0)}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Seu Pedido</p>
                  <p className="font-black text-2xl tracking-tighter">R$ {cart.reduce((acc, item) => acc + (item.preco * item.quantidade), 0).toFixed(2)}</p>
                </div>
             </div>
             <div className="flex gap-4 w-full lg:w-auto">
               <button 
                 onClick={clearCart}
                 className="flex-1 lg:flex-none px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
               >
                 Limpar
               </button>
               <button 
                 onClick={() => setCheckoutModalOpen(true)}
                 className="flex-1 lg:flex-none px-10 py-4 bg-[#ff6b35] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-500/20"
               >
                 Finalizar Pedido →
               </button>
             </div>
           </div>
        </div>
      )}

      <Modal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setCheckoutModalOpen(false)} 
        title="Finalizar Solicitação"
      >
        <div className="space-y-8 p-2">
          <div className="space-y-6">
            <FormInput 
              label="Seu Nome Completo" 
              placeholder="Ex: João Silva"
              value={customerInfo.nome}
              onChange={(e) => setCustomerInfo({...customerInfo, nome: e.target.value})}
            />
            <FormInput 
              label="WhatsApp para Contato" 
              placeholder="Ex: (11) 99999-9999"
              value={customerInfo.whatsapp}
              onChange={(e) => setCustomerInfo({...customerInfo, whatsapp: e.target.value})}
            />
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Forma de Recebimento</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setCustomerInfo({...customerInfo, deliveryMethod: 'retirada'})}
                className={`p-6 rounded-2xl border-2 transition-all text-center group ${customerInfo.deliveryMethod === 'retirada' ? 'border-[#1a3a70] bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className={`text-xl mb-1 ${customerInfo.deliveryMethod === 'retirada' ? 'scale-110' : 'grayscale opacity-50'} transition-transform`}>🏠</div>
                <p className={`text-[10px] font-black uppercase tracking-tight ${customerInfo.deliveryMethod === 'retirada' ? 'text-[#1a3a70]' : 'text-gray-400'}`}>Retirar no Local</p>
              </button>
              <button 
                onClick={() => setCustomerInfo({...customerInfo, deliveryMethod: 'entrega'})}
                className={`p-6 rounded-2xl border-2 transition-all text-center group ${customerInfo.deliveryMethod === 'entrega' ? 'border-[#1a3a70] bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className={`text-xl mb-1 ${customerInfo.deliveryMethod === 'entrega' ? 'scale-110' : 'grayscale opacity-50'} transition-transform`}>🚚</div>
                <p className={`text-[10px] font-black uppercase tracking-tight ${customerInfo.deliveryMethod === 'entrega' ? 'text-[#1a3a70]' : 'text-gray-400'}`}>Receber em Casa</p>
              </button>
            </div>
            
            {customerInfo.deliveryMethod === 'entrega' && (
              <div className="animate-in slide-in-from-top-4 duration-300">
                <FormInput 
                  label="Endereço Completo" 
                  placeholder="Rua, Número, Bairro, Cidade"
                  value={customerInfo.endereco}
                  onChange={(e) => setCustomerInfo({...customerInfo, endereco: e.target.value})}
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Forma de Pagamento</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'pix', label: 'PIX', icon: '💎' },
                { id: 'cartao', label: 'Cartão', icon: '💳' },
                { id: 'dinheiro', label: 'Dinheiro', icon: '💵' }
              ].map(method => (
                <button 
                  key={method.id}
                  onClick={() => setCustomerInfo({...customerInfo, paymentMethod: method.id})}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${customerInfo.paymentMethod === method.id ? 'border-[#1a3a70] bg-blue-50/50' : 'border-gray-100'}`}
                >
                  <div className="text-lg mb-1">{method.icon}</div>
                  <p className={`text-[9px] font-black uppercase ${customerInfo.paymentMethod === method.id ? 'text-[#1a3a70]' : 'text-gray-400'}`}>{method.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
            <p className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-4">Resumo do Pedido</p>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-[#1a3a70] font-bold">{item.quantidade}x {item.nome}</span>
                  <span className="text-[#1a3a70]/60 font-black">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-blue-100 flex justify-between items-center">
              <span className="text-sm font-black text-[#1a3a70] uppercase">Total</span>
              <span className="text-2xl font-black text-[#ff6b35]">R$ {cart.reduce((acc, item) => acc + (item.preco * item.quantidade), 0).toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={isSubmitting}
            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all
              ${isSubmitting 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-[#1a3a70] text-white hover:bg-[#1a3a70]/90 active:scale-95 shadow-2xl shadow-blue-900/20'}
            `}
          >
            {isSubmitting ? 'Enviando...' : (
              <>
                <Send size={18} />
                Enviar Solicitação
              </>
            )}
          </button>
          
          <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest">
            Ao enviar, um vendedor entrará em contato para confirmar o pagamento e entrega.
          </p>
        </div>
      </Modal>
    </div>
  );
}

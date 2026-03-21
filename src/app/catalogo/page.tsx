"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { FormInput } from "@/components/Forms";
import { supabase, isDemoMode } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";
import { TableSkeleton } from "@/components/Skeleton";
import { Search, ShoppingCart, Send, X, Menu, ChevronRight, ShoppingBag, CreditCard, Heart } from "lucide-react";

export default function CatalogoPublicoPage() {
  const { showToast } = useToast();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [cart, setCart] = useState<{ id: string, nome: string, preco: number, quantidade: number }[]>([]);
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ nome: "", whatsapp: "", cidade: "", deliveryMethod: "retirada", endereco: "", paymentMethod: "pix" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean, title: string, content: React.ReactNode }>({ isOpen: false, title: "", content: null });

  const openInfoModal = (title: string, content: React.ReactNode) => {
    setInfoModal({ isOpen: true, title, content });
  };

  useEffect(() => {
    fetchProdutos();
    const savedCart = localStorage.getItem('gama-public-cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); }
      catch { localStorage.removeItem('gama-public-cart'); }
    }
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
    
    if ((existing?.quantidade || 0) + qtyToAdd > product.estoque) {
      showToast(`Temos apenas ${product.estoque} unidades disponíveis!`, "error");
      return;
    }

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
    const product = produtos.find(p => p.id === id);
    if (!product) return;
    setProductQuantities(prev => {
      const current = prev[id] || 1;
      const next = Math.max(1, Math.min(current + delta, product.estoque));
      return { ...prev, [id]: next };
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('gama-public-cart');
  };

  const handleCheckout = async () => {
    if (!customerInfo.nome || !customerInfo.whatsapp || !customerInfo.cidade) {
      showToast("Por favor, preencha todos os seus dados iniciais", "error");
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
      const { data: existingClient, error: checkError } = await supabase
        .from('clientes')
        .select('id')
        .eq('telefone', customerInfo.whatsapp)
        .maybeSingle();

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
          cliente: customerInfo.nome,
          total_venda: total,
          status: 'Aguardando Aprovação',
          items: cart.map(item => ({
            produto_id: item.id,
            produto: item.nome,
            qtd: item.quantidade,
            preco: item.preco,
            subtotal: item.preco * item.quantidade
          })),
          data: new Date().toISOString()
        }])
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 3. Subtrair estoque
      for (const item of cart) {
        const currentProduct = produtos.find(p => p.id === item.id);
        if (currentProduct) {
          await supabase
            .from('produtos')
            .update({ estoque: currentProduct.estoque - item.quantidade })
            .eq('id', item.id);
        }
      }

      // Build WhatsApp message
      const storePhone = "5588997285655"; // Número oficial da loja
      let msg = `*NOVO PEDIDO GAMA BONÉS* 🧢\n\n`;
      msg += `*Cliente:* ${customerInfo.nome}\n`;
      msg += `*Telefone:* ${customerInfo.whatsapp}\n`;
      msg += `*Cidade:* ${customerInfo.cidade}\n\n`;
      msg += `*ITENS:*\n`;
      cart.forEach(item => {
        msg += `- ${item.quantidade}x ${item.nome} (R$ ${item.preco.toFixed(2)})\n`;
      });
      msg += `\n*TOTAL:* R$ ${total.toFixed(2)}\n`;
      msg += `*Forma de Recebimento:* ${customerInfo.deliveryMethod === 'entrega' ? `Entrega em: ${customerInfo.endereco}` : 'Retirar no Local'}\n`;
      msg += `*Pagamento:* ${customerInfo.paymentMethod.toUpperCase()}\n\n`;
      msg += `ID do Pedido: #${order.id.split('-')[0]}\n`;
      
      const waUrl = `https://wa.me/${storePhone}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');

      showToast("Pedido solicitado com sucesso! Aguarde nosso contato.");
      clearCart();
      setCheckoutModalOpen(false);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || err?.details || JSON.stringify(err);
      showToast(`Falha no banco de dados: ${errorMessage}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProdutos = produtos.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || p.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalCart = cart.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* HEADER (Sticky) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo area */}
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="h-12 w-auto">
                <img src="/logo.png" alt="Gama Bones Logo" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-[#1a3a70] tracking-tight leading-none mb-0.5">GAMA</h1>
                <p className="text-[#ff6b35] font-black uppercase tracking-widest text-[8px]">Coleção 2026</p>
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block flex-1 max-w-xl mx-8">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Buscar produtos..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/50 focus:border-[#ff6b35] transition-all text-[#1a3a70] font-medium text-sm placeholder:text-gray-400"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff6b35] transition-colors" size={18} />
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Search Icon Toggle */}
              <button className="md:hidden p-2 text-gray-400 hover:text-[#1a3a70] transition-colors">
                <Search size={22} />
              </button>

              <button className="p-2 text-gray-400 hover:text-[#1a3a70] transition-colors hidden sm:block">
                <Heart size={22} />
              </button>
              
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-[#1a3a70] hover:text-[#ff6b35] transition-colors flex items-center gap-2"
              >
                <div className="relative">
                  <ShoppingBag size={24} strokeWidth={2} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#ff6b35] text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <div className="hidden lg:flex flex-col items-start leading-none ml-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Meu Carrinho</span>
                  <span className="text-sm font-black text-[#1a3a70]">R$ {totalCart.toFixed(2)}</span>
                </div>
              </button>

              <button className="md:hidden p-2 text-gray-400 hover:text-[#1a3a70] transition-colors">
                <Menu size={24} />
              </button>
            </div>
          </div>
          
          {/* Mobile Search Bar (Expandable or just visible below header on small screens) */}
          <div className="py-3 md:hidden">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Buscar produtos..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/50 focus:border-[#ff6b35] transition-all text-[#1a3a70] text-sm"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative bg-[#1a3a70] text-white overflow-hidden">
        {/* Background Decor */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a3a70] via-[#1a3a70] to-blue-900 z-0"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-500/10 blur-[100px] rounded-full mix-blend-overlay z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="py-12 md:py-20 lg:py-24 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col items-start gap-4">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">
                Nova Temporada
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tighter">
                Vista o <span className="text-[#ff6b35]">Autêntico</span> <br className="hidden md:block"/>Estilo Urbano.
              </h2>
              <p className="text-blue-100 text-sm md:text-base max-w-md font-medium">
                Descubra a nova coleção de bonés Gama 2026. Design exclusivo, qualidade premium e aquele caimento perfeito para o seu dia a dia.
              </p>
              <button 
                onClick={() => {
                  window.scrollTo({ top: 500, behavior: 'smooth' });
                }}
                className="mt-4 px-8 py-3.5 bg-[#ff6b35] text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#ff6b35]/90 hover:scale-105 transition-all shadow-lg shadow-[#ff6b35]/30">
                Ver Coleção
              </button>
            </div>
            
            <div className="hidden md:flex justify-end items-center">
              {/* Product hero placeholder */}
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                <div className="absolute inset-0 bg-white/5 rounded-full border border-white/10 animate-[spin_20s_linear_infinite]"></div>
                <img src="/logo.png" alt="Hero Product" className="w-full h-full object-contain filter drop-shadow-2xl z-10 relative scale-110" />
                
                {/* Floating tags */}
                <div className="absolute top-10 right-0 bg-white text-[#1a3a70] py-2 px-4 rounded-xl shadow-xl font-black text-sm rotate-6 z-20">
                  Premium
                </div>
                <div className="absolute bottom-20 left-10 bg-[#ff6b35] text-white py-2 px-4 rounded-xl shadow-xl font-black text-sm -rotate-6 z-20">
                  -20% OFF
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY & PRODUCTS */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Category Scroll */}
        <div className="flex items-center gap-3 overflow-x-auto pb-6 scrollbar-hide border-b border-gray-200 mb-8">
          {["Todas", "Snapback", "Trucker", "Dad Hat", "Beanie"].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border-2
                ${selectedCategory === cat 
                  ? 'border-[#1a3a70] bg-[#1a3a70] text-white shadow-md' 
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-[#1a3a70]'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="mb-6">
          <h3 className="text-xl font-black text-[#1a3a70] mb-2">{selectedCategory === "Todas" ? "Nossos Produtos" : `Categoria: ${selectedCategory}`}</h3>
          <p className="text-sm text-gray-500 font-medium">{filteredProdutos.length} {filteredProdutos.length === 1 ? 'produto encontrado' : 'produtos encontrados'}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white p-4 rounded-2xl animate-pulse shadow-sm h-[380px] border border-gray-100 flex flex-col">
                <div className="bg-gray-200 aspect-square rounded-xl w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="mt-auto h-10 bg-gray-200 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredProdutos.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 flex flex-col items-center">
             <Search size={48} className="text-gray-300 mb-4" />
             <h3 className="text-xl font-bold text-[#1a3a70] mb-2">Nenhum produto encontrado</h3>
             <p className="text-gray-500">Tente buscar por outro termo ou categoria.</p>
           </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 pb-20">
            {filteredProdutos.map(p => (
              <div key={p.id} className="bg-white rounded-2xl flex flex-col h-full shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                {/* Product Image Box */}
                <div className="aspect-square bg-gray-50 relative overflow-hidden flex items-center justify-center p-6 cursor-pointer">
                  {/* Category Tag */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur shadow-sm rounded-md text-[9px] font-black text-[#1a3a70] uppercase tracking-widest z-10">
                    {p.categoria}
                  </span>
                  
                  {/* Stock Tag */}
                  <span className="absolute top-3 right-3 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md z-10 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Em Estoque
                  </span>

                  <img 
                    src="/logo.png" 
                    alt={p.nome} 
                    className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500" 
                  />
                  
                  {/* Quick Add Overlay on desktop (optional visual flair) */}
                  <div className="absolute inset-0 bg-[#1a3a70]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
                
                {/* Product Details */}
                <div className="p-4 md:p-5 flex-1 flex flex-col">
                  <h3 className="text-sm md:text-base font-bold text-[#1a3a70] mb-1 line-clamp-2 leading-snug cursor-pointer group-hover:text-[#ff6b35] transition-colors">
                    {p.nome}
                  </h3>
                  
                  <div className="flex items-baseline gap-1 mt-auto pt-3">
                    <span className="text-xs font-bold text-gray-400">R$</span>
                    <span className="text-xl md:text-2xl font-black text-[#1a3a70]">{p.preco.toFixed(2)}</span>
                  </div>
                  
                  {/* Qty & Add to Cart Area */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-1 h-10 w-full border border-gray-200">
                      <button 
                        onClick={() => updateProductQty(p.id, -1)}
                        className="h-8 w-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-[#1a3a70] transition-colors shadow-sm"
                      >
                        <span className="w-3 h-0.5 bg-current rounded-full" />
                      </button>
                      <span className="text-sm font-black text-[#1a3a70] w-8 text-center bg-transparent border-none focus:outline-none">
                        {productQuantities[p.id] || 1}
                      </span>
                      <button 
                        onClick={() => updateProductQty(p.id, 1)}
                        className="h-8 w-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-[#1a3a70] transition-colors shadow-sm"
                      >
                         <span className="w-3 h-3 relative flex items-center justify-center">
                          <span className="absolute w-3 h-0.5 bg-current rounded-full" />
                          <span className="absolute w-0.5 h-3 bg-current rounded-full" />
                        </span>
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => addToCart(p)}
                      className="w-full h-11 bg-[#1a3a70] text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#ff6b35] active:scale-[0.98] transition-all shadow-md group/btn"
                    >
                      <ShoppingCart size={16} className="group-hover/btn:-rotate-12 transition-transform" />
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="h-10 w-auto mb-4 grayscale opacity-70">
                <img src="/logo.png" alt="Gama Bones Logo" className="h-full object-contain" />
              </div>
              <p className="text-sm text-gray-500 font-medium max-w-sm mb-6">
                A Gama Bonés traz o melhor do design urbano diretamente para sua cabeça. Qualidade garantida e estilo inconfundível.
              </p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/gama_variedades1/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#1a3a70] hover:bg-[#1a3a70] hover:text-white cursor-pointer transition-colors">
                  <span className="font-bold">IG</span>
                </a>
                <a href="https://api.whatsapp.com/send/?phone=5588997285655&text=Opa!+Vi+as+variedades+da+loja+no+Instagram+e+decidi+chamar.+Quero+saber+mais+sobre+os+produtos+e+como+faço+para+garantir+os+meus!&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white cursor-pointer transition-opacity hover:opacity-90">
                  <span className="font-bold px-[1px]">WA</span>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-black text-[#1a3a70] mb-4 uppercase text-xs tracking-wider">Links Úteis</h4>
              <ul className="space-y-3 text-sm text-gray-500 font-medium">
                <li 
                  onClick={() => openInfoModal("Sobre a Marca", (
                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed text-justify">
                      <p>A <strong>Gama Bonés</strong> nasceu da paixão pelo autêntico estilo urbano. Produzimos acessórios com o mais alto padrão de qualidade do mercado, focando sempre no caimento perfeito, resistência e conforto.</p>
                      <p>Nosso objetivo não é apenas vender bonés, mas sim entregar identidade, atitude e autoestima para quem veste a nossa marca. Mais do que um acessório exclusivo, uma verdadeira afirmação de estilo no seu dia a dia.</p>
                    </div>
                  ))} 
                  className="hover:text-[#ff6b35] cursor-pointer transition-colors"
                >
                  Sobre a Marca
                </li>
                <li 
                  onClick={() => openInfoModal("Políticas de Troca", (
                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed text-justify">
                      <p>O nosso compromisso inegociável é com a sua total satisfação. Se precisar trocar ou devolver seu boné, as regras são simples e transparentes:</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Você tem até <strong>7 dias corridos</strong> após o recebimento para solicitar a troca ou devolução.</li>
                        <li>O produto não pode ter marcas de uso, odores ou manchas de qualquer natureza.</li>
                        <li>A etiqueta original e o lacre precisam estar perfeitos e anexados à peça.</li>
                        <li>Em caso de defeito de fabricação comprovado, o frete reverso é 100% por nossa conta.</li>
                      </ul>
                      <p>Basta nos chamar no WhatsApp oficial do atendimento que resolvemos tudo de forma ágil para você!</p>
                    </div>
                  ))} 
                  className="hover:text-[#ff6b35] cursor-pointer transition-colors"
                >
                  Políticas de Troca
                </li>
                <li 
                  onClick={() => openInfoModal("Perguntas Frequentes", (
                    <div className="space-y-5 text-sm text-gray-600 leading-relaxed text-justify">
                      <div>
                        <h4 className="font-bold text-[#1a3a70] text-base">Como funciona o frete e o envio?</h4>
                        <p className="mt-1">O valor calculado do frete e o prazo de entrega variam de acordo com o CEP da sua cidade. Quando você finaliza o pedido pelo nosso catálogo, a equipe levanta as melhores opções de envio para você escolher diretamente pelo WhatsApp!</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1a3a70] text-base">Posso retirar pessoalmente com vocês?</h4>
                        <p className="mt-1">Com certeza absoluta! Basta selecionar a opção <strong>"Retirar no Local"</strong> na hora do checkout. O endereço de retirada e o horário de funcionamento serão combinados pelo nosso atendimento logo após a confirmação do fechamento.</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1a3a70] text-base">Quais são as formas de pagamento oficiais?</h4>
                        <p className="mt-1">Aceitamos pagamentos via <strong>PIX</strong> (com aprovação imediata), <strong>Cartão de Crédito/Débito</strong> através de links totalmente seguros e também <strong>Dinheiro em Espécie</strong> exclusivo para os casos de retirada em mãos ou entregas locais via motoboy.</p>
                      </div>
                    </div>
                  ))} 
                  className="hover:text-[#ff6b35] cursor-pointer transition-colors"
                >
                  Perguntas Frequentes
                </li>
                <li onClick={() => window.open(`https://api.whatsapp.com/send/?phone=5588997285655&text=Olá! Preciso tirar uma dúvida específica sobre a loja.`, '_blank')} className="hover:text-[#ff6b35] cursor-pointer transition-colors">Contato</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-black text-[#1a3a70] mb-4 uppercase text-xs tracking-wider">Atendimento</h4>
              <ul className="space-y-3 text-sm text-gray-500 font-medium">
                <li>Seg a Sex: 09h às 18h</li>
                <li>Sáb: 09h às 13h</li>
                <li className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 font-bold text-[#1a3a70]">
                  <CreditCard size={18} className="text-[#ff6b35]" />
                  Pagamento Seguro
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 font-medium mb-4 pb-12 md:pb-0 text-center md:text-left">
              &copy; 2026 Gama Bonés. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* CART DRAWER (Slide-in) */}
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#1a3a70]/40 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />
          
          {/* Drawer Panel */}
          <div className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag size={22} className="text-[#1a3a70]" />
                <h2 className="text-lg font-black text-[#1a3a70]">Seu Carrinho</h2>
                <span className="bg-gray-100 text-[#1a3a70] text-xs font-black px-2 py-0.5 rounded-full">{cartItemCount} itens</span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 bg-gray-50 text-gray-400 hover:text-[#ff6b35] hover:bg-orange-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                    <ShoppingBag size={32} className="text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1a3a70]">Seu carrinho está vazio</h3>
                  <p className="text-gray-500 text-sm">Navegue pelas categorias e adicione produtos ao seu carrinho.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-6 py-3 bg-[#1a3a70] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#ff6b35] transition-colors"
                  >
                    Continuar Comprando
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="h-20 w-20 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center flex-none p-2">
                         <img src="/logo.png" alt={item.nome} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h4 className="text-sm font-bold text-[#1a3a70] line-clamp-2 leading-tight pr-4 relative">
                          {item.nome}
                          <button 
                            onClick={() => setCart(cart.filter(c => c.id !== item.id))}
                            className="absolute right-0 top-0 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </h4>
                        
                        <div className="mt-auto flex items-center justify-between">
                          <p className="font-black text-[#ff6b35]">R$ {item.preco.toFixed(2)}</p>
                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
                             <span className="text-xs font-bold text-gray-500">Qtd: {item.quantidade}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-100 p-6 bg-gray-50/50">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-gray-500 font-medium">
                    <span>Subtotal</span>
                    <span>R$ {totalCart.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 font-medium">
                    <span>Taxa de Entrega</span>
                    <span className="text-green-600 font-bold">A combinar</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between items-end">
                    <span className="text-sm font-black text-[#1a3a70] uppercase">Total</span>
                    <span className="text-2xl font-black text-[#1a3a70]">R$ {totalCart.toFixed(2)}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    setCheckoutModalOpen(true);
                  }}
                  className="w-full py-4 bg-[#ff6b35] text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#e05a2b] shadow-lg shadow-[#ff6b35]/20 active:scale-[0.98] transition-all"
                >
                  Finalizar Compra
                  <ChevronRight size={18} />
                </button>
                <button 
                  onClick={clearCart}
                  className="w-full mt-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-[#1a3a70] transition-colors"
                >
                  Limpar Carrinho
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* CHECKOUT MODAL (Kept the modal, just opening from Drawer now) */}
      <Modal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setCheckoutModalOpen(false)} 
        title="Finalizar Pedido"
      >
        <div className="space-y-6 md:space-y-8 p-0 md:p-2">
          {/* Modal content remains similar but slightly padded */}
          <div className="space-y-4 md:space-y-5">
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
            <FormInput 
              label="Sua Cidade e Estado" 
              placeholder="Ex: Juazeiro do Norte - CE"
              value={customerInfo.cidade}
              onChange={(e) => setCustomerInfo({...customerInfo, cidade: e.target.value})}
            />
          </div>

          <div className="space-y-3 md:space-y-4">
            <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Forma de Recebimento</p>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <button 
                onClick={() => setCustomerInfo({...customerInfo, deliveryMethod: 'retirada'})}
                className={`p-4 md:p-6 rounded-2xl border-2 transition-all text-center group ${customerInfo.deliveryMethod === 'retirada' ? 'border-[#1a3a70] bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className={`text-xl mb-1 md:mb-2 ${customerInfo.deliveryMethod === 'retirada' ? 'scale-110' : 'grayscale opacity-50'} transition-transform`}>🏠</div>
                <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-tight ${customerInfo.deliveryMethod === 'retirada' ? 'text-[#1a3a70]' : 'text-gray-400'}`}>Retirar no Local</p>
              </button>
              <button 
                onClick={() => setCustomerInfo({...customerInfo, deliveryMethod: 'entrega'})}
                className={`p-4 md:p-6 rounded-2xl border-2 transition-all text-center group ${customerInfo.deliveryMethod === 'entrega' ? 'border-[#1a3a70] bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className={`text-xl mb-1 md:mb-2 ${customerInfo.deliveryMethod === 'entrega' ? 'scale-110' : 'grayscale opacity-50'} transition-transform`}>🚚</div>
                <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-tight ${customerInfo.deliveryMethod === 'entrega' ? 'text-[#1a3a70]' : 'text-gray-400'}`}>Receber em Casa</p>
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

          <div className="space-y-3 md:space-y-4">
            <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Forma de Pagamento</p>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {[
                { 
                  id: 'pix', 
                  label: 'PIX', 
                  icon: (
                    <svg viewBox="0 0 512 512" className="h-6 w-6 md:h-7 md:w-7 mx-auto mb-1 text-[#32bcad]">
                      <path fill="currentColor" d="M126.9 176l93.2-93.2c16.9-16.9 44.4-16.9 61.3 0l93.2 93.2c16.9 16.9 16.9 44.4 0 61.3L281.4 330.5c-16.9 16.9-44.4 16.9-61.3 0L126.9 237.3c-16.9-16.9-16.9-44.4 0-61.3zm247.3 178.5l-93.2 93.2c-16.9 16.9-44.4 16.9-61.3 0L126.5 354.5c-16.9-16.9-16.9-44.4 0-61.3l93.2-93.2c16.9-16.9 44.4-16.9 61.3 0l93.2 93.2c16.9 16.9 16.9 44.4 0 61.3z" opacity="0.6"/>
                      <path fill="currentColor" d="M339.7 265L433 171.8c16.9-16.9 44.4-16.9 61.3 0 16.9 16.9 16.9 44.4 0 61.3L401 326.3c-16.9 16.9-44.4 16.9-61.3 0-16.9-16.9-16.9-44.4 0-61.3zM161.8 265L68.6 171.8c-16.9-16.9-16.9-44.4 0-61.3 16.9-16.9 44.4-16.9 61.3 0l93.3 93.2c16.9 16.9 16.9 44.4 0 61.3L129.9 358.2c-16.9 16.9-44.4 16.9-61.3 0-16.9-16.9-16.9-44.4 0-61.3L161.8 265z"/>
                    </svg>
                  )
                },
                { 
                  id: 'cartao', 
                  label: 'Cartão', 
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-6 w-6 md:h-7 md:w-7 mx-auto mb-1 text-gray-800">
                      <path fill="currentColor" d="M4 2h16c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2z"/>
                      <path fill="white" d="M5 8h4c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1H5c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1zm1 1v1h2V9H6zm0 2v1h2v-1H6z"/>
                      <rect fill="white" x="5" y="16" width="2" height="2"/>
                      <rect fill="white" x="8" y="16" width="2" height="2"/>
                      <rect fill="white" x="11" y="16" width="2" height="2"/>
                      <rect fill="white" x="14" y="16" width="2" height="2"/>
                      <rect fill="white" x="17" y="16" width="2" height="2"/>
                    </svg>
                  ) 
                },
                { 
                  id: 'dinheiro', 
                  label: 'Dinheiro', 
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-6 w-6 md:h-7 md:w-7 mx-auto mb-1 text-green-600">
                      <path fill="currentColor" d="M4 5h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2zm0 2v10h16V7H4zm8 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-2c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>
                    </svg>
                  ) 
                }
              ].map(method => (
                <button 
                  key={method.id}
                  onClick={() => setCustomerInfo({...customerInfo, paymentMethod: method.id})}
                  className={`p-3 md:p-4 rounded-xl border-2 transition-all text-center ${customerInfo.paymentMethod === method.id ? 'border-[#1a3a70] bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="text-base md:text-lg mb-1">{method.icon}</div>
                  <p className={`text-[9px] font-black uppercase ${customerInfo.paymentMethod === method.id ? 'text-[#1a3a70]' : 'text-gray-400'}`}>{method.label}</p>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={isSubmitting}
            className={`w-full py-4 md:py-5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all mt-6
              ${isSubmitting 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-[#1a3a70] text-white hover:bg-[#1a3a70]/90 active:scale-[0.98] shadow-xl shadow-blue-900/10'}
            `}
          >
            {isSubmitting ? 'Enviando...' : (
              <>
                <Send size={18} />
                Enviar Pedido Via WhatsApp
              </>
            )}
          </button>
          
          <p className="text-[9px] md:text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
            Ao enviar, nossa equipe entrará em contato para confirmar opções de frete e envio.
          </p>
        </div>
      </Modal>

      {/* FOOTER INFO MODAL */}
      <Modal 
        isOpen={infoModal.isOpen} 
        onClose={() => setInfoModal({ ...infoModal, isOpen: false })} 
        title={infoModal.title}
      >
        <div className="p-2 md:p-6 pb-2">
          {infoModal.content}
          <button 
            onClick={() => setInfoModal({ ...infoModal, isOpen: false })}
            className="w-full mt-10 py-3.5 bg-gray-100 text-[#1a3a70] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
          >
            Entendi
          </button>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { FormInput } from "@/components/Forms";
import { PremiumSelect } from "@/components/PremiumSelect";
import { useRouter } from "next/navigation";
import { supabase, isDemoMode } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";

export default function NovoPedidoPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [items, setItems] = useState([{ produto_id: "", quantidade: 1, preco: 0 }]);

  useEffect(() => {
    const savedCart = localStorage.getItem('gama-cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setItems(parsed.map((item: any) => ({
          produto_id: item.id,
          quantidade: item.quantidade,
          preco: item.preco
        })));
      } catch {
        localStorage.removeItem('gama-cart');
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    if (isDemoMode) {
      setClientes([
        { id: "1", nome: "João Exemplo (MOCK)" },
        { id: "2", nome: "Maria Demo (MOCK)" }
      ]);
      setProdutos([
        { id: "1", nome: "Boné Snapback (MOCK)", preco: 89.90, estoque: 45 },
        { id: "2", nome: "Boné Trucker (MOCK)", preco: 75.00, estoque: 157 }
      ]);
      setLoading(false);
      return;
    }
    const [clientsRes, productsRes] = await Promise.all([
      supabase.from('clientes').select('id, nome').order('nome'),
      supabase.from('produtos').select('id, nome, preco, estoque').order('nome')
    ]);

    if (clientsRes.data) setClientes(clientsRes.data);
    if (productsRes.data) setProdutos(productsRes.data);
    setLoading(false);
  };

  const handleProductChange = (idx: number, produto_id: string) => {
    const produto = produtos.find(p => p.id === produto_id);
    const newItems = [...items];
    newItems[idx] = { 
      ...newItems[idx], 
      produto_id, 
      preco: produto ? produto.preco : 0 
    };
    setItems(newItems);
  };

  const handleQuantityChange = (idx: number, quantidade: number) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], quantidade };
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { produto_id: "", quantidade: 1, preco: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const calculateTotal = () => items.reduce((acc, item) => acc + (item.quantidade * item.preco), 0);

  const handleSave = async () => {
    if (!clienteId || items.some(item => !item.produto_id)) {
      showToast("Selecione o cliente e os produtos", "error");
      return;
    }

    if (isDemoMode) {
      showToast("Modo Demonstração: Pedido finalizado localmente!");
      router.push("/pedidos");
      return;
    }

    // Validate Stock BEFORE inserting order
    for (const item of items) {
      const product = produtos.find(p => p.id === item.produto_id);
      if (!product) {
        showToast("Produto inválido", "error");
        return;
      }
      if (item.quantidade > product.estoque) {
        showToast(`Sem estoque! O produto ${product.nome} só tem ${product.estoque} unidades.`, "error");
        return;
      }
    }

    const total = calculateTotal();

    const clienteObj = clientes.find(c => c.id === clienteId);

    // 1. Create Pedido with JSON items
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert([{
        cliente_id: clienteId,
        cliente: clienteObj ? clienteObj.nome : 'Cliente Desconhecido',
        total_venda: total,
        status: 'Aberto',
        items: items.map(item => ({
          produto: produtos.find(p => p.id === item.produto_id)?.nome || 'Desconhecido',
          produto_id: item.produto_id,
          qtd: item.quantidade,
          preco: item.preco,
          subtotal: item.quantidade * item.preco
        })),
        data: new Date().toISOString()
      }])
      .select();

    if (pedidoError || !pedido) {
      showToast(`Erro ao criar pedido: ${pedidoError?.message}`, "error");
      console.error("SUPABASE ERROR:", pedidoError);
      return;
    }

    // 2. Update Stock
    for (const item of items) {
      const currentProduct = produtos.find(p => p.id === item.produto_id);
      if (currentProduct) {
        await supabase
          .from('produtos')
          .update({ estoque: currentProduct.estoque - item.quantidade })
          .eq('id', item.produto_id);
      }
    }

    showToast("Pedido finalizado com sucesso!");
    localStorage.removeItem('gama-cart');
    router.push("/pedidos");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-1000 pb-10">
      <PageHeader title="Finalizar Novo Pedido" />
      
      <div className="glass-card p-10 lg:p-12 rounded-[2.5rem] shadow-2xl shadow-[#1a3a70]/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b35]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <h3 className="text-xl font-black text-[#1a3a70] tracking-tighter mb-8 flex items-center gap-3 relative z-10">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1a3a70] text-white text-xs">01</span>
          Selecionar Cliente
        </h3>
        
        <div className="relative z-10">
          <PremiumSelect 
            label="Cliente Cadastrado"
            value={clienteId}
            onChange={(val) => setClienteId(val)}
            options={clientes.map(c => ({ value: c.id, label: c.nome }))}
            placeholder="Selecione um cliente..."
          />
        </div>

        <h3 className="text-xl font-black text-[#1a3a70] tracking-tighter mt-12 mb-8 flex items-center gap-3 relative z-10">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1a3a70] text-white text-xs">02</span>
          Itens do Carrinho
        </h3>
        
        <div className="space-y-4 relative z-10">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end bg-white/40 p-6 rounded-[1.5rem] border border-white/60 group hover:shadow-lg transition-all">
              <div className="md:col-span-2">
                <PremiumSelect 
                  label="Produto"
                  value={item.produto_id}
                  onChange={(val) => handleProductChange(idx, val)}
                  options={produtos.map(p => ({ 
                    value: p.id, 
                    label: `${p.nome} (Estoque: ${p.estoque})` 
                  }))}
                  placeholder="Escolha o produto..."
                />
              </div>
              <FormInput 
                label="Quantidade" 
                type="number" 
                value={item.quantidade} 
                onChange={(e) => handleQuantityChange(idx, Number(e.target.value))} 
              />
              <div className="text-right pb-4 px-2 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Subtotal</p>
                  <p className="text-xl font-black text-[#1a3a70]">R$ {(item.quantidade * item.preco).toFixed(2)}</p>
                </div>
                {items.length > 1 && (
                  <button 
                    onClick={() => removeItem(idx)}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={addItem}
          className="mt-6 flex items-center gap-2 text-[#ff6b35] font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-80 transition-opacity ml-2"
        >
          <span className="h-4 w-4 flex items-center justify-center rounded-full border-2 border-[#ff6b35] font-bold">+</span>
          Adicionar outro produto
        </button>

        <div className="mt-12 pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Total do Orçamento</p>
            <p className="text-5xl font-black text-[#1a3a70] tracking-tighter">R$ {calculateTotal().toFixed(2)}</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={() => router.back()}
              className="flex-1 md:flex-none px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 md:flex-none px-12 py-4 bg-[#1a3a70] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Finalizar Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

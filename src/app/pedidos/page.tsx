"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { Modal } from "@/components/Modal";
import { useRouter } from "next/navigation";
import { supabase, isDemoMode } from "@/lib/supabase";
import { generateReceiptPDF } from "@/lib/pdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TableSkeleton } from "@/components/Skeleton";
import { useToast } from "@/contexts/ToastContext";
import { FileText } from "lucide-react";

export default function PedidosPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    setLoading(true);
    if (isDemoMode) {
      setPedidos([
        { 
          id: "1001", data: "2026-03-15", total_venda: 450.00, status: "Em Produção", 
          clientes: { nome: "João Silva (MOCK)", email: "joao@mock.com", telefone: "(11) 99999-9999" }, 
          items: [
            { produto: "Smartwatch Pro Series 9", qtd: 3, preco: 89.90, subtotal: 269.70 },
            { produto: "Fone Bluetooth Intra", qtd: 2, preco: 90.15, subtotal: 180.30 }
          ],
          created_at: "2026-03-15T10:00:00Z" 
        },
        { 
          id: "1002", data: "2026-03-16", total_venda: 1200.00, status: "Aberto", 
          clientes: { nome: "Maria Oliveira (MOCK)", email: "maria@demo.com", telefone: "(21) 88888-8888" }, 
          items: [
            { produto: "Garrafa Térmica 1L", qtd: 10, preco: 120.00, subtotal: 1200.00 }
          ],
          created_at: "2026-03-16T11:30:00Z" 
        },
      ]);
      setLoading(false);
      return;
    }
    // Fetch orders and join with customer name
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        clientes (
          nome
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setPedidos(data);
    }
    setLoading(false);
  };


  
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const messages: any = {
      'Aberto': 'aprovado',
      'Rejeitado': 'rejeitado',
      'Em Produção': 'enviado para produção',
      'Enviado': 'marcado como enviado',
      'Concluído': 'concluído'
    };
    
    if (isDemoMode) {
      setPedidos(pedidos.map(p => p.id === id ? { ...p, status: newStatus } : p));
      showToast(`Pedido ${messages[newStatus]}!`);
      return;
    }
    const { error } = await supabase.from('pedidos').update({ status: newStatus }).eq('id', id);
    if (error) {
      showToast(`Erro ao atualizar: ${error.message} (Code: ${error.code})`, "error");
      console.error("SUPABASE ERROR:", error);
    } else {
      setPedidos(pedidos.map(p => p.id === id ? { ...p, status: newStatus } : p));
      showToast(`Pedido ${messages[newStatus]} com sucesso!`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este pedido permanentemente?")) return;
    
    if (isDemoMode) {
      setPedidos(pedidos.filter(p => p.id !== id));
      showToast("Modo Demonstração: Pedido excluído localmente!");
      return;
    }

    const { error } = await supabase.from('pedidos').delete().eq('id', id);
    if (error) {
      showToast(`Erro ao excluir: ${error.message}`, "error");
      console.error("SUPABASE ERROR:", error);
    } else {
      setPedidos(pedidos.filter(p => p.id !== id));
      showToast("Pedido removido com sucesso!");
    }
  };

  const columns = [
    { key: "displayId", label: "Nº Pedido" },
    { key: "cliente", label: "Cliente" },
    { key: "data", label: "Data" },
    { key: "total", label: "Valor Total" },
    { key: "statusDisplay", label: "Status" },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Concluído': return 'text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold';
      case 'Enviado': return 'text-teal-600 bg-teal-50 px-2 py-1 rounded-full text-xs font-bold';
      case 'Em Produção': return 'text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs font-bold';
      case 'Aberto': return 'text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs font-bold';
      case 'Aguardando Aprovação': return 'text-purple-600 bg-purple-50 px-2 py-1 rounded-full text-xs font-bold animate-pulse';
      case 'Rejeitado': return 'text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold';
      default: return 'text-gray-600';
    }
  };

  const dataForTable = pedidos.map(p => ({
    ...p,
    displayId: p.id.length > 8 ? `#${p.id.slice(0, 8)}` : `#${p.id}`,
    cliente: p.clientes?.nome || 'N/A',
    data: format(new Date(p.created_at), "dd/MM/yyyy", { locale: ptBR }),
    total: `R$ ${p.total_venda.toFixed(2)}`,
    statusDisplay: <span key={p.id} className={getStatusStyle(p.status)}>{p.status}</span>
  }));

  return (
    <div>
      <PageHeader 
        title="Gerenciamento de Pedidos" 
        action={{ label: "Novo Pedido", onClick: () => router.push("/pedidos/novo") }} 
      />
      
      <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl shadow-[#1a3a70]/5">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : (
          <Table 
            columns={columns} 
            data={dataForTable} 
            actions={[
              { label: "Ver", onClick: (p) => {
                setSelectedOrder(pedidos.find(o => o.id === p.id));
                setDetailModalOpen(true);
              }},
              { 
                label: "Aprovar", 
                onClick: (p) => handleStatusUpdate(p.id, 'Aberto'),
                show: (p: any) => p.status === 'Aguardando Aprovação' 
              },
              { 
                label: "Rejeitar", 
                onClick: (p) => handleStatusUpdate(p.id, 'Rejeitado'),
                variant: 'danger',
                show: (p: any) => p.status === 'Aguardando Aprovação'
              },
              { 
                label: "Produzir", 
                onClick: (p) => handleStatusUpdate(p.id, 'Em Produção'),
                show: (p: any) => p.status === 'Aberto'
              },
              { 
                label: "Enviar", 
                onClick: (p) => handleStatusUpdate(p.id, 'Enviado'),
                show: (p: any) => p.status === 'Em Produção'
              },
              { 
                label: "Concluir", 
                onClick: (p) => handleStatusUpdate(p.id, 'Concluído'),
                show: (p: any) => p.status === 'Enviado'
              },
              { label: "Excluir", onClick: (p) => handleDelete(p.id), variant: 'danger' }
            ]}
          />
        )}
      </div>

      <Modal 
        isOpen={isDetailModalOpen} 
        onClose={() => setDetailModalOpen(false)} 
        title={`Detalhes do Pedido ${selectedOrder?.id.length > 8 ? '#' + selectedOrder.id.slice(0, 8) : '#' + selectedOrder?.id}`}
      >
        {selectedOrder && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-2 gap-6 p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Cliente</p>
                <p className="font-bold text-[#1a3a70]">{selectedOrder.clientes?.nome}</p>
                <p className="text-xs text-gray-500">{selectedOrder.clientes?.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Status Atual</p>
                <span className={getStatusStyle(selectedOrder.status)}>{selectedOrder.status}</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center gap-6">
              <div className="text-3xl">📱</div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#1a3a70]/40 mb-1">Pagamento e Entrega</p>
                <p className="font-bold text-[#1a3a70] text-sm">
                  Os detalhes de endereço e forma de pagamento foram combinados diretamente via WhatsApp com o cliente.
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Itens do Pedido</p>
              <div className="space-y-3">
                {selectedOrder.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                    <div>
                      <p className="font-bold text-sm text-[#1a3a70]">{item.produto}</p>
                      <p className="text-xs text-gray-400">{item.qtd}x R$ {item.preco.toFixed(2)}</p>
                    </div>
                    <p className="font-black text-[#1a3a70]">R$ {item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Data da Venda</p>
                <p className="text-sm font-bold text-gray-600">{format(new Date(selectedOrder.created_at), "PPP", { locale: ptBR })}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Geral</p>
                <p className="text-3xl font-black text-[#ff6b35]">R$ {selectedOrder.total_venda.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100">
               <button 
                onClick={() => setDetailModalOpen(false)}
                className="flex-[2] py-4 bg-gray-100 text-gray-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
              <button 
                onClick={async () => {
                  showToast("Gerando recibo PDF...", "info");
                  await generateReceiptPDF(selectedOrder);
                }}
                className="flex-[3] py-4 bg-[#ff6b35] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                Gerar Recibo PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { generateReceiptPDF } from "@/lib/pdf";
import { supabase, isDemoMode } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TableSkeleton } from "@/components/Skeleton";
import { useToast } from "@/contexts/ToastContext";

export default function DocumentosPage() {
  const { showToast } = useToast();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentos();
  }, []);

  const fetchDocumentos = async () => {
    setLoading(true);
    if (isDemoMode) {
      setDocs([
        { id: "1001", cliente: "João Silva", tipo: "Recibo", data: "15/03/2026", total: "R$ 450,00", rawOrder: {} },
        { id: "1002", cliente: "Maria Oliveira", tipo: "Nota Fiscal", data: "16/03/2026", total: "R$ 1.200,00", rawOrder: {} },
      ]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('pedidos')
      .select(`
        *,
        clientes (
          nome, email, telefone
        )
      `)
      .order('created_at', { ascending: false });
      
    if (data) {
      const mappedDocs = data.map((p: any) => ({
        id: p.id.length > 8 ? `#${p.id.slice(0, 8)}` : `#${p.id}`,
        cliente: p.clientes?.nome || 'N/A',
        tipo: "Recibo Digital",
        data: format(new Date(p.created_at), "dd/MM/yyyy", { locale: ptBR }),
        total: `R$ ${(p.total_venda || 0).toFixed(2)}`,
        rawOrder: p
      }));
      setDocs(mappedDocs);
    }
    setLoading(false);
  };

  const columns = [
    { key: "id", label: "Nº Documento" },
    { key: "tipo", label: "Tipo" },
    { key: "cliente", label: "Cliente" },
    { key: "data", label: "Data de Emissão" },
    { key: "total", label: "Valor" },
  ];

  return (
    <div>
      <PageHeader title="Arquivo Central de Documentos" />
      
      <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl shadow-[#1a3a70]/5">
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : (
          <Table 
            columns={columns} 
            data={docs} 
            actions={[
              { 
                label: "Download PDF", 
                onClick: async (doc) => {
                  showToast("Gerando PDF com logotipo da GAMA...", "info");
                  if (isDemoMode) {
                     generateReceiptPDF({ 
                       id: "1001", data: "15/03/2026", total_venda: 450, 
                       clientes: { nome: doc.cliente }, items: [] 
                     });
                  } else {
                     generateReceiptPDF(doc.rawOrder);
                  }
                } 
              }
            ]}
          />
        )}
      </div>
    </div>
  );
}

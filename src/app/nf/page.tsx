"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { generateReceiptPDF } from "@/lib/pdf";

export default function DocumentosPage() {
  const docs = [
    { id: "#1001", cliente: "João Silva", tipo: "Recibo", data: "15/03/2026", total: "R$ 450,00" },
    { id: "#1002", cliente: "Maria Oliveira", tipo: "Nota Fiscal", data: "16/03/2026", total: "R$ 1.200,00" },
  ];

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
        <Table 
          columns={columns} 
          data={docs} 
          actions={[
            { label: "Download PDF", onClick: (doc) => generateReceiptPDF(doc) }
          ]}
        />
      </div>
    </div>
  );
}

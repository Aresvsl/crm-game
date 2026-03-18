"use client";

import jsPDF from "jspdf";

export const generateReceiptPDF = (order: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(26, 58, 112); // #1a3a70
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("GAMA BONES - RECIBO", 20, 25);
  
  doc.setFontSize(10);
  doc.text(`Pedido: #${String(order.id)}`, 160, 20);
  doc.text(`Data: ${String(order.data)}`, 160, 30);
  
  // Content
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text("Dados do Cliente", 20, 60);
  doc.setFontSize(11);
  doc.text(`Cliente: ${String(order.cliente)}`, 20, 70);
  
  doc.line(20, 80, 190, 80);
  
  doc.setFontSize(14);
  doc.text("Resumo do Pedido", 20, 95);
  doc.setFontSize(10);
  
  let yPos = 105;
  if (order.items && order.items.length > 0) {
    order.items.forEach((item: any) => {
      doc.text(`${String(item.produto || item.nome)} x ${String(item.qtd || item.quantidade)}`, 20, yPos);
      doc.text(`R$ ${String((item.subtotal || (item.preco * item.quantidade)).toFixed(2))}`, 160, yPos);
      yPos += 8;
    });
  } else {
    doc.text("Itens Diversos - GAMA BONES", 20, yPos);
    doc.text(String(order.total), 160, yPos);
    yPos += 8;
  }
  
  doc.line(20, yPos + 5, 190, yPos + 5);
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL GERAL", 20, yPos + 20);
  doc.text(String(order.total), 160, yPos + 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Este documento não tem valor fiscal. Obrigado!", 105, yPos + 40, { align: 'center' });
  
  const safeClientName = (order.cliente || "CLIENTE").replace(/[^a-z0-9]/gi, '_').toUpperCase();
  const filename = `RECIBO_GAMA_${String(order.id).slice(0, 8)}_${safeClientName}.pdf`;
  
  // Manual trigger for reliable filename
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateCatalogPDF = (products: any[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(26, 58, 112);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("GAMA BONES - CATÁLOGO 2026", 20, 25);
  doc.setFontSize(10);
  doc.text(`Total de Itens: ${String(products.length)}`, 160, 25);

  let yPos = 60;
  doc.setTextColor(0, 0, 0);
  
  products.forEach((p, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${p.nome}`, 20, yPos);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Categoria: ${p.categoria}`, 20, yPos + 5);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 107, 53); // #ff6b35
    doc.text(`R$ ${String(p.preco.toFixed(2))}`, 160, yPos + 5);
    
    doc.setTextColor(0, 0, 0);
    doc.line(20, yPos + 10, 190, yPos + 10);
    
    yPos += 20;
  });

  const filename = "CATALOGO_GAMA_BONES_2026.pdf";
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

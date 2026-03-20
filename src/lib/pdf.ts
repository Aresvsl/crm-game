"use client";

import jsPDF from "jspdf";

const fetchImageAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

export const generateReceiptPDF = async (order: any) => {
  const doc = new jsPDF();
  
  // Header Background
  doc.setFillColor(26, 58, 112); // #1a3a70
  doc.rect(0, 0, 210, 50, 'F');
  
  try {
    const logoData = await fetchImageAsBase64('/logo.png');
    doc.addImage(logoData, 'PNG', 15, 12, 25, 25);
  } catch (e) {
    console.error("No logo found");
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("GAMA BONES", 45, 25);
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("RECIBO DE VENDA", 45, 33);
  
  doc.setFontSize(10);
  doc.text(`Nº do Pedido: #${String(order.id).slice(0, 8)}`, 140, 25);
  doc.text(`Data: ${String(order.data)}`, 140, 33);
  
  // Content Start
  let yPos = 70;
  
  // Client Info Section
  doc.setTextColor(26, 58, 112);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO CLIENTE", 20, yPos);
  
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  yPos += 8;
  doc.text(`Nome: ${String(order.cliente || order.clientes?.nome || "Cliente Desconhecido")}`, 20, yPos);
  if (order.clientes?.email) {
    yPos += 6;
    doc.text(`E-mail: ${order.clientes.email}`, 20, yPos);
  }
  if (order.clientes?.telefone) {
    yPos += 6;
    doc.text(`Telefone: ${order.clientes.telefone}`, 20, yPos);
  }
  
  yPos += 15;
  doc.setDrawColor(220, 220, 220);
  doc.line(20, yPos, 190, yPos);
  
  // Order Summary Section
  yPos += 12;
  doc.setTextColor(26, 58, 112);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("RESUMO DO PEDIDO", 20, yPos);
  
  yPos += 12;
  doc.setFillColor(245, 245, 245);
  doc.rect(20, yPos - 6, 170, 8, 'F');
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("ITEM", 25, yPos);
  doc.text("QTD", 130, yPos);
  doc.text("SUBTOTAL", 160, yPos);
  
  yPos += 8;
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  const drawItem = (nome: string, qtd: string, val: string) => {
    doc.text(nome, 25, yPos);
    doc.text(qtd, 133, yPos);
    doc.text(val, 160, yPos);
    yPos += 8;
  };
  
  if (order.items && order.items.length > 0) {
    order.items.forEach((item: any) => {
      const preco = item.subtotal || (item.preco * item.quantidade) || 0;
      drawItem(
        String(item.produto || item.nome).substring(0, 45),
        `${String(item.qtd || item.quantidade)}x`,
        `R$ ${Number(preco).toFixed(2)}`
      );
    });
  } else {
    drawItem("Itens Diversos - GAMA BONES", "1x", `R$ ${Number(order.total_venda || order.total).toFixed(2)}`);
  }
  
  doc.line(20, yPos + 2, 190, yPos + 2);
  
  // Total Section
  yPos += 15;
  doc.setTextColor(255, 107, 53); // orange
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL GERAL", 20, yPos);
  doc.text(`R$ ${Number(order.total_venda || order.total).toFixed(2)}`, 160, yPos);
  
  // Footer
  yPos += 30;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("Este documento não tem valor fiscal. Obrigado pela preferência!", 105, yPos, { align: 'center' });
  doc.text("Gama Bones - inventory.gamabones.com.br", 105, yPos + 5, { align: 'center' });
  
  // Save Document
  const safeClientName = String(order.cliente || order.clientes?.nome || "CLIENTE").replace(/[^a-z0-9]/gi, '_').toUpperCase();
  const filename = `RECIBO_GAMA_${String(order.id).split('-')[0].toUpperCase()}_${safeClientName}.pdf`;
  doc.save(filename);
};

export const generateCatalogPDF = async (products: any[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(26, 58, 112);
  doc.rect(0, 0, 210, 50, 'F');
  
  try {
    const logoData = await fetchImageAsBase64('/logo.png');
    doc.addImage(logoData, 'PNG', 15, 12, 25, 25);
  } catch (e) { }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("GAMA BONES", 45, 25);
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("CATÁLOGO DE PRODUTOS 2026", 45, 33);
  
  doc.setFontSize(10);
  doc.text(`Total de Itens: ${String(products.length)}`, 150, 25);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 150, 33);

  let yPos = 70;
  
  products.forEach((p, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
      doc.setDrawColor(26, 58, 112);
      doc.setLineWidth(2);
      doc.line(0, 0, 210, 0);
    }
    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, yPos - 8, 180, 25, 3, 3, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 58, 112);
    doc.setFontSize(14);
    doc.text(`${p.nome}`, 20, yPos);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Categoria: ${p.categoria} | Estoque: ${p.estoque} un.`, 20, yPos + 6);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 107, 53); // #ff6b35
    doc.setFontSize(16);
    doc.text(`R$ ${String(p.preco.toFixed(2))}`, 160, yPos + 2);
    
    yPos += 32;
  });

  const filename = "CATALOGO_GAMA_BONES_2026.pdf";
  doc.save(filename);
};

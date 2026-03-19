"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Table } from "@/components/Table";
import { Modal } from "@/components/Modal";
import { FormInput } from "@/components/Forms";
import { supabase, isDemoMode } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";
import { TableSkeleton } from "@/components/Skeleton";

export default function ClientesPage() {
  const { showToast } = useToast();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [newCliente, setNewCliente] = useState({ nome: "", email: "", telefone: "", cidade: "" });
  const [editingCliente, setEditingCliente] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    if (isDemoMode) {
      setClientes([
        { id: "1", nome: "João Exemplo (MOCK)", email: "joao@mock.com", telefone: "(11) 99999-9999", cidade: "São Paulo" },
        { id: "2", nome: "Maria Demo (MOCK)", email: "maria@demo.com", telefone: "(21) 88888-8888", cidade: "Rio de Janeiro" },
      ]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setClientes(data);
    setLoading(false);
  };

  const columns = [
    { key: "nome", label: "Nome" },
    { key: "email", label: "E-mail" },
    { key: "telefone", label: "Telefone" },
    { key: "cidade", label: "Cidade" },
  ];

  const handleAdd = async () => {
    if (!newCliente.nome || !newCliente.email) return;
    
    if (isDemoMode) {
      const mockNew = { ...newCliente, id: Math.random().toString() };
      setClientes([...clientes, mockNew]);
      showToast("Modo Demonstração: Cliente cadastrado localmente!");
      setModalOpen(false);
      setNewCliente({ nome: "", email: "", telefone: "", cidade: "" });
      return;
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert([newCliente])
      .select();

    if (error) {
      showToast(`Erro no banco: ${error.message} (Code: ${error.code})`, "error");
      console.error("SUPABASE ERROR:", error);
      return;
    }

    if (data) {
      setClientes([...clientes, data[0]]);
      showToast("Cliente salvo com sucesso!");
      setModalOpen(false);
      setNewCliente({ nome: "", email: "", telefone: "", cidade: "" });
    }
  };

  const handleUpdate = async () => {
    if (!editingCliente.nome || !editingCliente.email) return;

    if (isDemoMode) {
      setClientes(clientes.map(c => c.id === editingCliente.id ? editingCliente : c));
      showToast("Modo Demonstração: Cliente atualizado localmente!");
      setEditModalOpen(false);
      return;
    }

    const { error } = await supabase
      .from('clientes')
      .update(editingCliente)
      .eq('id', editingCliente.id);

    if (error) {
      showToast(`Erro ao atualizar: ${error.message}`, "error");
      console.error("SUPABASE ERROR:", error);
    } else {
      setClientes(clientes.map(c => c.id === editingCliente.id ? editingCliente : c));
      showToast("Cliente atualizado com sucesso!");
      setEditModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
    
    if (isDemoMode) {
      setClientes(clientes.filter(c => c.id !== id));
      showToast("Modo Demonstração: Cliente excluído localmente!");
      return;
    }

    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) {
      showToast(`Erro ao excluir: ${error.message}`, "error");
      console.error("SUPABASE ERROR:", error);
    } else {
      setClientes(clientes.filter(c => c.id !== id));
      showToast("Cliente excluído com sucesso!");
    }
  };
  const filteredClientes = clientes.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader 
        title="Gerenciamento de Clientes" 
        action={{ label: "Novo Cliente", onClick: () => setModalOpen(true) }} 
      />
      
      <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl shadow-[#1a3a70]/5">
        <div className="mb-10 relative group">
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-5 glass-card rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] transition-all bg-white/40 placeholder:text-gray-400 placeholder:font-medium text-[#1a3a70] font-bold"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#ff6b35] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        </div>
        
        {loading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : (
          <Table 
            columns={columns} 
            data={filteredClientes} 
            actions={[
              { label: "Editar", onClick: (c) => {
                setEditingCliente(c);
                setEditModalOpen(true);
              }},
              { label: "Excluir", onClick: (c) => handleDelete(c.id), variant: 'danger' }
            ]}
          />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Novo Cliente">
        <div className="space-y-6">
          <FormInput 
            label="Nome Completo / Empresa" 
            value={newCliente.nome} 
            onChange={(e) => setNewCliente({...newCliente, nome: e.target.value})}
            placeholder="Ex: João Silva ou Empresa Ltda"
          />
          <FormInput 
            label="E-mail" 
            type="email"
            value={newCliente.email} 
            onChange={(e) => setNewCliente({...newCliente, email: e.target.value})}
            placeholder="cliente@exemplo.com"
          />
          <div className="grid grid-cols-2 gap-6">
            <FormInput 
              label="Telefone / WhatsApp" 
              value={newCliente.telefone} 
              onChange={(e) => setNewCliente({...newCliente, telefone: e.target.value})}
              placeholder="(00) 00000-0000"
            />
            <FormInput 
              label="Cidade / UF" 
              value={newCliente.cidade} 
              onChange={(e) => setNewCliente({...newCliente, cidade: e.target.value})}
              placeholder="São Paulo - SP"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="w-full mt-6 bg-[#ff6b35] text-white p-4 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-orange-500/20"
          >
            Cadastrar Cliente
          </button>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Cliente">
        <div className="space-y-6">
          {editingCliente && (
            <>
              <FormInput 
                label="Nome Completo / Empresa" 
                value={editingCliente.nome} 
                onChange={(e) => setEditingCliente({...editingCliente, nome: e.target.value})}
              />
              <FormInput 
                label="E-mail" 
                type="email"
                value={editingCliente.email} 
                onChange={(e) => setEditingCliente({...editingCliente, email: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-6">
                <FormInput 
                  label="Telefone" 
                  value={editingCliente.telefone} 
                  onChange={(e) => setEditingCliente({...editingCliente, telefone: e.target.value})}
                />
                <FormInput 
                  label="Cidade" 
                  value={editingCliente.cidade} 
                  onChange={(e) => setEditingCliente({...editingCliente, cidade: e.target.value})}
                />
              </div>
              <button 
                onClick={handleUpdate}
                className="w-full mt-6 bg-[#1a3a70] text-white p-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#1a3a70]/90 transition-colors shadow-xl"
              >
                Salvar Alterações
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

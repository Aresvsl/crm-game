"use client";

import { Plus } from 'lucide-react';

export const PageHeader = ({ title, action }: { title: string, action?: { label: string, onClick: () => void } }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
    <div>
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#1a3a70] tracking-tighter leading-none mb-2">
        {title.split(' ')[0]} <span className="text-[#ff6b35]">{title.split(' ').slice(1).join(' ')}</span>
      </h1>
      <div className="h-1 w-12 lg:w-20 bg-linear-to-r from-[#ff6b35] to-[#f97316] rounded-full" />
    </div>
    
    {action && (
      <button 
        onClick={action.onClick}
        className="btn-premium flex items-center gap-2 group"
      >
        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
        {action.label}
      </button>
    )}
  </div>
);

"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface PremiumSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export const PremiumSelect = ({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = "Selecione...", 
  error 
}: PremiumSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-4 relative" ref={containerRef}>
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#1a3a70] mb-2 ml-1 opacity-60">
        {label}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300
          text-sm font-bold border backdrop-blur-md
          ${isOpen 
            ? 'border-[#ff6b35] ring-4 ring-[#ff6b35]/10 bg-white shadow-xl' 
            : 'border-white/60 bg-white/40 hover:bg-white/60 hover:border-gray-300'}
          ${error ? 'border-red-500 bg-red-50/50' : ''}
          ${!selectedOption ? 'text-gray-400 font-medium' : 'text-[#1a3a70]'}
        `}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown 
          size={18} 
          className={`transition-transform duration-500 text-[#ff6b35] ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-3 p-2 bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[1.5rem] shadow-2xl shadow-[#1a3a70]/10 animate-in fade-in zoom-in-95 duration-300 max-h-60 overflow-y-auto custom-scrollbar">
          {options.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400 font-bold uppercase tracking-widest italic">
              Nenhuma opção disponível
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between p-4 mb-1 rounded-xl transition-all text-left
                    ${isSelected 
                      ? 'bg-linear-to-r from-[#1a3a70] to-[#2563eb] text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-[#ff6b35]/5 hover:text-[#ff6b35]'}
                  `}
                >
                  <span className={`text-sm ${isSelected ? 'font-black' : 'font-bold'}`}>
                    {opt.label}
                  </span>
                  {isSelected && <Check size={16} strokeWidth={3} className="animate-in slide-in-from-right-2" />}
                </button>
              );
            })
          )}
        </div>
      )}
      
      {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">{error}</p>}
    </div>
  );
};

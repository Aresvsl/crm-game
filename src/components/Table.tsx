"use client";

import { MoreHorizontal, Search, SlidersHorizontal } from "lucide-react";

export const Table = ({ columns, data, actions }: { 
  columns: { key: string, label: string, format?: (value: any) => React.ReactNode }[], 
  data: any[],
  actions?: { label: string, onClick: (item: any) => void, variant?: 'danger' | 'default', show?: (item: any) => boolean }[]
}) => (
  <div className="glass-card rounded-[2rem] shadow-2xl shadow-[#1a3a70]/5 border border-white/60 overflow-hidden">
    {/* Table Toolbar */}
    <div className="px-4 lg:px-8 py-4 lg:py-6 border-b border-gray-50 flex flex-col lg:flex-row items-start lg:items-center justify-between bg-gray-50/30 gap-4">
       <div className="flex items-center gap-4 text-[10px] lg:text-sm font-bold text-[#1a3a70]/50 uppercase tracking-widest">
         Métricas Recentes
       </div>
       <div className="flex items-center gap-2">
         <button className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all text-gray-400">
           <Search size={18} />
         </button>
         <button className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all text-gray-400">
           <SlidersHorizontal size={18} />
         </button>
       </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50">
            {columns.map(col => (
              <th key={col.key} className="px-4 lg:px-8 py-4 lg:py-5 font-black text-[8px] lg:text-[10px] uppercase tracking-[0.2em] text-[#1a3a70]/40 whitespace-nowrap">
                {col.label}
              </th>
            ))}
            {actions && <th className="px-4 lg:px-8 py-4 lg:py-5 font-black text-[8px] lg:text-[10px] uppercase tracking-[0.2em] text-[#1a3a70]/40 text-right">Ações</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50/80">
          {data.map((row, i) => (
            <tr key={i} className="group hover:bg-linear-to-r from-transparent via-blue-50/20 to-transparent transition-all duration-500">
              {columns.map(col => (
                <td key={col.key} className="px-4 lg:px-8 py-4 lg:py-6 whitespace-nowrap">
                  <span className="text-xs lg:text-sm font-semibold text-[#1a3a70]/70 group-hover:text-[#1a3a70] transition-colors tabular-nums">
                    {col.format ? col.format(row[col.key]) : row[col.key]}
                  </span>
                </td>
              ))}
              {actions && (
                <td className="px-4 lg:px-8 py-4 lg:py-6 text-right">
                  <div className="flex justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {actions.filter(act => !act.show || act.show(row)).map((act, j) => (
                      <button 
                        key={act.label} 
                        onClick={() => act.onClick(row)}
                        className={`
                          px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all
                          ${act.variant === 'danger' 
                            ? 'bg-red-50 text-red-500 hover:bg-red-600 hover:text-white border border-red-100 shadow-lg shadow-red-500/10' 
                            : j === 0 
                              ? 'bg-[#1a3a70] text-white hover:bg-[#ff6b35] shadow-lg shadow-[#1a3a70]/20' 
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                        `}
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                  <div className="group-hover:hidden transition-all text-gray-300">
                    <MoreHorizontal size={20} className="ml-auto" />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Table Footer */}
    <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-50 flex justify-between items-center">
       <div className="text-xs text-gray-400 font-medium">
         Mostrando <span className="text-[#1a3a70] font-bold">{data.length}</span> resultados
       </div>
       <div className="flex gap-2">
         <button className="px-4 py-2 text-xs font-bold text-[#1a3a70] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-100">
           Anterior
         </button>
         <button className="px-4 py-2 text-xs font-bold text-white bg-[#1a3a70] rounded-lg shadow-lg shadow-[#1a3a70]/20 active:scale-95 transition-all">
           Próximo
         </button>
       </div>
    </div>
  </div>
);

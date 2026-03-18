"use client";

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  icon?: React.ReactNode;
  color?: 'orange' | 'navy' | 'blue' | 'emerald' | 'purple';
}

export const StatCard = ({ label, value, trend, icon, color = 'navy' }: StatCardProps) => {
  const colorConfigs = {
    orange: 'from-[#ff6b35] to-[#f97316] shadow-orange-500/20',
    navy: 'from-[#1a3a70] to-[#2a5298] shadow-blue-500/20',
    blue: 'from-blue-500 to-indigo-600 shadow-indigo-500/20',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
    purple: 'from-purple-500 to-violet-600 shadow-purple-500/20'
  };

  return (
    <div className="group relative glass-card p-8 rounded-3xl premium-shadow hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 bg-linear-to-br ${colorConfigs[color]} opacity-5 rounded-full blur-3xl transition-opacity group-hover:opacity-10`} />
      
      <div className="relative flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${colorConfigs[color]} flex items-center justify-center text-white shadow-xl transform transition-transform group-hover:scale-110 group-hover:rotate-3`}>
          {icon}
        </div>
        {trend && (
          <span className={`px-3 py-1 rounded-full text-xs font-black tracking-tighter ${trend.startsWith('+') || trend === 'Aprovação' ? 'text-emerald-500 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
            {trend}
          </span>
        )}
      </div>

      <div className="relative">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-[#1a3a70] tracking-tighter tabular-nums drop-shadow-sm transition-all group-hover:scale-[1.02] origin-left">
          {value}
        </h3>
      </div>
    </div>
  );
};

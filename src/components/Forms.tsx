"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput = ({ label, error, ...props }: InputProps) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-[#1a3a70] mb-1">
      {label}
    </label>
    <input 
      {...props}
      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35] transition-all
        ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const FormSelect = ({ label, options, error, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-[#1a3a70] mb-1">
      {label}
    </label>
    <select 
      {...props}
      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35] transition-all
        ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

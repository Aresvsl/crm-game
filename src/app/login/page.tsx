"use client";

import React, { useState } from "react";
import { FormInput } from "@/components/Forms";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase, isDemoMode } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isDemoMode && email === "admin@gamabones.com") {
      // Em modo demo, salvamos um flag no cookie para o middleware
      document.cookie = "demo-session=true; path=/";
      router.push("/");
      return;
    }

    console.log("Supabase Call Initiated...");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
      {/* Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff6b35]/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1a3a70]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      <div className="glass-card w-full max-w-md p-10 rounded-[2.5rem] relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-24 h-24 mb-6 transform hover:scale-110 transition-transform duration-500">
            <Image 
              src="/brand-final.png" 
              alt="GAMA Logo" 
              fill
              className="object-contain drop-shadow-xl"
            />
          </div>
          <h1 className="text-3xl font-black text-[#1a3a70] tracking-tighter text-center uppercase">
            GAMA <span className="text-[#ff6b35]">Bonés</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">Portal Administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <FormInput
              label="E-mail Corporativo"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gamabones.com"
              required
            />
          </div>
          <div className="space-y-1">
            <FormInput
              label="Senha de Acesso"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-[10px] font-bold uppercase tracking-wider p-4 rounded-xl text-center animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <button 
            disabled={loading}
            className={`
              w-full bg-[#1a3a70] text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest mt-4 
              transition-all shadow-xl shadow-blue-900/20
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
            `}
          >
            {loading ? 'Autenticando...' : 'Avançar para o Painel'}
          </button>
        </form>

        <p className="text-center mt-10 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Problemas de acesso? <a href="#" className="text-[#ff6b35]">Contate o suporte</a>
        </p>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { FormInput } from "@/components/Forms";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase, isDemoMode } from "@/lib/supabase";
import { Sparkles, ShoppingBag, MessageCircle, ShieldCheck, Palette } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  React.useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isDemoMode && email === "admin@gamabones.com") {
      document.cookie = "demo-session=true; path=/";
      router.push("/");
      return;
    }

    try {
      // 10 second timeout to prevent infinite hang
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Tempo esgotado. Verifique sua conexão e tente novamente.")), 10000)
      );

      const authPromise = supabase.auth.signInWithPassword({ email, password });

      const { error: signInError } = await Promise.race([authPromise, timeoutPromise]) as Awaited<typeof authPromise>;

      if (signInError) {
        setError(signInError.message);
      } else {
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
        router.push("/");
        return; // don't setLoading(false) on success
      }
    } catch (err: any) {
      setError(err.message || "Erro inesperado. Tente novamente.");
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (isDemoMode) {
      setSuccess("Modo Demo: Instruções de recuperação enviadas ficticiamente.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?reset=true`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Se o e-mail existir, você receberá um link para redefinir a senha.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 p-6 md:p-12 relative overflow-hidden bg-slate-50">
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

        {isResetting ? (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-1">
              <FormInput
                label="E-mail Corporativo"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gamabones.com"
                required
              />
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Enviaremos um link de recuperação.</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-wider p-4 rounded-xl text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider p-4 rounded-xl text-center">
                {success}
              </div>
            )}

            <button 
              disabled={loading}
              className={`w-full bg-[#ff6b35] text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest mt-4 transition-all shadow-xl shadow-orange-500/20 ${loading ? 'opacity-50' : 'hover:scale-[1.02]'}`}
            >
              {loading ? 'Enviando...' : 'Recuperar Senha'}
            </button>
            <button 
              type="button"
              onClick={() => { setIsResetting(false); setError(""); setSuccess(""); }}
              className="w-full text-[#1a3a70] text-[10px] font-black uppercase tracking-widest hover:text-[#ff6b35] transition-colors mt-4"
            >
              Voltar ao Login
            </button>
          </form>
        ) : (
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
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Senha de Acesso</label>
                <button type="button" onClick={() => setIsResetting(true)} className="text-[10px] font-black uppercase tracking-widest text-[#ff6b35] hover:text-[#1a3a70] transition-colors">Esqueceu?</button>
              </div>
              <input
                type="password"
                className="w-full p-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] text-[#1a3a70] font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center space-x-3 px-2">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <div className={`w-5 h-5 rounded-md border-2 transition-all duration-300 ${rememberMe ? 'bg-[#ff6b35] border-[#ff6b35]' : 'bg-white/50 border-gray-200'}`}>
                    {rememberMe && <svg className="w-full h-full text-white p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </div>
                <span className="ml-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-[#1a3a70] transition-colors">
                  Lembrar meu e-mail
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-wider p-4 rounded-xl text-center">
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className={`w-full bg-[#1a3a70] text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest mt-4 transition-all shadow-xl shadow-blue-900/20 ${loading ? 'opacity-50' : 'hover:scale-[1.02]'}`}
            >
              {loading ? 'Autenticando...' : 'Avançar para o Painel'}
            </button>
          </form>
        )}

        <p className="text-center mt-10 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Problemas de acesso? <a href="#" className="text-[#ff6b35]">Contate o suporte</a>
        </p>
      </div>

      {/* Release Notes / Changelog Panel - Premium Vercel/Linear Style */}
      <div className="w-full max-w-md lg:max-w-xl p-1 relative z-10 animate-in fade-in slide-in-from-right-12 duration-1000 delay-300 rounded-[3rem] bg-gradient-to-br from-white/80 to-white/30 backdrop-blur-2xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(26,58,112,0.1)]">
        <div className="p-8 md:p-10">
          <div className="flex items-center gap-5 mb-10">
            <div className="h-16 w-16 bg-gradient-to-br from-[#1a3a70] to-blue-900 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-900/30 border border-white/20">
              <Sparkles className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-[#1a3a70] tracking-tighter uppercase drop-shadow-sm">Release Notes</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6b35] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff6b35]"></span>
                </span>
                <span className="text-[10px] font-black text-[#ff6b35] uppercase tracking-[0.2em] bg-orange-50 border border-orange-100/50 px-3 py-1 rounded-full shadow-sm">v2.1.0 Elite Update</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Item 1 */}
            <div className="p-6 rounded-[2rem] bg-white/40 border border-white/60 hover:bg-white hover:border-emerald-100 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 group relative overflow-hidden cursor-default">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex gap-5">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
                  <ShoppingBag size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#1a3a70] uppercase tracking-widest mb-1.5 group-hover:text-emerald-600 transition-colors">Catálogo PRO</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">Novo carrinho flutuante responsivo com sistema dinâmico de <strong>bloqueio de compras sem estoque real</strong>.</p>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="p-6 rounded-[2rem] bg-white/40 border border-white/60 hover:bg-white hover:border-[#25D366]/30 hover:shadow-2xl hover:shadow-[#25D366]/10 transition-all duration-500 group relative overflow-hidden cursor-default">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#25D366] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex gap-5">
                <div className="h-12 w-12 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-inner">
                  <MessageCircle size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#1a3a70] uppercase tracking-widest mb-1.5 group-hover:text-[#25D366] transition-colors">Expresso WhatsApp</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">Pedidos do catálogo interceptados e formatados (Nome, Endereço, Pix) direto para o número oficial da loja.</p>
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="p-6 rounded-[2rem] bg-white/40 border border-white/60 hover:bg-white hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group relative overflow-hidden cursor-default">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex gap-5">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
                  <ShieldCheck size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#1a3a70] uppercase tracking-widest mb-1.5 group-hover:text-blue-600 transition-colors">Blindagem CRM</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">Travas de segurança no PDV interno para <strong>impedir venda de produtos esgotados pela equipe</strong> e vacina de cache de navegador.</p>
                </div>
              </div>
            </div>

            {/* Item 4 */}
            <div className="p-6 rounded-[2rem] bg-white/40 border border-white/60 hover:bg-white hover:border-purple-100 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 group relative overflow-hidden cursor-default">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex gap-5">
                <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-inner">
                  <Palette size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#1a3a70] uppercase tracking-widest mb-1.5 group-hover:text-purple-600 transition-colors">Design System & UX</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">Ícones vetorizados premium (PIX, Cartões, IG) e modais flutuantes sofisticados para Políticas de Troca e FAQ Público.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

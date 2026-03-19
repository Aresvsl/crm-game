"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";
import { ToastProvider } from "@/contexts/ToastContext";
import { supabase, isDemoMode } from "@/lib/supabase";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const isCatalogoPage = pathname?.startsWith("/catalogo");
  const [authChecked, setAuthChecked] = useState(false);
  const [userEmail, setUserEmail] = useState("admin@gamabones.com");

  useEffect(() => {
    const checkAuth = async () => {
      // Public pages don't need auth
      if (isLoginPage || isCatalogoPage) {
        setAuthChecked(true);
        return;
      }

      // Demo mode is always allowed
      const isDemoSession = document.cookie.includes("demo-session=true");
      if (isDemoMode || isDemoSession) {
        setAuthChecked(true);
        return;
      }

      // Check real Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUserEmail(session.user.email || "admin@gamabones.com");
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [pathname, router, isLoginPage, isCatalogoPage]);

  // Show nothing while checking auth (avoids flash of unprotected content)
  if (!authChecked && !isLoginPage && !isCatalogoPage) {
    return (
      <ToastProvider>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#1a3a70]/20 border-t-[#1a3a70] rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Verificando acesso...</p>
          </div>
        </div>
      </ToastProvider>
    );
  }

  const user = { name: "Admin GAMA", email: userEmail };
  const content = (isLoginPage || isCatalogoPage) ? children : <Layout user={user}>{children}</Layout>;

  return <ToastProvider>{content}</ToastProvider>;
}

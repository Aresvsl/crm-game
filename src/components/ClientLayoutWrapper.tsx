"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Layout } from "@/components/Layout";
import { ToastProvider } from "@/contexts/ToastContext";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const mockUser = { name: "Admin GAMA", email: "admin@gamabones.com.br" };

  const content = isLoginPage ? children : <Layout user={mockUser}>{children}</Layout>;

  return <ToastProvider>{content}</ToastProvider>;
}

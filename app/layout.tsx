
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

import AppShell from "@/components/AppShell";
import { ToastProvider } from "@/components/ToastProvider";
import { SidebarProvider } from "@/context/SidebarContext";

export const viewport: Viewport = {
  themeColor: "#052659",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Fatura Ótica • ERP Óptico & Gestão Clínica B2B",
    template: "%s | Fatura Ótica Enterprise",
  },
  description:
    "Sistema de alta precisão para óticas de varejo: emissão de ordens de serviço, matriz dióptrica clínica 0.25D, controle de esteira de laboratórios e Kardex de reposição automática.",
  keywords: [
    "ERP Óptico",
    "Gestão de Óticas",
    "Ordem de Serviço Óptica",
    "Kardex de Estoque",
    "Matriz Dióptrica",
    "Software para Ótica",
  ],
  authors: [{ name: "Fatura Ótica Technologies" }],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Fatura Ótica • ERP Óptico & Gestão Clínica",
    description:
      "A plataforma definitiva para automação de balcão, rastreabilidade de laboratórios e cálculo dióptrico de alta precisão.",
    type: "website",
    locale: "pt_BR",
    siteName: "Fatura Ótica Enterprise",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex bg-[#F0F6FC] text-[#021024]`}
      >
        <ToastProvider>
          <SidebarProvider>
            <AppShell>{children}</AppShell>
          </SidebarProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

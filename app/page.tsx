"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useOperator } from "@/hooks/useOperator";
import PageHeader from "@/components/PageHeader";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#052659] text-white p-2.5 rounded-lg border border-[#7DA0CA]/50 shadow-lg text-xs">
        <div className="font-bold text-[#C1E8FF] mb-1 font-mono">{label}</div>
        <div className="flex items-center justify-between gap-3 text-white">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-[#5483B3]"></span>
            Realizado:
          </span>
          <span className="font-mono font-bold">R$ {payload[0]?.value?.toLocaleString("pt-BR")},00</span>
        </div>
        {payload[1] && (
          <div className="flex items-center justify-between gap-3 text-[#C1E8FF]/80 mt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-0.5 bg-[#7DA0CA] border-t border-dashed"></span>
              Meta Prevista:
            </span>
            <span className="font-mono">R$ {payload[1]?.value?.toLocaleString("pt-BR")},00</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function Home() {
  const [selectedPeriod, setSelectedPeriod] = useState<"hoje" | "7d" | "mes">("hoje");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { operator, isManager, isConsultant } = useOperator();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const chartData = [
    { dia: "SEG", realizado: 5200, meta: 5000 },
    { dia: "TER", realizado: 6100, meta: 5200 },
    { dia: "QUA", realizado: 4800, meta: 5500 },
    { dia: "QUI", realizado: 7400, meta: 5500 },
    { dia: "SEX", realizado: 8900, meta: 6000 },
    { dia: "SÁB", realizado: 9400, meta: 6200, highlight: true },
    { dia: "DOM", realizado: 2100, meta: 6500 },
  ];

  const labs = [
    {
      nome: "Hoya Lab Brasil",
      pedidos: 14,
      sla: "2.8 dias",
      pontualidade: "97.4%",
      status: "normal",
      contato: "11988887777",
    },
    {
      nome: "EssilorLuxottica",
      pedidos: 22,
      sla: "3.1 dias",
      pontualidade: "94.8%",
      status: "normal",
      contato: "11977776666",
    },
    {
      nome: "Zeiss Lab Sp",
      pedidos: 9,
      sla: "4.2 dias",
      pontualidade: "83.0%",
      status: "atraso",
      contato: "11966665555",
    },
    {
      nome: "Brasul Ofta Lab",
      pedidos: 6,
      sla: "1.9 dias",
      pontualidade: "99.1%",
      status: "normal",
      contato: "11955554444",
    },
  ];

  const priorityOrders = [
    {
      id: "10294",
      cliente: "João Pedro Alcantara",
      tipo: "Multifocal Digital FreeForm",
      etapa: "Pronto Retirada",
      etapaType: "success",
      atraso: "No prazo",
      atrasoType: "neutral",
      prioridade: "VIP",
      prioridadeType: "purple",
    },
    {
      id: "10287",
      cliente: "Beatriz Nogueira Silva",
      tipo: "Visão Simples Antirreflexo",
      etapa: "Montagem Externa",
      etapaType: "info",
      atraso: "+1d Atraso",
      atrasoType: "danger",
      prioridade: "Urgente",
      prioridadeType: "red",
    },
    {
      id: "10279",
      cliente: "Carlos Eduardo Dias",
      tipo: "Lentes Solares Graduadas",
      etapa: "Surfaçagem Hoya",
      etapaType: "warning",
      atraso: "Hoje 17h",
      atrasoType: "warning",
      prioridade: "Garantia",
      prioridadeType: "amber",
    },
    {
      id: "10274",
      cliente: "Ana Luiza Meireles",
      tipo: "Fotossensível Transitions Gen8",
      etapa: "Triagem Armação",
      etapaType: "info",
      atraso: "No prazo",
      atrasoType: "neutral",
      prioridade: "Normal",
      prioridadeType: "blue",
    },
  ];

  const sellers = [
    {
      nome: "Mariana Souza",
      cargo: "Consultora Master",
      oss: 48,
      vendas: "R$ 38.450",
      metaPercent: 112,
      arTaxa: "92%",
    },
    {
      nome: "Marcos Lima",
      cargo: "Atendente Técnico",
      oss: 36,
      vendas: "R$ 28.900",
      metaPercent: 96,
      arTaxa: "86%",
    },
    {
      nome: "Juliana Costa",
      cargo: "Consultora Óptica",
      oss: 29,
      vendas: "R$ 21.400",
      metaPercent: 89,
      arTaxa: "82%",
    },
  ];

  // Specific worklist for Consultant View
  const consultantOrders = [
    {
      id: "10294",
      os: "OS #10294",
      cliente: "João Pedro Alcantara",
      telefone: "11988887777",
      armacao: "Ray-Ban RX5228 Tartaruga 54-18",
      lente: "Multifocal Digital FreeForm",
      status: "pronto",
      statusLabel: "Pronto Retirada",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      prazo: "Hoje",
    },
    {
      id: "10291",
      os: "OS #10291",
      cliente: "Mariana Silva Lima",
      telefone: "11977776666",
      armacao: "Vogue VO5352 Dourado 52-17",
      lente: "Visão Simples Crizal Rock",
      status: "montagem",
      statusLabel: "Laboratório Hoya",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      prazo: "Hoje às 17h",
    },
    {
      id: "10288",
      os: "OS #10288",
      cliente: "Roberto Campos Neto",
      telefone: "11966665555",
      armacao: "Oakley OX8156 Satin Black",
      lente: "Transitions Gen 8 Cinza",
      status: "surfacagem",
      statusLabel: "Surfaçagem Zeiss",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      prazo: "Amanhã 11h",
    },
    {
      id: "10285",
      os: "OS #10285",
      cliente: "Beatriz Albuquerque",
      telefone: "11955554444",
      armacao: "Carrera CA8840 Aviador Grafite",
      lente: "Policarbonato Antirreflexo",
      status: "receita",
      statusLabel: "Aguardando DNP",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      prazo: "Pendente",
    },
    {
      id: "10280",
      os: "OS #10280",
      cliente: "Fernando Dias",
      telefone: "11944443333",
      armacao: "Ray-Ban Justin RB4165 Preto",
      lente: "Solar Polarizado G-15",
      status: "entregue",
      statusLabel: "Entregue ao Paciente",
      badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
      prazo: "Concluído",
    },
  ];

  const consultantLabAlerts = [
    {
      lab: "Hoya Lab Brasil",
      os: "OS #10291",
      cliente: "Mariana Silva Lima",
      servico: "Crizal Rock Surfaçada",
      previsao: "Hoje às 17h",
      status: "No prazo",
      statusType: "success",
    },
    {
      lab: "Zeiss Lab SP",
      os: "OS #10288",
      cliente: "Roberto Campos Neto",
      servico: "Transitions Gen8",
      previsao: "Amanhã às 11h",
      status: "Atenção 24h",
      statusType: "warning",
    },
    {
      lab: "EssilorLuxottica",
      os: "OS #10276",
      cliente: "Claudio Mendonça",
      servico: "Varilux Comfort Max",
      previsao: "Quarta-feira",
      status: "Em rota de entrega",
      statusType: "info",
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F0F6FC]">
      {/* Top Persistent Componentized Header */}
      <PageHeader
        id="header-dash-executivo"
        icon={isManager ? "domain" : "badge"}
        title={
          <>
            {isManager ? "Painel Executivo" : "Painel de Atendimento"}
            <span className="hidden xl:inline"> &amp; Diagnóstico Diário</span>
          </>
        }
        badge={
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C1E8FF] text-[#052659] border border-[#7DA0CA]/50 inline-flex items-center">
              {operator.branch.split(" - ")[0].toUpperCase()}
            </span>
            {isConsultant && (
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                TURNO ATIVO
              </span>
            )}
          </div>
        }
        subtitle={
          <>
            <span className="material-symbols-outlined text-[13px] shrink-0">
              {isManager ? "calendar_today" : "person"}
            </span>
            <span className="truncate">
              {isManager
                ? "Segunda-feira, 28 de Outubro de 2024"
                : `${operator.name} • ${operator.role}`}
            </span>
            <span className="text-[#7DA0CA] hidden sm:inline">•</span>
            <span className="text-[#5483B3] hidden sm:inline font-mono">Sincronização EDI: há 3 min</span>
          </>
        }
        centerSlot={
          isManager ? (
            <div className="bg-[#F0F6FC] p-0.5 rounded-lg border border-[#7DA0CA]/50 hidden sm:flex items-center">
              <button
                id="btn-dash-periodo-hoje"
                onClick={() => setSelectedPeriod("hoje")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  selectedPeriod === "hoje"
                    ? "bg-[#052659] text-white shadow-xs"
                    : "text-[#5483B3] hover:text-[#052659]"
                }`}
              >
                Hoje
              </button>
              <button
                id="btn-dash-periodo-7d"
                onClick={() => setSelectedPeriod("7d")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  selectedPeriod === "7d"
                    ? "bg-[#052659] text-white shadow-xs"
                    : "text-[#5483B3] hover:text-[#052659]"
                }`}
              >
                7 dias
              </button>
              <button
                id="btn-dash-periodo-mes"
                onClick={() => setSelectedPeriod("mes")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  selectedPeriod === "mes"
                    ? "bg-[#052659] text-white shadow-xs"
                    : "text-[#5483B3] hover:text-[#052659]"
                }`}
              >
                Este Mês
              </button>
            </div>
          ) : undefined
        }
        actions={
          <>
            <button
              id="btn-dash-atualizar"
              onClick={handleRefresh}
              className="h-9 px-3 rounded-lg border border-[#7DA0CA]/60 bg-white hover:bg-[#F0F6FC] text-[#052659] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              type="button"
            >
              <span
                className={`material-symbols-outlined text-[17px] text-[#5483B3] ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              >
                refresh
              </span>
              <span className="hidden md:inline">[F1] Atualizar</span>
            </button>

            <Link
              id="btn-dash-nova-os"
              href="/ordens-de-servico"
              className="h-9 px-3.5 rounded-lg bg-[#052659] hover:bg-[#021024] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px] text-[#C1E8FF]">add_circle</span>
              <span>Nova OS [F2]</span>
            </Link>
          </>
        }
      />

      {/* Main Container */}
      <main className="p-6 lg:p-8 space-y-6 max-w-[1720px] w-full mx-auto">
        {/* ========================================================================= */}
        {/* SECTION 1: TOP KPI STRIP (ROLE-AWARE) */}
        {/* ========================================================================= */}
        {isManager ? (
          /* GERENTE: 6-KPI STRIP EXECUTIVA FINANCEIRA */
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* KPI 1: Faturamento Hoje */}
            <div className="bg-white rounded-lg border border-[#7DA0CA]/40 p-4 flex flex-col justify-between shadow-xs hover:border-[#5483B3] transition-all">
              <div>
                <div className="flex items-center justify-between text-[#5483B3] text-[11px] font-bold uppercase tracking-wider">
                  <span>Faturamento Hoje</span>
                  <span className="material-symbols-outlined text-[#052659] text-base">point_of_sale</span>
                </div>
                <div className="mt-2 text-2xl font-mono font-bold text-[#052659] tracking-tight">
                  R$ 6.850,00
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-700">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span>+22% vs ontem</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#F0F6FC]">
                <div className="flex justify-between text-[10px] font-mono text-[#5483B3] mb-1">
                  <span>Meta Mês: 70%</span>
                  <span>R$ 150k</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                  <div className="h-full rounded-full bg-[#052659]" style={{ width: "70%" }}></div>
                </div>
              </div>
            </div>

            {/* KPI 2: Ticket Médio Diário */}
            <div className="bg-white rounded-lg border border-[#7DA0CA]/40 p-4 flex flex-col justify-between shadow-xs hover:border-[#5483B3] transition-all">
              <div>
                <div className="flex items-center justify-between text-[#5483B3] text-[11px] font-bold uppercase tracking-wider">
                  <span>Ticket Médio</span>
                  <span className="material-symbols-outlined text-[#052659] text-base">receipt_long</span>
                </div>
                <div className="mt-2 text-2xl font-mono font-bold text-[#052659] tracking-tight">
                  R$ 685,00
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-700">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span>+8.4% vs meta</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#F0F6FC] text-[10px] text-[#5483B3] flex items-center justify-between">
                <span>10 vendas no período</span>
                <span className="font-mono font-bold text-[#052659]">AR: 80%</span>
              </div>
            </div>

            {/* KPI 3: Saldo a Receber */}
            <div className="bg-white rounded-lg border border-[#7DA0CA]/40 p-4 flex flex-col justify-between shadow-xs hover:border-[#5483B3] transition-all">
              <div>
                <div className="flex items-center justify-between text-[#5483B3] text-[11px] font-bold uppercase tracking-wider">
                  <span>Saldo a Receber</span>
                  <span className="material-symbols-outlined text-[#052659] text-base">account_balance_wallet</span>
                </div>
                <div className="mt-2 text-2xl font-mono font-bold text-[#052659] tracking-tight">
                  R$ 14.820,00
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs font-medium text-amber-700">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>Retiradas pendentes</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#F0F6FC] text-[10px] text-[#5483B3] flex items-center justify-between">
                <span>Cartão 12x: 65%</span>
                <span className="font-mono font-bold text-[#052659]">Pix: 35%</span>
              </div>
            </div>

            {/* KPI 4: Laboratório no Prazo */}
            <div className="bg-white rounded-lg border border-[#7DA0CA]/40 p-4 flex flex-col justify-between shadow-xs hover:border-[#5483B3] transition-all">
              <div>
                <div className="flex items-center justify-between text-[#5483B3] text-[11px] font-bold uppercase tracking-wider">
                  <span>Lab no Prazo</span>
                  <span className="material-symbols-outlined text-[#052659] text-base">precision_manufacturing</span>
                </div>
                <div className="mt-2 text-2xl font-mono font-bold text-[#052659] tracking-tight">
                  94.2%
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-700">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>Meta de SLA atingida</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#F0F6FC] text-[10px] text-[#5483B3] flex items-center justify-between">
                <span>51 OSs em lab externo</span>
                <span className="font-mono font-bold text-amber-700">3 atrasos</span>
              </div>
            </div>

            {/* KPI 5: Ordens em Produção */}
            <div className="bg-white rounded-lg border border-[#7DA0CA]/40 p-4 flex flex-col justify-between shadow-xs hover:border-[#5483B3] transition-all">
              <div>
                <div className="flex items-center justify-between text-[#5483B3] text-[11px] font-bold uppercase tracking-wider">
                  <span>Ordens em Fila</span>
                  <span className="material-symbols-outlined text-[#052659] text-base">assignment</span>
                </div>
                <div className="mt-2 text-2xl font-mono font-bold text-[#052659] tracking-tight">
                  28 OSs
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs font-medium text-[#5483B3]">
                  <span>12 montagem • 16 terceirizadas</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#F0F6FC] text-[10px] text-[#5483B3] flex items-center justify-between">
                <span>Capacidade de montagem</span>
                <span className="font-mono font-bold text-[#052659]">82% ocupada</span>
              </div>
            </div>

            {/* KPI 6: Retiradas Pendentes */}
            <div className="bg-white rounded-lg border border-[#7DA0CA]/40 p-4 flex flex-col justify-between shadow-xs hover:border-[#5483B3] transition-all">
              <div>
                <div className="flex items-center justify-between text-[#5483B3] text-[11px] font-bold uppercase tracking-wider">
                  <span>Prontos p/ Retirada</span>
                  <span className="material-symbols-outlined text-emerald-700 text-base">storefront</span>
                </div>
                <div className="mt-2 text-2xl font-mono font-bold text-emerald-700 tracking-tight">
                  7 óculos
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-700">
                  <span className="material-symbols-outlined text-sm">chat</span>
                  <span>WhatsApp disparado</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#F0F6FC] text-[10px] text-[#5483B3] flex items-center justify-between">
                <span>Saldo gaveta: R$ 4.890</span>
                <Link id="link-dash-kpi-ver-balcao" href="/ordens-de-servico/fila" className="font-bold text-[#052659] hover:underline">
                  Ver balcão
                </Link>
              </div>
            </div>
          </section>
        ) : (
          /* CONSULTOR: 4-KPI STRIP OPERACIONAL DE BALCÃO (CLEAN) */
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Minhas OSs em Aberto */}
            <div className="bg-white rounded-lg border border-[#7DA0CA]/40 p-4 flex flex-col justify-between shadow-xs hover:border-[#5483B3] transition-all">
              <div>
                <div className="flex items-center justify-between text-[#5483B3] text-[11px] font-bold uppercase tracking-wider">
                  <span>Minhas OSs em Aberto</span>
                  <span className="material-symbols-outlined text-[#052659] text-base">assignment</span>
                </div>
                <div className="mt-2 text-3xl font-mono font-bold text-[#052659] tracking-tight">
                  8 <span className="text-sm font-sans font-medium text-[#5483B3]">ordens</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs font-medium text-[#5483B3]">
                  <span>3 em laboratório • 5 em montagem</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#F0F6FC] flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Todas com prazo ativo</span>
                <span className="font-bold text-emerald-600 font-mono">100% no prazo</span>
              </div>
            </div>

            {/* Card 2: Prontas para Retirada */}
            <div className="bg-white rounded-lg border border-emerald-200 bg-emerald-50/20 p-4 flex flex-col justify-between shadow-xs hover:border-emerald-400 transition-all">
              <div>
                <div className="flex items-center justify-between text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                  <span>Prontas para Retirada</span>
                  <span className="material-symbols-outlined text-emerald-700 text-base">shopping_bag</span>
                </div>
                <div className="mt-2 text-3xl font-mono font-bold text-emerald-800 tracking-tight">
                  3 <span className="text-sm font-sans font-medium text-emerald-700">óculos</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-700">
                  <span className="material-symbols-outlined text-sm">chat</span>
                  <span>Clientes notificados via WhatsApp</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-center justify-between text-[11px]">
                <span className="text-emerald-800">Gaveta de Balcão 01</span>
                <Link id="link-dash-kpi-entregar-oculos" href="/ordens-de-servico/fila" className="font-bold text-emerald-800 hover:underline">
                  Entregar óculos →
                </Link>
              </div>
            </div>

            {/* Card 3: Aguardando Validação / Receita */}
            <div className="bg-white rounded-lg border border-amber-200 bg-amber-50/20 p-4 flex flex-col justify-between shadow-xs hover:border-amber-400 transition-all">
              <div>
                <div className="flex items-center justify-between text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                  <span>Aguardando Confirmação</span>
                  <span className="material-symbols-outlined text-amber-700 text-base">hourglass_top</span>
                </div>
                <div className="mt-2 text-3xl font-mono font-bold text-amber-900 tracking-tight">
                  2 <span className="text-sm font-sans font-medium text-amber-700">pendências</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs font-medium text-amber-800">
                  <span>1 pendente DNP • 1 receita médica</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-amber-100 flex items-center justify-between text-[11px]">
                <span className="text-amber-800 font-medium">Requer contato cliente</span>
                <span className="font-bold text-amber-900 font-mono">Ação pendente</span>
              </div>
            </div>

            {/* Card 4: Meus Atendimentos Hoje */}
            <div className="bg-white rounded-lg border border-[#7DA0CA]/40 p-4 flex flex-col justify-between shadow-xs hover:border-[#5483B3] transition-all">
              <div>
                <div className="flex items-center justify-between text-[#5483B3] text-[11px] font-bold uppercase tracking-wider">
                  <span>Meus Atendimentos Hoje</span>
                  <span className="material-symbols-outlined text-[#052659] text-base">person_check</span>
                </div>
                <div className="mt-2 text-3xl font-mono font-bold text-[#052659] tracking-tight">
                  14 <span className="text-sm font-sans font-medium text-[#5483B3]">pacientes</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-700">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span>+4 atendimentos vs ontem</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#F0F6FC] flex items-center justify-between text-[11px]">
                <span className="text-[#5483B3]">Ritmo de vendas ótimo</span>
                <span className="font-bold text-[#052659] font-mono">Turno 70%</span>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: MAIN WORKSPACE (ROLE-AWARE) */}
        {/* ========================================================================= */}
        {isManager ? (
          /* GERENTE: GRÁFICO DE FATURAMENTO + SLA DOS LABORATÓRIOS */
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Billing Chart (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-lg border border-[#7DA0CA]/40 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0F6FC] gap-2">
                <div>
                  <h2 className="text-base font-bold text-[#052659]">Evolução de Faturamento Diário vs. Meta</h2>
                  <p className="text-xs text-[#5483B3]">Comparativo semanal de receita realizada e projeção orçamentária</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#052659]"></span>
                    <span className="text-[#052659]">Realizado (R$)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#5483B3] border-dashed border-t"></span>
                    <span className="text-[#5483B3]">Meta Prevista</span>
                  </div>
                </div>
              </div>

              {/* Chart Area with Recharts */}
              <div className="mt-4 pt-2">
                <div className="h-64 w-full">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={chartData}
                        margin={{ top: 15, right: 10, left: -15, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#7DA0CA" opacity={0.25} vertical={false} />
                        <XAxis
                          dataKey="dia"
                          tick={{ fill: "#052659", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-jetbrains-mono)" }}
                          axisLine={{ stroke: "#7DA0CA", opacity: 0.4 }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#5483B3", fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }}
                          tickFormatter={(value) => `${value / 1000}k`}
                          domain={[0, 10000]}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="realizado"
                          name="Realizado (R$)"
                          radius={[4, 4, 0, 0]}
                          barSize={32}
                        >
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.dia === "DOM" ? "#7DA0CA" : entry.highlight ? "#5483B3" : "#052659"}
                              className="transition-all hover:opacity-85"
                            />
                          ))}
                        </Bar>
                        <Line
                          type="monotone"
                          dataKey="meta"
                          name="Meta Prevista (R$)"
                          stroke="#5483B3"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          dot={{ r: 3.5, fill: "#FFFFFF", stroke: "#5483B3", strokeWidth: 2 }}
                          activeDot={{ r: 5, fill: "#FFFFFF", stroke: "#052659", strokeWidth: 2 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-[#5483B3]">
                      <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                      Carregando métricas...
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-[#F0F6FC] rounded-lg border border-[#7DA0CA]/40 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#5483B3] text-lg">insights</span>
                    <span className="font-bold text-[#052659]">Projeção de fechamento:</span>
                    <span className="text-[#5483B3]">Previsão de bater 108% da meta semanal (Meta: R$ 42.000).</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 whitespace-nowrap">+R$ 3.420 acumulado</span>
                </div>
              </div>
            </div>

            {/* Right Column: SLA & Performance dos Laboratórios (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-lg border border-[#7DA0CA]/40 p-5 shadow-xs flex flex-col h-full">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0F6FC]">
                <div>
                  <h2 className="text-base font-bold text-[#052659]">SLA dos Laboratórios Externos</h2>
                  <p className="text-xs text-[#5483B3]">Controle de pontualidade e surfaçagem terceirizada</p>
                </div>
                <Link
                  id="link-dash-sla-ver-fila"
                  href="/ordens-de-servico/fila"
                  className="text-[#5483B3] hover:text-[#052659] text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <span>Ver Fila</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>

              <div className="mt-3 flex-1 overflow-x-auto border border-[#7DA0CA]/40 rounded-lg">
                <table id="table-dash-sla-laboratorios" className="w-full h-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="h-9 bg-[#F0F6FC] text-[11px] font-bold tracking-wider text-[#052659] border-b border-[#7DA0CA]/40 uppercase">
                      <th className="px-3">Laboratório</th>
                      <th className="px-2 text-center">Ativos</th>
                      <th className="px-2 text-center">SLA Médio</th>
                      <th className="px-2 text-center">Pontualidade</th>
                      <th className="px-3 text-right">Cobrar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F6FC]">
                    {labs.map((lab) => (
                      <tr key={lab.nome} className="h-14 hover:bg-[#C1E8FF]/20 transition-colors">
                        <td className="px-3 font-semibold text-[#052659]">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                lab.status === "atraso" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                              }`}
                            ></span>
                            <div>
                              <div className="truncate max-w-[130px]">{lab.nome}</div>
                              {lab.status === "atraso" && (
                                <div className="text-[10px] text-amber-600 font-medium mt-0.5">Acima do SLA contratado</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 text-center font-mono font-bold text-[#052659]">{lab.pedidos}</td>
                        <td
                          className={`px-2 text-center font-mono font-medium ${
                            lab.status === "atraso" ? "text-amber-700 font-bold" : "text-[#5483B3]"
                          }`}
                        >
                          {lab.sla}
                        </td>
                        <td className="px-2 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                              lab.status === "atraso"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {lab.pontualidade}
                          </span>
                        </td>
                        <td className="px-3 text-right">
                          <a
                            href={`https://wa.me/55${lab.contato}?text=Ol%C3%A1%2C%20gostaria%20de%20verificar%20o%20status%20das%20nossas%20OSs%20em%20surfa%C3%A7agem%20hoje.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-[#F0F6FC] text-[#5483B3] hover:text-emerald-600 transition-colors inline-block"
                            title="Cobrar status via WhatsApp"
                          >
                            <span className="material-symbols-outlined text-base">chat</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-[#5483B3]">
                <span>Última sincronização EDI: há 8 min</span>
                <span className="font-mono font-bold text-[#052659]">51 OSs em processo externo</span>
              </div>
            </div>
          </section>
        ) : (
          /* CONSULTOR: "MINHAS ORDENS DO DIA" + "AGING DE LABORATÓRIO DOS MEUS PEDIDOS" */
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Minhas Ordens de Serviço do Dia (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-lg border border-[#7DA0CA]/40 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0F6FC] gap-2">
                  <div>
                    <h2 className="text-base font-bold text-[#052659] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#5483B3]">assignment_ind</span>
                      <span>Minhas Ordens de Serviço do Dia</span>
                    </h2>
                    <p className="text-xs text-[#5483B3]">Atendimentos sob responsabilidade de {operator.name}</p>
                  </div>
                  <Link
                    id="btn-dash-consultor-nova-os"
                    href="/ordens-de-servico"
                    className="h-8 px-3 rounded-md bg-[#052659] hover:bg-[#021024] text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>Nova Venda</span>
                  </Link>
                </div>

                {/* Table of Consultant Orders */}
                <div className="mt-3 overflow-x-auto border border-[#7DA0CA]/40 rounded-lg">
                  <table id="table-dash-consultor-minhas-ordens" className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="h-9 bg-[#F0F6FC] text-[11px] font-bold tracking-wider text-[#052659] border-b border-[#7DA0CA]/40 uppercase">
                        <th className="px-3">OS / Cliente</th>
                        <th className="px-3 hidden md:table-cell">Armação &amp; Lente</th>
                        <th className="px-2 text-center">Status</th>
                        <th className="px-3 text-right">Ação Balcão</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F6FC]">
                      {consultantOrders.map((ord) => (
                        <tr key={ord.id} className="h-13 hover:bg-[#F0F6FC]/80 transition-colors">
                          <td className="px-3 py-2 font-medium">
                            <div className="font-bold text-[#052659]">{ord.cliente}</div>
                            <div className="font-mono text-[11px] text-[#5483B3] flex items-center gap-1">
                              <span>{ord.os}</span>
                              <span className="text-slate-300">•</span>
                              <span>Prazo: {ord.prazo}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 hidden md:table-cell">
                            <div className="truncate max-w-[220px] font-semibold text-[#052659]">{ord.armacao}</div>
                            <div className="truncate max-w-[220px] text-[11px] text-slate-500">{ord.lente}</div>
                          </td>
                          <td className="px-2 py-2 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${ord.badgeColor}`}
                            >
                              {ord.statusLabel}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            {ord.status === "pronto" ? (
                              <Link
                                id={`btn-dash-notificar-os-${ord.id}`}
                                href={`/ordens-de-servico/notificar-whatsapp?id=${ord.id}`}
                                className="h-7 px-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 transition-colors shadow-2xs"
                                title="Notificar retirada via WhatsApp"
                              >
                                <span className="material-symbols-outlined text-[15px]">chat</span>
                                <span>Notificar</span>
                              </Link>
                            ) : ord.status === "receita" ? (
                              <Link
                                id={`btn-dash-validar-dnp-${ord.id}`}
                                href="/ordens-de-servico"
                                className="h-7 px-2.5 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs inline-flex items-center gap-1 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[15px]">edit_document</span>
                                <span>Validar DNP</span>
                              </Link>
                            ) : (
                              <Link
                                id={`btn-dash-ver-os-${ord.id}`}
                                href="/ordens-de-servico/fila"
                                className="h-7 px-2.5 rounded border border-[#7DA0CA]/60 hover:bg-[#F0F6FC] text-[#052659] font-bold text-xs inline-flex items-center gap-1 transition-colors"
                              >
                                <span>Ver OS</span>
                                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#F0F6FC] flex items-center justify-between text-xs text-[#5483B3]">
                <span>5 ordens listadas • 3 prontas para entrega</span>
                <Link id="link-dash-consultor-ver-fila-completa" href="/ordens-de-servico/fila" className="font-bold text-[#052659] hover:underline flex items-center gap-1">
                  <span>Abrir Fila de Ordens Completa</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Aging de Laboratório dos Meus Pedidos (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-lg border border-[#7DA0CA]/40 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F0F6FC]">
                  <div>
                    <h2 className="text-base font-bold text-[#052659] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#5483B3]">precision_manufacturing</span>
                      <span>Aging de Laboratório dos Meus Pedidos</span>
                    </h2>
                    <p className="text-xs text-[#5483B3]">Acompanhamento de lentes externas em produção</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C1E8FF] text-[#052659]">
                    3 ATIVOS
                  </span>
                </div>

                {/* Progress bar and summary */}
                <div className="mt-3 p-3 rounded-lg bg-[#F0F6FC] border border-[#7DA0CA]/30">
                  <div className="flex justify-between text-xs font-semibold text-[#052659] mb-1">
                    <span>Pontualidade das minhas lentes:</span>
                    <span className="font-mono text-emerald-700 font-bold">100% no prazo</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: "95%" }}></div>
                  </div>
                </div>

                {/* Individual Lab Orders List */}
                <div className="mt-3 space-y-2.5">
                  {consultantLabAlerts.map((alert) => (
                    <div
                      key={alert.os}
                      className="p-3 rounded-lg border border-[#7DA0CA]/30 bg-white hover:bg-[#F0F6FC]/60 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#052659]">{alert.os}</span>
                          <span className="text-[11px] font-medium text-slate-700">• {alert.cliente}</span>
                        </div>
                        <div className="text-[11px] text-[#5483B3] mt-0.5">
                          {alert.lab} — <span className="font-medium text-slate-600">{alert.servico}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Previsão: {alert.previsao}</div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${
                            alert.statusType === "warning"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : alert.statusType === "info"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {alert.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-2.5 bg-blue-50/60 rounded-lg border border-blue-200 text-xs flex items-center justify-between text-blue-900">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-700 text-base">support_agent</span>
                  <span>Dúvida sobre prazo de laboratório?</span>
                </div>
                <Link
                  id="link-dash-consultor-cobrar-lab"
                  href="/ordens-de-servico/fila"
                  className="font-bold text-blue-800 hover:underline text-[11px]"
                >
                  Cobrar Lab →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: BOTTOM GRID (ROLE-AWARE) */}
        {/* ========================================================================= */}
        {isManager ? (
          /* GERENTE: ACOMPANHAMENTO PRIORITÁRIO + METAS DA EQUIPE */
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Acompanhamento Prioritário de Balcão (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-lg border border-[#7DA0CA]/40 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0F6FC] gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#052659]">notifications_active</span>
                  <h2 className="text-base font-bold text-[#052659]">Acompanhamento Prioritário de Balcão</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                    1 Atraso Crítico
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    1 Pronto Entrega
                  </span>
                </div>
              </div>

              {/* Compact Clinical Worklist Table */}
              <div className="mt-3 overflow-x-auto border border-[#7DA0CA]/40 rounded-lg">
                <table id="table-dash-acompanhamento-prioritario" className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="h-9 bg-[#F0F6FC] text-[11px] font-bold tracking-wider text-[#052659] border-b border-[#7DA0CA]/40 uppercase">
                      <th className="px-3">OS</th>
                      <th className="px-3">Cliente / Paciente</th>
                      <th className="px-3">Prescrição / Lente</th>
                      <th className="px-2 text-center">Etapa Atual</th>
                      <th className="px-2 text-center">Prazo</th>
                      <th className="px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F6FC]">
                    {priorityOrders.map((order) => (
                      <tr key={order.id} className="h-12 hover:bg-[#F0F6FC] transition-colors">
                        <td className="px-3 font-mono font-bold text-[#052659]">#{order.id}</td>
                        <td className="px-3 font-medium text-[#052659]">
                          <div className="flex items-center gap-1.5">
                            <span>{order.cliente}</span>
                            {order.prioridade === "VIP" && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                VIP
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 text-[#5483B3] truncate max-w-[180px]">{order.tipo}</td>
                        <td className="px-2 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                              order.etapaType === "success"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : order.etapaType === "warning"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {order.etapa}
                          </span>
                        </td>
                        <td className="px-2 text-center">
                          <span
                            className={`font-mono font-semibold text-[11px] ${
                              order.atrasoType === "danger"
                                ? "text-red-600 font-bold"
                                : order.atrasoType === "warning"
                                ? "text-amber-600 font-bold"
                                : "text-emerald-700"
                            }`}
                          >
                            {order.atraso}
                          </span>
                        </td>
                        <td className="px-3 text-right">
                          {order.etapa === "Pronto Retirada" ? (
                            <Link
                              id={`btn-dash-prioritaria-avisar-${order.id}`}
                              href={`/ordens-de-servico/notificar-whatsapp?id=${order.id}`}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">chat</span>
                              <span>Avisar</span>
                            </Link>
                          ) : (
                            <Link
                              id={`btn-dash-prioritaria-ver-${order.id}`}
                              href={`/ordens-de-servico/fila?destaque=${order.id}`}
                              className="px-2.5 py-1 rounded border border-[#7DA0CA]/60 hover:bg-[#F0F6FC] text-[#052659] font-bold text-xs inline-flex items-center gap-1 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              <span>Ver</span>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Link to Full Orders List */}
              <div className="mt-3 pt-2 border-t border-[#F0F6FC] flex items-center justify-between text-xs">
                <span className="text-[#5483B3]">12 ordens de serviço pendentes no total</span>
                <Link
                  id="link-dash-prioritario-abrir-balcao"
                  href="/ordens-de-servico/fila"
                  className="font-bold text-[#052659] hover:underline flex items-center gap-1"
                >
                  <span>Abrir Balcão Completo</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Ranking de Vendas da Equipe de Balcão (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-lg border border-[#7DA0CA]/40 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F6FC]">
                <div>
                  <h2 className="text-base font-bold text-[#052659]">Metas da Equipe de Balcão</h2>
                  <p className="text-xs text-[#5483B3]">Desempenho individual e índice de conversão AR</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C1E8FF] text-[#052659]">
                  OUTUBRO
                </span>
              </div>

              {/* Seller List */}
              <div className="mt-4 space-y-3.5">
                {sellers.map((s, index) => (
                  <div
                    key={s.nome}
                    className="p-3 rounded-lg border border-[#7DA0CA]/30 bg-[#F0F6FC]/60 hover:bg-[#F0F6FC] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            index === 0
                              ? "bg-amber-400 text-amber-950 shadow-xs"
                              : index === 1
                              ? "bg-slate-300 text-slate-800"
                              : "bg-[#7DA0CA] text-white"
                          }`}
                        >
                          {index + 1}º
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#052659]">{s.nome}</div>
                          <div className="text-[10px] text-[#5483B3]">{s.cargo}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-xs text-[#052659]">{s.vendas}</div>
                        <div
                          className={`text-[10px] font-bold ${
                            s.metaPercent >= 100 ? "text-emerald-700" : "text-[#5483B3]"
                          }`}
                        >
                          {s.metaPercent}% da meta
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            s.metaPercent >= 100 ? "bg-emerald-500" : "bg-[#5483B3]"
                          }`}
                          style={{ width: `${Math.min(s.metaPercent, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-[#5483B3] mt-1.5">
                        <span>{s.oss} OSs concluídas</span>
                        <span>Conv. AR: {s.arTaxa}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Restock Alert Box */}
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-700 text-base">emergency</span>
                  <span className="text-amber-900 font-medium">8 itens aguardando reposição</span>
                </div>
                <Link
                  href="/kardex/sugestoes-compra"
                  className="font-bold text-amber-800 hover:underline flex items-center gap-0.5 text-xs"
                >
                  <span>Pedir</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </section>
        ) : (
          /* CONSULTOR: ACOMPANHAMENTO PRIORITÁRIO + SLA DOS LABORATÓRIOS (ESSENCIAL P/ ATENDIMENTO) */
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Acompanhamento Prioritário de Balcão (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-lg border border-[#7DA0CA]/40 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0F6FC] gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#052659]">notifications_active</span>
                  <h2 className="text-base font-bold text-[#052659]">Acompanhamento Prioritário de Balcão</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                    1 Atraso Crítico
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    1 Pronto Entrega
                  </span>
                </div>
              </div>

              {/* Compact Clinical Worklist Table */}
              <div className="mt-3 overflow-x-auto border border-[#7DA0CA]/40 rounded-lg">
                <table id="table-dash-consultor-prioritarias" className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="h-9 bg-[#F0F6FC] text-[11px] font-bold tracking-wider text-[#052659] border-b border-[#7DA0CA]/40 uppercase">
                      <th className="px-3">OS</th>
                      <th className="px-3">Cliente / Paciente</th>
                      <th className="px-3">Prescrição / Lente</th>
                      <th className="px-2 text-center">Etapa Atual</th>
                      <th className="px-2 text-center">Prazo</th>
                      <th className="px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F6FC]">
                    {priorityOrders.map((order) => (
                      <tr key={order.id} className="h-12 hover:bg-[#F0F6FC] transition-colors">
                        <td className="px-3 font-mono font-bold text-[#052659]">#{order.id}</td>
                        <td className="px-3 font-medium text-[#052659]">
                          <div className="flex items-center gap-1.5">
                            <span>{order.cliente}</span>
                            {order.prioridade === "VIP" && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                VIP
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 text-[#5483B3] truncate max-w-[180px]">{order.tipo}</td>
                        <td className="px-2 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                              order.etapaType === "success"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : order.etapaType === "warning"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {order.etapa}
                          </span>
                        </td>
                        <td className="px-2 text-center">
                          <span
                            className={`font-mono font-semibold text-[11px] ${
                              order.atrasoType === "danger"
                                ? "text-red-600 font-bold"
                                : order.atrasoType === "warning"
                                ? "text-amber-600 font-bold"
                                : "text-emerald-700"
                            }`}
                          >
                            {order.atraso}
                          </span>
                        </td>
                        <td className="px-3 text-right">
                          {order.etapa === "Pronto Retirada" ? (
                            <Link
                              id={`btn-dash-consultor-prioritaria-avisar-${order.id}`}
                              href={`/ordens-de-servico/notificar-whatsapp?id=${order.id}`}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">chat</span>
                              <span>Avisar</span>
                            </Link>
                          ) : (
                            <Link
                              id={`btn-dash-consultor-prioritaria-ver-${order.id}`}
                              href={`/ordens-de-servico/fila?destaque=${order.id}`}
                              className="px-2.5 py-1 rounded border border-[#7DA0CA]/60 hover:bg-[#F0F6FC] text-[#052659] font-bold text-xs inline-flex items-center gap-1 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              <span>Ver</span>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 pt-2 border-t border-[#F0F6FC] flex items-center justify-between text-xs">
                <span className="text-[#5483B3]">Prioridade máxima para pacientes aguardando</span>
                <Link
                  id="link-dash-consultor-abrir-fila-bottom"
                  href="/ordens-de-servico/fila"
                  className="font-bold text-[#052659] hover:underline flex items-center gap-1"
                >
                  <span>Abrir Fila Completa</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Right Column: SLA dos Laboratórios Externos (5 cols - Essencial para o Consultor passar prazos) */}
            <div className="lg:col-span-5 bg-white rounded-lg border border-[#7DA0CA]/40 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F0F6FC]">
                  <div>
                    <h2 className="text-base font-bold text-[#052659]">Prazos &amp; SLA dos Laboratórios</h2>
                    <p className="text-xs text-[#5483B3]">Consulta rápida para promessa de entrega ao cliente</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C1E8FF] text-[#052659]">
                    PRODUÇÃO
                  </span>
                </div>

                <div className="mt-3 overflow-x-auto border border-[#7DA0CA]/40 rounded-lg">
                  <table id="table-dash-consultor-sla-labs" className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="h-9 bg-[#F0F6FC] text-[11px] font-bold tracking-wider text-[#052659] border-b border-[#7DA0CA]/40 uppercase">
                        <th className="px-3">Laboratório</th>
                        <th className="px-2 text-center">Prazo Médio</th>
                        <th className="px-2 text-center">Pontualidade</th>
                        <th className="px-3 text-right">Contato</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F6FC]">
                      {labs.map((lab) => (
                        <tr key={lab.nome} className="h-12 hover:bg-[#F0F6FC] transition-colors">
                          <td className="px-3 font-semibold text-[#052659]">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  lab.status === "atraso" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                                }`}
                              ></span>
                              <div className="truncate max-w-[130px]">{lab.nome}</div>
                            </div>
                          </td>
                          <td className="px-2 text-center font-mono font-bold text-[#052659]">
                            {lab.sla}
                          </td>
                          <td className="px-2 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                lab.status === "atraso"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {lab.pontualidade}
                            </span>
                          </td>
                          <td className="px-3 text-right">
                            <a
                              href={`https://wa.me/55${lab.contato}?text=Ol%C3%A1%2C%20gostaria%20de%20consultar%20o%20prazo%20de%20uma%20OS.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded hover:bg-[#F0F6FC] text-[#5483B3] hover:text-emerald-600 transition-colors inline-block"
                              title="Contato via WhatsApp"
                            >
                              <span className="material-symbols-outlined text-base">chat</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 p-3 bg-[#F0F6FC] rounded-lg border border-[#7DA0CA]/40 flex items-center justify-between text-xs text-[#5483B3]">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#052659]">info</span>
                  <span>Oriente o cliente sempre com +1 dia útil de margem de montagem.</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

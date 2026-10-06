"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useOperator } from "@/hooks/useOperator";

const emptySubscribe = () => () => {};
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
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
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [consultantSearch, setConsultantSearch] = useState("");
  const [consultantFilterStatus, setConsultantFilterStatus] = useState("todas");
  const { operator, isManager, isConsultant } = useOperator();

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
      gaveta: "Gaveta G-01",
      laboratorio: "Laboratório Próprio",
      valor: "R$ 1.890,00",
      status: "pronto",
      statusLabel: "Pronto Retirada",
      prazo: "Hoje",
    },
    {
      id: "10291",
      os: "OS #10291",
      cliente: "Mariana Silva Lima",
      telefone: "11977776666",
      armacao: "Vogue VO5352 Dourado 52-17",
      lente: "Visão Simples Crizal Rock",
      gaveta: "Bancada Lab",
      laboratorio: "Hoya Lab Brasil",
      valor: "R$ 950,00",
      status: "montagem",
      statusLabel: "Laboratório Hoya",
      prazo: "Hoje às 17h",
    },
    {
      id: "10288",
      os: "OS #10288",
      cliente: "Roberto Campos Neto",
      telefone: "11966665555",
      armacao: "Oakley OX8156 Satin Black",
      lente: "Transitions Gen 8 Cinza",
      gaveta: "Gaveta G-02",
      laboratorio: "Zeiss Lab SP",
      valor: "R$ 1.420,00",
      status: "surfacagem",
      statusLabel: "Surfaçagem Zeiss",
      prazo: "Amanhã 11h",
    },
    {
      id: "10285",
      os: "OS #10285",
      cliente: "Beatriz Albuquerque",
      telefone: "11955554444",
      armacao: "Carrera CA8840 Aviador Grafite",
      lente: "Policarbonato Antirreflexo",
      gaveta: "Gaveta G-03",
      laboratorio: "Aguardando DNP",
      valor: "R$ 780,00",
      status: "receita",
      statusLabel: "Aguardando DNP",
      prazo: "Pendente",
    },
    {
      id: "10282",
      os: "OS #10282",
      cliente: "Carlos Eduardo Mendes",
      telefone: "11933332222",
      armacao: "Prada Linea Rossa 02WS",
      lente: "Solar Polarizado Cinza",
      gaveta: "Gaveta G-01",
      laboratorio: "Laboratório Próprio",
      valor: "R$ 2.150,00",
      status: "pronto",
      statusLabel: "Pronto Retirada",
      prazo: "Hoje",
    },
    {
      id: "10280",
      os: "OS #10280",
      cliente: "Fernando Dias",
      telefone: "11944443333",
      armacao: "Ray-Ban Justin RB4165 Preto",
      lente: "Solar Polarizado G-15",
      gaveta: "Entregue",
      laboratorio: "Concluído",
      valor: "R$ 650,00",
      status: "entregue",
      statusLabel: "Entregue ao Paciente",
      prazo: "Concluído",
    },
  ];

  const filteredConsultantOrders = consultantOrders.filter((ord) => {
    if (consultantFilterStatus === "pronto" && ord.status !== "pronto") return false;
    if (consultantFilterStatus === "lab" && ord.status !== "montagem" && ord.status !== "surfacagem") return false;
    if (consultantFilterStatus === "pendente" && ord.status !== "receita") return false;
    if (consultantSearch.trim()) {
      const q = consultantSearch.toLowerCase();
      return (
        ord.os.toLowerCase().includes(q) ||
        ord.cliente.toLowerCase().includes(q) ||
        ord.armacao.toLowerCase().includes(q) ||
        ord.lente.toLowerCase().includes(q) ||
        ord.gaveta.toLowerCase().includes(q)
      );
    }
    return true;
  });

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
    <div className="flex-1 flex flex-col min-w-0 bg-[#F0F6FC] min-h-screen pb-20 text-[#021024]">
      {/* Top Persistent Componentized Header */}
      <PageHeader
        id="header-dash-executivo"
        icon={isManager ? "domain" : "badge"}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: isManager ? "Painel Executivo" : "Painel de Atendimento" },
        ]}
        title={isManager ? "Painel Executivo" : "Painel de Atendimento"}
        badge={
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#052659] text-white border border-[#052659] inline-flex items-center gap-1 shadow-2xs">
              <span className="material-symbols-outlined text-[13px] text-[#C1E8FF]">storefront</span>
              <span>{operator.branch.split(" - ")[0].toUpperCase()}</span>
            </span>
            {isConsultant && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>TURNO ATIVO</span>
              </span>
            )}
          </div>
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
              className="h-9 px-3.5 rounded-xl bg-[#5483B3] hover:bg-[#052659] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 ring-2 ring-[#5483B3]/25"
              type="button"
            >
              <span
                className={`material-symbols-outlined text-[17px] text-white ${
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
              className="h-9 px-4 rounded-xl bg-[#052659] hover:bg-[#021024] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 ring-2 ring-[#052659]/20 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px] text-[#C1E8FF]">add_circle</span>
              <span>Nova OS [F2]</span>
            </Link>
          </>
        }
      />

      {/* Main Container - Proporções e Largura Alinhadas com Kardex & Estoque */}
      <main className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ========================================================================= */}
        {/* SECTION 1: TOP KPI STRIP (ROLE-AWARE) */}
        {/* ========================================================================= */}
        {isManager ? (
          /* GERENTE: 6-KPI STRIP EXECUTIVA FINANCEIRA UNIFICADA */
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KpiCard
              id="card-dash-faturamento-hoje"
              title="Faturamento Hoje"
              value="R$ 6.850,00"
              icon="point_of_sale"
              trend={{ text: "+22% vs ontem", isPositive: true, icon: "trending_up" }}
              progressPercent={70}
              footerLeft="Meta Mês: 70%"
              footerRight={<span className="font-mono font-bold text-[#052659]">R$ 150k</span>}
            />
            <KpiCard
              id="card-dash-ticket-medio"
              title="Ticket Médio"
              value="R$ 685,00"
              icon="receipt_long"
              trend={{ text: "+8.4% vs meta", isPositive: true, icon: "trending_up" }}
              footerLeft="10 vendas no período"
              footerRight={<span className="font-mono font-bold text-[#052659]">AR: 80%</span>}
            />
            <KpiCard
              id="card-dash-saldo-receber"
              title="Saldo a Receber"
              value="R$ 14.820,00"
              icon="account_balance_wallet"
              iconVariant="warning"
              trend={{ text: "Retiradas pendentes", isNeutral: true, icon: "schedule" }}
              footerLeft="Cartão 12x: 65%"
              footerRight={<span className="font-mono font-bold text-[#052659]">Pix: 35%</span>}
            />
            <KpiCard
              id="card-dash-lab-prazo"
              title="Lab no Prazo"
              value="94.2%"
              icon="precision_manufacturing"
              iconVariant="success"
              trend={{ text: "Meta de SLA atingida", isPositive: true, icon: "verified" }}
              footerLeft="51 OSs em lab externo"
              footerRight={<span className="font-mono font-bold text-amber-700">3 atrasos</span>}
            />
            <KpiCard
              id="card-dash-ordens-fila"
              title="Ordens em Fila"
              value="28"
              unit="OSs"
              icon="assignment"
              trend={{ text: "12 montagem • 16 terceirizadas", isNeutral: true }}
              footerLeft="Capacidade montagem"
              footerRight={<span className="font-mono font-bold text-[#052659]">82% ocupada</span>}
            />
            <KpiCard
              id="card-dash-prontos-retirada"
              title="Prontos p/ Retirada"
              value="7"
              unit="óculos"
              icon="storefront"
              trend={{ text: "WhatsApp disparado", isPositive: true }}
              footerLeft="Saldo gaveta: R$ 4.890"
              footerHref="/ordens-de-servico/fila"
              footerActionLabel="Ver balcão"
            />
          </section>
        ) : (
          /* CONSULTOR: 4-KPI STRIP OPERACIONAL DE BALCÃO UNIFICADA */
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              id="card-dash-minhas-oss"
              title="Minhas OSs em Aberto"
              value="8"
              unit="ordens"
              icon="assignment"
              trend={{ text: "+2 vs semana anterior", isPositive: true, icon: "trending_up" }}
              footerLeft="Todas com prazo ativo"
              footerHref="/ordens-de-servico/fila"
              footerActionLabel="Ver fila OS"
            />
            <KpiCard
              id="card-dash-prontas-retirada"
              title="Prontas para Retirada"
              value="3"
              unit="óculos"
              icon="shopping_bag"
              iconVariant="success"
              trend={{ text: "WhatsApp disparado", isPositive: true }}
              footerLeft="Gaveta de Balcão 01"
              footerHref="/ordens-de-servico/fila"
              footerActionLabel="Entregar óculos"
            />
            <KpiCard
              id="card-dash-aguardando-confirmacao"
              title="Aguardando Confirmação"
              value="2"
              unit="pendências"
              icon="hourglass_top"
              iconVariant="warning"
              trend={{ text: "1 pendente DNP • 1 receita", isNeutral: true, icon: "warning" }}
              footerLeft="Requer contato cliente"
              footerHref="/ordens-de-servico/fila"
              footerActionLabel="Ver pendências"
            />
            <KpiCard
              id="card-dash-atendimentos-hoje"
              title="Meus Atendimentos Hoje"
              value="14"
              unit="pacientes"
              icon="person_check"
              trend={{ text: "+4 atendimentos vs ontem", isPositive: true, icon: "trending_up" }}
              footerLeft="Ritmo de vendas ótimo"
              footerHref="/ordens-de-servico"
              footerActionLabel="Nova venda [F2]"
            />
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: MAIN WORKSPACE (ROLE-AWARE) */}
        {/* ========================================================================= */}
        {isManager ? (
          /* GERENTE: GRÁFICO DE FATURAMENTO + SLA DOS LABORATÓRIOS */
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Billing Chart (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-[#C1E8FF]/60 p-5 shadow-sm">
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

                <div className="mt-4 p-3 bg-[#F0F6FC] rounded-xl border border-[#C1E8FF]/60 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
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
            <div className="lg:col-span-5 bg-white rounded-xl border border-[#C1E8FF]/60 p-5 shadow-sm flex flex-col h-full">
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

              <div className="mt-3 flex-1 overflow-x-auto border border-[#C1E8FF]/60 rounded-xl overflow-hidden shadow-2xs">
                <table id="table-dash-sla-laboratorios" className="w-full h-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="h-9 bg-[#F0F6FC] sticky top-0 z-10 text-[11px] font-bold tracking-wider text-[#052659] border-b border-[#C1E8FF]/80 uppercase">
                      <th className="px-3">Laboratório</th>
                      <th className="px-2 text-center">Ativos</th>
                      <th className="px-2 text-center">SLA Médio</th>
                      <th className="px-2 text-center">Pontualidade</th>
                      <th className="px-3 text-right">Cobrar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F6FC]">
                    {labs.map((lab) => (
                      <tr key={lab.nome} className="h-14 hover:bg-[#C1E8FF]/15 transition-colors duration-150 cursor-default">
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
          /* CONSULTOR: FLUXO DE BALCÃO INTEGRADO (100% LARGURA OPERACIONAL EQUALIZADA COM KARDEX) */
          <>
            {/* SECTION 2: WORKLIST OPERACIONAL DE BALCÃO (12 COLS - FULL WIDTH PADRÃO KARDEX) */}
            <section className="bg-white rounded-2xl border border-[#C1E8FF] shadow-xs flex flex-col overflow-hidden">
              {/* Barra de Filtros & Ações Rápidas */}
              <div className="p-4 sm:p-5 border-b border-[#F0F6FC] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#052659] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-[#052659]">Minhas Ordens de Serviço do Balcão</h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F0F6FC] text-[#052659] border border-[#C1E8FF]">
                        {filteredConsultantOrders.length} ordens ativas
                      </span>
                    </div>
                    <p className="text-xs text-[#5483B3] mt-0.5">Atendimentos sob responsabilidade direta de {operator.name}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Busca Rápida */}
                  <div className="relative min-w-[240px] sm:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[17px] text-[#5483B3]">
                      search
                    </span>
                    <input
                      id="input-dash-consultor-busca"
                      type="text"
                      value={consultantSearch}
                      onChange={(e) => setConsultantSearch(e.target.value)}
                      placeholder="Buscar por paciente, OS ou armação..."
                      className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-[#7DA0CA]/60 bg-white text-[#021024] placeholder:text-slate-400 focus:outline-none focus:border-[#052659] focus:ring-1 focus:ring-[#052659] transition-all"
                    />
                  </div>

                  {/* Filtro de Status */}
                  <div className="flex items-center gap-2">
                    <select
                      id="select-dash-consultor-filtro-status"
                      value={consultantFilterStatus}
                      onChange={(e) => setConsultantFilterStatus(e.target.value)}
                      className="h-9 px-3 text-xs font-semibold rounded-xl border border-[#7DA0CA]/60 bg-white text-[#052659] focus:outline-none focus:border-[#052659] transition-all cursor-pointer"
                    >
                      <option value="todas">Todos os Status</option>
                      <option value="pronto">Prontas p/ Retirada</option>
                      <option value="lab">Em Produção / Lab</option>
                      <option value="pendente">Aguardando DNP / Receita</option>
                    </select>

                    <Link
                      id="btn-dash-consultor-nova-os"
                      href="/ordens-de-servico"
                      className="h-9 px-3.5 rounded-xl bg-[#052659] hover:bg-[#021024] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all ring-2 ring-[#052659]/20 whitespace-nowrap cursor-pointer shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#C1E8FF]">add_circle</span>
                      <span>Nova OS [F2]</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Tabela de Ordens do Consultor em Largura Total */}
              <div className="overflow-x-auto">
                <table id="table-dash-consultor-minhas-ordens" className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#F0F6FC] sticky top-0 z-10 border-b border-[#C1E8FF] text-[11px] font-bold text-[#052659] uppercase tracking-wider shadow-2xs">
                      <th className="px-4 py-3.5 whitespace-nowrap">OS</th>
                      <th className="px-4 py-3.5">Paciente &amp; Contato</th>
                      <th className="px-4 py-3.5">Armação &amp; Lente Prescrita</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Local / Gaveta</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Laboratório &amp; Prazo</th>
                      <th className="px-4 py-3.5 text-right whitespace-nowrap">Valor Total</th>
                      <th className="px-4 py-3.5 text-center whitespace-nowrap">Status Clínico</th>
                      <th className="px-4 py-3.5 text-right whitespace-nowrap">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[#021024]">
                    {filteredConsultantOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-xs text-slate-500">
                          Nenhuma ordem encontrada para os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      filteredConsultantOrders.map((ord) => (
                        <tr
                          key={ord.id}
                          className="hover:bg-[#C1E8FF]/15 transition-colors duration-150 cursor-default"
                        >
                          {/* Coluna 1: OS Action Chip */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <Link
                              id={`link-dash-consultant-os-${ord.id}`}
                              href={`/ordens-de-servico/detalhes?id=${ord.id}`}
                              className="px-2.5 py-1 rounded-lg font-mono font-bold text-xs bg-[#F0F6FC] hover:bg-[#052659] text-[#052659] hover:text-white border border-[#C1E8FF] hover:border-[#052659] shadow-2xs hover:shadow-xs transition-all inline-flex items-center gap-1 group cursor-pointer"
                              title="Ver Ficha Técnica"
                            >
                              <span className="material-symbols-outlined text-[13px] text-[#5483B3] group-hover:text-white transition-colors">
                                tag
                              </span>
                              <span>{ord.os}</span>
                            </Link>
                          </td>

                          {/* Coluna 2: Paciente & Contato */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="font-bold text-sm text-[#052659]">{ord.cliente}</div>
                            <div className="font-mono text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-[#5483B3]">call</span>
                              <span>{ord.telefone}</span>
                            </div>
                          </td>

                          {/* Coluna 3: Armação & Lente */}
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-sm text-slate-800 truncate max-w-[280px]">
                              {ord.armacao}
                            </div>
                            <div className="text-xs text-slate-500 truncate max-w-[280px] mt-0.5">
                              {ord.lente}
                            </div>
                          </td>

                          {/* Coluna 4: Local / Gaveta */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#F0F6FC] text-[#052659] border border-[#C1E8FF] shadow-2xs">
                              <span className="material-symbols-outlined text-[14px] text-[#5483B3]">shelves</span>
                              <span>{ord.gaveta}</span>
                            </span>
                          </td>

                          {/* Coluna 5: Laboratório & Prazo */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="font-medium text-xs text-slate-700">{ord.laboratorio}</div>
                            <div className="font-mono text-[11px] text-[#5483B3] mt-0.5">Prazo: {ord.prazo}</div>
                          </td>

                          {/* Coluna 6: Valor Total */}
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-sm text-[#052659] whitespace-nowrap">
                            {ord.valor}
                          </td>

                          {/* Coluna 7: Status Clínico */}
                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${
                                ord.status === "pronto"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : ord.status === "receita"
                                  ? "bg-amber-50 text-amber-800 border-amber-300"
                                  : "bg-[#F0F6FC] text-[#052659] border-[#C1E8FF]"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  ord.status === "pronto"
                                    ? "bg-emerald-500 ring-2 ring-emerald-200"
                                    : ord.status === "receita"
                                    ? "bg-amber-500 ring-2 ring-amber-200"
                                    : "bg-[#5483B3] ring-2 ring-[#C1E8FF]"
                                }`}
                              />
                              <span>{ord.statusLabel}</span>
                            </span>
                          </td>

                          {/* Coluna 8: Ações Rápidas de 1 Clique */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {ord.status === "pronto" && (
                                <Link
                                  id={`btn-dash-notificar-os-${ord.id}`}
                                  href={`/ordens-de-servico/notificar-whatsapp?id=${ord.id}`}
                                  className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center justify-center shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all ring-2 ring-emerald-500/20 shrink-0"
                                  title="Notificar retirada via WhatsApp"
                                  aria-label="Notificar retirada via WhatsApp"
                                >
                                  <span className="material-symbols-outlined text-[17px]">chat</span>
                                </Link>
                              )}
                              {ord.status === "receita" && (
                                <Link
                                  id={`btn-dash-validar-dnp-${ord.id}`}
                                  href="/ordens-de-servico"
                                  className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center justify-center shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all ring-2 ring-amber-500/20 shrink-0"
                                  title="Validar DNP & Prescrição"
                                  aria-label="Validar DNP & Prescrição"
                                >
                                  <span className="material-symbols-outlined text-[17px]">straighten</span>
                                </Link>
                              )}
                              <Link
                                id={`btn-dash-ver-os-${ord.id}`}
                                href={`/ordens-de-servico/detalhes?id=${ord.id}`}
                                className="w-8 h-8 rounded-lg bg-[#F0F6FC] hover:bg-[#052659] text-[#052659] hover:text-white border border-[#5483B3]/40 hover:border-[#052659] inline-flex items-center justify-center shadow-2xs hover:shadow-xs active:scale-95 transition-all group cursor-pointer shrink-0"
                                title="Ver Ficha Técnica Dióptrica"
                                aria-label="Ver Ficha Técnica Dióptrica"
                              >
                                <span className="material-symbols-outlined text-[17px] text-[#5483B3] group-hover:text-white transition-colors">
                                  description
                                </span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Rodapé Resumo da Tabela */}
              <div className="p-3.5 bg-[#F0F6FC]/60 border-t border-[#C1E8FF] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#5483B3] gap-2">
                <span>
                  Exibindo <strong>{filteredConsultantOrders.length}</strong> de {consultantOrders.length} ordens de balcão registradas
                </span>
                <Link
                  id="link-dash-consultor-ver-fila-completa"
                  href="/ordens-de-servico/fila"
                  className="px-3 py-1 rounded-lg border border-[#7DA0CA] bg-white hover:bg-[#052659] text-[#052659] hover:text-white text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <span>Abrir Fila de Ordens Completa</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </section>

            {/* SECTION 3: MONITOR DE LABORATÓRIO E METAS DE BALCÃO (12 COLS DIVIDIDO) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column: Aging de Laboratório dos Meus Pedidos (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#C1E8FF] p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#F0F6FC]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#052659] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <span className="material-symbols-outlined text-base">precision_manufacturing</span>
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-[#052659]">Aging de Laboratório dos Meus Pedidos</h2>
                        <p className="text-xs text-[#5483B3]">Acompanhamento de lentes externas em produção terceirizada</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C1E8FF] text-[#052659] border border-[#7DA0CA]/40">
                      3 ATIVOS
                    </span>
                  </div>

                  {/* Barra de Progresso de Pontualidade */}
                  <div className="mt-4 p-3.5 rounded-xl bg-[#F0F6FC] border border-[#C1E8FF]">
                    <div className="flex justify-between text-xs font-bold text-[#052659] mb-1.5">
                      <span>Pontualidade das minhas lentes:</span>
                      <span className="font-mono text-emerald-700 font-bold">100% no prazo</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: "95%" }}></div>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-[#5483B3] mt-1.5">
                      <span>Tempo médio: 2.4 dias</span>
                      <span>0 ordens em atraso</span>
                    </div>
                  </div>

                  {/* Lista de Ordens em Laboratório */}
                  <div className="mt-3.5 space-y-2.5">
                    {consultantLabAlerts.map((alert) => (
                      <div
                        key={alert.os}
                        className="p-3.5 rounded-xl border border-[#C1E8FF] bg-white hover:bg-[#F0F6FC]/60 transition-colors flex items-center justify-between shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#052659]">{alert.os}</span>
                            <span className="text-xs font-semibold text-slate-800">• {alert.cliente}</span>
                          </div>
                          <div className="text-xs text-[#5483B3] mt-0.5">
                            {alert.lab} — <span className="font-medium text-slate-600">{alert.servico}</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">Previsão de Entrega: {alert.previsao}</div>
                        </div>

                        <div className="text-right flex items-center gap-2">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono ${
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

                <div className="mt-4 p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs flex items-center justify-between text-blue-900 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-700 text-base">support_agent</span>
                    <span className="font-medium">Dúvida sobre prazo de laboratório?</span>
                  </div>
                  <Link
                    id="link-dash-consultor-cobrar-lab"
                    href="/ordens-de-servico/fila"
                    className="font-bold text-blue-800 hover:underline text-xs flex items-center gap-0.5"
                  >
                    <span>Cobrar Lab</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Performance de Balcão & Metas de Mariana (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-[#C1E8FF] p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#F0F6FC]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#052659] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <span className="material-symbols-outlined text-base">trending_up</span>
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-[#052659]">Minha Performance de Balcão</h2>
                        <p className="text-xs text-[#5483B3]">Metas individuais do turno de atendimento</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                      META: 85%
                    </span>
                  </div>

                  {/* Barra de Progresso da Meta Diária */}
                  <div className="mt-4 p-3.5 rounded-xl bg-[#F0F6FC] border border-[#C1E8FF]">
                    <div className="flex justify-between text-xs font-bold text-[#052659] mb-1.5">
                      <span>Meta Diária de Vendas:</span>
                      <span className="font-mono text-[#052659]">R$ 4.250 / R$ 5.000</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div className="h-full rounded-full bg-[#052659] transition-all duration-500" style={{ width: "85%" }}></div>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-[#5483B3] mt-1.5">
                      <span className="text-emerald-700 font-bold">+R$ 750 para bater 100%</span>
                      <span>Turno: Manhã/Tarde</span>
                    </div>
                  </div>

                  {/* 4 Cards de Métricas de Vendas de Balcão */}
                  <div className="mt-3.5 grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#F0F6FC] border border-[#C1E8FF] shadow-2xs">
                      <span className="text-[11px] font-bold uppercase text-[#5483B3] block">Atendimentos</span>
                      <span className="font-mono text-xl font-bold text-[#052659] block mt-1">14</span>
                      <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">+4 vs ontem</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F0F6FC] border border-[#C1E8FF] shadow-2xs">
                      <span className="text-[11px] font-bold uppercase text-[#5483B3] block">Ticket Médio</span>
                      <span className="font-mono text-xl font-bold text-[#052659] block mt-1">R$ 303</span>
                      <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">Meta: R$ 280</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F0F6FC] border border-[#C1E8FF] shadow-2xs">
                      <span className="text-[11px] font-bold uppercase text-[#5483B3] block">Conv. Antirreflexo</span>
                      <span className="font-mono text-xl font-bold text-[#052659] block mt-1">80%</span>
                      <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">Excelente</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F0F6FC] border border-[#C1E8FF] shadow-2xs">
                      <span className="text-[11px] font-bold uppercase text-[#5483B3] block">OSs Concluídas</span>
                      <span className="font-mono text-xl font-bold text-[#052659] block mt-1">6</span>
                      <span className="text-[10px] text-[#5483B3] font-medium block mt-0.5">No prazo</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between text-emerald-900 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold">Turno em ritmo ótimo:</span>
                    <span className="text-emerald-800 text-[11px]">85% da cota diária concluída.</span>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: BOTTOM GRID (ROLE-AWARE - APENAS GERENTE) */}
        {/* ========================================================================= */}
        {isManager && (
          /* GERENTE: ACOMPANHAMENTO PRIORITÁRIO + METAS DA EQUIPE */
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Acompanhamento Prioritário de Balcão (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-[#C1E8FF]/60 p-5 shadow-sm">
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
              <div className="mt-3 overflow-x-auto border border-[#C1E8FF] rounded-xl overflow-hidden shadow-2xs">
                <table id="table-dash-acompanhamento-prioritario" className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="h-10 bg-[#F0F6FC] sticky top-0 z-10 text-[11px] font-bold tracking-wider text-[#052659] border-b border-[#C1E8FF] uppercase">
                      <th className="px-4 py-3">OS</th>
                      <th className="px-4 py-3">Cliente / Paciente</th>
                      <th className="px-4 py-3">Prescrição / Lente</th>
                      <th className="px-3 py-3 text-center">Etapa Atual</th>
                      <th className="px-3 py-3 text-center">Prazo</th>
                      <th className="px-4 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F6FC]">
                    {priorityOrders.map((order) => (
                      <tr key={order.id} className="h-14 hover:bg-[#C1E8FF]/15 transition-colors duration-150 cursor-default">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <Link
                            id={`link-dash-prioritaria-os-${order.id}`}
                            href={`/ordens-de-servico/detalhes?id=${order.id}`}
                            className="font-mono font-bold text-xs text-[#052659] hover:text-white bg-[#F0F6FC] hover:bg-[#052659] px-2.5 py-1 rounded-lg border border-[#C1E8FF] hover:border-[#052659] transition-all inline-flex items-center gap-1 shadow-2xs hover:shadow-xs group cursor-pointer"
                            title="Ver Ficha Técnica"
                          >
                            <span className="material-symbols-outlined text-[13px] text-[#5483B3] group-hover:text-white transition-colors">tag</span>
                            <span>{order.id}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-[#052659]">{order.cliente}</span>
                            {order.prioridade === "VIP" && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                                VIP
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#5483B3] truncate max-w-[180px]">{order.tipo}</td>
                        <td className="px-3 py-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${
                              order.etapaType === "success"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : order.etapaType === "warning"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-[#F0F6FC] text-[#052659] border-[#C1E8FF]"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                order.etapaType === "success"
                                  ? "bg-emerald-500 ring-2 ring-emerald-200"
                                  : order.etapaType === "warning"
                                  ? "bg-amber-500 ring-2 ring-amber-200"
                                  : "bg-[#5483B3] ring-2 ring-[#C1E8FF]"
                              }`}
                            />
                            <span>{order.etapa}</span>
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                              order.atrasoType === "danger"
                                ? "text-rose-800 bg-rose-50 border border-rose-200"
                                : order.atrasoType === "warning"
                                ? "text-amber-800 bg-amber-50 border border-amber-200"
                                : "text-emerald-800 bg-emerald-50 border border-emerald-200"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {order.atrasoType === "danger" ? "error" : order.atrasoType === "warning" ? "schedule" : "check_circle"}
                            </span>
                            <span>{order.atraso}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          {order.etapa === "Pronto Retirada" ? (
                            <Link
                              id={`btn-dash-prioritaria-avisar-${order.id}`}
                              href={`/ordens-de-servico/notificar-whatsapp?id=${order.id}`}
                              className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 ring-2 ring-emerald-500/20"
                            >
                              <span className="material-symbols-outlined text-sm">chat</span>
                              <span>Avisar</span>
                            </Link>
                          ) : (
                            <Link
                              id={`btn-dash-prioritaria-ver-${order.id}`}
                              href={`/ordens-de-servico/fila?destaque=${order.id}`}
                              className="h-8 px-3 rounded-lg bg-[#F0F6FC] hover:bg-[#052659] text-[#052659] hover:text-white border border-[#5483B3]/40 hover:border-[#052659] font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 transition-all group"
                            >
                              <span className="material-symbols-outlined text-sm text-[#5483B3] group-hover:text-white transition-colors">visibility</span>
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#052659] hover:text-white bg-[#F0F6FC] hover:bg-[#052659] border border-[#C1E8FF] hover:border-[#052659] transition-all shadow-2xs group cursor-pointer"
                >
                  <span>Abrir Balcão Completo</span>
                  <span className="material-symbols-outlined text-sm text-[#5483B3] group-hover:text-white group-hover:translate-x-0.5 transition-all">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Ranking de Vendas da Equipe de Balcão (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-[#C1E8FF]/60 p-5 shadow-sm">
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
                    className="p-3 rounded-xl border border-[#C1E8FF]/60 bg-[#F0F6FC]/60 hover:bg-[#F0F6FC] transition-colors shadow-2xs"
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
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs shadow-2xs">
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
        )}

        {!isManager && (
          /* CONSULTOR: ATALHOS OPERACIONAIS DE BALCÃO */
          <section className="bg-white rounded-xl border border-[#C1E8FF]/60 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F6FC]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#052659]">flash_on</span>
                <h2 className="text-base font-bold text-[#052659]">Atalhos Operacionais de Balcão</h2>
              </div>
              <span className="text-xs text-[#5483B3] font-medium hidden sm:inline">
                Acesso rápido aos fluxos de atendimento diário
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                id="link-dash-consultor-shortcut-nova-os"
                href="/ordens-de-servico"
                prefetch={true}
                className="p-4 rounded-xl border border-[#C1E8FF] bg-[#F0F6FC]/50 hover:bg-[#F0F6FC] hover:border-[#5483B3] transition-all duration-200 group flex items-start gap-3.5 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-98 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-[#052659] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-[#052659] flex items-center gap-1.5">
                    <span>Nova OS de Balcão</span>
                    <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-[#C1E8FF] text-[#052659] font-bold">F2</span>
                  </div>
                  <p className="text-xs text-[#5483B3] mt-0.5">Prescrição e venda assistida</p>
                </div>
              </Link>

              <Link
                id="link-dash-consultor-shortcut-catalogo"
                href="/estoque"
                prefetch={true}
                className="p-4 rounded-xl border border-[#C1E8FF] bg-[#F0F6FC]/50 hover:bg-[#F0F6FC] hover:border-[#5483B3] transition-all duration-200 group flex items-start gap-3.5 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-98 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-[#5483B3] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">eyeglasses</span>
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-[#052659]">Catálogo de Armações</div>
                  <p className="text-xs text-[#5483B3] mt-0.5">Consulta de estoque e preços</p>
                </div>
              </Link>

              <Link
                id="link-dash-consultor-shortcut-fila"
                href="/ordens-de-servico/fila"
                prefetch={true}
                className="p-4 rounded-xl border border-[#C1E8FF] bg-[#F0F6FC]/50 hover:bg-[#F0F6FC] hover:border-[#5483B3] transition-all duration-200 group flex items-start gap-3.5 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-98 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-[#5483B3] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">shelves</span>
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-[#052659]">Fila de Pedidos</div>
                  <p className="text-xs text-[#5483B3] mt-0.5">Localização física e gaveteiros</p>
                </div>
              </Link>

              <Link
                id="link-dash-consultor-shortcut-kardex"
                href="/kardex"
                prefetch={true}
                className="p-4 rounded-xl border border-[#C1E8FF] bg-[#F0F6FC]/50 hover:bg-[#F0F6FC] hover:border-[#5483B3] transition-all duration-200 group flex items-start gap-3.5 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-98 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-[#5483B3] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-[#052659]">Kardex de Estoque</div>
                  <p className="text-xs text-[#5483B3] mt-0.5">Rastreamento de movimentações</p>
                </div>
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

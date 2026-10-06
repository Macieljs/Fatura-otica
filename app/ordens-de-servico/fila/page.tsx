"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useToast } from "@/components/ToastProvider";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";

interface OSItem {
  id: string;
  cliente: string;
  telefone: string;
  armacao: string;
  lente: string;
  laboratorio: string;
  statusColuna: "aguardando_lab" | "surfacagem" | "controle_qualidade" | "pronto";
  statusBadge: string;
  statusBadgeTipo: "danger" | "warning" | "info" | "success";
  gaveta: string;
  prometido: string;
  valorTotal: number;
  saldoRestante: number;
}

function FilaLaboratorioContent() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const destaqueParam = searchParams.get("destaque");

  const [busca, setBusca] = useState("");
  const [filtroColuna, setFiltroColuna] = useState<string>("todas");
  const viewParam = searchParams.get("view");
  const [modoVisualizacao, setModoVisualizacao] = useState<"tabela" | "kanban">(
    viewParam === "kanban" || viewParam === "gavetas" ? "kanban" : "tabela"
  );
  const [inputMalote, setInputMalote] = useState("");
  const [mensagemSucessoBip, setMensagemSucessoBip] = useState<string | null>(null);
  const [osDestacada, setOsDestacada] = useState<string | null>(destaqueParam);

  const [gavetasAbertas, setGavetasAbertas] = useState<Record<string, boolean>>({
    aguardando_lab: true,
    surfacagem: true,
    controle_qualidade: true,
    pronto: true,
  });

  const toggleGaveta = (id: string) => {
    setGavetasAbertas((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandirTodasGavetas = () => {
    setGavetasAbertas({
      aguardando_lab: true,
      surfacagem: true,
      controle_qualidade: true,
      pronto: true,
    });
  };

  const recolherTodasGavetas = () => {
    setGavetasAbertas({
      aguardando_lab: false,
      surfacagem: false,
      controle_qualidade: false,
      pronto: false,
    });
  };

  const [ordens, setOrdens] = useState<OSItem[]>([
    {
      id: "10294",
      cliente: "João Silva",
      telefone: "(11) 98765-4321",
      armacao: "Ray-Ban RX5228 Tartaruga 54-18",
      lente: "Multifocal Varilux Comfort 1.60",
      laboratorio: "Essilor SP (Surfaçagem Digital)",
      statusColuna: "aguardando_lab",
      statusBadge: "Atrasado 2 dias",
      statusBadgeTipo: "danger",
      gaveta: "Gaveta Transit Lab",
      prometido: "22/10 (Vencido)",
      valorTotal: 1890.0,
      saldoRestante: 450.0,
    },
    {
      id: "10287",
      cliente: "Beatriz Nogueira Silva",
      telefone: "(11) 98321-4455",
      armacao: "Carolina Herrera CH0048 Havana",
      lente: "Visão Simples Antirreflexo 1.60",
      laboratorio: "Laboratório Regional Lux",
      statusColuna: "aguardando_lab",
      statusBadge: "Montagem Externa (+1d Atraso)",
      statusBadgeTipo: "danger",
      gaveta: "Em Trânsito Lab",
      prometido: "23/10 (Vencido)",
      valorTotal: 1280.0,
      saldoRestante: 300.0,
    },
    {
      id: "10279",
      cliente: "Carlos Eduardo Dias",
      telefone: "(11) 97654-3210",
      armacao: "Ray-Ban Aviator RB3025 Dourado",
      lente: "Lentes Solares Graduadas G-15 Hoya",
      laboratorio: "Lab Hoya Brasil",
      statusColuna: "surfacagem",
      statusBadge: "Surfaçagem Hoya (Hoje 17h)",
      statusBadgeTipo: "warning",
      gaveta: "Em Produção Lab",
      prometido: "Hoje, 17:00",
      valorTotal: 1540.0,
      saldoRestante: 0.0,
    },
    {
      id: "10274",
      cliente: "Ana Luiza Meireles",
      telefone: "(11) 99112-8877",
      armacao: "Ana Hickmann AH6342 Nude",
      lente: "Fotossensível Transitions Gen8 1.56",
      laboratorio: "Essilor SP",
      statusColuna: "surfacagem",
      statusBadge: "Triagem Armação",
      statusBadgeTipo: "info",
      gaveta: "Bancada 01",
      prometido: "26/10, 15:00",
      valorTotal: 1190.0,
      saldoRestante: 190.0,
    },
    {
      id: "10298",
      cliente: "Maria Fernanda Costa",
      telefone: "(11) 97123-4567",
      armacao: "Vogue Eyewear VO5352 Dourado",
      lente: "Essilor Crizal Sapphire HR 1.67",
      laboratorio: "Laboratório Regional Lux",
      statusColuna: "pronto",
      statusBadge: "Chegou na Loja (Hoje)",
      statusBadgeTipo: "success",
      gaveta: "Gaveta G-01",
      prometido: "Hoje, 18:00",
      valorTotal: 1650.0,
      saldoRestante: 320.0,
    },
    {
      id: "10301",
      cliente: "Carlos Eduardo M.",
      telefone: "(11) 99887-1122",
      armacao: "Oakley OX8156 Holbrook RX Satin Black",
      lente: "Hoya MiYOSMART Poly 1.59",
      laboratorio: "Lab Hoya Brasil",
      statusColuna: "aguardando_lab",
      statusBadge: "Atrasado 1 dia",
      statusBadgeTipo: "warning",
      gaveta: "Em Maloteiro",
      prometido: "23/10 (Vencido)",
      valorTotal: 1420.0,
      saldoRestante: 0.0,
    },
    {
      id: "10312",
      cliente: "Renata Vasconcelos",
      telefone: "(11) 97412-8899",
      armacao: "Prada PR16MV Preto Clássico",
      lente: "Zeiss DriveSafe Single Vision 1.60",
      laboratorio: "Zeiss Lab Express #8841",
      statusColuna: "aguardando_lab",
      statusBadge: "Aguardando Lente Lab",
      statusBadgeTipo: "warning",
      gaveta: "Bancada Montagem 04",
      prometido: "Previsão 25/10",
      valorTotal: 2150.0,
      saldoRestante: 580.0,
    },
    {
      id: "10315",
      cliente: "Mariana Souza",
      telefone: "(11) 98112-3344",
      armacao: "Armação Cliente (Metal Fio de Nylon)",
      lente: "Polarizada Cinza c/ Antirreflexo",
      laboratorio: "Essilor SP",
      statusColuna: "surfacagem",
      statusBadge: "Em Produção no Lab",
      statusBadgeTipo: "info",
      gaveta: "Em Trânsito Lab",
      prometido: "Hoje, 19:30",
      valorTotal: 790.0,
      saldoRestante: 0.0,
    },
    {
      id: "10318",
      cliente: "Thiago Alencar",
      telefone: "(11) 96541-2233",
      armacao: "Carrera CA8840 Aviador Grafite",
      lente: "Monofocal Trivex 1.53 Anti-Impacto",
      laboratorio: "Laboratório Regional Lux",
      statusColuna: "surfacagem",
      statusBadge: "Surfaçagem Finalizada",
      statusBadgeTipo: "info",
      gaveta: "Aguardando Malote",
      prometido: "Amanhã, 12:00",
      valorTotal: 980.0,
      saldoRestante: 200.0,
    },
    {
      id: "10322",
      cliente: "Beatriz Lima",
      telefone: "(11) 99123-5566",
      armacao: "Silhouette Titan Minimal Art",
      lente: "Alto Índice 1.74 Hi-Index",
      laboratorio: "Lab Hoya Brasil",
      statusColuna: "surfacagem",
      statusBadge: "Furação Tridimensional",
      statusBadgeTipo: "info",
      gaveta: "Lab Especializado",
      prometido: "Amanhã, 15:00",
      valorTotal: 2400.0,
      saldoRestante: 1200.0,
    },
    {
      id: "10289",
      cliente: "Gustavo Neves",
      telefone: "(11) 98877-6655",
      armacao: "Ray-Ban Clubmaster RB3016",
      lente: "Varilux Physio 3.0 Orma",
      laboratorio: "Essilor SP",
      statusColuna: "controle_qualidade",
      statusBadge: "Conferido no Lensômetro",
      statusBadgeTipo: "success",
      gaveta: "Gaveta G-03",
      prometido: "Hoje, 17:00",
      valorTotal: 1750.0,
      saldoRestante: 0.0,
    },
    {
      id: "10292",
      cliente: "Patrícia Prado",
      telefone: "(11) 97766-5544",
      armacao: "Emporio Armani EA3147",
      lente: "Fotossensível Transitions GenS",
      laboratorio: "Laboratório Regional Lux",
      statusColuna: "controle_qualidade",
      statusBadge: "Embalando p/ Gaveta",
      statusBadgeTipo: "info",
      gaveta: "Gaveta G-04",
      prometido: "Hoje, 17:30",
      valorTotal: 1390.0,
      saldoRestante: 390.0,
    },
    {
      id: "10295",
      cliente: "Rodrigo Antunes",
      telefone: "(11) 99432-1100",
      armacao: "Oakley Crosslink Switch",
      lente: "Policarbonato Blue UV Shield",
      laboratorio: "Lab Hoya Brasil",
      statusColuna: "controle_qualidade",
      statusBadge: "Validação Eixo Astigmático",
      statusBadgeTipo: "info",
      gaveta: "Bancada QC",
      prometido: "Hoje, 18:45",
      valorTotal: 1100.0,
      saldoRestante: 0.0,
    },
    {
      id: "10280",
      cliente: "Amanda Meireles",
      telefone: "(11) 98456-7890",
      armacao: "Vogue VO5352 Dourado Infantil",
      lente: "Hoya MiYOSMART Poly 1.59",
      laboratorio: "Laboratório Regional Lux",
      statusColuna: "pronto",
      statusBadge: "Cliente Notificado WhatsApp",
      statusBadgeTipo: "success",
      gaveta: "Gaveta G-02 (Lacrado)",
      prometido: "Liberado",
      valorTotal: 1250.0,
      saldoRestante: 0.0,
    },
    {
      id: "10282",
      cliente: "Felipe Guimarães",
      telefone: "(11) 98234-5678",
      armacao: "Tom Ford FT5542 Acetato",
      lente: "Essilor Eyezen Start 1.60",
      laboratorio: "Essilor SP",
      statusColuna: "pronto",
      statusBadge: "Pronto na Gaveta G-05",
      statusBadgeTipo: "success",
      gaveta: "Gaveta G-05",
      prometido: "Liberado",
      valorTotal: 2200.0,
      saldoRestante: 600.0,
    },
  ]);

  // Deep-Link Effect: Scroll suave e realce de cor intuitivo temporário (fade out automático)
  useEffect(() => {
    if (destaqueParam) {
      setOsDestacada(destaqueParam);
      setFiltroColuna("todas");

      const scrollTimer = setTimeout(() => {
        const elemento =
          document.getElementById(`linha-os-${destaqueParam}`) ||
          document.getElementById(`card-fila-kanban-${destaqueParam}`);
        if (elemento) {
          elemento.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);

      // Efeito sutil: a cor destaca o item de imediato e desvanece suavemente após 3.5 segundos
      const fadeTimer = setTimeout(() => {
        setOsDestacada(null);
      }, 3500);

      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(fadeTimer);
      };
    }
  }, [destaqueParam]);

  const handleDarEntradaBip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMalote.trim()) return;

    const idLimpo = inputMalote.trim().replace("#", "");
    const osEncontrada = ordens.find((o) => o.id === idLimpo);

    if (osEncontrada) {
      setOrdens((prev) =>
        prev.map((o) =>
          o.id === idLimpo
            ? {
                ...o,
                statusColuna: "pronto",
                statusBadge: "Recebido do Lab (Hoje)",
                statusBadgeTipo: "success",
                gaveta: "Gaveta G-01",
              }
            : o
        )
      );
      setMensagemSucessoBip(`Malote da OS #${idLimpo} (${osEncontrada.cliente}) recebido com sucesso e alocado na Gaveta G-01!`);
      toast.success(`Malote da OS #${idLimpo} (${osEncontrada.cliente}) recebido e alocado na Gaveta G-01!`, {
        title: "Malote Recebido",
        icon: "check_circle",
      });
    } else {
      setMensagemSucessoBip(`OS #${idLimpo} não encontrada na fila atual. Verifique o código.`);
      toast.warning(`OS #${idLimpo} não localizada na fila de laboratório atual.`, {
        title: "Código Não Encontrado",
        icon: "search_off",
      });
    }

    setInputMalote("");
    setTimeout(() => setMensagemSucessoBip(null), 7000);
  };

  // Normalização diacrítica para pesquisa resiliente a acentos e caixa
  const normalizar = (texto: string) =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  // Motor de Busca Lógica Estruturada com AND e Prefixos
  const ordensFiltradas = useMemo(() => {
    const resultado = ordens.filter((o) => {
      const isHighlighted = osDestacada && o.id === osDestacada;
      if (filtroColuna !== "todas" && o.statusColuna !== filtroColuna && !isHighlighted) {
        return false;
      }

      if (!busca.trim()) return true;

      const termos = normalizar(busca).split(/\s+/).filter(Boolean);

      return termos.every((termo) => {
        // Prefixo lab: (ex: lab:essilor)
        if (termo.startsWith("lab:")) {
          const valor = termo.replace("lab:", "");
          return normalizar(o.laboratorio).includes(valor);
        }
        // Prefixo status: (ex: status:atrasado, status:pronto)
        if (termo.startsWith("status:")) {
          const valor = termo.replace("status:", "");
          return (
            normalizar(o.statusBadge).includes(valor) ||
            normalizar(o.statusColuna).includes(valor)
          );
        }
        // Prefixo gaveta: (ex: gaveta:g-01)
        if (termo.startsWith("gaveta:")) {
          const valor = termo.replace("gaveta:", "");
          return normalizar(o.gaveta).includes(valor);
        }
        // Prefixo os: ou # (ex: os:10294 ou #10294)
        if (termo.startsWith("os:") || termo.startsWith("#")) {
          const valor = termo.replace("os:", "").replace("#", "");
          return o.id.includes(valor);
        }

        // Termo livre (busca cumulativa AND em qualquer campo)
        return (
          o.id.includes(termo) ||
          normalizar(o.cliente).includes(termo) ||
          normalizar(o.armacao).includes(termo) ||
          normalizar(o.lente).includes(termo) ||
          normalizar(o.laboratorio).includes(termo) ||
          normalizar(o.gaveta).includes(termo) ||
          normalizar(o.statusBadge).includes(termo) ||
          o.telefone.includes(termo)
        );
      });
    });

    // Ordenação por proximidade do cliente: o processo mais próximo do balcão primeiro
    const prioridadeStatus: Record<string, number> = {
      pronto: 1,              // Mais próximo do cliente (já na loja, na gaveta de retirada)
      controle_qualidade: 2,  // Chegou na loja (conferência rápida para liberar ao cliente)
      surfacagem: 3,          // Em produção / montagem (em andamento)
      aguardando_lab: 4,      // No laboratório terceirizado (mais distante)
    };

    return [...resultado].sort((a, b) => {
      const prioridadeA = prioridadeStatus[a.statusColuna] || 99;
      const prioridadeB = prioridadeStatus[b.statusColuna] || 99;
      if (prioridadeA !== prioridadeB) {
        return prioridadeA - prioridadeB;
      }
      // Se empatar no mesmo estágio, OSs com atraso/atenção sobem para o topo
      if (a.statusBadgeTipo === "danger" && b.statusBadgeTipo !== "danger") return -1;
      if (b.statusBadgeTipo === "danger" && a.statusBadgeTipo !== "danger") return 1;
      return 0;
    });
  }, [ordens, filtroColuna, busca, osDestacada]);

  // Gaveteiros organizados por proximidade do cliente (Customer-First)
  const colunasKanban = [
    {
      id: "pronto",
      gavetaNumero: "Gaveteiro 01",
      titulo: "Pronto na Gaveta (Retirada no Balcão)",
      subtitulo: "Óculos conferidos e prontos para entrega imediata ao cliente no balcão",
      cor: "bg-emerald-600",
      badgeCor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      icone: "inventory_2",
    },
    {
      id: "controle_qualidade",
      gavetaNumero: "Gaveteiro 02",
      titulo: "Chegou / Conferir Lensômetro",
      subtitulo: "Malote entregue na loja aguardando conferência dióptrica rápida",
      cor: "bg-[#052659]",
      badgeCor: "bg-slate-100 text-slate-800 border-slate-200",
      icone: "visibility",
    },
    {
      id: "surfacagem",
      gavetaNumero: "Gaveteiro 03",
      titulo: "Em Produção / Montagem",
      subtitulo: "Em processo de surfaçagem, blocagem e montagem de aro",
      cor: "bg-slate-700",
      badgeCor: "bg-slate-100 text-slate-800 border-slate-200",
      icone: "precision_manufacturing",
    },
    {
      id: "aguardando_lab",
      gavetaNumero: "Gaveteiro 04",
      titulo: "No Laboratório Externo",
      subtitulo: "Ordens enviadas e em trânsito com laboratórios terceirizados",
      cor: "bg-slate-600",
      badgeCor: "bg-slate-100 text-slate-800 border-slate-200",
      icone: "local_shipping",
    },
  ];

  return (
    <div className="flex-1 bg-[#F0F6FC] min-h-screen pb-20 text-[#021024]">
      {/* 1. CABEÇALHO PADRONIZADO DA TELA */}
      <PageHeader
        id="header-fila-pedidos"
        icon="assignment"
        title="Central de Pedidos & Acompanhamento de Laboratório"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#052659] text-white border border-[#052659] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-300/40 animate-pulse" />
            <span>{ordens.length} Pedidos Ativos</span>
          </span>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Ordens de Serviço" },
          { label: "Central de Pedidos & Balcão" },
        ]}
        subtitle="Controle de malotes de laboratórios terceirizados, conferência de chegada e automação de WhatsApp"
        actions={
          <>
            <button
              id="btn-fila-imprimir-romaneio"
              type="button"
              onClick={() =>
                toast.success(
                  "Romaneio de Envio de Malote gerado com sucesso! Protocolo com 3 armações para entrega ao motoboy.",
                  {
                    title: "Malote Despachado",
                    icon: "local_shipping",
                  }
                )
              }
              className="h-9 px-3.5 rounded-xl text-xs font-bold bg-[#5483B3] hover:bg-[#052659] text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 ring-2 ring-[#5483B3]/25 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-white">local_shipping</span>
              <span>Emitir Romaneio</span>
            </button>

            <Link
              id="link-fila-nova-os"
              href="/ordens-de-servico"
              className="h-9 px-4 rounded-xl bg-[#052659] hover:bg-[#021024] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 ring-2 ring-[#052659]/20 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#C1E8FF]">add_circle</span>
              <span>+ Nova OS (F2)</span>
            </Link>
          </>
        }
      />

      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Barra de Recepção Rápida de Malote em 1 Bip */}
        <div className="bg-white border border-[#C1E8FF] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#052659] flex items-center justify-center text-white shadow-xs shrink-0">
                <span className="material-symbols-outlined text-[22px]">barcode_scanner</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#052659] uppercase tracking-wider flex items-center gap-1.5">
                  Recepção Rápida de Malote do Laboratório (1 Bip)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Bipe o código do envelope entregue pelo motoboy para dar entrada na gaveta e liberar aviso ao cliente.
                </p>
              </div>
            </div>

            <form id="form-fila-bip-malote" onSubmit={handleDarEntradaBip} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-80">
                <input
                  id="input-fila-bip-codigo"
                  type="text"
                  value={inputMalote}
                  onChange={(e) => setInputMalote(e.target.value)}
                  placeholder="Bipar ou digitar OS (ex: 10298)..."
                  className="w-full h-9.5 pl-3.5 pr-12 rounded-xl border border-[#7DA0CA]/60 text-xs font-mono font-bold bg-[#F0F6FC]/60 text-[#052659] placeholder:text-slate-400 focus:bg-white focus:border-[#5483B3] focus:outline-none focus:ring-2 focus:ring-[#5483B3]/20 transition-all"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-[#5483B3] bg-white px-1.5 py-0.5 rounded border border-[#7DA0CA]/40">
                  [F4]
                </span>
              </div>
              <button
                id="btn-fila-bipar"
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#052659] hover:bg-[#021024] text-white text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 ring-2 ring-[#052659]/20 shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                <span>Dar Entrada</span>
              </button>
            </form>
          </div>

          {mensagemSucessoBip && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                <span>{mensagemSucessoBip}</span>
              </div>
              <Link
                id="link-fila-bip-notificar-whatsapp"
                href="/ordens-de-servico/notificar-whatsapp?id=10298"
                className="font-bold underline hover:text-emerald-950 inline-flex items-center gap-1"
              >
                <span>Notificar Cliente no WhatsApp Agora</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          )}
        </div>

        {/* Faixa de KPIs Executivos de Loja de Balcão (Unificada via KpiCard) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            id="card-fila-prontos-retirada"
            title="Prontos p/ Retirada"
            value="4"
            unit="pedidos"
            icon="inventory_2"
            footerLeft={
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="material-symbols-outlined text-[15px] text-[#5483B3]">shelves</span>
                <span>Gavetas G-01 a G-05</span>
              </div>
            }
          />
          <KpiCard
            id="card-fila-avisos-whatsapp"
            title="Avisos WhatsApp"
            value="8"
            unit="notificados"
            icon="chat"
            footerLeft={
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F6FC] text-[#052659] border border-[#C1E8FF]">
                Taxa de Resposta: 92%
              </span>
            }
          />
          <KpiCard
            id="card-fila-atrasados-lab"
            title="Atrasados pelo Lab"
            value="2"
            unit="pedidos"
            icon="warning"
            iconVariant="danger"
            badge={
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                Atenção
              </span>
            }
            footerLeft={
              <a
                id="link-fila-kpi-cobrar-lab"
                href="https://wa.me/5511987654321?text=Ol%C3%A1%20Laborat%C3%B3rio!%20Gostaria%20de%20cobrar%20posi%C3%A7%C3%A3o%20urgente%20dos%20pedidos%20em%20atraso%20da%20Fatura%20%C3%93tica."
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#052659] hover:text-rose-700 inline-flex items-center gap-1 transition-colors"
              >
                <span>Cobrar via WhatsApp</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </a>
            }
          />
          <KpiCard
            id="card-fila-no-lab-externo"
            title="No Lab Externo"
            value="6"
            unit="pedidos"
            icon="precision_manufacturing"
            footerLeft={
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="material-symbols-outlined text-[15px] text-[#5483B3]">factory</span>
                <span className="truncate">Essilor (3) • Hoya (2) • Lab Lux (1)</span>
              </div>
            }
          />
        </div>

        {/* Barra de Filtros, Pesquisa e Seletor de Modo de Visualização */}
        <div className="bg-white border border-[#C1E8FF] rounded-2xl p-3.5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3.5 shadow-xs">
          {/* Pills de Filtro de Estágio com rolagem horizontal suave no mobile/tablet */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0 scrollbar-none w-full xl:w-auto shrink-0">
            {[
              { id: "todas", label: `Todos (${ordens.length})` },
              { id: "pronto", label: "Prontos p/ Retirar (4)" },
              { id: "controle_qualidade", label: "Chegou / Conferir (3)" },
              { id: "surfacagem", label: "Em Produção (3)" },
              { id: "aguardando_lab", label: "No Lab Externo (4)" },
            ].map((f) => (
              <button
                key={f.id}
                id={`btn-fila-filtro-${f.id}`}
                type="button"
                onClick={() => setFiltroColuna(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
                  filtroColuna === f.id
                    ? "bg-[#052659] text-white border-[#052659] shadow-xs"
                    : "bg-white text-[#052659] border-[#C1E8FF] hover:bg-[#F0F6FC] hover:border-[#7DA0CA]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between xl:justify-end gap-3 w-full xl:w-auto">
            {/* Campo de Pesquisa Rápida Estruturada */}
            <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 sm:flex-initial">
              <div className="relative w-full sm:w-72 lg:w-80">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                  search
                </span>
                <input
                  id="input-fila-pesquisa"
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar OS, cliente, lab:essilor, status:atrasado..."
                  className="w-full h-8.5 pl-8 pr-7 rounded-xl border border-[#C1E8FF] text-xs bg-white text-[#052659] placeholder:text-[#5483B3]/60 focus:border-[#5483B3] focus:ring-2 focus:ring-[#C1E8FF] transition-all shadow-2xs"
                />
                {busca && (
                  <button
                    id="btn-fila-limpar-busca-icone"
                    type="button"
                    onClick={() => setBusca("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#052659] p-0.5 cursor-pointer"
                    title="Limpar busca"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                )}
              </div>

              {/* Chips de Atalhos de Busca Rápida */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-[#5483B3] font-bold uppercase">Atalhos:</span>
                {[
                  { label: "lab:essilor", q: "lab:essilor" },
                  { label: "lab:hoya", q: "lab:hoya" },
                  { label: "status:atrasado", q: "status:atrasado" },
                  { label: "status:pronto", q: "status:pronto" },
                  { label: "gaveta:g-01", q: "gaveta:g-01" },
                ].map((chip) => (
                  <button
                    key={chip.q}
                    id={`btn-chip-busca-${chip.q.replace(":", "-")}`}
                    type="button"
                    onClick={() => setBusca((prev) => (prev ? `${prev} ${chip.q}` : chip.q))}
                    className="px-1.5 py-0.5 rounded bg-[#F0F6FC] hover:bg-[#C1E8FF]/60 text-[#052659] border border-[#C1E8FF]/60 font-mono text-[9px] font-semibold transition-colors cursor-pointer"
                  >
                    +{chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alternador de Modo: Tabela vs. Gavetas/Kanban */}
            <div className="flex items-center rounded-xl border border-[#C1E8FF] overflow-hidden bg-[#F0F6FC] p-1 shrink-0 self-start sm:self-center shadow-2xs">
              <button
                id="btn-fila-view-tabela"
                type="button"
                onClick={() => setModoVisualizacao("tabela")}
                className={`px-3 py-1.5 text-xs flex items-center gap-1.5 rounded-lg transition-all cursor-pointer ${
                  modoVisualizacao === "tabela"
                    ? "bg-[#052659] text-white shadow-xs font-bold"
                    : "text-[#5483B3] hover:text-[#052659] font-semibold"
                }`}
                title="Visualização em Tabela Ágil"
              >
                <span className="material-symbols-outlined text-[15px]">table_rows</span>
                <span>Tabela</span>
              </button>
              <button
                id="btn-fila-view-kanban"
                type="button"
                onClick={() => setModoVisualizacao("kanban")}
                className={`px-3 py-1.5 text-xs flex items-center gap-1.5 rounded-lg transition-all cursor-pointer ${
                  modoVisualizacao === "kanban"
                    ? "bg-[#052659] text-white shadow-xs font-bold"
                    : "text-[#5483B3] hover:text-[#052659] font-semibold"
                }`}
                title="Visualização por Gavetas e Estágios"
              >
                <span className="material-symbols-outlined text-[15px]">view_kanban</span>
                <span>Gavetas</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1. VISUALIZAÇÃO PADRÃO: TABELA ÁGIL DE ALTA DENSIDADE */}
        {modoVisualizacao === "tabela" ? (
          <section className="bg-white border border-[#C1E8FF] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table id="table-fila-producao" className="w-full text-left text-sm border-collapse min-w-[1060px]">
                <thead>
                  <tr className="bg-[#F0F6FC] sticky top-0 z-10 border-b border-[#C1E8FF] text-[11px] font-bold text-[#052659] uppercase tracking-wider">
                    <th className="w-[80px] px-3.5 py-3">OS</th>
                    <th className="w-[180px] px-3.5 py-3">Paciente</th>
                    <th className="px-3.5 py-3">Armação &amp; Lente</th>
                    <th className="w-[165px] px-3.5 py-3">Laboratório</th>
                    <th className="w-[190px] px-3.5 py-3">Status &amp; Previsão</th>
                    <th className="w-[130px] px-3.5 py-3">Gaveta Física</th>
                    <th className="w-[140px] px-3.5 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ordensFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-slate-500 space-y-2">
                        <span className="material-symbols-outlined text-3xl text-slate-400 block mx-auto">
                          search_off
                        </span>
                        <p className="font-semibold text-slate-700">
                          Nenhum pedido encontrado {busca ? `para a pesquisa "${busca}"` : "com os filtros aplicados"}.
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Tente buscar por número de OS, paciente, ou use prefixos lógicos como <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">lab:essilor</code> ou <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">status:atrasado</code>.
                        </p>
                        <button
                          id="btn-fila-limpar-busca-empty"
                          type="button"
                          onClick={() => {
                            setBusca("");
                            setFiltroColuna("todas");
                          }}
                          className="mt-2 px-3 py-1.5 rounded-lg bg-[#052659] hover:bg-[#021024] text-white text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <span className="material-symbols-outlined text-sm">restart_alt</span>
                          <span>Limpar Filtros e Pesquisa</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    ordensFiltradas.map((item) => {
                      const isHighlighted = item.id === osDestacada;
                      return (
                        <tr
                          key={item.id}
                          id={`linha-os-${item.id}`}
                          className={`transition-colors duration-150 cursor-default ${
                            isHighlighted
                              ? "bg-amber-100/80 ring-2 ring-amber-500/50"
                              : item.statusBadgeTipo === "danger"
                              ? "bg-rose-50/30 hover:bg-rose-50/60"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          {/* Coluna 1: OS */}
                          <td className="px-3.5 py-2.5 sm:py-3 whitespace-nowrap">
                            <Link
                              id={`link-fila-os-${item.id}`}
                              href={`/ordens-de-servico/detalhes?id=${item.id}`}
                              className="font-mono font-bold text-xs text-[#052659] hover:text-white bg-[#F0F6FC] hover:bg-[#052659] px-2.5 py-1 rounded-lg border border-[#C1E8FF] hover:border-[#052659] transition-all inline-flex items-center gap-1 shadow-2xs hover:shadow-xs group cursor-pointer"
                              title="Ver ficha técnica dióptrica"
                            >
                              <span className="material-symbols-outlined text-[13px] text-[#5483B3] group-hover:text-white transition-colors">tag</span>
                              <span>{item.id}</span>
                            </Link>
                          </td>

                          {/* Coluna 2: Paciente */}
                          <td className="px-3.5 py-2.5 sm:py-3 whitespace-nowrap">
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-[#052659] text-sm truncate" title={item.cliente}>
                                {item.cliente}
                              </span>
                              <span className="text-xs font-mono text-slate-400">{item.telefone}</span>
                            </div>
                          </td>

                          {/* Armação & Lente */}
                          <td className="px-3.5 py-2.5 sm:py-3 max-w-[280px]">
                            <div className="truncate font-semibold text-slate-800 text-sm" title={item.armacao}>
                              {item.armacao}
                            </div>
                            <div className="truncate text-xs text-[#5483B3]" title={item.lente}>
                              {item.lente}
                            </div>
                          </td>

                          {/* Laboratório Parceiro */}
                          <td className="px-3.5 py-2.5 sm:py-3 whitespace-nowrap">
                            <span className="font-medium text-slate-700 text-sm">{item.laboratorio}</span>
                          </td>

                          {/* Status & Previsão */}
                          <td className="px-3.5 py-2.5 sm:py-3 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5 items-start">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-2xs ${
                                  item.statusBadgeTipo === "danger"
                                    ? "bg-rose-50 text-rose-800 border-rose-300"
                                    : item.statusBadgeTipo === "warning"
                                    ? "bg-amber-50 text-amber-800 border-amber-300"
                                    : item.statusBadgeTipo === "success"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : "bg-[#F0F6FC] text-[#052659] border-[#C1E8FF]"
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    item.statusBadgeTipo === "danger"
                                      ? "bg-rose-500 ring-2 ring-rose-200"
                                      : item.statusBadgeTipo === "warning"
                                      ? "bg-amber-500 ring-2 ring-amber-200"
                                      : item.statusBadgeTipo === "success"
                                      ? "bg-emerald-500 ring-2 ring-emerald-200"
                                      : "bg-[#5483B3] ring-2 ring-[#C1E8FF]"
                                  }`}
                                />
                                <span>{item.statusBadge}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#5483B3] font-mono font-medium pl-1">
                                <span className="material-symbols-outlined text-[13px]">schedule</span>
                                <span>Previsto: {item.prometido}</span>
                              </span>
                            </div>
                          </td>

                          {/* Gaveta Física */}
                          <td className="px-3.5 py-2.5 sm:py-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#F0F6FC] text-[#052659] border border-[#C1E8FF] shadow-2xs">
                              <span className="material-symbols-outlined text-[14px] text-[#5483B3]">shelves</span>
                              <span>{item.gaveta}</span>
                            </span>
                          </td>

                          {/* Ações Rápidas de Balcão (Apenas Ícones com Tooltip) */}
                          <td className="px-3.5 py-2.5 sm:py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Se OS atrasada, botão de cobrança de laboratório */}
                              {item.statusBadgeTipo === "danger" && (
                                <a
                                  id={`link-fila-cobrar-lab-${item.id}`}
                                  href={`https://wa.me/5511987654321?text=Ol%C3%A1%20${encodeURIComponent(item.laboratorio)}!%20Cobran%C3%A7a%20urgente%20da%20OS%20%23${item.id}%20do%20paciente%20${encodeURIComponent(item.cliente)}%20que%20est%C3%A1%20atrasada.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all ring-2 ring-rose-500/20 shrink-0"
                                  title="Cobrar Laboratório Parceiro via WhatsApp"
                                  aria-label="Cobrar Laboratório Parceiro via WhatsApp"
                                >
                                  <span className="material-symbols-outlined text-[17px]">warning</span>
                                </a>
                              )}

                              {/* Botão de Disparo Dedicado para WhatsApp do Paciente */}
                              <Link
                                id={`link-fila-notificar-whatsapp-${item.id}`}
                                href={`/ordens-de-servico/notificar-whatsapp?id=${item.id}`}
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all ring-2 ring-emerald-500/20 shrink-0"
                                title="Notificar Paciente via WhatsApp"
                                aria-label="Notificar Paciente via WhatsApp"
                              >
                                <span className="material-symbols-outlined text-[18px]">chat</span>
                              </Link>

                              {/* Link para Ficha Completa */}
                              <Link
                                id={`link-fila-ver-ficha-${item.id}`}
                                href={`/ordens-de-servico/detalhes?id=${item.id}`}
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F0F6FC] hover:bg-[#052659] text-[#052659] hover:text-white border border-[#5483B3]/40 hover:border-[#052659] transition-all shadow-2xs hover:shadow-xs active:scale-95 group cursor-pointer shrink-0"
                                title="Ver Ficha Técnica Dióptrica"
                                aria-label="Ver Ficha Técnica Dióptrica"
                              >
                                <span className="material-symbols-outlined text-[17px] text-[#5483B3] group-hover:text-white transition-colors">description</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          /* 2. VISUALIZAÇÃO GAVETAS DE BALCÃO (ACCORDIONS EXPANSÍVEIS) */
          <div className="space-y-4">
            {/* Barra de Ações Rápidas das Gavetas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 px-1 gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[17px] text-[#5483B3]">inventory_2</span>
                <span className="font-semibold text-[#052659]">Gaveteiro de Balcão (4 Estágios Físicos)</span>
                <span className="text-slate-400 hidden sm:inline">•</span>
                <span className="hidden sm:inline">Visualização horizontal ampla sem corte de cards</span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  id="btn-gavetas-expandir-todas"
                  type="button"
                  onClick={expandirTodasGavetas}
                  className="text-xs font-semibold text-[#5483B3] hover:text-[#052659] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">unfold_more</span>
                  <span>Expandir Todas</span>
                </button>
                <span className="text-slate-300">|</span>
                <button
                  id="btn-gavetas-recolher-todas"
                  type="button"
                  onClick={recolherTodasGavetas}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">unfold_less</span>
                  <span>Recolher Todas</span>
                </button>
              </div>
            </div>

            {/* Lista dos 4 Gaveteiros */}
            {colunasKanban.map((col) => {
              const ordensNaColuna = ordensFiltradas.filter((o) => o.statusColuna === col.id);
              const isOpen = gavetasAbertas[col.id] !== false;

              return (
                <div
                  key={col.id}
                  id={`gaveta-secao-${col.id}`}
                  className="bg-[#FFFFFF] border border-[#C1E8FF]/60 rounded-xl overflow-hidden shadow-sm transition-all"
                >
                  {/* Cabeçalho do Gaveteiro (Clicável para Expandir/Recolher) */}
                  <button
                    id={`btn-toggle-gaveta-${col.id}`}
                    type="button"
                    onClick={() => toggleGaveta(col.id)}
                    className="w-full p-4 bg-[#F0F6FC] hover:bg-[#e4effa] border-b border-[#C1E8FF]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${col.cor} shadow-xs shrink-0`}>
                        <span className="material-symbols-outlined text-[18px]">{col.icone}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5483B3] bg-white px-2 py-0.5 rounded border border-[#C1E8FF]/80">
                            {col.gavetaNumero}
                          </span>
                          <h3 className="font-bold text-sm text-[#052659]">{col.titulo}</h3>
                        </div>
                        <p className="text-[11px] text-slate-500 hidden md:block mt-0.5">
                          {col.subtitulo}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${col.badgeCor}`}>
                        {ordensNaColuna.length} {ordensNaColuna.length === 1 ? "pedido" : "pedidos"}
                      </span>
                      <span className="material-symbols-outlined text-[20px] text-[#5483B3] transition-transform duration-200">
                        {isOpen ? "expand_less" : "expand_more"}
                      </span>
                    </div>
                  </button>

                  {/* Conteúdo da Gaveta: Grid Amplo e Responsivo de Cards */}
                  {isOpen && (
                    <div className="p-4 sm:p-5 bg-[#FAFCFF]">
                      {ordensNaColuna.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-1.5">
                          <span className="material-symbols-outlined text-[24px] text-slate-300">inbox</span>
                          <span>Nenhum pedido alocado neste estágio no momento</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                          {ordensNaColuna.map((item) => {
                            const isHighlighted = item.id === osDestacada;
                            return (
                              <div
                                key={item.id}
                                id={`card-fila-gaveta-${item.id}`}
                                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                                  isHighlighted
                                    ? "border-amber-400 bg-amber-50/90 ring-2 ring-amber-300"
                                    : item.statusBadgeTipo === "danger"
                                    ? "border-slate-200 border-l-4 border-l-rose-500 bg-white hover:border-slate-400"
                                    : "border-slate-200 bg-white hover:border-[#052659]"
                                }`}
                              >
                                {/* Topo do Card */}
                                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      id={`link-gaveta-os-${item.id}`}
                                      href={`/ordens-de-servico/detalhes?id=${item.id}`}
                                      className="font-mono font-bold text-xs text-[#052659] hover:text-white bg-[#F0F6FC] hover:bg-[#052659] px-2 py-0.5 rounded-md border border-[#C1E8FF] transition-all inline-flex items-center gap-1 group shadow-2xs"
                                      title="Ver Ficha Técnica"
                                    >
                                      <span className="material-symbols-outlined text-[12px] text-[#5483B3] group-hover:text-white transition-colors">tag</span>
                                      <span>{item.id}</span>
                                    </Link>
                                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                                      {item.prometido}
                                    </span>
                                  </div>
                                  <div className="flex items-center shrink-0">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs ${
                                        item.statusBadgeTipo === "danger"
                                          ? "bg-rose-50 text-rose-800 border-rose-300"
                                          : item.statusBadgeTipo === "warning"
                                          ? "bg-amber-50 text-amber-800 border-amber-300"
                                          : item.statusBadgeTipo === "success"
                                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                          : "bg-[#F0F6FC] text-[#052659] border-[#C1E8FF]"
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                          item.statusBadgeTipo === "danger"
                                            ? "bg-rose-500"
                                            : item.statusBadgeTipo === "warning"
                                            ? "bg-amber-500"
                                            : item.statusBadgeTipo === "success"
                                            ? "bg-emerald-500"
                                            : "bg-[#5483B3]"
                                        }`}
                                      />
                                      <span>{item.statusBadge}</span>
                                    </span>
                                  </div>
                                </div>

                                {/* Dados do Paciente */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-xs text-[#021024]">
                                    <span className="material-symbols-outlined text-[16px] text-[#5483B3] shrink-0">
                                      person
                                    </span>
                                    <span className="font-extrabold text-[#052659] truncate text-[13px]" title={item.cliente}>
                                      {item.cliente}
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-mono text-slate-500 pl-5">
                                    {item.telefone}
                                  </div>
                                </div>

                                {/* Detalhes de Armação, Lente e Laboratório */}
                                <div className="bg-[#F8FAFC] rounded-lg p-2.5 space-y-1 border border-[#F0F6FC] text-xs">
                                  <div className="flex items-start gap-1.5">
                                    <span className="material-symbols-outlined text-[14px] text-[#5483B3] shrink-0 mt-0.5">
                                      eyeglasses
                                    </span>
                                    <span className="font-semibold text-slate-800 line-clamp-1" title={item.armacao}>
                                      {item.armacao}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-600 line-clamp-1 pl-5" title={item.lente}>
                                    {item.lente}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono pl-5 pt-0.5 flex items-center justify-between">
                                    <span>{item.laboratorio}</span>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-[#052659] border border-[#C1E8FF] shadow-2xs">
                                      <span className="material-symbols-outlined text-[12px] text-[#5483B3]">shelves</span>
                                      <span>{item.gaveta}</span>
                                    </span>
                                  </div>
                                </div>

                                {/* Rodapé de Ações de Balcão */}
                                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                    {item.statusBadgeTipo === "danger" ? (
                                      <a
                                        id={`link-gaveta-cobrar-lab-${item.id}`}
                                        href={`https://wa.me/5511987654321?text=Ol%C3%A1%20${encodeURIComponent(item.laboratorio)}!%20Cobran%C3%A7a%20urgente%20da%20OS%20%23${item.id}%20do%20paciente%20${encodeURIComponent(item.cliente)}%20que%20est%C3%A1%20atrasada.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all ring-2 ring-rose-500/20 shrink-0"
                                        title="Cobrar laboratório via WhatsApp"
                                        aria-label="Cobrar laboratório via WhatsApp"
                                      >
                                        <span className="material-symbols-outlined text-[15px]">warning</span>
                                      </a>
                                    ) : (
                                      <span className="text-[11px] font-mono font-bold text-slate-900">
                                        R$ {item.valorTotal.toFixed(2).replace(".", ",")}
                                      </span>
                                    )}

                                    <div className="flex items-center gap-1.5">
                                      <Link
                                        id={`link-gaveta-avisar-${item.id}`}
                                        href={`/ordens-de-servico/notificar-whatsapp?id=${item.id}`}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs hover:shadow-xs active:scale-95 transition-all ring-2 ring-emerald-500/20 shrink-0"
                                        title="Notificar paciente via WhatsApp"
                                        aria-label="Notificar paciente via WhatsApp"
                                      >
                                        <span className="material-symbols-outlined text-[15px]">chat</span>
                                      </Link>
                                      <Link
                                        id={`link-gaveta-ficha-${item.id}`}
                                        href={`/ordens-de-servico/detalhes?id=${item.id}`}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#F0F6FC] hover:bg-[#052659] text-[#052659] hover:text-white border border-[#C1E8FF] hover:border-[#052659] transition-all shadow-2xs group cursor-pointer shrink-0"
                                        title="Ver Ficha Técnica Dióptrica"
                                        aria-label="Ver Ficha Técnica Dióptrica"
                                      >
                                        <span className="material-symbols-outlined text-[15px] text-[#5483B3] group-hover:text-white transition-colors">description</span>
                                      </Link>
                                    </div>
                                  </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FilaLaboratorioPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs text-slate-500">Carregando Fila de Laboratório...</div>}>
      <FilaLaboratorioContent />
    </Suspense>
  );
}

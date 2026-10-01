"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useToast } from "@/components/ToastProvider";

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
    return ordens.filter((o) => {
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
  }, [ordens, filtroColuna, busca, osDestacada]);

  const colunasKanban = [
    { id: "aguardando_lab", titulo: "No Laboratório Externo", cor: "bg-rose-600" },
    { id: "surfacagem", titulo: "Em Produção / Montagem", cor: "bg-[#5483B3]" },
    { id: "controle_qualidade", titulo: "Chegou / Conferir Lensômetro", cor: "bg-indigo-600" },
    { id: "pronto", titulo: "Pronto na Gaveta (Retirada)", cor: "bg-emerald-600" },
  ];

  return (
    <div className="flex-1 bg-[#F0F6FC] min-h-screen pb-20 text-[#021024]">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-[#FFFFFF] border-b border-[#7DA0CA] px-6 lg:px-10 py-4">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-[#5483B3] font-medium">
              <Link id="link-fila-breadcrumb-dashboard" href="/" className="hover:underline flex items-center gap-1 text-[#052659]">
                <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                Dashboard
              </Link>
              <span>/</span>
              <span>Ordens de Serviço</span>
              <span>/</span>
              <span>Central de Pedidos &amp; Balcão</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#052659] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#052659] text-[26px]">storefront</span>
                Central de Pedidos &amp; Acompanhamento de Laboratório
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C1E8FF] text-[#052659] border border-[#7DA0CA]">
                {ordens.length} Pedidos Ativos
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Controle de malotes de laboratórios terceirizados, conferência de chegada e automação de WhatsApp de balcão.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              id="link-fila-nova-os"
              href="/ordens-de-servico"
              className="px-4 py-2 rounded bg-[#052659] hover:bg-[#021024] text-white text-xs font-bold transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              + Nova OS (F2)
            </Link>
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
              className="px-3.5 py-2 rounded text-xs font-semibold bg-[#FFFFFF] border border-[#7DA0CA] text-[#052659] hover:bg-[#F0F6FC] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              Emitir Romaneio de Envio
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Barra de Recepção Rápida de Malote em 1 Bip */}
        <div className="bg-[#FFFFFF] border border-[#C1E8FF]/60 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F0F6FC] border border-[#7DA0CA]/60 flex items-center justify-center text-[#052659] shrink-0">
                <span className="material-symbols-outlined text-[24px]">barcode_scanner</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#052659] uppercase tracking-wide flex items-center gap-1.5">
                  Recepção Rápida de Malote do Laboratório (1 Bip)
                </h3>
                <p className="text-[11px] text-slate-500">
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
                  className="w-full h-9 pl-3 pr-12 rounded border border-[#7DA0CA] text-xs font-mono font-semibold bg-[#F0F6FC] text-[#052659] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#5483B3]"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#7DA0CA]/50">
                  [F4]
                </span>
              </div>
              <button
                id="btn-fila-bipar"
                type="submit"
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                <span>Dar Entrada</span>
              </button>
            </form>
          </div>

          {mensagemSucessoBip && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center justify-between">
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

        {/* Faixa de KPIs Executivos de Loja de Balcão */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#FFFFFF] border border-[#C1E8FF]/60 rounded-xl p-4 space-y-1 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[11px] font-semibold text-[#5483B3] uppercase">No Laboratório Externo</span>
            <div className="text-2xl font-bold font-mono text-[#052659]">6 Pedidos</div>
            <span className="text-[11px] text-slate-500">Essilor (3), Hoya (2), Lab Lux (1)</span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#C1E8FF]/60 rounded-xl p-4 space-y-1 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[11px] font-semibold text-[#5483B3] uppercase">Atrasados pelo Lab</span>
            <div className="text-2xl font-bold font-mono text-red-600">2 Pedidos</div>
            <a
              id="link-fila-kpi-cobrar-lab"
              href="https://wa.me/5511987654321?text=Ol%C3%A1%20Laborat%C3%B3rio!%20Gostaria%20de%20cobrar%20posi%C3%A7%C3%A3o%20urgente%20dos%20pedidos%20em%20atraso%20da%20Fatura%20%C3%93tica."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#B91C1C] border border-red-200 hover:bg-red-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[13px]">warning</span>
              <span>Cobrar Fornecedor via WhatsApp</span>
            </a>
          </div>

          <div className="bg-[#FFFFFF] border border-[#C1E8FF]/60 rounded-xl p-4 space-y-1 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[11px] font-semibold text-[#5483B3] uppercase">Prontos p/ Retirada na Loja</span>
            <div className="text-2xl font-bold font-mono text-emerald-700">4 Pedidos</div>
            <span className="text-[11px] text-slate-500">Gavetas G-01 a G-05</span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#C1E8FF]/60 rounded-xl p-4 space-y-1 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[11px] font-semibold text-[#5483B3] uppercase">Avisos WhatsApp Enviados</span>
            <div className="text-2xl font-bold font-mono text-[#052659]">8 Notificados</div>
            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#F0FDF4] text-[#15803D] border border-emerald-200">
              Taxa de Resposta: 92%
            </span>
          </div>
        </div>

        {/* Barra de Filtros, Pesquisa e Seletor de Modo de Visualização */}
        {/* Barra de Filtros, Pesquisa e Seletor de Modo de Visualização */}
        <div className="bg-[#FFFFFF] border border-[#C1E8FF]/60 rounded-xl p-3.5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3.5 shadow-sm">
          {/* Pills de Filtro de Estágio com rolagem horizontal suave no mobile/tablet */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0 scrollbar-none w-full xl:w-auto shrink-0">
            {[
              { id: "todas", label: `Todos (${ordens.length})` },
              { id: "aguardando_lab", label: "No Lab Externo (4)" },
              { id: "surfacagem", label: "Em Produção (3)" },
              { id: "controle_qualidade", label: "Chegou / Conferir (3)" },
              { id: "pronto", label: "Prontos p/ Retirar (4)" },
            ].map((f) => (
              <button
                key={f.id}
                id={`btn-fila-filtro-${f.id}`}
                type="button"
                onClick={() => setFiltroColuna(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border cursor-pointer shrink-0 ${
                  filtroColuna === f.id
                    ? "bg-[#052659] text-white border-[#052659] shadow-2xs"
                    : "bg-[#FFFFFF] text-[#052659] border-[#C1E8FF]/80 hover:bg-[#F0F6FC]"
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
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#5483B3]">
                  search
                </span>
                <input
                  id="input-fila-pesquisa"
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar OS, cliente, lab:essilor, status:atrasado..."
                  className="w-full h-8.5 pl-8 pr-7 rounded-lg border border-[#C1E8FF]/80 text-xs bg-[#FFFFFF] text-[#021024] focus:border-[#5483B3] focus:ring-2 focus:ring-[#5483B3]/40 transition-all shadow-2xs"
                />
                {busca && (
                  <button
                    id="btn-fila-limpar-busca-icone"
                    type="button"
                    onClick={() => setBusca("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Limpar busca"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                )}
              </div>

              {/* Chips de Atalhos de Busca Rápida */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Atalhos:</span>
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
                    className="px-1.5 py-0.2 rounded bg-[#F0F6FC] hover:bg-[#dce9f8] text-[#052659] border border-[#7DA0CA]/50 font-mono text-[9px] font-semibold transition-colors cursor-pointer"
                  >
                    +{chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alternador de Modo: Tabela vs. Gavetas/Kanban */}
            <div className="flex items-center rounded-lg border border-[#7DA0CA] overflow-hidden bg-[#F0F6FC] shrink-0 self-start sm:self-center">
              <button
                id="btn-fila-view-tabela"
                type="button"
                onClick={() => setModoVisualizacao("tabela")}
                className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  modoVisualizacao === "tabela"
                    ? "bg-[#052659] text-white"
                    : "text-[#052659] hover:bg-[#FFFFFF]"
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
                className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  modoVisualizacao === "kanban"
                    ? "bg-[#052659] text-white"
                    : "text-[#052659] hover:bg-[#FFFFFF]"
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
          <section className="bg-[#FFFFFF] border border-[#C1E8FF]/60 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table id="table-fila-producao" className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F0F6FC] sticky top-0 z-10 border-b border-[#C1E8FF]/80 text-[11px] font-bold text-[#052659] uppercase shadow-2xs">
                    <th className="px-4 py-3">OS &amp; Paciente</th>
                    <th className="px-4 py-3">Armação &amp; Lente</th>
                    <th className="px-4 py-3">Laboratório Parceiro</th>
                    <th className="px-4 py-3">Status &amp; Previsão</th>
                    <th className="px-4 py-3">Gaveta Física</th>
                    <th className="px-4 py-3 text-right">Ações de Balcão (1 Clique)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F6FC]">
                  {ordensFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-slate-500 space-y-2">
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
                              : "hover:bg-[#C1E8FF]/15"
                          }`}
                        >
                          {/* OS & Paciente */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-[#052659] bg-[#F0F6FC] px-1.5 py-0.5 rounded border border-[#7DA0CA]/50">
                                OS #{item.id}
                              </span>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900">{item.cliente}</span>
                                <span className="text-[11px] font-mono text-slate-500">{item.telefone}</span>
                              </div>
                            </div>
                          </td>

                          {/* Armação & Lente */}
                          <td className="px-4 py-3 max-w-[240px]">
                            <div className="truncate font-medium text-slate-800" title={item.armacao}>
                              {item.armacao}
                            </div>
                            <div className="truncate text-[11px] text-slate-500" title={item.lente}>
                              {item.lente}
                            </div>
                          </td>

                          {/* Laboratório Parceiro */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-medium text-slate-700">{item.laboratorio}</span>
                          </td>

                          {/* Status & Previsão */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border w-fit ${
                                  item.statusBadgeTipo === "danger"
                                    ? "bg-[#FEF2F2] text-[#B91C1C] border-[#F87171]"
                                    : item.statusBadgeTipo === "warning"
                                    ? "bg-[#FFFBEB] text-[#B45309] border-[#FCD34D]"
                                    : item.statusBadgeTipo === "info"
                                    ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#93C5FD]"
                                    : "bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]"
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {item.statusBadge}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Previsto: {item.prometido}
                              </span>
                            </div>
                          </td>

                          {/* Gaveta Física */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#F0F6FC] border border-[#7DA0CA]/50 text-[#052659]">
                              {item.gaveta}
                            </span>
                          </td>

                          {/* Ações Rápidas de Balcão */}
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {/* Se OS atrasada, botão de cobrança de laboratório */}
                              {item.statusBadgeTipo === "danger" && (
                                <a
                                  id={`link-fila-cobrar-lab-${item.id}`}
                                  href={`https://wa.me/5511987654321?text=Ol%C3%A1%20${encodeURIComponent(item.laboratorio)}!%20Cobran%C3%A7a%20urgente%20da%20OS%20%23${item.id}%20do%20paciente%20${encodeURIComponent(item.cliente)}%20que%20est%C3%A1%20atrasada.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded text-xs font-bold bg-[#FEF2F2] text-[#B91C1C] border border-[#F87171] hover:bg-red-100 transition-colors inline-flex items-center gap-1"
                                  title="Cobrar Laboratório Parceiro via WhatsApp"
                                >
                                  <span className="material-symbols-outlined text-[14px]">warning</span>
                                  <span>Cobrar Lab</span>
                                </a>
                              )}

                              {/* Botão de Disparo Dedicado para WhatsApp do Paciente */}
                              <Link
                                id={`link-fila-notificar-whatsapp-${item.id}`}
                                href={`/ordens-de-servico/notificar-whatsapp?id=${item.id}`}
                                className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                                title="Abrir tela dedicada de disparo WhatsApp para o paciente"
                              >
                                <span className="material-symbols-outlined text-[14px] text-emerald-600">chat</span>
                                <span>Notificar WhatsApp</span>
                              </Link>

                              {/* Link para Ficha Completa */}
                              <Link
                                id={`link-fila-ver-ficha-${item.id}`}
                                href={`/ordens-de-servico/detalhes?id=${item.id}`}
                                className="px-2 py-1 rounded text-xs font-semibold bg-[#F0F6FC] text-[#052659] border border-[#7DA0CA] hover:bg-[#dce9f8] transition-colors inline-flex items-center gap-0.5"
                                title="Ver ficha técnica dióptrica"
                              >
                                <span>Ficha</span>
                                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
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
          /* 2. VISUALIZAÇÃO KANBAN POR GAVETAS / ESTÁGIOS */
          <div className="flex gap-4 items-start overflow-x-auto pb-6 scroll-smooth">
            {colunasKanban.map((col) => {
              const ordensNaColuna = ordensFiltradas.filter((o) => o.statusColuna === col.id);
              return (
                <div
                  key={col.id}
                  id={`coluna-fila-kanban-${col.id}`}
                  className="w-[290px] sm:w-[320px] xl:w-auto xl:flex-1 shrink-0 bg-[#FFFFFF] border border-[#C1E8FF]/60 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-3 bg-[#F0F6FC] border-b border-[#C1E8FF]/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.cor}`}></span>
                      <h3 className="font-bold text-xs text-[#052659] leading-tight">{col.titulo}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#FFFFFF] border border-[#C1E8FF]/80 text-[#052659]">
                      {ordensNaColuna.length}
                    </span>
                  </div>

                  <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[640px]">
                    {ordensNaColuna.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400">Nenhum pedido nesta gaveta</div>
                    ) : (
                      ordensNaColuna.map((item) => {
                        const isHighlighted = item.id === osDestacada;
                        return (
                          <div
                            key={item.id}
                            id={`card-fila-kanban-${item.id}`}
                            className={`p-3 rounded-xl border transition-all duration-300 space-y-2 group shadow-2xs ${
                              isHighlighted
                                ? "border-amber-400 bg-amber-50/90 ring-2 ring-amber-300 shadow-sm"
                                : "border-[#C1E8FF]/70 bg-[#FFFFFF] hover:border-[#052659] hover:bg-[#F0F6FC]/50 hover:shadow-xs"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-xs text-[#052659] bg-[#F0F6FC] px-1.5 py-0.5 rounded border border-[#C1E8FF]/80 whitespace-nowrap shrink-0">
                                  OS #{item.id}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border truncate max-w-[62%] text-right shrink-0 ${
                                  item.statusBadgeTipo === "danger"
                                    ? "bg-[#FEF2F2] text-[#B91C1C] border-[#F87171]"
                                    : item.statusBadgeTipo === "warning"
                                    ? "bg-[#FFFBEB] text-[#B45309] border-[#FCD34D]"
                                    : item.statusBadgeTipo === "info"
                                    ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#93C5FD]"
                                    : "bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]"
                                }`}
                                title={item.statusBadge}
                              >
                                {item.statusBadge}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-[#021024] min-w-0">
                              <span className="material-symbols-outlined text-[15px] text-[#5483B3] shrink-0">
                                person
                              </span>
                              <span className="font-semibold truncate" title={item.cliente}>
                                {item.cliente}
                              </span>
                            </div>

                            <div className="space-y-0.5 text-xs text-slate-600">
                              <div className="truncate font-medium text-slate-800" title={item.armacao}>
                                {item.armacao}
                              </div>
                              <div className="truncate text-[11px] text-slate-500" title={item.lente}>
                                {item.lente}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-[#F0F6FC] flex items-center justify-between text-[11px]">
                              <span className="font-mono text-slate-500 text-[10px]">{item.gaveta}</span>
                              <div className="flex items-center gap-1.5">
                                <Link
                                  id={`link-fila-kanban-avisar-${item.id}`}
                                  href={`/ordens-de-servico/notificar-whatsapp?id=${item.id}`}
                                  className="text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-0.5"
                                  title="Notificar cliente no WhatsApp"
                                >
                                  <span className="material-symbols-outlined text-[14px]">chat</span>
                                  <span>Avisar</span>
                                </Link>
                                <span className="text-slate-300">•</span>
                                <Link
                                  id={`link-fila-kanban-ficha-${item.id}`}
                                  href={`/ordens-de-servico/detalhes?id=${item.id}`}
                                  className="text-[#5483B3] hover:text-[#052659] font-bold inline-flex items-center gap-0.5"
                                >
                                  <span>Ficha</span>
                                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
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

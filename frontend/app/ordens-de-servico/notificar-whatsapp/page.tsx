"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useMemo, Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import OpticalFrameIcon from "@/components/icons/OpticalFrameIcon";

interface OSWhatsAppDetail {
  id: string;
  cliente: string;
  telefone: string;
  cpf: string;
  armacao: string;
  lente: string;
  laboratorio: string;
  statusOS: string;
  gaveta: string;
  saldoRestante: number;
}

const mockOSDatabase: Record<string, OSWhatsAppDetail> = {
  "10294": {
    id: "10294",
    cliente: "João Silva",
    telefone: "+55 (11) 98765-4321",
    cpf: "128.456.789-00",
    armacao: "Ray-Ban RX5228 Tartaruga 54-18",
    lente: "Varilux Comfort Max Crizal Sapphire",
    laboratorio: "Essilor SP (Surfaçagem Digital)",
    statusOS: "Pronto p/ Retirada",
    gaveta: "Gaveta G-02 (Balcão)",
    saldoRestante: 450.0,
  },
  "10298": {
    id: "10298",
    cliente: "Maria Fernanda Costa",
    telefone: "+55 (11) 97123-4567",
    cpf: "341.892.410-08",
    armacao: "Vogue VO5352 Dourado (Aro Total)",
    lente: "Varilux Comfort Max 1.60 Crizal Sapphire HR",
    laboratorio: "Laboratório Regional Lux",
    statusOS: "Pronto p/ Retirada",
    gaveta: "Gaveta G-01",
    saldoRestante: 320.0,
  },
  "10301": {
    id: "10301",
    cliente: "Carlos Eduardo M.",
    telefone: "+55 (11) 99887-1122",
    cpf: "452.981.304-12",
    armacao: "Oakley OX8156 Holbrook RX Satin Black",
    lente: "Hoya MiYOSMART Poly 1.59 HVLL",
    laboratorio: "Lab Hoya Brasil",
    statusOS: "Atrasado no Lab",
    gaveta: "Em Maloteiro Lab",
    saldoRestante: 0.0,
  },
  "10280": {
    id: "10280",
    cliente: "Amanda Meireles",
    telefone: "+55 (11) 98456-7890",
    cpf: "219.873.402-99",
    armacao: "Vogue VO5352 Dourado Infantil",
    lente: "Hoya MiYOSMART Poly 1.59",
    laboratorio: "Laboratório Regional Lux",
    statusOS: "Pronto p/ Retirada",
    gaveta: "Gaveta G-03 (Lacrado)",
    saldoRestante: 0.0,
  },
  "10312": {
    id: "10312",
    cliente: "Renata Vasconcelos",
    telefone: "+55 (11) 97412-8899",
    cpf: "518.239.104-55",
    armacao: "Prada PR16MV Preto Clássico",
    lente: "Zeiss DriveSafe Single Vision 1.60",
    laboratorio: "Zeiss Lab Express #8841",
    statusOS: "Em Montagem",
    gaveta: "Bancada Montagem 04",
    saldoRestante: 580.0,
  },
};

function WhatsAppNotifierContent() {
  const searchParams = useSearchParams();
  const initialOsParam = searchParams.get("id") || "10294";

  const [activeOsId, setActiveOsId] = useState<string>(
    mockOSDatabase[initialOsParam] ? initialOsParam : "10294"
  );
  const osData = mockOSDatabase[activeOsId] || mockOSDatabase["10294"];

  const [templateSelecionado, setTemplateSelecionado] = useState<
    "pronto" | "atraso" | "pagamento" | "pos_venda"
  >("pronto");
  const [incluirQrCode, setIncluirQrCode] = useState(true);
  const [incluirGarantia, setIncluirGarantia] = useState(true);
  const [incluirGuiaUso, setIncluirGuiaUso] = useState(false);
  const [simularResposta, setSimularResposta] = useState(true);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [textoEditado, setTextoEditado] = useState<string>("");
  const [copiado, setCopiado] = useState(false);

  // Template text generator - Clean Clinical standard without emojis
  const mensagemPadrao = useMemo(() => {
    const nomePrimeiro = osData.cliente.split(" ")[0];
    const armacao = osData.armacao;
    const lente = osData.lente;
    const gaveta = osData.gaveta;

    if (templateSelecionado === "pronto") {
      let msg = `Olá, *${nomePrimeiro}*! Aqui é da *Fatura Ótica (Filial Centro)*.\n\n`;
      msg += `Informamos que seus óculos de grau (*${armacao}* com lentes *${lente}*) passaram pelo controle de qualidade e já estão prontos para retirada no balcão.\n\n`;
      msg += `• Local de Retirada: Rua das Óticas, 450 - Balcão Central\n`;
      msg += `• Horário de Atendimento: Segunda a Sexta até às 19h00\n`;
      msg += `• Ordem de Serviço: #${osData.id} (${gaveta})\n`;
      if (osData.saldoRestante > 0) {
        msg += `• Saldo Pendente: R$ ${osData.saldoRestante.toFixed(2).replace(".", ",")} (Aceitamos PIX ou Cartão em até 6x)\n\n`;
      } else {
        msg += `• Situação Financeira: Quitado\n\n`;
      }
      msg += `Aguardamos sua visita para realizarmos a conferência final e o ajuste anatômico das hastes em seu rosto.`;
      return msg;
    }

    if (templateSelecionado === "atraso") {
      let msg = `Olá, *${nomePrimeiro}*! Aqui é da equipe técnica da *Fatura Ótica (Filial Centro)*.\n\n`;
      msg += `Acompanhamos sua Ordem de Serviço *#${osData.id}* e informamos que suas lentes (*${lente}*) estão em fase final de surfaçagem no laboratório parceiro (${osData.laboratorio}).\n\n`;
      msg += `Para assegurar a máxima precisão dióptrica e aderência à norma ISO, a liberação para retirada foi reprogramada para *amanhã às 16h00*.\n\n`;
      msg += `Assim que o malote der entrada na loja, confirmaremos imediatamente. Permanecemos à disposição para qualquer esclarecimento.`;
      return msg;
    }

    if (templateSelecionado === "pagamento") {
      let msg = `Olá, *${nomePrimeiro}*! Aqui é da *Fatura Ótica (Filial Centro)*.\n\n`;
      msg += `Sua Ordem de Serviço *#${osData.id}* está em etapa de conferência final.\n\n`;
      msg += `Lembramos que o saldo remanescente na entrega é de *R$ ${osData.saldoRestante.toFixed(2).replace(".", ",")}*.\n`;
      msg += `Condições aceitas: PIX, Débito ou Crédito em até 6x sem acréscimo.\n\n`;
      msg += `Aguardamos você para a prova e ajuste personalizado.`;
      return msg;
    }

    // pos_venda
    let msg = `Olá, *${nomePrimeiro}*! Aqui é da *Fatura Ótica*.\n\n`;
    msg += `Faz 7 dias desde a entrega dos seus novos óculos (OS *#${osData.id}*).\n\n`;
    msg += `Gostaríamos de acompanhar a sua adaptação visual com as lentes (*${lente}*).\n\n`;
    msg += `Reiteramos que sua garantia assegura ajustes de plaquetas e parafusos a qualquer momento em nossa loja física. Conte sempre conosco.`;
    return msg;
  }, [osData, templateSelecionado]);

  const mensagemAtiva = modoEdicao && textoEditado ? textoEditado : mensagemPadrao;

  const handleAlternarTemplate = (tmpl: "pronto" | "atraso" | "pagamento" | "pos_venda") => {
    setTemplateSelecionado(tmpl);
    setTextoEditado("");
    setModoEdicao(false);
  };

  const cleanPhone = osData.telefone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensagemAtiva)}`;

  const handleCopiar = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(mensagemAtiva);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  const historicoMensagens = [
    {
      dataHora: "Hoje, 11:22",
      template: "Óculos Pronto para Retirada",
      atendente: "Mariana Souza (Balcão)",
      status: "Entregue e Lido",
      statusTipo: "success",
      telefone: osData.telefone,
    },
    {
      dataHora: "Ontem, 16:40",
      template: "Atualização de Malote Lab",
      atendente: "Sistema Automático",
      status: "Entregue",
      statusTipo: "info",
      telefone: osData.telefone,
    },
    {
      dataHora: "22/10/2026, 14:15",
      template: "Confirmação de Emissão da OS",
      atendente: "João Caixa",
      status: "Entregue e Lido",
      statusTipo: "success",
      telefone: osData.telefone,
    },
  ];

  return (
    <div className="flex-1 bg-[#F0F6FC] min-h-screen pb-20 text-[#021024]">
      {/* 1. CABEÇALHO PADRONIZADO DA TELA */}
      <PageHeader
        id="header-os-notificar-whatsapp"
        icon="chat"
        title="Notificação WhatsApp"
        badge={
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Canal Conectado (API &amp; Web)</span>
          </span>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Fila de Pedidos", href: "/ordens-de-servico/fila", id: "link-notificar-breadcrumb-pedidos" },
          { label: "Notificação WhatsApp" },
          { label: `OS #${osData.id}` },
        ]}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              id="link-notificar-voltar-fila"
              href="/ordens-de-servico/fila"
              className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-xl border border-[#7DA0CA] bg-white hover:bg-[#F0F6FC] text-[#052659] text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#5483B3]">arrow_back</span>
              <span>Voltar para Fila</span>
            </Link>
            <Link
              id="link-notificar-ficha-tecnica"
              href={`/ordens-de-servico/detalhes?id=${osData.id}`}
              className="h-9 px-4 inline-flex items-center gap-1.5 rounded-xl bg-[#052659] text-white hover:bg-[#021024] text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#C1E8FF]">description</span>
              <span>Ficha Técnica Dióptrica</span>
            </Link>
          </div>
        }
      />

      {/* Main Container */}
      <main className="max-w-7xl 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Quick OS Switcher Bar */}
        <div className="bg-white rounded-2xl border border-[#C1E8FF] p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="material-symbols-outlined text-[#5483B3] text-lg">person_search</span>
            <span className="font-bold text-[#052659] uppercase tracking-wider text-[11px]">
              Trocar Ordem de Serviço:
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-500 text-xs hidden sm:inline">
              Alterne rapidamente para auditar dados de outras ordens de balcão
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.values(mockOSDatabase).map((item) => {
              const isSelected = item.id === activeOsId;
              return (
                <button
                  key={item.id}
                  id={`btn-switcher-os-${item.id}`}
                  type="button"
                  onClick={() => {
                    setActiveOsId(item.id);
                    setTextoEditado("");
                    setModoEdicao(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-baseline gap-1.5 shadow-2xs ${
                    isSelected
                      ? "bg-[#052659] text-white ring-2 ring-[#052659]/30 shadow-sm"
                      : "bg-white text-[#052659] border-2 border-[#C1E8FF] hover:border-[#5483B3] hover:bg-[#F0F6FC] active:scale-95"
                  }`}
                >
                  <span className="font-mono text-xs font-bold leading-normal">#{item.id}</span>
                  <span className="text-xs font-bold leading-normal truncate max-w-[110px]">{item.cliente.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Split: Configurações & Visualizador */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================================= */}
          {/* COLUNA ESQUERDA: DADOS CLÍNICOS, TEMPLATES & ANEXOS DIGITAIS (5 COLS) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 space-y-5">
            {/* Card 1: Dossiê Clínico do Paciente */}
            <div className="bg-white border border-[#C1E8FF] rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#5483B3] transition-all duration-200">
              <div className="flex items-start justify-between pb-3.5 border-b border-[#F0F6FC] gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#052659] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                    {osData.cliente
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        id="link-notificar-ficha-tecnica-os"
                        href={`/ordens-de-servico/detalhes?id=${osData.id}`}
                        className="font-mono font-bold text-xs text-[#052659] hover:text-white bg-[#F0F6FC] hover:bg-[#052659] px-2.5 py-1 rounded-lg border border-[#C1E8FF] hover:border-[#052659] transition-all inline-flex items-center gap-1 shadow-2xs group cursor-pointer"
                        title="Ver Ficha Técnica da OS"
                      >
                        <span className="material-symbols-outlined text-[13px] text-[#5483B3] group-hover:text-white transition-colors">tag</span>
                        <span>{osData.id}</span>
                      </Link>
                      <h2 className="text-base font-bold text-[#052659]">{osData.cliente}</h2>
                    </div>
                    <div className="flex items-center gap-2.5 mt-1">
                      <span className="text-xs font-mono text-slate-500 font-semibold">{osData.telefone}</span>
                      <a
                        id="link-notificar-abrir-conversa-direta"
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-300 transition-all shadow-2xs group"
                        title="Abrir chat direto no WhatsApp"
                      >
                        <span className="material-symbols-outlined text-[13px] text-emerald-600 group-hover:text-white transition-colors">chat</span>
                        <span>Chat direto</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${
                      osData.statusOS.includes("Pronto")
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-amber-50 text-amber-800 border-amber-300"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        osData.statusOS.includes("Pronto")
                          ? "bg-emerald-500 ring-2 ring-emerald-200"
                          : "bg-amber-500 ring-2 ring-amber-200"
                      }`}
                    />
                    {osData.statusOS}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#F0F6FC] text-[#052659] border border-[#C1E8FF] shadow-2xs">
                    <span className="material-symbols-outlined text-[13px] text-[#5483B3]">shelves</span>
                    <span>{osData.gaveta}</span>
                  </span>
                </div>
              </div>

              {/* Informações dos Óculos */}
              <div className="mt-3.5 space-y-2.5 text-xs">
                <div className="p-3 bg-[#F0F6FC] rounded-xl border border-[#C1E8FF] flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <OpticalFrameIcon size={18} className="text-[#5483B3] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-[#5483B3] block">Armação</span>
                      <span className="font-semibold text-slate-800 truncate block" title={osData.armacao}>
                        {osData.armacao}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#F0F6FC] rounded-xl border border-[#C1E8FF] flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[#5483B3] text-lg">lens</span>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-[#5483B3] block">Lentes &amp; Tratamentos</span>
                      <span className="font-semibold text-slate-800 truncate block" title={osData.lente}>
                        {osData.lente}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="material-symbols-outlined text-[16px] text-[#5483B3]">account_balance_wallet</span>
                    <span>Condição Financeira:</span>
                  </div>
                  <span
                    className={`font-mono text-sm font-bold ${
                      osData.saldoRestante > 0 ? "text-amber-800" : "text-emerald-800"
                    }`}
                  >
                    {osData.saldoRestante > 0
                      ? `Restante: R$ ${osData.saldoRestante.toFixed(2).replace(".", ",")}`
                      : "Totalmente Quitado (R$ 0,00)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Modelos Oficiais de Mensagem */}
            <div className="bg-white border border-[#C1E8FF] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F6FC]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#052659] text-lg">format_list_bulleted</span>
                  <h3 className="text-xs font-bold text-[#052659] uppercase tracking-wider">
                    Modelos de Mensagem Homologados
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[#052659] bg-[#F0F6FC] border border-[#C1E8FF] px-2 py-0.5 rounded-full">
                  4 padrões
                </span>
              </div>

              <div className="mt-3.5 space-y-2.5">
                {[
                  {
                    id: "pronto" as const,
                    titulo: "Óculos Pronto para Retirada",
                    badge: "Retirada",
                    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300",
                    desc: "Informa que os óculos foram conferidos no lensômetro e estão na gaveta de balcão.",
                    icone: "check_circle",
                  },
                  {
                    id: "atraso" as const,
                    titulo: "Aviso de Reprogramação de Laboratório",
                    badge: "Alerta Lab",
                    badgeColor: "bg-amber-50 text-amber-800 border-amber-300",
                    desc: "Notifica reprogramação de prazo pelo laboratório parceiro com transparência.",
                    icone: "schedule",
                  },
                  {
                    id: "pagamento" as const,
                    titulo: "Lembrete de Saldo e Formas de Pagamento",
                    badge: "Financeiro",
                    badgeColor: "bg-[#F0F6FC] text-[#052659] border-[#C1E8FF]",
                    desc: "Indica saldo remanescente na entrega e opções de parcelamento na maquininha.",
                    icone: "payments",
                  },
                  {
                    id: "pos_venda" as const,
                    titulo: "Acompanhamento Clínico de Adaptação",
                    badge: "Pós-Venda",
                    badgeColor: "bg-[#F0F6FC] text-[#052659] border-[#C1E8FF]",
                    desc: "Verifica conforto visual após 7 dias de uso e oferece ajustes de manutenção.",
                    icone: "verified",
                  },
                ].map((tmpl) => {
                  const isSelected = templateSelecionado === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      id={`btn-notificar-template-${tmpl.id}`}
                      type="button"
                      onClick={() => handleAlternarTemplate(tmpl.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3 group ${
                        isSelected
                          ? "bg-[#F0F6FC] border-[#052659] ring-2 ring-[#052659]/20 shadow-xs"
                          : "bg-white border-[#C1E8FF] hover:bg-[#F0F6FC]/60 hover:border-[#7DA0CA]"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${
                          isSelected
                            ? "bg-[#052659] text-white"
                            : "bg-[#F0F6FC] text-[#5483B3] border border-[#C1E8FF]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[19px]">{tmpl.icone}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs font-bold truncate ${
                              isSelected ? "text-[#052659]" : "text-slate-900"
                            }`}
                          >
                            {tmpl.titulo}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${tmpl.badgeColor}`}
                          >
                            {tmpl.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{tmpl.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card 3: Anexos e Opções Clínicas */}
            <div className="bg-white border border-[#C1E8FF] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F6FC]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#052659] text-lg">attachment</span>
                  <h3 className="text-xs font-bold text-[#052659] uppercase tracking-wider">
                    Anexos Digitais &amp; Certificados
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Controle de Balcão</span>
              </div>

              <div className="mt-3 space-y-2.5">
                <label
                  id="label-toggle-qrcode"
                  className="p-3 rounded-xl border border-[#C1E8FF] bg-[#F0F6FC]/60 hover:bg-[#F0F6FC] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#052659] text-lg">qr_code_2</span>
                    <div>
                      <span className="text-xs font-bold text-[#052659] block">
                        Código de Retirada Rápida
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Identificador para conferência imediata de gaveta no balcão
                      </span>
                    </div>
                  </div>
                  <input
                    id="checkbox-notificar-incluir-qrcode"
                    type="checkbox"
                    checked={incluirQrCode}
                    onChange={(e) => setIncluirQrCode(e.target.checked)}
                    className="w-4 h-4 rounded text-[#052659] focus:ring-[#5483B3] accent-[#052659] cursor-pointer"
                  />
                </label>

                <label
                  id="label-toggle-garantia"
                  className="p-3 rounded-xl border border-[#C1E8FF] bg-[#F0F6FC]/60 hover:bg-[#F0F6FC] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#052659] text-lg">verified_user</span>
                    <div>
                      <span className="text-xs font-bold text-[#052659] block">
                        Certificado Digital de Garantia (12 Meses)
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Anexo do termo de garantia contra defeitos de fabricação
                      </span>
                    </div>
                  </div>
                  <input
                    id="checkbox-notificar-incluir-garantia"
                    type="checkbox"
                    checked={incluirGarantia}
                    onChange={(e) => setIncluirGarantia(e.target.checked)}
                    className="w-4 h-4 rounded text-[#052659] focus:ring-[#5483B3] accent-[#052659] cursor-pointer"
                  />
                </label>

                <label
                  id="label-toggle-guia-uso"
                  className="p-3 rounded-xl border border-[#C1E8FF] bg-[#F0F6FC]/60 hover:bg-[#F0F6FC] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#5483B3] text-lg">menu_book</span>
                    <div>
                      <span className="text-xs font-bold text-[#052659] block">
                        Guia de Conservação &amp; Higienização
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Instruções de lavagem com água fria e uso de microfibra
                      </span>
                    </div>
                  </div>
                  <input
                    id="checkbox-notificar-incluir-guia-uso"
                    type="checkbox"
                    checked={incluirGuiaUso}
                    onChange={(e) => setIncluirGuiaUso(e.target.checked)}
                    className="w-4 h-4 rounded text-[#052659] focus:ring-[#5483B3] accent-[#052659] cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* COLUNA DIREITA: VISUALIZADOR CORPORATIVO & ESTÚDIO DE DISPARO (7 COLS) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white border border-[#C1E8FF] rounded-2xl overflow-hidden shadow-xs">
              {/* Header do Disparador */}
              <div className="bg-[#052659] text-white px-5 py-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-sm text-white border border-white/20 shadow-2xs">
                    FO
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white tracking-wide">
                        Fatura Ótica • Central de Mensageria
                      </span>
                      <span className="material-symbols-outlined text-emerald-400 text-[17px]">
                        verified
                      </span>
                    </div>
                    <span className="text-[11px] text-[#C1E8FF] flex items-center gap-1 font-mono">
                      <span>Canal Oficial de Atendimento • Filial Centro</span>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono text-[#C1E8FF] font-bold">
                    {osData.telefone}
                  </div>
                  <div className="text-[10px] text-[#7DA0CA]">Destinatário da OS #{osData.id}</div>
                </div>
              </div>

              {/* Barra de Modos: Visualizador vs Edição */}
              <div className="bg-[#F0F6FC] px-5 py-2.5 border-b border-[#C1E8FF] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    id="btn-tab-preview-whatsapp"
                    type="button"
                    onClick={() => setModoEdicao(false)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                      !modoEdicao
                        ? "bg-[#052659] text-white shadow-2xs"
                        : "text-[#5483B3] hover:text-[#052659] hover:bg-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span>Visualizador de Mensagem</span>
                  </button>

                  <button
                    id="btn-tab-editar-whatsapp"
                    type="button"
                    onClick={() => {
                      if (!textoEditado) setTextoEditado(mensagemPadrao);
                      setModoEdicao(true);
                    }}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                      modoEdicao
                        ? "bg-[#052659] text-white shadow-2xs"
                        : "text-[#5483B3] hover:text-[#052659] hover:bg-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Personalizar Mensagem</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-toggle-simular-resposta"
                    type="button"
                    onClick={() => setSimularResposta(!simularResposta)}
                    className="text-[11px] font-bold text-[#5483B3] hover:text-[#052659] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {simularResposta ? "chat_bubble" : "chat_bubble_outline"}
                    </span>
                    <span>{simularResposta ? "Ocultar Resposta Simulada" : "Exibir Resposta Simulada"}</span>
                  </button>
                </div>
              </div>

              {/* Modo de Edição Manual */}
              {modoEdicao ? (
                <div className="p-5 bg-white space-y-3 border-b border-[#C1E8FF]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#052659]">
                      Edição do texto antes do acionamento:
                    </span>
                    <button
                      id="btn-restaurar-mensagem-padrao"
                      type="button"
                      onClick={() => {
                        setTextoEditado(mensagemPadrao);
                      }}
                      className="text-[11px] font-bold text-[#5483B3] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">restart_alt</span>
                      <span>Restaurar Mensagem Homologada</span>
                    </button>
                  </div>
                  <textarea
                    id="textarea-notificar-mensagem-custom"
                    rows={8}
                    value={textoEditado || mensagemPadrao}
                    onChange={(e) => setTextoEditado(e.target.value)}
                    className="w-full text-xs font-sans p-3.5 rounded-xl border border-[#C1E8FF] focus:border-[#5483B3] focus:ring-2 focus:ring-[#C1E8FF] text-[#021024] leading-relaxed shadow-2xs"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-[#5483B3]">
                    <span className="font-bold text-[#052659]">Inserir tag rápida:</span>
                    <button
                      type="button"
                      onClick={() => setTextoEditado((prev) => (prev || mensagemPadrao) + " " + osData.cliente)}
                      className="px-2 py-0.5 rounded bg-[#F0F6FC] hover:bg-[#C1E8FF] text-[#052659] font-mono text-[10px] cursor-pointer border border-[#C1E8FF]"
                    >
                      + {osData.cliente}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextoEditado((prev) => (prev || mensagemPadrao) + " #" + osData.id)}
                      className="px-2 py-0.5 rounded bg-[#F0F6FC] hover:bg-[#C1E8FF] text-[#052659] font-mono text-[10px] cursor-pointer border border-[#C1E8FF]"
                    >
                      + #{osData.id}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextoEditado((prev) => (prev || mensagemPadrao) + " (" + osData.gaveta + ")")}
                      className="px-2 py-0.5 rounded bg-[#F0F6FC] hover:bg-[#C1E8FF] text-[#052659] font-mono text-[10px] cursor-pointer border border-[#C1E8FF]"
                    >
                      + {osData.gaveta}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Corpo da Conversa - Estilo Clínico e Neutro */}
              <div className="p-6 bg-[#F8FAFC] min-h-[380px] flex flex-col justify-end space-y-4 border-b border-[#C1E8FF]">
                {/* Data Separator Chip */}
                <div className="flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-white shadow-2xs border border-[#C1E8FF] text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Hoje
                  </span>
                </div>

                {/* 1. Bolha Enviada pela Ótica */}
                <div className="max-w-[92%] sm:max-w-[85%] ml-auto bg-[#E7F5ED] text-[#0F291E] p-4 rounded-2xl rounded-tr-xs shadow-xs border border-emerald-200 space-y-3">
                  <p className="text-xs leading-relaxed whitespace-pre-line font-normal text-slate-900">
                    {mensagemAtiva}
                  </p>

                  {/* Anexos Compactos e Clínicos */}
                  {(incluirQrCode || incluirGarantia || incluirGuiaUso) && (
                    <div className="space-y-1.5 pt-1 border-t border-emerald-200/80">
                      {incluirQrCode && (
                        <div className="p-2 bg-white rounded-lg border border-emerald-200 text-xs flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#052659] text-base">qr_code_2</span>
                            <span className="font-semibold text-slate-800 text-[11px]">
                              Identificador de Retirada: OS #{osData.id} ({osData.gaveta})
                            </span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded bg-[#F0F6FC] text-[#052659] font-mono text-[9px] font-bold border border-[#C1E8FF]">
                            VALIDADO
                          </span>
                        </div>
                      )}

                      {incluirGarantia && (
                        <div className="p-2 bg-white rounded-lg border border-emerald-200 text-xs flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-700 text-base">verified_user</span>
                            <span className="text-slate-800 text-[11px] font-medium">
                              Certificado_Garantia_OS_{osData.id}.pdf (12 Meses)
                            </span>
                          </div>
                          <span className="material-symbols-outlined text-slate-400 text-sm">download</span>
                        </div>
                      )}

                      {incluirGuiaUso && (
                        <div className="p-2 bg-white rounded-lg border border-emerald-200 text-xs flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#5483B3] text-base">menu_book</span>
                            <span className="text-slate-800 text-[11px] font-medium">
                              Manual_Conservacao_e_Limpeza.pdf
                            </span>
                          </div>
                          <span className="material-symbols-outlined text-slate-400 text-sm">download</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp & Confirmação */}
                  <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-500 pt-0.5">
                    <span>11:22</span>
                    <span className="material-symbols-outlined text-[15px] text-[#5483B3] font-bold">
                      done_all
                    </span>
                  </div>
                </div>

                {/* 2. Resposta Simulada do Paciente */}
                {simularResposta && (
                  <div className="max-w-[85%] sm:max-w-[75%] mr-auto bg-white text-slate-900 p-3.5 rounded-2xl rounded-tl-xs shadow-xs border border-slate-200 space-y-1">
                    <p className="text-xs leading-relaxed text-slate-800">
                      Olá! Mensagem recebida. Passarei na loja hoje no final da tarde, por volta das 17h30, para a prova dos óculos e retirada. Obrigado pelo aviso.
                    </p>
                    <div className="flex items-center justify-end text-[10px] text-slate-400">
                      <span>11:24</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Barra de Disparo */}
              <div className="p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <a
                    id="link-notificar-disparar-whatsapp"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1faa53] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 ring-2 ring-emerald-500/30 inline-flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[19px] group-hover:scale-110 transition-transform">
                      send
                    </span>
                    <span>Disparar no WhatsApp</span>
                    <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                  </a>

                  <button
                    id="btn-notificar-copiar-texto"
                    type="button"
                    onClick={handleCopiar}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F0F6FC] text-[#052659] text-xs font-bold border-2 border-[#5483B3] hover:border-[#052659] transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#5483B3]">
                      {copiado ? "check" : "content_copy"}
                    </span>
                    <span>{copiado ? "Copiado!" : "Copiar Texto"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="material-symbols-outlined text-[#052659] text-sm">lock</span>
                  <span className="text-[11px]">Acionamento direto via link oficial wa.me</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SEÇÃO INFERIOR: HISTÓRICO DE MENSAGENS ENVIADAS (PADRÃO CATÁLOGO text-sm) */}
        {/* ========================================================================= */}
        <section className="bg-white border border-[#C1E8FF] rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-[#F0F6FC] border-b border-[#C1E8FF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#052659] text-lg">history</span>
              <h3 className="text-xs font-bold text-[#052659] uppercase tracking-wider">
                Histórico de Mensagens Enviadas para esta OS (#{osData.id})
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#5483B3]">
              {historicoMensagens.length} disparos auditados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table id="table-notificar-historico-disparos" className="w-full text-left text-sm border-collapse">
              <thead className="sticky top-0 z-10 bg-[#F0F6FC] border-b border-[#C1E8FF]">
                <tr className="text-[11px] font-bold text-[#052659] uppercase tracking-wider">
                  <th className="px-4 py-3.5">Data / Hora</th>
                  <th className="px-4 py-3.5">Modelo Disparado</th>
                  <th className="px-4 py-3.5">Destinatário</th>
                  <th className="px-4 py-3.5">Operador</th>
                  <th className="px-4 py-3.5">Status de Entrega</th>
                  <th className="px-4 py-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#021024]">
                {historicoMensagens.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[#C1E8FF]/15 transition-colors duration-150 cursor-default"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-600 font-medium">
                      {item.dataHora}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#052659] text-sm">
                      {item.template}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-[#5483B3] font-semibold">
                      {item.telefone}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 text-sm font-medium">
                      {item.atendente}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <span className="material-symbols-outlined text-[15px] text-[#5483B3] font-bold">
                          done_all
                        </span>
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        id={`btn-historico-reenviar-${idx}`}
                        type="button"
                        onClick={handleCopiar}
                        className="px-3 py-1.5 rounded-xl border border-[#7DA0CA] bg-white hover:bg-[#F0F6FC] text-[#052659] font-bold text-xs inline-flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm text-[#5483B3]">replay</span>
                        <span>Reenviar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function WhatsAppNotifierPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-xs text-slate-500">
          Carregando dados da notificação WhatsApp...
        </div>
      }
    >
      <WhatsAppNotifierContent />
    </Suspense>
  );
}

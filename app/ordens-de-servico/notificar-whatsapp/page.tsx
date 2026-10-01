"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useMemo, Suspense } from "react";

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
  "10294": {
    id: "10294",
    cliente: "João Silva",
    telefone: "+55 (11) 98765-4321",
    cpf: "128.456.789-00",
    armacao: "Ray-Ban RX5228 Tartaruga 54-18",
    lente: "Varilux Comfort Max Crizal Sapphire",
    laboratorio: "Essilor SP (Surfaçagem Digital)",
    statusOS: "Atrasado no Lab",
    gaveta: "Gaveta Transit Lab",
    saldoRestante: 450.0,
  },
  "10301": {
    id: "10301",
    cliente: "Carlos Eduardo M.",
    telefone: "+55 (11) 99887-1122",
    cpf: "452.981.304-12",
    armacao: "Oakley OX8156 Holbrook RX Satin Black",
    lente: "Hoya MiYOSMART Poly 1.59 HVLL",
    laboratorio: "Lab Hoya Brasil",
    statusOS: "Em Trânsito Malote",
    gaveta: "Em Maloteiro",
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
    gaveta: "Gaveta G-02",
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
    statusOS: "Aguardando Lente Lab",
    gaveta: "Bancada Montagem 04",
    saldoRestante: 580.0,
  },
};

function WhatsAppNotifierContent() {
  const searchParams = useSearchParams();
  const osIdParam = searchParams.get("id") || "10298";
  const osData = mockOSDatabase[osIdParam] || mockOSDatabase["10298"];

  const [templateSelecionado, setTemplateSelecionado] = useState<"pronto" | "atraso" | "pagamento" | "pos_venda">("pronto");
  const [incluirQrCode, setIncluirQrCode] = useState(true);
  const [incluirGarantia, setIncluirGarantia] = useState(true);
  const [solicitarConfirmacao, setSolicitarConfirmacao] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Template texts
  const mensagemFormatada = useMemo(() => {
    const nomePrimeiro = osData.cliente.split(" ")[0];
    const armacao = osData.armacao;
    const lente = osData.lente;
    const gaveta = osData.gaveta;

    if (templateSelecionado === "pronto") {
      let msg = `Olá, ${nomePrimeiro}! Boas notícias da Fatura Ótica Filial Centro.\n\n`;
      msg += `Seus novos óculos de grau (Armação ${armacao} com lentes ${lente}) acabaram de passar pelo nosso controle de qualidade e já estão montados e prontinhos na loja!\n\n`;
      msg += `Local de retirada: Rua das Óticas, 450 - Balcão Central\n`;
      msg += `Horário de atendimento hoje: até às 19h00\n`;
      msg += `Identificador da OS: #${osData.id} (${gaveta})\n\n`;
      if (incluirQrCode) {
        msg += `[Código de Retirada Rápida: QR-${osData.id}-OK]\n`;
      }
      if (incluirGarantia) {
        msg += `[Certificado de Autenticidade & Garantia Digital Anexado]\n\n`;
      }
      msg += `Aguardamos você para fazermos o ajuste anatômico perfeito no seu rosto e entregar seu estojo com flanela de microfibra!`;
      return msg;
    }

    if (templateSelecionado === "atraso") {
      let msg = `Olá, ${nomePrimeiro}! Aqui é da equipe técnica da Fatura Ótica Filial Centro.\n\n`;
      msg += `Queremos te manter informado(a) sobre a sua Ordem de Serviço #${osData.id}.\n`;
      msg += `Suas lentes (${lente}) estão passando por um processo especial de tratamento óptico no laboratório para garantir a máxima nitidez e precisão médica.\n\n`;
      msg += `Por conta desse padrão rigoroso de qualidade, a entrega foi reprogramada com prioridade para amanhã até às 16h00.\n\n`;
      msg += `Assim que o malote chegar e for aprovado na nossa bancada, te avisaremos imediatamente por aqui! Qualquer dúvida, estamos à disposição.`;
      return msg;
    }

    if (templateSelecionado === "pagamento") {
      let msg = `Olá, ${nomePrimeiro}! Tudo bem? Aqui é da Fatura Ótica Filial Centro.\n\n`;
      msg += `Seus óculos (OS #${osData.id}) já estão em fase final de preparação!\n`;
      msg += `Lembramos que o saldo restante para retirada é de R$ ${osData.saldoRestante.toFixed(2).replace(".", ",")}.\n\n`;
      msg += `Aceitamos PIX, cartão de crédito em até 6x sem juros ou débito na retirada.\n`;
      msg += `Te esperamos em breve na loja!`;
      return msg;
    }

    // pos_venda
    let msg = `Olá, ${nomePrimeiro}! Tudo bem com você?\n\n`;
    msg += `Faz 7 dias que você retirou seus novos óculos na Fatura Ótica (OS #${osData.id}).\n`;
    msg += `Queremos saber: como está sendo a sua adaptação visual com as novas lentes?\n\n`;
    msg += `Lembrando que nossa garantia cobre ajustes gratuitos de plaquetas, parafusos e hastes sempre que você precisar. Pode passar aqui no balcão a qualquer momento!`;
    return msg;
  }, [osData, templateSelecionado, incluirQrCode, incluirGarantia]);

  // Clean phone number for WhatsApp link
  const cleanPhone = osData.telefone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensagemFormatada)}`;

  const handleCopiar = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(mensagemFormatada);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  const historicoMensagens = [
    {
      dataHora: "Hoje, 11:22",
      template: "Óculos Pronto para Retirada",
      atendente: "João Caixa",
      status: "Entregue e Lido",
      statusTipo: "success",
    },
    {
      dataHora: "22/10/2026, 14:15",
      template: "Confirmação de Emissão da OS",
      atendente: "Sistema Automático",
      status: "Entregue",
      statusTipo: "info",
    },
  ];

  return (
    <div className="flex-1 bg-[#F0F6FC] min-h-screen pb-20 text-[#021024]">
      {/* Top Breadcrumb & Title Bar */}
      <div className="bg-[#FFFFFF] border-b border-[#7DA0CA] px-6 lg:px-10 py-4">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-[#5483B3] font-medium">
              <Link id="link-notificar-breadcrumb-pedidos" href="/ordens-de-servico/fila" className="hover:underline flex items-center gap-1 text-[#052659]">
                <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                Central de Pedidos
              </Link>
              <span>/</span>
              <span>Comunicação &amp; Notificações</span>
              <span>/</span>
              <span>OS #{osData.id}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#052659] flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[26px]">chat</span>
                Comunicação Oficial com o Paciente • WhatsApp
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                WhatsApp Web &amp; API Link
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Disparo rápido de mensagens pré-formatadas para o paciente, com dados dos óculos e instruções de balcão.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              id="link-notificar-voltar-fila"
              href="/ordens-de-servico/fila"
              className="px-3.5 py-2 rounded text-xs font-semibold bg-[#FFFFFF] border border-[#7DA0CA] text-[#052659] hover:bg-[#F0F6FC] transition-colors inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Voltar para Fila de Pedidos
            </Link>
            <Link
              id="link-notificar-ficha-tecnica"
              href={`/ordens-de-servico/detalhes?id=${osData.id}`}
              className="px-3.5 py-2 rounded text-xs font-semibold bg-[#F0F6FC] border border-[#7DA0CA] text-[#052659] hover:bg-[#dce9f8] transition-colors inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">assignment</span>
              Ficha Técnica da OS
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content: 2-Column Split Layout */}
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda: Dados do Paciente & Seleção de Templates (5 Colunas) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Card 1: Dados do Paciente */}
            <div className="bg-[#FFFFFF] border border-[#C1E8FF]/60 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0F6FC]">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#052659] bg-[#F0F6FC] px-2 py-0.5 rounded border border-[#7DA0CA]/60">
                    OS #{osData.id}
                  </span>
                  <span className="text-xs font-bold text-[#021024]">{osData.cliente}</span>
                </div>
                <span className="text-[11px] font-semibold text-[#5483B3] bg-[#C1E8FF]/50 px-2 py-0.5 rounded border border-[#7DA0CA]/50">
                  {osData.gaveta}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Telefone / WhatsApp:</span>
                  <span className="font-mono font-bold text-[#052659] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                    {osData.telefone}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Armação:</span>
                  <span className="font-medium text-[#021024] text-right truncate" title={osData.armacao}>
                    {osData.armacao}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Lentes:</span>
                  <span className="font-medium text-[#021024] text-right truncate" title={osData.lente}>
                    {osData.lente}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F0F6FC]">
                  <span className="text-slate-500">Saldo Restante:</span>
                  <span className={`font-mono font-bold ${osData.saldoRestante > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                    {osData.saldoRestante > 0 ? `R$ ${osData.saldoRestante.toFixed(2).replace(".", ",")}` : "Quitado (R$ 0,00)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Seletor de Modelo de Mensagem */}
            <div className="bg-[#FFFFFF] border border-[#C1E8FF]/60 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0F6FC]">
                <h3 className="text-xs font-bold text-[#052659] uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px] text-[#5483B3]">format_list_bulleted</span>
                  Modelo de Mensagem (Templates)
                </h3>
                <span className="text-[10px] text-slate-400">Clique para alternar</span>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: "pronto",
                    titulo: "Óculos Pronto para Retirada",
                    badge: "Mais Usado",
                    desc: "Avisa que o óculos passou no controle de qualidade e está na loja.",
                    icone: "check_circle",
                  },
                  {
                    id: "atraso",
                    titulo: "Aviso de Atraso do Laboratório",
                    badge: "Atenção",
                    desc: "Informa que o laboratório reprogramou a entrega para amanhã.",
                    icone: "schedule",
                  },
                  {
                    id: "pagamento",
                    titulo: "Lembrete de Pagamento de Saldo",
                    badge: "Financeiro",
                    desc: "Informa o saldo restante que o cliente deve quitar na retirada.",
                    icone: "payments",
                  },
                  {
                    id: "pos_venda",
                    titulo: "Pós-Venda: Ajuste & Satisfação",
                    badge: "7 Dias",
                    desc: "Pergunta como está a adaptação visual e convida para ajuste de haste.",
                    icone: "sentiment_satisfied",
                  },
                ].map((tmpl) => {
                  const isSelected = templateSelecionado === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      id={`btn-notificar-template-${tmpl.id}`}
                      type="button"
                      onClick={() => setTemplateSelecionado(tmpl.id as any)}
                      className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? "bg-[#F0F6FC] border-[#052659] ring-1 ring-[#052659]"
                          : "bg-[#FFFFFF] border-[#7DA0CA]/60 hover:bg-[#F0F6FC]/50"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[19px] mt-0.5 ${isSelected ? "text-[#052659]" : "text-[#5483B3]"}`}>
                        {tmpl.icone}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-bold ${isSelected ? "text-[#052659]" : "text-[#021024]"}`}>
                            {tmpl.titulo}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              tmpl.id === "pronto"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : tmpl.id === "atraso"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-blue-50 text-blue-800 border-blue-200"
                            }`}
                          >
                            {tmpl.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{tmpl.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card 3: Parâmetros do Disparo */}
            <div className="bg-[#FFFFFF] border border-[#C1E8FF]/60 rounded-xl p-4 space-y-2.5 shadow-sm">
              <h3 className="text-xs font-bold text-[#052659] uppercase tracking-wide">
                Opções &amp; Anexos Digitais
              </h3>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    id="checkbox-notificar-incluir-qrcode"
                    type="checkbox"
                    checked={incluirQrCode}
                    onChange={(e) => setIncluirQrCode(e.target.checked)}
                    className="rounded text-[#052659] focus:ring-[#5483B3]"
                  />
                  <span>Incluir Código de Retirada Rápida no Balcão</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    id="checkbox-notificar-incluir-garantia"
                    type="checkbox"
                    checked={incluirGarantia}
                    onChange={(e) => setIncluirGarantia(e.target.checked)}
                    className="rounded text-[#052659] focus:ring-[#5483B3]"
                  />
                  <span>Anexar Certificado de Autenticidade &amp; Garantia</span>
                </label>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Simulador Visual do WhatsApp Web & Ações de Disparo (7 Colunas) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#FFFFFF] border border-[#C1E8FF]/60 rounded-xl overflow-hidden shadow-sm">
              {/* Topo do Chat do WhatsApp */}
              <div className="bg-[#052659] text-white p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#5483B3] flex items-center justify-center font-bold text-xs text-white">
                    FO
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">Fatura Ótica Filial Centro</span>
                      <span className="material-symbols-outlined text-emerald-400 text-[15px]">verified</span>
                    </div>
                    <span className="text-[10px] text-[#7DA0CA] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Canal Comercial de Atendimento
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono text-[#C1E8FF]">{osData.telefone}</span>
                </div>
              </div>

              {/* Corpo da Conversa com Fundo Suave */}
              <div className="p-5 bg-[#efeae2]/60 min-h-[320px] flex flex-col justify-end">
                <div className="max-w-[85%] ml-auto bg-[#d9fdd3] text-[#111b21] p-3.5 rounded-lg rounded-tr-none shadow-xs border border-emerald-200/80 space-y-2">
                  <p className="text-xs leading-relaxed whitespace-pre-line font-normal">
                    {mensagemFormatada}
                  </p>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 pt-1">
                    <span>11:22</span>
                    <span className="material-symbols-outlined text-[14px] text-sky-600">done_all</span>
                  </div>
                </div>
              </div>

              {/* Barra de Ações de Disparo */}
              <div className="p-4 bg-[#FFFFFF] border-t border-[#7DA0CA] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    id="link-notificar-disparar-whatsapp"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#1faa53] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>Disparar no WhatsApp</span>
                    <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                  </a>

                  <button
                    id="btn-notificar-copiar-texto"
                    type="button"
                    onClick={handleCopiar}
                    className="px-3.5 py-2.5 rounded-lg bg-[#F0F6FC] hover:bg-[#dce9f8] text-[#052659] text-xs font-bold border border-[#7DA0CA] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copiado ? "check" : "content_copy"}
                    </span>
                    <span>{copiado ? "Copiado!" : "Copiar Texto"}</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">lock</span>
                  <span>Disparo direto via protocolo wa.me</span>
                </div>
              </div>
            </div>

            {/* Card de Dicas Operacionais para a Loja */}
            <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#C1E8FF]/60 shadow-sm flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#5483B3] text-[20px]">lightbulb</span>
                <span>
                  <strong>Dica de Balcão:</strong> Ao clicar em <em>Disparar no WhatsApp</em>, a conversa abrirá diretamente no WhatsApp Web ou no aplicativo com o texto preenchido, sem necessidade de salvar o número na agenda!
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Histórico de Disparos para Esta OS */}
        <section className="bg-[#FFFFFF] border border-[#C1E8FF]/60 rounded-xl overflow-hidden shadow-sm">
          <div className="p-3.5 bg-[#F0F6FC] border-b border-[#C1E8FF]/80 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#052659] uppercase tracking-wide flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px] text-[#5483B3]">history</span>
              Histórico de Mensagens Enviadas para esta OS (#{osData.id})
            </h3>
            <span className="text-[11px] font-semibold text-[#5483B3]">
              {historicoMensagens.length} disparos registrados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table id="table-notificar-historico-disparos" className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-[#F0F6FC] border-b border-[#C1E8FF]/80">
                <tr className="text-[11px] font-bold text-[#052659] uppercase">
                  <th className="px-4 py-2.5">Data / Hora</th>
                  <th className="px-4 py-2.5">Modelo Disparado</th>
                  <th className="px-4 py-2.5">Destinatário</th>
                  <th className="px-4 py-2.5">Operador</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F6FC]">
                {historicoMensagens.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#C1E8FF]/15 transition-colors duration-150 cursor-default">
                    <td className="px-4 py-3 font-mono font-medium text-slate-600">{item.dataHora}</td>
                    <td className="px-4 py-3 font-semibold text-[#021024]">{item.template}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{osData.telefone}</td>
                    <td className="px-4 py-3 text-slate-600">{item.atendente}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="material-symbols-outlined text-[13px] text-emerald-600">done_all</span>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function WhatsAppNotifierPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs text-slate-500">Carregando dados da notificação...</div>}>
      <WhatsAppNotifierContent />
    </Suspense>
  );
}

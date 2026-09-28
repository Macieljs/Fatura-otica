"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useToast } from "@/components/ToastProvider";

interface OSDetalhe {
  id: string;
  cliente: string;
  cpf: string;
  telefone: string;
  dataAbertura: string;
  prometido: string;
  statusBadge: string;
  statusBadgeTipo: "danger" | "warning" | "info" | "success";
  medico: string;
  crm: string;
  od: { esf: string; cil: string; eixo: string; add: string; dnp: string; altura: string };
  oe: { esf: string; cil: string; eixo: string; add: string; dnp: string; altura: string };
  armacao: string;
  armacaoSku: string;
  armacaoLocal: string;
  lente: string;
  lenteCodigo: string;
  tecnico: string;
  estacao: string;
  valorTotal: number;
}

const mockBancoOS: Record<string, OSDetalhe> = {
  "10294": {
    id: "10294",
    cliente: "João Silva",
    cpf: "192.482.910-44",
    telefone: "(11) 97123-4567",
    dataAbertura: "22/10/2026 10:15",
    prometido: "22/10/2026 18:00 (Atrasado 2 dias)",
    statusBadge: "Atrasado 2 dias • Bancada Prioritária",
    statusBadgeTipo: "danger",
    medico: "Dr. Eduardo F. Silveira",
    crm: "CRM/SP 148.920",
    od: { esf: "+0.75", cil: "-1.00", eixo: "180°", add: "+1.50", dnp: "31.5", altura: "19.0" },
    oe: { esf: "-1.25", cil: "0.00", eixo: "---", add: "+1.50", dnp: "32.0", altura: "19.0" },
    armacao: "Ray-Ban RX5228 Tartaruga 54-18 Acetato",
    armacaoSku: "78985201104",
    armacaoLocal: "Gaveta A-04 • Colmeia 02",
    lente: "Multifocal Varilux Comfort 1.60 Crizal Sapphire HR",
    lenteCodigo: "VAR-COMF-160-CRZ",
    tecnico: "Lucas Mendes (Técnico de Laboratório - CFT-1092)",
    estacao: "Bancada de Biselamento Automático CNC #02",
    valorTotal: 1680.0,
  },
  "10298": {
    id: "10298",
    cliente: "Maria Fernanda Costa",
    cpf: "284.195.830-12",
    telefone: "(11) 98844-2211",
    dataAbertura: "24/10/2026 09:30",
    prometido: "Hoje, 18:00",
    statusBadge: "Montagem Pendente (Hoje)",
    statusBadgeTipo: "info",
    medico: "Dra. Camila Vasconcelos",
    crm: "CRM/SP 192.831",
    od: { esf: "+1.00", cil: "-0.50", eixo: "90°", add: "+2.00", dnp: "30.0", altura: "18.5" },
    oe: { esf: "+0.50", cil: "-0.75", eixo: "85°", add: "+2.00", dnp: "31.0", altura: "18.5" },
    armacao: "Vogue Eyewear VO5352 Dourado Aço",
    armacaoSku: "78985201115",
    armacaoLocal: "Gaveta B-01 • Colmeia 04",
    lente: "Essilor Crizal Sapphire HR 1.67 Antirreflexo",
    lenteCodigo: "ESS-SAPPH-167",
    tecnico: "Lucas Mendes",
    estacao: "Bancada de Montagem Manual",
    valorTotal: 1940.0,
  },
  "10301": {
    id: "10301",
    cliente: "Carlos Eduardo M.",
    cpf: "349.882.110-90",
    telefone: "(11) 99182-3344",
    dataAbertura: "23/10/2026 11:00",
    prometido: "23/10/2026 19:00 (Atrasado 1 dia)",
    statusBadge: "Atrasado 1 dia • Aguardando Alocação",
    statusBadgeTipo: "warning",
    medico: "Dr. Roberto Caldas",
    crm: "CRM/SP 130.412",
    od: { esf: "-2.50", cil: "-1.50", eixo: "15°", add: "---", dnp: "32.0", altura: "---" },
    oe: { esf: "-2.75", cil: "-1.25", eixo: "165°", add: "---", dnp: "32.5", altura: "---" },
    armacao: "Oakley OX8156 Holbrook RX Satin Black",
    armacaoSku: "78985201120",
    armacaoLocal: "Gaveta C-02 • Colmeia 01",
    lente: "Hoya MiYOSMART Poly 1.59 HVLL",
    lenteCodigo: "HY-MIOSMART-159",
    tecnico: "Aguardando Alocação de Bancada",
    estacao: "Fila de Facetamento",
    valorTotal: 1450.0,
  },
  "10312": {
    id: "10312",
    cliente: "Renata Vasconcelos",
    cpf: "410.291.884-55",
    telefone: "(11) 97722-1199",
    dataAbertura: "24/10/2026 08:45",
    prometido: "Previsão 25/10",
    statusBadge: "Aguardando Lente Lab Externo",
    statusBadgeTipo: "warning",
    medico: "Dra. Luciana Pires",
    crm: "CRM/SP 167.890",
    od: { esf: "+2.25", cil: "-0.25", eixo: "180°", add: "+1.75", dnp: "29.5", altura: "20.0" },
    oe: { esf: "+2.00", cil: "0.00", eixo: "---", add: "+1.75", dnp: "30.0", altura: "20.0" },
    armacao: "Prada PR16MV Preto Clássico Acetato",
    armacaoSku: "78985201199",
    armacaoLocal: "Gaveta Especial Luxo",
    lente: "Zeiss DriveSafe Single Vision 1.60",
    lenteCodigo: "ZEISS-DRV-160",
    tecnico: "Pedido Lab Externo #8841",
    estacao: "Em Trânsito para Loja",
    valorTotal: 2480.0,
  },
};

function DetalheOSContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id") || "10294";
  const os = mockBancoOS[idParam] || mockBancoOS["10294"];
  const [apontamentoConcluido, setApontamentoConcluido] = useState(false);
  const [showReceitaModal, setShowReceitaModal] = useState(false);
  const toast = useToast();

  return (
    <div className="flex-1 bg-[#F0F6FC] min-h-screen pb-28 text-[#021024]">
      {/* Top Bar Contextual */}
      <div className="bg-[#FFFFFF] border-b border-[#7DA0CA] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-[#5483B3] font-medium">
              <Link id="link-os-detalhe-voltar-fila" href="/ordens-de-servico/fila" className="hover:underline flex items-center gap-1 text-[#052659]">
                <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                Fila de Laboratório
              </Link>
              <span>/</span>
              <span>OS #{os.id}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#052659]">
                Ordem de Serviço #{os.id} — {os.cliente}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  os.statusBadgeTipo === "danger"
                    ? "bg-[#FEF2F2] text-[#B91C1C] border-[#F87171]"
                    : os.statusBadgeTipo === "warning"
                    ? "bg-[#FFFBEB] text-[#B45309] border-[#FCD34D]"
                    : "bg-[#EFF6FF] text-[#1D4ED8] border-[#93C5FD]"
                }`}
              >
                {os.statusBadge}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span>Criada em: <strong>{os.dataAbertura}</strong></span>
              <span>•</span>
              <span>Promessa de Entrega: <strong className="text-rose-700">{os.prometido}</strong></span>
              <span>•</span>
              <span>CPF: <span className="font-mono">{os.cpf}</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="btn-os-detalhe-imprimir-job-ticket"
              type="button"
              onClick={() =>
                toast.success(`Job Ticket da Bandeja enviado com sucesso para a impressora térmica (OS #${os.id}).`, {
                  title: "Impressão Térmica",
                  icon: "print",
                })
              }
              className="px-3.5 py-2 rounded border border-[#7DA0CA] bg-[#FFFFFF] hover:bg-[#F0F6FC] text-[#052659] text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Job Ticket (Bandeja)
            </button>
            <button
              id="btn-os-detalhe-concluir-montagem"
              type="button"
              onClick={() => {
                setApontamentoConcluido(true);
                toast.success(`Montagem técnica da OS #${os.id} registrada e debitada no Kardex.`, {
                  title: "Apontamento Concluído",
                  icon: "fact_check",
                });
              }}
              className="px-4 py-2 rounded bg-[#052659] hover:bg-[#021024] text-white text-xs font-bold transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Concluir Montagem
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {apontamentoConcluido && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-400 text-emerald-900 flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600 text-2xl">verified</span>
              <div>
                <div className="font-bold text-sm">Montagem Concluída com Sucesso!</div>
                <div className="text-xs text-emerald-700">
                  A OS #{os.id} avançou para a etapa de <strong>Controle de Qualidade (QC) &amp; Lensometria</strong>.
                </div>
              </div>
            </div>
            <Link
              id="link-os-detalhe-sucesso-fila"
              href="/ordens-de-servico/fila"
              className="px-4 py-1.5 rounded bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
            >
              Ver na Fila de Produção
            </Link>
          </div>
        )}

        {/* Grid de 2 Colunas: Prescrição e Materiais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Prescrição Oftalmológica */}
          <section className="bg-[#FFFFFF] border border-[#7DA0CA] rounded-lg p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F6FC]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#5483B3] text-[20px]">visibility</span>
                <h2 className="text-sm font-bold text-[#052659] uppercase tracking-wide">
                  Prescrição Oftalmológica &amp; Matriz Dióptrica
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0F6FC] text-[#052659] border border-[#7DA0CA]">
                Esfero-Cilíndrico (-)
              </span>
            </div>

            {/* Matriz Dióptrica OD / OE */}
            <div className="overflow-x-auto">
              <table id="table-os-detalhe-matriz-dioptrica" className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F0F6FC] text-[#052659] border-b border-[#7DA0CA] text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3 text-left">Olho</th>
                    <th className="py-2.5 px-2">Esférico</th>
                    <th className="py-2.5 px-2">Cilíndrico</th>
                    <th className="py-2.5 px-2">Eixo</th>
                    <th className="py-2.5 px-2">Adição</th>
                    <th className="py-2.5 px-2">DNP</th>
                    <th className="py-2.5 px-2">Altura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] font-mono font-semibold">
                  <tr className="hover:bg-[#F0F6FC]/50">
                    <td className="py-3 px-3 text-left font-sans font-bold text-[#052659]">OD (Direito)</td>
                    <td className="py-3 px-2 text-[#021024]">{os.od.esf} D</td>
                    <td className="py-3 px-2 text-[#052659]">{os.od.cil} D</td>
                    <td className="py-3 px-2 text-[#021024]">{os.od.eixo}</td>
                    <td className="py-3 px-2 text-[#021024]">{os.od.add} D</td>
                    <td className="py-3 px-2 text-slate-700">{os.od.dnp} mm</td>
                    <td className="py-3 px-2 text-slate-700">{os.od.altura} mm</td>
                  </tr>
                  <tr className="hover:bg-[#F0F6FC]/50">
                    <td className="py-3 px-3 text-left font-sans font-bold text-[#5483B3]">OE (Esquerdo)</td>
                    <td className="py-3 px-2 text-[#021024]">{os.oe.esf} D</td>
                    <td className="py-3 px-2 text-[#052659]">{os.oe.cil} D</td>
                    <td className="py-3 px-2 text-slate-400">{os.oe.eixo}</td>
                    <td className="py-3 px-2 text-[#021024]">{os.oe.add} D</td>
                    <td className="py-3 px-2 text-slate-700">{os.oe.dnp} mm</td>
                    <td className="py-3 px-2 text-slate-700">{os.oe.altura} mm</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-[#F0F6FC] flex items-center justify-between text-xs text-slate-600">
              <div>
                Médico Prescritor: <strong className="text-[#052659]">{os.medico}</strong> ({os.crm})
              </div>
              <button
                id="btn-os-detalhe-ver-receita-modal"
                type="button"
                onClick={() => setShowReceitaModal(true)}
                className="text-[#5483B3] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
                Ver Receita Assinada (ICP-Brasil)
              </button>
            </div>
          </section>

          {/* Card 2: Materiais e Componentes Alocados */}
          <section className="bg-[#FFFFFF] border border-[#7DA0CA] rounded-lg p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F6FC]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#5483B3] text-[20px]">inventory_2</span>
                <h2 className="text-sm font-bold text-[#052659] uppercase tracking-wide">
                  Materiais Alocados &amp; Rastreamento de Estoque
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Alocação Física OK
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded border border-[#7DA0CA]/60 bg-[#F0F6FC] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5483B3] block">Armação Vinculada</span>
                  <div className="text-xs font-bold text-[#052659] mt-0.5">{os.armacao}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    SKU {os.armacaoSku} • Local: {os.armacaoLocal}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#93C5FD]">
                  Baixada do Kardex
                </span>
              </div>

              <div className="p-3 rounded border border-[#7DA0CA]/60 bg-[#F0F6FC] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5483B3] block">Bloco de Lentes</span>
                  <div className="text-xs font-bold text-[#052659] mt-0.5">{os.lente}</div>
                  <div className="text-[11px] text-slate-500 font-mono">Código: {os.lenteCodigo}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC]">
                  Surfaçagem Finalizada
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F0F6FC] flex items-center justify-between text-xs text-slate-600">
              <div>
                Técnico: <strong className="text-[#052659]">{os.tecnico}</strong>
              </div>
              <div className="text-[11px] text-slate-500">Posto: {os.estacao}</div>
            </div>
          </section>
        </div>

        {/* Linha do Tempo de Rastreabilidade & Produção */}
        <section className="bg-[#FFFFFF] border border-[#7DA0CA] rounded-lg p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0F6FC]">
            <span className="material-symbols-outlined text-[#5483B3] text-[20px]">timeline</span>
            <h2 className="text-sm font-bold text-[#052659] uppercase tracking-wide">
              Linha do Tempo de Produção na Bancada
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded border border-[#86EFAC] bg-[#F0FDF4]">
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                1. Abertura &amp; Venda
              </div>
              <div className="text-[11px] text-slate-600 mt-1 font-mono">22/10 às 10:15</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Balcão • Atendente Marcos</div>
            </div>

            <div className="p-3 rounded border border-[#86EFAC] bg-[#F0FDF4]">
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                2. Separação de Peças
              </div>
              <div className="text-[11px] text-slate-600 mt-1 font-mono">22/10 às 11:30</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Enviado à Bandeja #14</div>
            </div>

            <div className="p-3 rounded border border-[#86EFAC] bg-[#F0FDF4]">
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                3. Surfaçagem CNC
              </div>
              <div className="text-[11px] text-slate-600 mt-1 font-mono">23/10 às 14:00</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Facetadora Automática OK</div>
            </div>

            <div className="p-3 rounded border border-rose-300 bg-rose-50">
              <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold">
                <span className="material-symbols-outlined text-[16px] text-rose-600">warning</span>
                4. Montagem Final (Gargalo)
              </div>
              <div className="text-[11px] text-rose-700 mt-1 font-mono">24/10 às 16:30</div>
              <div className="text-[10px] text-rose-600 mt-0.5 font-bold">Aguardando Bancada 02</div>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Bottom Bar */}
      <footer className="fixed bottom-0 left-0 md:left-64 right-0 z-30 bg-[#FFFFFF] border-t border-[#7DA0CA] px-6 lg:px-10 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">Valor Total da OS:</span>
            <strong className="text-sm font-bold font-mono text-[#052659]">
              R$ {os.valorTotal.toFixed(2).replace(".", ",")}
            </strong>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Pago no Balcão • NFC-e #88492
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link
              id="link-os-detalhe-footer-voltar-fila"
              href="/ordens-de-servico/fila"
              className="px-4 py-2 rounded border border-[#7DA0CA] text-[#052659] hover:bg-[#F0F6FC] text-xs font-semibold transition-colors"
            >
              Voltar à Fila
            </Link>
            <button
              id="btn-os-detalhe-avancar-qc"
              type="button"
              onClick={() =>
                toast.success(`OS #${os.id} encaminhada com sucesso para a esteira de Controle de Qualidade (CQ).`, {
                  title: "Etapa Concluída",
                  icon: "verified",
                })
              }
              className="px-5 py-2.5 rounded bg-[#052659] hover:bg-[#021024] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Avançar para Controle de Qualidade (F8)
            </button>
          </div>
        </div>
      </footer>

      {/* Modal Visualizador de Receita Assinada ICP-Brasil */}
      {showReceitaModal && (
        <div id="modal-os-detalhe-receita-digital" className="fixed inset-0 z-50 bg-[#021024]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#7DA0CA]/40 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#F0F6FC] border-b border-[#7DA0CA]/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">verified_user</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#052659] flex items-center gap-2">
                    Receita Digital Oftalmológica
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ICP-Brasil Válida
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#5483B3] font-mono">
                    OS #{os.id} • Chave ICP-SP-2026-99214
                  </p>
                </div>
              </div>
              <button
                id="btn-modal-receita-fechar"
                onClick={() => setShowReceitaModal(false)}
                className="text-[#7DA0CA] hover:text-[#052659] p-1 rounded-lg hover:bg-white/80 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-700 text-xl shrink-0 mt-0.5">
                  policy
                </span>
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <strong className="block font-bold">Assinatura Digital ICP-Brasil A3 Válida</strong>
                  Prescrição em conformidade com a MP nº 2.200-2/2001 e CFM nº 2.299/2021. Integridade e autoria verificadas via carimbo de tempo.
                </div>
              </div>

              {/* Dados do Médico e Paciente */}
              <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 rounded-lg p-3.5 bg-slate-50">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Médico Oftalmologista
                  </span>
                  <strong className="text-[#052659] block mt-0.5">{os.medico}</strong>
                  <span className="text-slate-500 font-mono text-[11px]">{os.crm}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Paciente Prescrito
                  </span>
                  <strong className="text-[#052659] block mt-0.5">{os.cliente}</strong>
                  <span className="text-slate-500 font-mono text-[11px]">CPF: {os.cpf}</span>
                </div>
              </div>

              {/* Tabela de Dioptrias Prescritas */}
              <div className="border border-[#7DA0CA]/50 rounded-lg overflow-hidden">
                <table id="table-modal-receita-dioptrias" className="w-full text-center text-xs">
                  <thead className="bg-[#F0F6FC] text-[#052659] font-bold">
                    <tr>
                      <th className="py-2 px-2 text-left">Olho</th>
                      <th className="py-2 px-2">Esférico</th>
                      <th className="py-2 px-2">Cilíndrico</th>
                      <th className="py-2 px-2">Eixo</th>
                      <th className="py-2 px-2">Adição</th>
                      <th className="py-2 px-2">DNP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr>
                      <td className="py-2 px-2 font-bold text-left text-[#052659]">O.D.</td>
                      <td className="py-2 px-2">{os.od.esf}</td>
                      <td className="py-2 px-2">{os.od.cil}</td>
                      <td className="py-2 px-2">{os.od.eixo}</td>
                      <td className="py-2 px-2">{os.od.add}</td>
                      <td className="py-2 px-2">{os.od.dnp} mm</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-bold text-left text-[#052659]">O.E.</td>
                      <td className="py-2 px-2">{os.oe.esf}</td>
                      <td className="py-2 px-2">{os.oe.cil}</td>
                      <td className="py-2 px-2">{os.oe.eixo}</td>
                      <td className="py-2 px-2">{os.oe.add}</td>
                      <td className="py-2 px-2">{os.oe.dnp} mm</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-[10px] text-slate-400 font-mono truncate">
                Hash de Autenticidade: SHA-256: 9e8a7c1f82b49d5c310ea092384ba41ef0021c324
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                id="btn-modal-receita-download-pdf"
                type="button"
                onClick={() => {
                  toast.info("Download do arquivo PDF assinado iniciado...", {
                    title: "Exportando Receita",
                    icon: "download",
                  });
                }}
                className="px-4 py-2 rounded-lg border border-[#7DA0CA] bg-white hover:bg-slate-100 text-[#052659] text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                Baixar PDF Assinado
              </button>
              <button
                id="btn-modal-receita-fechar-rodape"
                type="button"
                onClick={() => setShowReceitaModal(false)}
                className="px-5 py-2 rounded-lg bg-[#052659] hover:bg-[#021024] text-white text-xs font-bold transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DetalheOSPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs text-slate-500">Carregando Ficha da OS...</div>}>
      <DetalheOSContent />
    </Suspense>
  );
}

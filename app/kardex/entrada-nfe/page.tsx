"use client";

import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/components/ToastProvider";

interface ItemNFe {
  id: string;
  codFornecedor: string;
  descricaoNF: string;
  sku: string;
  nomeSistema: string;
  qtdFaturada: number;
  qtdConferida: number;
  custoUnitarioNF: number;
  custoMedioAtual: number;
  saldoAtualEstoque: number;
  statusVinculo: "OK" | "PENDENTE";
}

export default function EntradaNFePage() {
  const toast = useToast();
  const [chaveAcesso, setChaveAcesso] = useState("3526 1000 0000 0001 9155 0010 0004 8921 9845 2031");
  const [sefazConsultado, setSefazConsultado] = useState(true);
  const [confirmadoSucesso, setConfirmadoSucesso] = useState(false);
  const [atualizarCustoMedio, setAtualizarCustoMedio] = useState(true);
  const [gerarContasPagar, setGerarContasPagar] = useState(true);
  const [imprimirEtiquetas, setImprimirEtiquetas] = useState(true);
  const [gaveteiroDestino, setGaveteiroDestino] = useState("Almoxarifado Geral / Gaveteiro A-04");

  const [itens, setItens] = useState<ItemNFe[]>([
    {
      id: "1",
      codFornecedor: "RB-5228-TART",
      descricaoNF: "Armação Ray-Ban RX5228 Tartaruga 54-18-140 Acetato",
      sku: "78985201104",
      nomeSistema: "Ray-Ban RX5228 Clássica Tartaruga",
      qtdFaturada: 10,
      qtdConferida: 10,
      custoUnitarioNF: 410.0,
      custoMedioAtual: 410.0,
      saldoAtualEstoque: 14,
      statusVinculo: "OK",
    },
    {
      id: "2",
      codFornecedor: "HY-MIOSMART-167",
      descricaoNF: "Par Bloco Lente Hoya MiYOSMART Poly 1.59 HVLL Antirreflexo",
      sku: "78985203301",
      nomeSistema: "Lente Hoya MiYOSMART Poly 1.59 HVLL",
      qtdFaturada: 8,
      qtdConferida: 8,
      custoUnitarioNF: 480.0,
      custoMedioAtual: 465.0,
      saldoAtualEstoque: 4,
      statusVinculo: "OK",
    },
    {
      id: "3",
      codFornecedor: "OK-OX8156-BLK",
      descricaoNF: "Armação Oakley OX8156 Holbrook RX Satin Black 56-17",
      sku: "78985201120",
      nomeSistema: "Oakley OX8156 Holbrook RX Satin Black",
      qtdFaturada: 15,
      qtdConferida: 15,
      custoUnitarioNF: 290.0,
      custoMedioAtual: 305.0,
      saldoAtualEstoque: 6,
      statusVinculo: "OK",
    },
    {
      id: "4",
      codFornecedor: "EST-MICRO-LUX",
      descricaoNF: "Estojo Rígido Luxo c/ Flanela Microfibra Personalizada",
      sku: "78985209941",
      nomeSistema: "Estojo Rígido Luxo Microfibra",
      qtdFaturada: 15,
      qtdConferida: 15,
      custoUnitarioNF: 18.0,
      custoMedioAtual: 16.5,
      saldoAtualEstoque: 20,
      statusVinculo: "OK",
    },
  ]);

  const handleQtdConferidaChange = (id: string, val: number) => {
    setItens((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qtdConferida: Math.max(0, val) } : item))
    );
  };

  // Cálculo Custo Médio Ponderado:
  // Novo Custo Médio = ((SaldoAtual * CustoAtual) + (QtdConferida * CustoUnitNF)) / (SaldoAtual + QtdConferida)
  const calcularNovoCustoMedio = (item: ItemNFe) => {
    const totalAtual = item.saldoAtualEstoque * item.custoMedioAtual;
    const totalEntrada = item.qtdConferida * item.custoUnitarioNF;
    const novoSaldo = item.saldoAtualEstoque + item.qtdConferida;
    if (novoSaldo === 0) return item.custoUnitarioNF;
    return (totalAtual + totalEntrada) / novoSaldo;
  };

  const totalFaturadoQtd = itens.reduce((acc, i) => acc + i.qtdFaturada, 0);
  const totalConferidoQtd = itens.reduce((acc, i) => acc + i.qtdConferida, 0);
  const totalValorNF = itens.reduce((acc, i) => acc + i.qtdFaturada * i.custoUnitarioNF, 0);
  const divergencias = itens.filter((i) => i.qtdConferida !== i.qtdFaturada).length;

  return (
    <div className="flex-1 bg-[#F0F6FC] min-h-screen pb-28 text-[#021024]">
      {/* Top Bar Contextual */}
      <div className="bg-[#FFFFFF] border-b border-[#7DA0CA] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-[#5483B3] font-medium">
              <Link id="link-nfe-breadcrumb-kardex" href="/kardex" className="hover:underline flex items-center gap-1 text-[#052659]">
                <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                Kardex
              </Link>
              <span>/</span>
              <span>Entrada de Mercadorias (NF-e)</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#052659]">
                Recebimento e Importação Fiscal de NF-e
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C1E8FF] text-[#052659] border border-[#7DA0CA]">
                Aguardando Conciliação
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Conferência física às cegas, conciliação de itens de fornecedor com catálogo e cálculo automatizado de custo médio ponderado.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SEFAZ / Produção Homologada
            </span>
            <Link
              id="link-nfe-voltar-kardex"
              href="/kardex"
              className="px-3 py-1.5 rounded text-xs font-semibold bg-[#FFFFFF] border border-[#7DA0CA] text-[#052659] hover:bg-[#F0F6FC] transition-colors inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Voltar ao Kardex
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {confirmadoSucesso && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-400 text-emerald-900 flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600 text-2xl">check_circle</span>
              <div>
                <div className="font-bold text-sm">Entrada Fiscal Homologada com Sucesso no Kardex!</div>
                <div className="text-xs text-emerald-700">
                  48 unidades integradas ao saldo físico. Custo médio recalculado e títulos provisórios emitidos no Financeiro.
                </div>
              </div>
            </div>
            <Link
              id="link-nfe-sucesso-ir-kardex"
              href="/kardex"
              className="px-4 py-1.5 rounded bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
            >
              Ir para o Kardex
            </Link>
          </div>
        )}

        {/* Card 1: Importação e Metadados da NF-e */}
        <section className="bg-[#FFFFFF] border border-[#7DA0CA] rounded-lg p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#F0F6FC]">
            <div className="flex-1 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#052659]">
                Chave de Acesso da NF-e (44 Dígitos)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#5483B3]">
                    qr_code_scanner
                  </span>
                  <input
                    id="input-nfe-chave-acesso"
                    type="text"
                    value={chaveAcesso}
                    onChange={(e) => setChaveAcesso(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 rounded border border-[#7DA0CA] font-mono text-xs md:text-sm text-[#021024] bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#5483B3]"
                    placeholder="Cole a chave de 44 dígitos..."
                  />
                </div>
                <button
                  id="btn-nfe-consultar-sefaz"
                  type="button"
                  onClick={() => setSefazConsultado(true)}
                  className="h-10 px-4 rounded bg-[#052659] text-white text-xs font-semibold hover:bg-[#021024] transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span className="material-symbols-outlined text-[17px]">sync</span>
                  Consultar SEFAZ
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:border-l lg:border-[#7DA0CA] lg:pl-6 pt-2 lg:pt-0">
              <span className="text-xs text-slate-400 font-semibold uppercase">OU</span>
              <button
                id="btn-nfe-upload-xml"
                type="button"
                className="h-10 px-4 rounded border border-dashed border-[#7DA0CA] bg-[#F0F6FC] text-[#052659] hover:bg-[#e4effa] text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px] text-[#5483B3]">upload_file</span>
                Carregar Arquivo XML (.xml)
              </button>
            </div>
          </div>

          {/* Grid de Metadados da Nota */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            <div className="p-3 rounded bg-[#F0F6FC] border border-[#7DA0CA]/50">
              <span className="text-[11px] font-semibold text-[#5483B3] uppercase">Número da Nota</span>
              <div className="text-sm font-bold text-[#052659] mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#052659]">receipt</span>
                NF-e 004.892 — Série 1
              </div>
            </div>

            <div className="p-3 rounded bg-[#F0F6FC] border border-[#7DA0CA]/50">
              <span className="text-[11px] font-semibold text-[#5483B3] uppercase">Fornecedor / Emitente</span>
              <div className="text-sm font-bold text-[#021024] mt-0.5 truncate" title="Luxottica Brasil Ltda">
                Luxottica Brasil Ltda
              </div>
              <span className="text-[10px] text-slate-500 font-mono">CNPJ 00.485.291/0001-92</span>
            </div>

            <div className="p-3 rounded bg-[#F0F6FC] border border-[#7DA0CA]/50">
              <span className="text-[11px] font-semibold text-[#5483B3] uppercase">Natureza da Operação</span>
              <div className="text-sm font-bold text-[#021024] mt-0.5">Revenda (CFOP 5.102)</div>
              <span className="text-[10px] text-slate-500">Emissão: 24/10/2026 09:30</span>
            </div>

            <div className="p-3 rounded bg-[#F0F6FC] border border-[#7DA0CA]/50">
              <span className="text-[11px] font-semibold text-[#5483B3] uppercase">Valor Total Faturado</span>
              <div className="text-base font-bold font-mono text-[#052659] mt-0.5">
                R$ {totalValorNF.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-emerald-700 font-medium">Tributos Destacados: R$ 1.620,00</span>
            </div>
          </div>
        </section>

        {/* Card 2: Matriz de Conciliação de Itens */}
        <section className="bg-[#FFFFFF] border border-[#7DA0CA] rounded-lg overflow-hidden shadow-xs">
          <div className="p-4 bg-[#F0F6FC] border-b border-[#7DA0CA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#052659] text-[20px]">checklist</span>
              <h2 className="text-sm font-bold text-[#052659] uppercase tracking-wide">
                Conferência Física &amp; Conciliação com Catálogo Óptico ({itens.length} itens)
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-medium">Status de Divergências:</span>
              {divergencias === 0 ? (
                <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                  0 divergências encontradas
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  {divergencias} item(ns) com divergência física
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table id="table-nfe-conciliacao-itens" className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F0F6FC] text-[#052659] border-b border-[#7DA0CA] text-[11px] font-bold uppercase tracking-wider select-none">
                  <th className="px-4 py-3 whitespace-nowrap">Cód. Fornecedor</th>
                  <th className="px-4 py-3 whitespace-nowrap min-w-[220px]">Descrição na NF-e</th>
                  <th className="px-4 py-3 whitespace-nowrap min-w-[200px]">SKU no Fatura Ótica</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Qtd. NF</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap min-w-[130px]">Qtd. Conferida</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Custo NF</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Custo Atual</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap min-w-[140px]">Novo Custo Médio</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Vínculo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#021024]">
                {itens.map((item) => {
                  const isEquil = item.qtdConferida === item.qtdFaturada;
                  const novoCusto = calcularNovoCustoMedio(item);
                  return (
                    <tr key={item.id} className="hover:bg-[#C1E8FF]/20 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                        {item.codFornecedor}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#052659]">{item.descricaoNF}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-slate-600 font-medium">{item.sku}</div>
                        <div className="text-[11px] text-[#5483B3] font-medium">{item.nomeSistema}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-semibold whitespace-nowrap">
                        {item.qtdFaturada} un
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 border border-[#7DA0CA] rounded bg-[#FFFFFF] px-1.5 py-0.5">
                          <input
                            id={`input-nfe-qtd-conferida-${item.id}`}
                            type="number"
                            value={item.qtdConferida}
                            onChange={(e) => handleQtdConferidaChange(item.id, Number(e.target.value))}
                            className="w-12 text-center font-mono font-bold text-xs bg-transparent border-0 p-0 focus:ring-0 text-[#052659]"
                            min={0}
                          />
                          <span className="text-[10px] text-slate-500 font-mono">un</span>
                          {isEquil ? (
                            <span className="material-symbols-outlined text-emerald-600 text-[16px]" title="Conferido e igual">
                              check_circle
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-rose-600 text-[16px]" title="Divergência de conferência">
                              warning
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium whitespace-nowrap">
                        R$ {item.custoUnitarioNF.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                        R$ {item.custoMedioAtual.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-[#052659] bg-[#F0F6FC]/60 whitespace-nowrap">
                        R$ {novoCusto.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0FDF4] text-[#15803D] border border-emerald-300">
                          {item.statusVinculo}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Card 3: Regras de Lançamento e Configurações de Almoxarifado */}
        <section className="bg-[#FFFFFF] border border-[#7DA0CA] rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold text-[#052659] uppercase tracking-wide flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[17px] text-[#5483B3]">tune</span>
            Parâmetros de Atualização de Estoque &amp; Financeiro
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-start gap-2.5 p-3 rounded border border-[#7DA0CA]/50 bg-[#F0F6FC] cursor-pointer">
              <input
                id="checkbox-nfe-recalcular-custo"
                type="checkbox"
                checked={atualizarCustoMedio}
                onChange={(e) => setAtualizarCustoMedio(e.target.checked)}
                className="mt-0.5 rounded border-[#7DA0CA] text-[#052659] focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-bold text-[#052659] block">Recalcular Custo Médio</span>
                <span className="text-[11px] text-slate-600">Atualiza automaticamente o valor no livro Kardex auditável.</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded border border-[#7DA0CA]/50 bg-[#F0F6FC] cursor-pointer">
              <input
                id="checkbox-nfe-gerar-contas-pagar"
                type="checkbox"
                checked={gerarContasPagar}
                onChange={(e) => setGerarContasPagar(e.target.checked)}
                className="mt-0.5 rounded border-[#7DA0CA] text-[#052659] focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-bold text-[#052659] block">Gerar Contas a Pagar</span>
                <span className="text-[11px] text-slate-600">Cria títulos financeiros nos prazos acordados com o fornecedor.</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded border border-[#7DA0CA]/50 bg-[#F0F6FC] cursor-pointer">
              <input
                id="checkbox-nfe-imprimir-etiquetas"
                type="checkbox"
                checked={imprimirEtiquetas}
                onChange={(e) => setImprimirEtiquetas(e.target.checked)}
                className="mt-0.5 rounded border-[#7DA0CA] text-[#052659] focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-bold text-[#052659] block">Imprimir Etiquetas Térmicas</span>
                <span className="text-[11px] text-slate-600">Gera fila de impressão para 48 etiquetas Code-128.</span>
              </div>
            </label>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs font-semibold text-[#052659] whitespace-nowrap">Localização de Destino:</span>
            <select
              id="select-nfe-gaveteiro-destino"
              value={gaveteiroDestino}
              onChange={(e) => setGaveteiroDestino(e.target.value)}
              className="h-9 px-3 rounded border border-[#7DA0CA] bg-[#FFFFFF] text-xs font-medium text-[#021024] focus:outline-none focus:ring-1 focus:ring-[#5483B3]"
            >
              <option value="Almoxarifado Geral / Gaveteiro A-04">Almoxarifado Geral / Gaveteiro A-04</option>
              <option value="Balcão Frente de Loja / Expositor Vitrine">Balcão Frente de Loja / Expositor Vitrine</option>
              <option value="Laboratório de Surfaçagem / Gaveta Lentes">Laboratório de Surfaçagem / Gaveta Lentes</option>
            </select>
          </div>
        </section>
      </div>

      {/* Sticky Action Footer */}
      <footer className="fixed bottom-0 left-0 md:left-64 right-0 z-30 bg-[#FFFFFF] border-t border-[#7DA0CA] px-6 lg:px-10 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
            <div>
              <span className="text-slate-400">Total Faturado:</span>{" "}
              <strong className="text-[#052659] font-mono">{totalFaturadoQtd} un</strong>
            </div>
            <span>•</span>
            <div>
              <span className="text-slate-400">Total Conferido:</span>{" "}
              <strong className="text-emerald-700 font-mono">{totalConferidoQtd} un</strong>
            </div>
            <span>•</span>
            <div>
              <span className="text-slate-400">Valor Total da Nota:</span>{" "}
              <strong className="text-[#052659] font-mono text-sm">
                R$ {totalValorNF.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link
              id="link-nfe-cancelar"
              href="/kardex"
              className="px-4 py-2 rounded border border-[#7DA0CA] text-[#052659] hover:bg-[#F0F6FC] text-xs font-semibold transition-colors"
            >
              Cancelar
            </Link>
            <button
              id="btn-nfe-salvar-rascunho"
              type="button"
              onClick={() =>
                toast.success("Rascunho de conferência de NF-e salvo localmente com sucesso.", {
                  title: "Rascunho Salvo",
                  icon: "save",
                })
              }
              className="px-4 py-2 rounded bg-[#C1E8FF] text-[#052659] hover:bg-[#a9daf8] text-xs font-semibold transition-colors"
            >
              Salvar Rascunho
            </button>
            <button
              id="btn-nfe-confirmar-entrada"
              type="button"
              onClick={() => {
                setConfirmadoSucesso(true);
                toast.success(
                  "Entrada da NF-e confirmada com sucesso! Saldos e custos médios atualizados no Kardex.",
                  {
                    title: "NF-e Lançada",
                    icon: "verified",
                  }
                );
              }}
              className="px-5 py-2.5 rounded bg-[#052659] hover:bg-[#021024] text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[17px]">inventory</span>
              Confirmar Entrada &amp; Atualizar Custos (F8)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOperator } from "@/hooks/useOperator";
import { useToast } from "@/components/ToastProvider";
import PageHeader from "@/components/PageHeader";

interface SugestaoItem {
  id: string;
  sku: string;
  descricao: string;
  detalhe: string;
  categoria: "armacao" | "lente" | "insumo";
  fornecedor: string;
  saldoAtual: number;
  estoqueMinimo: number;
  giro30D: number;
  qtdSugerida: number;
  custoUnitario: number;
  urgencia: "critico" | "atencao" | "normal";
  urgenciaLabel: string;
  selected: boolean;
}

export default function SugestoesCompraPage() {
  const router = useRouter();
  const { isManager, isLoaded } = useOperator();
  const toast = useToast();

  useEffect(() => {
    if (isLoaded && !isManager) {
      router.replace("/kardex");
    }
  }, [isLoaded, isManager, router]);

  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [busca, setBusca] = useState<string>("");
  const [pedidosGeradosSucesso, setPedidosGeradosSucesso] = useState(false);

  // Estado do Modal de Parâmetros de Reposição
  const [itemParaAjuste, setItemParaAjuste] = useState<SugestaoItem | null>(null);
  const [formEstoqueMin, setFormEstoqueMin] = useState<number>(0);
  const [formQtdSugerida, setFormQtdSugerida] = useState<number>(0);
  const [formLeadTime, setFormLeadTime] = useState<number>(5);

  const abrirAjuste = (item: SugestaoItem) => {
    setItemParaAjuste(item);
    setFormEstoqueMin(item.estoqueMinimo);
    setFormQtdSugerida(item.qtdSugerida);
    setFormLeadTime(item.categoria === "lente" ? 7 : item.categoria === "armacao" ? 10 : 3);
  };

  const salvarAjuste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemParaAjuste) return;
    setItens((prev) =>
      prev.map((it) =>
        it.id === itemParaAjuste.id
          ? { ...it, estoqueMinimo: formEstoqueMin, qtdSugerida: formQtdSugerida }
          : it
      )
    );
    toast.success(
      `Parâmetros de ${itemParaAjuste.descricao} atualizados com sucesso (Min: ${formEstoqueMin} un, Pedido: ${formQtdSugerida} un).`,
      { title: "Parâmetros Atualizados", icon: "tune" }
    );
    setItemParaAjuste(null);
  };

  const [itens, setItens] = useState<SugestaoItem[]>([
    {
      id: "1",
      sku: "78985203301",
      descricao: "Lente Hoya MiYOSMART Poly 1.59 HVLL",
      detalhe: "Tratamento Antirreflexo Avançado • Lente Oftálmica Premium",
      categoria: "lente",
      fornecedor: "Hoya Vision Care Brasil",
      saldoAtual: 1,
      estoqueMinimo: 6,
      giro30D: 12,
      qtdSugerida: 8,
      custoUnitario: 472.5,
      urgencia: "critico",
      urgenciaLabel: "Crítico / Ruptura",
      selected: true,
    },
    {
      id: "2",
      sku: "78985201104",
      descricao: "Armação Ray-Ban RX5228 Tartaruga 54-18",
      detalhe: "Acetato Premium • Modelo Clássico Unissex",
      categoria: "armacao",
      fornecedor: "Luxottica Brasil Ltda",
      saldoAtual: 3,
      estoqueMinimo: 5,
      giro30D: 8,
      qtdSugerida: 10,
      custoUnitario: 410.0,
      urgencia: "atencao",
      urgenciaLabel: "Atenção / Ponto Pedido",
      selected: true,
    },
    {
      id: "3",
      sku: "78985204412",
      descricao: "Lente Essilor Crizal Sapphire 1.67 Antirreflexo",
      detalhe: "Índice Alto 1.67 • Bloqueio UV & Luz Azul",
      categoria: "lente",
      fornecedor: "EssilorLuxottica Brasil",
      saldoAtual: 0,
      estoqueMinimo: 4,
      giro30D: 10,
      qtdSugerida: 6,
      custoUnitario: 520.0,
      urgencia: "critico",
      urgenciaLabel: "Esgotado / Balcão Zero",
      selected: true,
    },
    {
      id: "4",
      sku: "78985201120",
      descricao: "Armação Oakley OX8156 Holbrook RX Satin Black",
      detalhe: "O-Matter Performance • Receituário Esportivo Masculino",
      categoria: "armacao",
      fornecedor: "Luxottica Brasil Ltda",
      saldoAtual: 2,
      estoqueMinimo: 6,
      giro30D: 9,
      qtdSugerida: 10,
      custoUnitario: 297.5,
      urgencia: "atencao",
      urgenciaLabel: "Atenção / Giro Alto",
      selected: true,
    },
    {
      id: "5",
      sku: "78985209941",
      descricao: "Estojo Rígido Luxo Microfibra",
      detalhe: "Insumo Balcão • Acompanha Flanela Antirrisco",
      categoria: "insumo",
      fornecedor: "Fornecedor Central Óptico",
      saldoAtual: 8,
      estoqueMinimo: 20,
      giro30D: 35,
      qtdSugerida: 50,
      custoUnitario: 17.25,
      urgencia: "normal",
      urgenciaLabel: "Normal / Reposição",
      selected: true,
    },
  ]);

  const toggleSelectAll = (checked: boolean) => {
    setItens((prev) => prev.map((item) => ({ ...item, selected: checked })));
  };

  const toggleItem = (id: string) => {
    setItens((prev) => prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)));
  };

  const handleQtdChange = (id: string, val: number) => {
    setItens((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qtdSugerida: Math.max(1, val) } : item))
    );
  };

  const itensFiltrados = itens.filter((item) => {
    if (filtroCategoria === "criticos" && item.urgencia !== "critico") return false;
    if (filtroCategoria === "armacoes" && item.categoria !== "armacao") return false;
    if (filtroCategoria === "lentes" && item.categoria !== "lente") return false;
    if (filtroCategoria === "insumos" && item.categoria !== "insumo") return false;
    if (busca.trim()) {
      const q = busca.toLowerCase();
      return (
        item.sku.includes(q) ||
        item.descricao.toLowerCase().includes(q) ||
        item.fornecedor.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selecionados = itens.filter((i) => i.selected);
  const totalItensSelecionados = selecionados.length;
  const totalUnidadesSelecionadas = selecionados.reduce((acc, i) => acc + i.qtdSugerida, 0);
  const valorTotalInvestimento = selecionados.reduce((acc, i) => acc + i.qtdSugerida * i.custoUnitario, 0);

  if (!isLoaded || !isManager) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-xs text-[#5483B3] font-mono">
          <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
          <span>Acesso exclusivo ao Gerente. Redirecionando para o Kardex...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F0F6FC] min-h-screen pb-28 text-[#021024]">
      {/* 1. CABEÇALHO PADRONIZADO DA TELA */}
      <PageHeader
        id="header-sugestoes-compra"
        icon="shopping_cart"
        title="Sugestões de Compra"
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C1E8FF] text-[#052659] border border-[#7DA0CA]">
            Lote #REP-2026-W43 • 5 Fornecedores
          </span>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Kardex", href: "/kardex", id: "link-sugestoes-breadcrumb-kardex" },
          { label: "Sugestões de Compra" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Reposição Ativa
            </span>
            <Link
              id="link-sugestoes-voltar-kardex"
              href="/kardex"
              className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-xl text-xs font-bold border border-[#7DA0CA] text-[#052659] hover:bg-[#F0F6FC] bg-white transition-all shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#5483B3]">arrow_back</span>
              <span>Voltar ao Kardex</span>
            </Link>
          </div>
        }
      />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {pedidosGeradosSucesso && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-400 text-emerald-900 flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600 text-2xl">local_shipping</span>
              <div>
                <div className="font-bold text-sm">
                  {totalItensSelecionados} Ordens de Compra Geradas com Sucesso!
                </div>
                <div className="text-xs text-emerald-700">
                  {totalUnidadesSelecionadas} unidades despachadas para cotação e envio automático aos respectivos fornecedores ópticos.
                </div>
              </div>
            </div>
            <Link
              id="link-sugestoes-sucesso-ir-kardex"
              href="/kardex"
              className="px-4 py-1.5 rounded bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
            >
              Ir para o Kardex
            </Link>
          </div>
        )}

        {/* Faixa de KPIs Executivos de Reposição (Padrão Kardex/Dashboard) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white border border-rose-200 hover:border-rose-300 rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-3 group">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                SKUs em Ruptura Crítica
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[18px]">emergency</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-rose-700 tracking-tight leading-none">7</span>
                <span className="text-xs sm:text-sm font-sans font-semibold text-rose-600 leading-none">itens</span>
              </div>
            </div>
            <div className="pt-2 border-t border-rose-100 flex items-center gap-1.5 text-xs text-rose-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Estoque Zero ou Abaixo do Mínimo</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-amber-200 hover:border-amber-300 rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-3 group">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                Itens em Ponto de Pedido
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-800 tracking-tight leading-none">18</span>
                <span className="text-xs sm:text-sm font-sans font-semibold text-amber-700 leading-none">itens</span>
              </div>
            </div>
            <div className="pt-2 border-t border-amber-100 flex items-center gap-1.5 text-xs text-amber-800 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Giro Acelerado Últimos 30 Dias</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#C1E8FF] hover:border-[#5483B3] rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-3 group">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold text-[#5483B3] uppercase tracking-wider">
                Investimento Total Sugerido
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#F0F6FC] text-[#5483B3] border border-[#C1E8FF] flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-[#052659] tracking-tight leading-none">R$ 28.450,00</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="material-symbols-outlined text-[15px] text-[#5483B3]">percent</span>
              <span>Custo Médio Negociado em Lote</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-[#C1E8FF] hover:border-[#5483B3] rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-3 group">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold text-[#5483B3] uppercase tracking-wider">
                Lead Time Médio
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#F0F6FC] text-[#5483B3] border border-[#C1E8FF] flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-[#052659] tracking-tight leading-none">3.8</span>
                <span className="text-xs sm:text-sm font-sans font-semibold text-[#5483B3] leading-none">dias</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
              <span>Fornecedores nacionais &amp; surfaçagem</span>
            </div>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="bg-[#FFFFFF] border border-[#7DA0CA] rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
            {[
              { id: "todos", label: "Todos os Fornecedores (5)" },
              { id: "criticos", label: "Apenas Críticos (2)" },
              { id: "armacoes", label: "Armações (2)" },
              { id: "lentes", label: "Lentes Oftálmicas (2)" },
              { id: "insumos", label: "Insumos & Estojos (1)" },
            ].map((f) => (
              <button
                key={f.id}
                id={`tab-sugestoes-filtro-${f.id}`}
                type="button"
                onClick={() => setFiltroCategoria(f.id)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors border ${
                  filtroCategoria === f.id
                    ? "bg-[#052659] text-white border-[#052659]"
                    : "bg-[#FFFFFF] text-[#052659] border-[#7DA0CA] hover:bg-[#F0F6FC]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#5483B3]">
                search
              </span>
              <input
                id="input-sugestoes-busca"
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por SKU, Fornecedor ou Nome..."
                className="w-full h-8 pl-8 pr-2.5 rounded border border-[#7DA0CA] text-xs bg-[#FFFFFF] text-[#021024] focus:outline-none focus:ring-1 focus:ring-[#5483B3]"
              />
            </div>
            <button
              id="btn-sugestoes-exportar-previa"
              type="button"
              onClick={() =>
                toast.success("Exportação de prévia de pedidos gerada com sucesso (XLSX).", {
                  title: "Exportação Concluída",
                  icon: "table_view",
                })
              }
              className="h-8 px-3 rounded border border-[#7DA0CA] bg-[#FFFFFF] hover:bg-[#F0F6FC] text-[#052659] text-xs font-semibold transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              Exportar Prévia
            </button>
          </div>
        </div>

        {/* Tabela de Sugestões de Reposição */}
        <section className="bg-[#FFFFFF] border border-[#7DA0CA] rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table id="table-sugestoes-matriz-compras" className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F0F6FC] text-[#052659] border-b border-[#7DA0CA] text-[11px] font-bold uppercase tracking-wider select-none">
                  <th className="w-10 px-4 py-3 text-center whitespace-nowrap">
                    <input
                      id="checkbox-sugestoes-selecionar-todos"
                      type="checkbox"
                      checked={itens.length > 0 && itens.every((i) => i.selected)}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      className="rounded border-[#7DA0CA] text-[#052659] focus:ring-0 h-3.5 w-3.5"
                    />
                  </th>
                  <th className="px-4 py-3 whitespace-nowrap">SKU &amp; Descrição do Produto</th>
                  <th className="px-4 py-3 whitespace-nowrap">Fornecedor Principal</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Saldo</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Mínimo</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Giro 30D</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap min-w-[130px]">Qtd. Sugerida</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Custo Unit.</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap min-w-[120px]">Total Previsto</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Nível Urgência</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Ação Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#021024]">
                {itensFiltrados.map((item) => {
                  const totalPrevisto = item.qtdSugerida * item.custoUnitario;
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#C1E8FF]/20 transition-colors ${
                        item.selected ? "bg-white" : "bg-slate-50/50 opacity-75"
                      }`}
                    >
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <input
                          id={`checkbox-sugestoes-item-${item.id}`}
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleItem(item.id)}
                          className="rounded border-[#7DA0CA] text-[#052659] focus:ring-0 h-3.5 w-3.5"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-[#052659]">{item.descricao}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          SKU {item.sku} • {item.detalhe}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-medium text-slate-700">{item.fornecedor}</span>
                      </td>
                      <td className="px-4 py-4 text-center font-mono font-bold whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            item.saldoAtual === 0
                              ? "bg-rose-100 text-rose-800"
                              : item.saldoAtual <= item.estoqueMinimo
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {item.saldoAtual} un
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center font-mono text-slate-600 whitespace-nowrap">
                        {item.estoqueMinimo} un
                      </td>
                      <td className="px-4 py-4 text-center font-mono text-slate-700 whitespace-nowrap">
                        {item.giro30D} un/mês
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 border border-[#7DA0CA] rounded bg-[#FFFFFF] px-1.5 py-0.5">
                          <input
                            id={`input-sugestoes-qtd-${item.id}`}
                            type="number"
                            value={item.qtdSugerida}
                            onChange={(e) => handleQtdChange(item.id, Number(e.target.value))}
                            className="w-12 text-center font-mono font-bold text-xs bg-transparent border-0 p-0 focus:ring-0 text-[#052659]"
                            min={1}
                          />
                          <span className="text-[10px] text-slate-500 font-mono">un</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-slate-600 whitespace-nowrap">
                        R$ {item.custoUnitario.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-bold text-[#052659] bg-[#F0F6FC]/60 whitespace-nowrap">
                        R$ {totalPrevisto.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.urgencia === "critico"
                              ? "bg-[#FEF2F2] text-[#B91C1C] border border-red-200"
                              : item.urgencia === "atencao"
                              ? "bg-[#FFFBEB] text-[#B45309] border border-amber-200"
                              : "bg-[#C1E8FF] text-[#052659] border border-[#7DA0CA]"
                          }`}
                        >
                          {item.urgenciaLabel}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <button
                          id={`btn-sugestoes-ajustar-${item.id}`}
                          type="button"
                          onClick={() => abrirAjuste(item)}
                          className="px-2.5 py-1 rounded border border-[#7DA0CA] hover:bg-[#F0F6FC] text-[#052659] text-[11px] font-semibold transition-colors flex items-center gap-1 mx-auto"
                        >
                          <span className="material-symbols-outlined text-[13px]">tune</span>
                          Ajustar Pedido
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Sticky Bottom Bar de Execução em Lote */}
      <footer className="fixed bottom-0 left-0 md:left-64 right-0 z-30 bg-[#FFFFFF] border-t border-[#7DA0CA] px-6 lg:px-10 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
            <div>
              <span className="text-slate-400">Itens Selecionados:</span>{" "}
              <strong className="text-[#052659] font-mono">{totalItensSelecionados} de {itens.length}</strong>
            </div>
            <span>•</span>
            <div>
              <span className="text-slate-400">Total Unidades:</span>{" "}
              <strong className="text-[#052659] font-mono">{totalUnidadesSelecionadas} un</strong>
            </div>
            <span>•</span>
            <div>
              <span className="text-slate-400">Custo Total Previsto:</span>{" "}
              <strong className="text-[#052659] font-mono text-sm">
                R$ {valorTotalInvestimento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              id="btn-sugestoes-desmarcar-todos"
              type="button"
              onClick={() => toggleSelectAll(false)}
              className="px-4 py-2 rounded border border-[#7DA0CA] text-[#052659] hover:bg-[#F0F6FC] text-xs font-semibold transition-colors"
            >
              Desmarcar Todos
            </button>
            <button
              id="btn-sugestoes-gerar-cotacao-pdf"
              type="button"
              onClick={() =>
                toast.info("Gerando cotação consolidada em PDF para os 5 fornecedores mapeados...", {
                  title: "Cotação em Lote",
                  icon: "picture_as_pdf",
                })
              }
              className="px-4 py-2 rounded bg-[#C1E8FF] text-[#052659] hover:bg-[#a9daf8] text-xs font-semibold transition-colors"
            >
              Gerar Cotação (PDF)
            </button>
            <button
              id="btn-sugestoes-emitir-pedidos-lote"
              type="button"
              onClick={() => {
                setPedidosGeradosSucesso(true);
                toast.success(
                  `${totalItensSelecionados} Ordens de Compra geradas com sucesso para os fornecedores!`,
                  {
                    title: "Pedidos de Compra Emitidos",
                    icon: "shopping_cart_checkout",
                  }
                );
              }}
              className="px-5 py-2.5 rounded bg-[#052659] hover:bg-[#021024] text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[17px]">shopping_cart_checkout</span>
              Gerar Pedidos de Compra Automáticos ({totalItensSelecionados} Ordens)
            </button>
          </div>
        </div>
      </footer>

      {/* Modal Corporativo de Ajuste de Parâmetros de Reposição */}
      {itemParaAjuste && (
        <div id="modal-sugestoes-ajuste-parametros" className="fixed inset-0 z-50 bg-[#021024]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#7DA0CA]/40 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#F0F6FC] border-b border-[#7DA0CA]/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#052659] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">tune</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#052659]">
                    Ajustar Parâmetros de Reposição
                  </h3>
                  <p className="text-[11px] text-[#5483B3] font-mono">
                    SKU {itemParaAjuste.sku} • {itemParaAjuste.fornecedor}
                  </p>
                </div>
              </div>
              <button
                id="btn-modal-sugestoes-fechar"
                onClick={() => setItemParaAjuste(null)}
                className="text-[#7DA0CA] hover:text-[#052659] p-1 rounded-lg hover:bg-white/80 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={salvarAjuste} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Item Selecionado
                </span>
                <p className="text-xs font-bold text-[#052659] mt-0.5">
                  {itemParaAjuste.descricao}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {itemParaAjuste.detalhe}
                </p>
                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400">Saldo Atual:</span>{" "}
                    <strong className="text-[#052659] font-mono">{itemParaAjuste.saldoAtual} un</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Giro 30D:</span>{" "}
                    <strong className="text-[#052659] font-mono">{itemParaAjuste.giro30D} un/mês</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Custo Unit.:</span>{" "}
                    <strong className="text-[#052659] font-mono">
                      R$ {itemParaAjuste.custoUnitario.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="input-modal-sugestoes-estoque-min" className="block text-xs font-bold text-slate-700 mb-1">
                    Estoque Mínimo (Segurança)
                  </label>
                  <input
                    id="input-modal-sugestoes-estoque-min"
                    type="number"
                    min="0"
                    value={formEstoqueMin}
                    onChange={(e) => setFormEstoqueMin(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-[#7DA0CA] text-xs font-mono font-bold text-[#052659] focus:outline-none focus:ring-2 focus:ring-[#5483B3]"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Gatilho de reposição no Kardex
                  </span>
                </div>

                <div>
                  <label htmlFor="input-modal-sugestoes-qtd-sugerida" className="block text-xs font-bold text-slate-700 mb-1">
                    Quantidade a Sugerir (Lote)
                  </label>
                  <input
                    id="input-modal-sugestoes-qtd-sugerida"
                    type="number"
                    min="1"
                    value={formQtdSugerida}
                    onChange={(e) => setFormQtdSugerida(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-[#7DA0CA] text-xs font-mono font-bold text-[#052659] focus:outline-none focus:ring-2 focus:ring-[#5483B3]"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Tamanho do lote econômico de compra
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="input-modal-sugestoes-lead-time" className="block text-xs font-bold text-slate-700 mb-1">
                  Lead Time Médio do Fornecedor (Dias)
                </label>
                <input
                  id="input-modal-sugestoes-lead-time"
                  type="number"
                  min="1"
                  value={formLeadTime}
                  onChange={(e) => setFormLeadTime(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-[#7DA0CA] text-xs font-mono font-bold text-[#052659] focus:outline-none focus:ring-2 focus:ring-[#5483B3]"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Prazo de entrega em dias úteis para cálculo de giro
                </span>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  id="btn-modal-sugestoes-cancelar"
                  type="button"
                  onClick={() => setItemParaAjuste(null)}
                  className="px-4 py-2 rounded-lg border border-[#7DA0CA] text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  id="btn-modal-sugestoes-salvar"
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#052659] hover:bg-[#021024] text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Salvar Parâmetros
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

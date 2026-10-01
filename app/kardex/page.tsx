"use client";

import Link from "next/link";
import { useState } from "react";
import { useOperator } from "@/hooks/useOperator";

export default function Kardex() {
  const { isManager } = useOperator();
  const [selectedItems, setSelectedItems] = useState<string[]>([
    "78985201104",
    "78985201108",
    "78985201115",
  ]);
  const [quantities, setQuantities] = useState<Record<string, number>>({
    "78985201104": 15,
    "78985201108": 10,
    "78985201115": 8,
    "78985201122": 12,
  });
  const [filterOp, setFilterOp] = useState("todas");
  const [filterPeriodo, setFilterPeriodo] = useState("30d");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSelect = (sku: string) => {
    setSelectedItems((prev) =>
      prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku]
    );
  };

  const updateQuantity = (sku: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [sku]: Math.max(1, val) }));
  };

  const restockItems = [
    {
      sku: "78985201104",
      nome: "Ray-Ban RX5228 Tartaruga 54-18",
      tipo: "Acetato Premium • Armação Oftálmica",
      fornecedor: "Luxottica Brasil",
      estoque: 0,
      estoqueLabel: "0 un - Esgotado",
      estoqueType: "danger",
      ponto: "5 un",
      leadTime: "5d",
      custoUnitario: 285,
    },
    {
      sku: "78985201108",
      nome: "Carrera CA8840 Aviador Grafite 58-15",
      tipo: "Metal Titânio • Alta Rotatividade Balcão",
      fornecedor: "Safilo do Brasil",
      estoque: 1,
      estoqueLabel: "1 un - Crítico",
      estoqueType: "warning",
      ponto: "4 un",
      leadTime: "4d",
      custoUnitario: 245,
    },
    {
      sku: "78985201115",
      nome: "Vogue Eyewear VO5352 Dourado",
      tipo: "Aço Cirúrgico • Modelo Unissex Redondo",
      fornecedor: "Luxottica Brasil",
      estoque: 1,
      estoqueLabel: "1 un - Crítico",
      estoqueType: "warning",
      ponto: "6 un",
      leadTime: "5d",
      custoUnitario: 215.625,
    },
    {
      sku: "78985201122",
      nome: "Oakley OX8156 Holbrook RX Satin Black",
      tipo: "O-Matter Performance • Receituário Esportivo",
      fornecedor: "Marchon Brasil",
      estoque: 1,
      estoqueLabel: "1 un - Crítico",
      estoqueType: "warning",
      ponto: "5 un",
      leadTime: "6d",
      custoUnitario: 240,
    },
  ];

  const totalCustoEstimado = selectedItems.reduce((acc, sku) => {
    const item = restockItems.find((r) => r.sku === sku);
    const qty = quantities[sku] || 0;
    return acc + (item ? item.custoUnitario * qty : 0);
  }, 0);

  const ledgerMovements = [
    {
      data: "24/10/2026 14:30:18",
      tipo: "saida",
      operacao: "Saída • Venda Balcão",
      doc: "OS #10294",
      docLink: "/ordens-de-servico/detalhes?id=10294",
      sku: "78985201104",
      item: "Ray-Ban RX5228 Tartaruga 54-18",
      detalhes: "Acetato Masculino • Filial Centro",
      movimento: "-1 un",
      saldo: "0 un",
      operador: "João Caixa",
    },
    {
      data: "24/10/2026 11:14:02",
      tipo: "entrada",
      operacao: "Entrada • NF-e Fornecedor",
      doc: "NF-e #44892",
      docLink: "/kardex/entrada-nfe",
      sku: "78985202319",
      item: "Lente Essilor Crizal Sapphire",
      detalhes: "Esf -2.25 Cil -0.75 Eixo 180°",
      movimento: "+15 un",
      saldo: "28 un",
      operador: "Sistema (XML)",
    },
    {
      data: "24/10/2026 10:45:51",
      tipo: "saida",
      operacao: "Saída • Montagem Lab",
      doc: "OS #10188",
      docLink: "/ordens-de-servico/detalhes?id=10294",
      sku: "78985201108",
      item: "Carrera CA8840 Aviador Grafite",
      detalhes: "Grafite 58-15 • Bisel Fino",
      movimento: "-1 un",
      saldo: "1 un",
      operador: "Dra. Camila",
    },
    {
      data: "23/10/2026 18:20:09",
      tipo: "ajuste",
      operacao: "Ajuste • Avaria de Bancada",
      doc: "Laudo #089",
      docLink: "/kardex/ajuste-manual",
      sku: "78985200955",
      item: "Lente Hoya MiYOSMART 1.59",
      detalhes: "Trinca no bisel durante montagem",
      movimento: "-1 un",
      saldo: "3 un",
      operador: "Roberto Lab",
    },
    {
      data: "23/10/2026 16:05:44",
      tipo: "entrada",
      operacao: "Entrada • NF-e Fornecedor",
      doc: "NF-e #44870",
      docLink: "/kardex/entrada-nfe",
      sku: "78985201115",
      item: "Vogue Eyewear VO5352 Dourado",
      detalhes: "Remessa Reposição Luxottica",
      movimento: "+6 un",
      saldo: "7 un",
      operador: "Carlos Ramos",
    },
    {
      data: "23/10/2026 14:10:30",
      tipo: "saida",
      operacao: "Saída • Venda Balcão",
      doc: "OS #10174",
      docLink: "/ordens-de-servico/detalhes?id=10294",
      sku: "78985201115",
      item: "Vogue Eyewear VO5352 Dourado",
      detalhes: "Retirada Paciente Balcão",
      movimento: "-1 un",
      saldo: "6 un",
      operador: "Ana Paula",
    },
  ];

  const filteredMovements = ledgerMovements.filter((m) => {
    if (filterOp === "entrada" && m.tipo !== "entrada") return false;
    if (filterOp === "saida" && m.tipo !== "saida") return false;
    if (filterOp === "ajuste" && m.tipo !== "ajuste") return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        m.sku.includes(q) ||
        m.item.toLowerCase().includes(q) ||
        m.doc.toLowerCase().includes(q) ||
        m.operador.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1720px] w-full mx-auto">
      {/* Header Compacto com Ações Diretas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-[#C1E8FF]/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#052659] text-xl">inventory_2</span>
            <h1 className="text-base lg:text-lg font-bold text-[#052659] tracking-tight">
              {isManager ? "Kardex & Sugestões de Compra" : "Kardex & Rastreabilidade de Estoque"}
            </h1>
            <span className="bg-[#C1E8FF] text-[#052659] text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border border-[#7DA0CA]/50">
              LEDGER-v2.6
            </span>
          </div>
          <p className="text-xs text-[#5483B3] mt-0.5">
            {isManager
              ? "Controle de estoque crítico, reposição inteligente e rastreabilidade fiscal de movimentações"
              : "Histórico de entradas, saídas por OS e rastreabilidade física de movimentações"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            id="link-kardex-entrada-nfe"
            href="/kardex/entrada-nfe"
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-bold border border-[#7DA0CA] text-[#052659] hover:bg-[#F0F6FC] bg-white transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-sm text-[#5483B3]">upload_file</span>
            <span>+ Entrada NF-e</span>
          </Link>
          {isManager && (
            <>
              <Link
                id="link-kardex-ajuste-manual"
                href="/kardex/ajuste-manual"
                className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-bold border border-[#7DA0CA] text-[#052659] hover:bg-[#F0F6FC] bg-white transition-colors shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm text-rose-600">construction</span>
                <span>+ Ajuste / Avaria</span>
              </Link>
              <Link
                id="link-kardex-painel-reposicao"
                href="/kardex/sugestoes-compra"
                className="h-8 px-3.5 inline-flex items-center gap-1.5 rounded-lg text-xs font-bold text-white bg-[#052659] hover:bg-[#021024] transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">shopping_cart_checkout</span>
                <span>Painel Reposição [F8]</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mini-Indicadores Operacionais At-a-Glance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#C1E8FF]/60 p-3.5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#5483B3] uppercase tracking-wide">SKUs no Kardex</div>
            <div className="text-2xl font-mono font-bold text-[#052659] mt-0.5">842 <span className="text-xs font-normal text-slate-500">itens</span></div>
          </div>
          <span className="material-symbols-outlined text-[#5483B3] text-2xl">category</span>
        </div>
        <div className="bg-white rounded-xl border border-red-200/80 p-3.5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between bg-red-50/15">
          <div>
            <div className="text-xs font-bold text-red-600 uppercase tracking-wide">Rupturas Críticas</div>
            <div className="text-2xl font-mono font-bold text-red-700 mt-0.5">4 <span className="text-xs font-normal text-red-500">itens</span></div>
          </div>
          <span className="material-symbols-outlined text-red-600 text-2xl">emergency</span>
        </div>
        <div className="bg-white rounded-xl border border-[#C1E8FF]/60 p-3.5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#5483B3] uppercase tracking-wide">Entradas NF-e Mês</div>
            <div className="text-2xl font-mono font-bold text-emerald-700 mt-0.5">+128 <span className="text-xs font-normal text-slate-500">un</span></div>
          </div>
          <span className="material-symbols-outlined text-emerald-600 text-2xl">receipt_long</span>
        </div>
        <div className="bg-white rounded-xl border border-[#C1E8FF]/60 p-3.5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#5483B3] uppercase tracking-wide">Saídas Balcão &amp; OS</div>
            <div className="text-2xl font-mono font-bold text-[#052659] mt-0.5">-94 <span className="text-xs font-normal text-slate-500">un</span></div>
          </div>
          <span className="material-symbols-outlined text-[#5483B3] text-2xl">output</span>
        </div>
      </div>

      {/* TABELA 1: SUGESTÃO DE REPOSIÇÃO AUTOMÁTICA (COMPACTA - EXCLUSIVA GERENTE) */}
      {isManager && (
        <section className="bg-white rounded-xl border border-amber-300/80 shadow-sm overflow-hidden">
          {/* Banner Superior da Tabela 1 */}
          <div className="px-4 py-2.5 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-800 text-lg">warning</span>
            <span className="font-bold text-amber-950 text-sm">
              Sugestão de Reposição Automática (Ruptura Eminente)
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-mono">
              4 itens abaixo do ponto
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-amber-900">
            <span className="flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined text-sm">schedule</span>
              Demanda: Hoje, 14:15
            </span>
            <Link
              id="link-kardex-matriz-completa"
              href="/kardex/sugestoes-compra"
              className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 transition-colors inline-flex items-center gap-1 text-xs"
            >
              <span>Ver Matriz Completa</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Tabela com Nomes e Números Maiores e Legíveis */}
        <div className="overflow-x-auto">
          <table id="table-kardex-sugestoes-rapidas" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0F6FC] sticky top-0 z-10 border-b border-slate-200 text-[11px] font-bold text-[#052659] uppercase tracking-wider h-9 shadow-2xs">
                <th className="w-8 px-3 text-center">
                  <input
                    id="checkbox-kardex-reposicao-todos"
                    type="checkbox"
                    checked={selectedItems.length === restockItems.length}
                    onChange={(e) =>
                      setSelectedItems(e.target.checked ? restockItems.map((r) => r.sku) : [])
                    }
                    className="rounded border-slate-300 text-[#052659] h-4 w-4 cursor-pointer"
                  />
                </th>
                <th className="px-3">SKU</th>
                <th className="px-3">Peça &amp; Especificação</th>
                <th className="px-3">Fornecedor</th>
                <th className="px-3 text-center">Estoque</th>
                <th className="px-3 text-center">Ponto Rep.</th>
                <th className="px-3 text-center">Qtd. Sugerida</th>
                <th className="px-3 text-right">Custo Est.</th>
                <th className="px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#021024]">
              {restockItems.map((item) => {
                const isChecked = selectedItems.includes(item.sku);
                const currentQty = quantities[item.sku] || 1;
                const subtotal = item.custoUnitario * currentQty;

                return (
                  <tr
                    key={item.sku}
                    className={`h-12 hover:bg-[#C1E8FF]/15 transition-colors duration-150 cursor-default ${
                      isChecked ? "bg-amber-50/20" : ""
                    }`}
                  >
                    <td className="px-3 text-center">
                      <input
                        id={`checkbox-kardex-reposicao-item-${item.sku}`}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(item.sku)}
                        className="rounded border-slate-300 text-[#052659] h-4 w-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 font-mono text-xs text-[#5483B3] font-bold">
                      {item.sku}
                    </td>
                    <td className="px-3">
                      <div className="font-bold text-sm text-[#052659]">
                        {item.nome}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.tipo}
                      </div>
                    </td>
                    <td className="px-3 text-slate-800 text-xs font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        {item.fornecedor}
                      </span>
                    </td>
                    <td className="px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold font-mono border ${
                          item.estoqueType === "danger"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.estoqueType === "danger" ? "bg-rose-600 animate-pulse" : "bg-amber-600"
                          }`}
                        ></span>
                        {item.estoqueLabel}
                      </span>
                    </td>
                    <td className="px-3 text-center font-mono text-xs font-semibold text-slate-700">
                      {item.ponto} <span className="text-[11px] text-slate-400 font-normal">({item.leadTime})</span>
                    </td>
                    <td className="px-3 text-center">
                      <div className="inline-flex items-center border border-amber-300 rounded bg-amber-50/80 px-1.5 py-0.5 shadow-2xs">
                        <input
                          id={`input-kardex-reposicao-qtd-${item.sku}`}
                          type="number"
                          value={currentQty}
                          onChange={(e) => updateQuantity(item.sku, parseInt(e.target.value) || 1)}
                          className="w-12 text-center bg-transparent border-0 p-0 text-sm font-mono font-bold text-amber-950 focus:ring-0"
                        />
                        <span className="text-xs font-mono font-bold text-amber-800 pr-1">un</span>
                      </div>
                    </td>
                    <td className="px-3 text-right font-mono font-bold text-sm text-slate-900">
                      R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 text-right">
                      <Link
                        id={`link-kardex-reposicao-pedir-${item.sku}`}
                        href={`/kardex/sugestoes-compra?sku=${item.sku}`}
                        className="h-8 px-3 rounded bg-white hover:bg-[#F0F6FC] text-[#052659] border border-[#7DA0CA] font-bold text-xs inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Pedir</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rodapé Ação em Lote Tabela 1 */}
        <div className="p-3 bg-amber-50/40 border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-medium text-amber-950">
              <span className="material-symbols-outlined text-lg text-amber-700">check_circle</span>
              <span>
                <strong className="font-bold text-[#052659]">{selectedItems.length} itens selecionados</strong> para remessa direta
              </span>
            </div>
            <div className="h-4 w-px bg-amber-300 hidden sm:block"></div>
            <div className="font-mono text-amber-950">
              Custo Estimado:{" "}
              <strong className="font-bold text-base text-slate-900">
                R$ {totalCustoEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
          <Link
            id="btn-kardex-gerar-pedido-lote"
            href="/kardex/sugestoes-compra"
            className="h-8 px-4 inline-flex items-center gap-2 rounded-md text-xs font-bold text-white bg-[#052659] hover:bg-[#021024] shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">local_shipping</span>
            <span>Gerar Pedido de Compra em Lote</span>
          </Link>
        </div>
      </section>
      )}

      {/* TABELA 2: KARDEX LEDGER (RASTREABILIDADE DE MOVIMENTAÇÕES) */}
      <section className="bg-white rounded-xl border border-[#C1E8FF]/60 shadow-sm flex flex-col overflow-hidden">
        {/* Barra de Filtros Compacta */}
        <div className="p-3 border-b border-[#F0F6FC] flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 bg-white">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5483B3] text-base">
              search
            </span>
            <input
              id="input-kardex-ledger-busca"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por SKU, Documento (NF-e/OS) ou Operador..."
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-[#C1E8FF]/80 focus:border-[#5483B3] focus:ring-2 focus:ring-[#5483B3]/40 placeholder:text-slate-400 transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1">
              <label className="text-slate-500 font-medium hidden sm:inline text-[11px]">Operação:</label>
              <select
                id="select-kardex-ledger-operacao"
                value={filterOp}
                onChange={(e) => setFilterOp(e.target.value)}
                className="h-8 text-xs rounded-lg border border-[#C1E8FF]/80 px-2 py-0 bg-white text-[#052659] font-medium focus:border-[#5483B3] focus:ring-2 focus:ring-[#5483B3]/30"
              >
                <option value="todas">Todas as Operações</option>
                <option value="entrada">Entradas (NF-e Fornecedor)</option>
                <option value="saida">Saídas (OS / Venda Balcão)</option>
                <option value="ajuste">Ajustes &amp; Avaria</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <label className="text-slate-500 font-medium hidden sm:inline text-[11px]">Período:</label>
              <select
                id="select-kardex-ledger-periodo"
                value={filterPeriodo}
                onChange={(e) => setFilterPeriodo(e.target.value)}
                className="h-8 text-xs rounded-lg border border-[#C1E8FF]/80 px-2 py-0 bg-white text-[#052659] font-medium focus:border-[#5483B3] focus:ring-2 focus:ring-[#5483B3]/30"
              >
                <option value="30d">Últimos 30 dias</option>
                <option value="hoje">Hoje</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="mes">Mês Atual</option>
              </select>
            </div>

            <button
              id="btn-kardex-ledger-filtros"
              className="h-8 px-2.5 rounded-lg border border-[#7DA0CA]/60 bg-[#F0F6FC] hover:bg-white text-[#052659] inline-flex items-center gap-1 text-xs font-semibold transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-sm text-[#5483B3]">tune</span>
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* Tabela do Ledger de Movimentações */}
        <div className="overflow-x-auto">
          <table id="table-kardex-ledger-movimentacoes" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0F6FC] sticky top-0 z-10 border-b border-[#C1E8FF]/80 text-[11px] font-bold text-[#052659] uppercase tracking-wider h-9 shadow-2xs">
                <th className="px-3">Data / Hora</th>
                <th className="px-3">Operação</th>
                <th className="px-3">Documento / Vínculo</th>
                <th className="px-3">SKU &amp; Descrição do Item</th>
                <th className="px-3 text-right">Movimento</th>
                <th className="px-3 text-right">Saldo</th>
                <th className="px-3">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F6FC] text-[#021024]">
              {filteredMovements.map((mov, idx) => (
                <tr key={idx} className="h-12 hover:bg-[#C1E8FF]/15 transition-colors duration-150 cursor-default">
                  <td className="px-3 font-mono text-xs text-slate-700 font-medium whitespace-nowrap">
                    {mov.data}
                  </td>
                  <td className="px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border ${
                        mov.tipo === "saida"
                          ? "text-rose-700 bg-rose-50 border-rose-200"
                          : mov.tipo === "entrada"
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                          : "text-blue-700 bg-blue-50 border-blue-200"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {mov.tipo === "saida"
                          ? "arrow_upward"
                          : mov.tipo === "entrada"
                          ? "arrow_downward"
                          : "sync_alt"}
                      </span>
                      {mov.operacao}
                    </span>
                  </td>
                  <td className="px-3 whitespace-nowrap">
                    <Link
                      id={`link-kardex-ledger-doc-${idx}`}
                      href={mov.docLink}
                      className="inline-flex items-center gap-1.5 font-mono font-bold text-xs text-[#052659] hover:underline"
                    >
                      <span className="material-symbols-outlined text-sm text-[#5483B3]">
                        {mov.doc.includes("OS") ? "receipt_long" : "description"}
                      </span>
                      {mov.doc}
                    </Link>
                  </td>
                  <td className="px-3">
                    <div className="font-bold text-sm text-slate-900 truncate max-w-[340px]">
                      <span className="font-mono text-xs text-[#5483B3] mr-1.5 font-bold">{mov.sku}</span>
                      {mov.item}
                    </div>
                    <div className="text-xs text-slate-500 truncate max-w-[340px]">
                      {mov.detalhes}
                    </div>
                  </td>
                  <td
                    className={`px-3 text-right font-mono font-bold text-sm whitespace-nowrap ${
                      mov.tipo === "saida"
                        ? "text-rose-600"
                        : mov.tipo === "entrada"
                        ? "text-emerald-700"
                        : "text-blue-700"
                    }`}
                  >
                    {mov.movimento}
                  </td>
                  <td className="px-3 text-right font-mono font-bold text-sm text-slate-900 whitespace-nowrap">
                    {mov.saldo}
                  </td>
                  <td className="px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-800 text-xs font-medium">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          mov.operador.includes("Sistema") ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      ></span>
                      <span>{mov.operador}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rodapé Resumo do Ledger */}
        <div className="p-3 bg-[#F0F6FC]/60 border-t border-[#7DA0CA]/30 flex items-center justify-between text-xs text-[#5483B3]">
          <span>
            Exibindo <strong>{filteredMovements.length}</strong> de 142 movimentações registradas
          </span>
          <div className="flex items-center gap-1.5">
            <button
              id="btn-kardex-ledger-pag-anterior"
              className="px-2.5 py-1 rounded border border-[#7DA0CA]/50 bg-white text-[#052659] text-xs font-bold hover:bg-[#F0F6FC] transition-colors cursor-pointer"
            >
              Anterior
            </button>
            <span className="px-2.5 py-1 text-xs font-mono font-bold text-[#052659]">1 / 24</span>
            <button
              id="btn-kardex-ledger-pag-proximo"
              className="px-2.5 py-1 rounded border border-[#7DA0CA]/50 bg-white text-[#052659] text-xs font-bold hover:bg-[#F0F6FC] transition-colors cursor-pointer"
            >
              Próxima
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

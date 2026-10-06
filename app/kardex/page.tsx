"use client";

import Link from "next/link";
import { useState } from "react";
import { useOperator } from "@/hooks/useOperator";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";

export default function Kardex() {
  const { isManager } = useOperator();
  const [filterOp, setFilterOp] = useState("todas");
  const [filterPeriodo, setFilterPeriodo] = useState("30d");
  const [searchTerm, setSearchTerm] = useState("");

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
    <div className="flex-1 bg-[#F0F6FC] min-h-screen pb-20 text-[#021024]">
      {/* 1. CABEÇALHO PADRONIZADO DA TELA */}
      <PageHeader
        id="header-kardex-ledger"
        icon="swap_horiz"
        title="Kardex de Estoque"
        badge={
          <span className="bg-[#F0F6FC] text-[#052659] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#C1E8FF]">
            LEDGER-v2.6
          </span>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Estoque & Logística" },
          { label: "Kardex" },
        ]}
        actions={
          <>
            <Link
              id="link-kardex-entrada-nfe"
              href="/kardex/entrada-nfe"
              className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-xl text-xs font-bold border border-[#7DA0CA] text-[#052659] hover:bg-[#F0F6FC] bg-white transition-all shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-[#5483B3]">upload_file</span>
              <span>+ Entrada NF-e</span>
            </Link>
            {isManager && (
              <>
                <Link
                  id="link-kardex-ajuste-manual"
                  href="/kardex/ajuste-manual"
                  className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-xl text-xs font-bold border border-[#7DA0CA] text-[#052659] hover:bg-[#F0F6FC] bg-white transition-all shadow-2xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-slate-600">construction</span>
                  <span>+ Ajuste / Avaria</span>
                </Link>
                <Link
                  id="link-kardex-painel-reposicao"
                  href="/kardex/sugestoes-compra"
                  className="h-9 px-4 inline-flex items-center gap-1.5 rounded-xl text-xs font-bold text-white bg-[#052659] hover:bg-[#021024] transition-all shadow-xs hover:shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">shopping_cart_checkout</span>
                  <span>Sugestões de Compra [F8]</span>
                </Link>
              </>
            )}
          </>
        }
      />

      {/* 2. CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl 2xl:max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Indicadores Executivos do Kardex */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            id="card-kardex-skus"
            title="SKUs no Kardex"
            value="842"
            unit="itens"
            icon="category"
            trend={{ text: "+18 novos itens cadastrados", isPositive: true, icon: "trending_up" }}
            footerLeft="Catálogo ativo na matriz"
            footerHref="/estoque"
            footerActionLabel="Ver estoque"
          />
          <KpiCard
            id="card-kardex-entradas-mes"
            title="Entradas NF-e Mês"
            value="+128"
            unit="unidades"
            icon="receipt_long"
            iconVariant="success"
            trend={{ text: "12 notas fiscais importadas", isPositive: true }}
            footerLeft="Total compras: R$ 42.150"
            footerHref="/kardex/entrada-nfe"
            footerActionLabel="Importar XML"
          />
          <KpiCard
            id="card-kardex-saidas-balcao"
            title="Saídas Balcão & OS"
            value="-94"
            unit="baixas"
            icon="outbox"
            trend={{ text: "88 OSs montadas • 6 vendas diretas", isNeutral: true, icon: "arrow_upward" }}
            footerLeft="Baixa automática por OS"
            footerHref="/ordens-de-servico/fila"
            footerActionLabel="Ver fila OS"
          />
          <KpiCard
            id="card-kardex-ponto-reposicao"
            title="Ponto de Reposição"
            value="4"
            unit="itens críticos"
            icon="emergency"
            iconVariant="warning"
            trend={{ text: "Abaixo do estoque de segurança", isNeutral: true }}
            footerLeft="Lead time médio: 3 dias"
            footerHref="/kardex/sugestoes-compra"
            footerActionLabel="Pedir agora"
          />
        </div>

      {/* KARDEX LEDGER (RASTREABILIDADE DE MOVIMENTAÇÕES) */}
      <section className="bg-white rounded-2xl border border-[#C1E8FF] shadow-xs flex flex-col overflow-hidden">
        {/* Barra de Filtros Compacta */}
        <div className="p-3.5 border-b border-[#F0F6FC] flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5483B3] text-base">
              search
            </span>
            <input
              id="input-kardex-ledger-busca"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por SKU, Documento (NF-e/OS) ou Operador..."
              className="w-full h-8.5 pl-8.5 pr-3 text-xs rounded-xl border border-[#C1E8FF] focus:border-[#5483B3] focus:ring-2 focus:ring-[#C1E8FF] placeholder:text-slate-400 transition-all shadow-2xs text-[#052659]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5">
              <label className="text-[#5483B3] font-bold hidden sm:inline text-[11px]">Operação:</label>
              <select
                id="select-kardex-ledger-operacao"
                value={filterOp}
                onChange={(e) => setFilterOp(e.target.value)}
                className="h-8.5 text-xs rounded-xl border border-[#C1E8FF] px-2.5 py-0 bg-white text-[#052659] font-semibold focus:border-[#5483B3] focus:ring-2 focus:ring-[#C1E8FF]"
              >
                <option value="todas">Todas as Operações</option>
                <option value="entrada">Entradas (NF-e Fornecedor)</option>
                <option value="saida">Saídas (OS / Venda Balcão)</option>
                <option value="ajuste">Ajustes &amp; Avaria</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-[#5483B3] font-bold hidden sm:inline text-[11px]">Período:</label>
              <select
                id="select-kardex-ledger-periodo"
                value={filterPeriodo}
                onChange={(e) => setFilterPeriodo(e.target.value)}
                className="h-8.5 text-xs rounded-xl border border-[#C1E8FF] px-2.5 py-0 bg-white text-[#052659] font-semibold focus:border-[#5483B3] focus:ring-2 focus:ring-[#C1E8FF]"
              >
                <option value="30d">Últimos 30 dias</option>
                <option value="hoje">Hoje</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="mes">Mês Atual</option>
              </select>
            </div>

            <button
              id="btn-kardex-ledger-filtros"
              className="h-8.5 px-3 rounded-xl border border-[#7DA0CA] bg-white hover:bg-[#F0F6FC] text-[#052659] inline-flex items-center gap-1 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
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
              <tr className="bg-[#F0F6FC] sticky top-0 z-10 border-b border-[#C1E8FF] text-[11px] font-bold text-[#052659] uppercase tracking-wider shadow-2xs">
                <th className="px-4 py-3.5">Data / Hora</th>
                <th className="px-4 py-3.5">Operação</th>
                <th className="px-4 py-3.5">Documento / Vínculo</th>
                <th className="px-4 py-3.5">SKU &amp; Descrição do Item</th>
                <th className="px-4 py-3.5 text-right">Movimento</th>
                <th className="px-4 py-3.5 text-right">Saldo</th>
                <th className="px-4 py-3.5">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#021024]">
              {filteredMovements.map((mov, idx) => (
                <tr key={idx} className="hover:bg-[#C1E8FF]/15 transition-colors duration-150 cursor-default">
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-600 font-medium whitespace-nowrap">
                    {mov.data}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 text-sm text-slate-800 font-medium">
                      <span
                        className={`material-symbols-outlined text-[18px] font-bold ${
                          mov.tipo === "entrada"
                            ? "text-emerald-600"
                            : mov.tipo === "saida"
                            ? "text-rose-500"
                            : "text-amber-500"
                        }`}
                      >
                        {mov.tipo === "saida"
                          ? "arrow_upward"
                          : mov.tipo === "entrada"
                          ? "arrow_downward"
                          : "sync_alt"}
                      </span>
                      <span>{mov.operacao}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Link
                      id={`link-kardex-ledger-doc-${idx}`}
                      href={mov.docLink}
                      className="inline-flex items-center gap-1.5 font-mono font-bold text-sm text-[#052659] hover:underline"
                    >
                      <span className="material-symbols-outlined text-base text-[#5483B3]">
                        {mov.doc.includes("OS") ? "receipt_long" : "description"}
                      </span>
                      {mov.doc}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-sm text-[#052659] truncate max-w-[340px]">
                      <span className="font-mono text-xs text-[#5483B3] mr-1.5 font-bold">{mov.sku}</span>
                      {mov.item}
                    </div>
                    <div className="text-xs text-slate-500 truncate max-w-[340px]">
                      {mov.detalhes}
                    </div>
                  </td>
                  <td
                    className={`px-4 py-3.5 text-right font-mono font-bold text-sm whitespace-nowrap ${
                      mov.tipo === "entrada"
                        ? "text-emerald-600"
                        : "text-slate-800"
                    }`}
                  >
                    {mov.movimento}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-sm text-[#052659] whitespace-nowrap">
                    {mov.saldo}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-800 text-sm font-medium">
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
        <div className="p-3.5 bg-[#F0F6FC]/60 border-t border-[#C1E8FF] flex items-center justify-between text-xs text-[#5483B3]">
          <span>
            Exibindo <strong>{filteredMovements.length}</strong> de 142 movimentações registradas
          </span>
          <div className="flex items-center gap-1.5">
            <button
              id="btn-kardex-ledger-pag-anterior"
              className="px-3 py-1 rounded-lg border border-[#7DA0CA] bg-white text-[#052659] text-xs font-bold hover:bg-[#F0F6FC] transition-colors cursor-pointer shadow-2xs"
            >
              Anterior
            </button>
            <span className="px-2.5 py-1 text-xs font-mono font-bold text-[#052659]">1 / 24</span>
            <button
              id="btn-kardex-ledger-pag-proximo"
              className="px-3 py-1 rounded-lg border border-[#7DA0CA] bg-white text-[#052659] text-xs font-bold hover:bg-[#F0F6FC] transition-colors cursor-pointer shadow-2xs"
            >
              Próxima
            </button>
          </div>
        </div>
      </section>
      </main>
    </div>
  );
}

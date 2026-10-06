"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useOperator } from "@/hooks/useOperator";
import { useToast } from "@/components/ToastProvider";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import OpticalFrameIcon from "@/components/icons/OpticalFrameIcon";
import Button from "@/components/Button";

interface FrameItem {
  id: string;
  sku: string;
  marca: string;
  referencia: string;
  cor: string;
  tamanho: string;
  qtd: number;
  preco: number;
  custo?: number;
  margem?: string;
  categoria: "armacoes" | "lentes" | "contato";
}

const mockCatalog: FrameItem[] = [
  {
    id: "1",
    sku: "78985201104",
    marca: "Ray-Ban",
    referencia: "RX5228",
    cor: "Tartaruga Clássica",
    tamanho: "54-18",
    qtd: 14,
    preco: 890.0,
    custo: 380.0,
    margem: "57%",
    categoria: "armacoes",
  },
  {
    id: "2",
    sku: "78985201115",
    marca: "Vogue",
    referencia: "VO5352",
    cor: "Dourado Polido",
    tamanho: "52-17",
    qtd: 1,
    preco: 540.0,
    custo: 210.0,
    margem: "61%",
    categoria: "armacoes",
  },
  {
    id: "3",
    sku: "78985201120",
    marca: "Oakley",
    referencia: "OX8156",
    cor: "Preto Fosco Satin",
    tamanho: "55-16",
    qtd: 6,
    preco: 620.0,
    custo: 260.0,
    margem: "58%",
    categoria: "armacoes",
  },
  {
    id: "4",
    sku: "78985201108",
    marca: "Carrera",
    referencia: "CA8840",
    cor: "Grafite Metálico",
    tamanho: "58-15",
    qtd: 0,
    preco: 780.0,
    custo: 320.0,
    margem: "59%",
    categoria: "armacoes",
  },
  {
    id: "5",
    sku: "78985201107",
    marca: "Emporio Armani",
    referencia: "EA3147",
    cor: "Azul Marinho Translúcido",
    tamanho: "55-16",
    qtd: 8,
    preco: 920.0,
    custo: 390.0,
    margem: "58%",
    categoria: "armacoes",
  },
  {
    id: "6",
    sku: "78985201109",
    marca: "Silhouette",
    referencia: "Titan Minimal 5515",
    cor: "Prata Titânio Puro",
    tamanho: "51-19",
    qtd: 4,
    preco: 1650.0,
    custo: 680.0,
    margem: "59%",
    categoria: "armacoes",
  },
  {
    id: "7",
    sku: "78985201132",
    marca: "Prada",
    referencia: "PR16MV",
    cor: "Preto Piano Luxury",
    tamanho: "53-17",
    qtd: 1,
    preco: 1450.0,
    custo: 580.0,
    margem: "60%",
    categoria: "armacoes",
  },
  {
    id: "8",
    sku: "78985201140",
    marca: "Ray-Ban",
    referencia: "RB3025 Aviator",
    cor: "Dourado G-15",
    tamanho: "58-14",
    qtd: 12,
    preco: 820.0,
    custo: 350.0,
    margem: "57%",
    categoria: "armacoes",
  },
  {
    id: "9",
    sku: "78985202319",
    marca: "Essilor",
    referencia: "Crizal Sapphire HR",
    cor: "Tratamento Antirreflexo",
    tamanho: "Esf -2.25 Cil -0.75",
    qtd: 28,
    preco: 420.0,
    custo: 180.0,
    margem: "57%",
    categoria: "lentes",
  },
  {
    id: "10",
    sku: "78985203301",
    marca: "Hoya",
    referencia: "MiYOSMART Poly 1.59",
    cor: "Controle de Miopia",
    tamanho: "Esf -3.00",
    qtd: 14,
    preco: 950.0,
    custo: 420.0,
    margem: "56%",
    categoria: "lentes",
  },
  {
    id: "11",
    sku: "78985204402",
    marca: "Acuvue",
    referencia: "Oasys 1-Day com HydraLuxe",
    cor: "Descarte Diário (30 un)",
    tamanho: "Curva 8.5 / -2.50D",
    qtd: 18,
    preco: 210.0,
    custo: 95.0,
    margem: "55%",
    categoria: "contato",
  },
];

export default function EstoquePage() {
  const { isManager } = useOperator();
  const toast = useToast();
  const [catalogItems, setCatalogItems] = useState<FrameItem[]>(mockCatalog);
  const [activeTab, setActiveTab] = useState<"armacoes" | "lentes" | "contato">("armacoes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("Todas");
  const [selectedStock, setSelectedStock] = useState("Todos");
  const [onlyMinAlert, setOnlyMinAlert] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Estado do Modal de Cadastro Manual de Produto
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    categoria: "armacoes" as "armacoes" | "lentes" | "contato",
    marca: "",
    referencia: "",
    cor: "",
    tamanho: "",
    sku: "",
    preco: "",
    custo: "",
    qtd: "1",
  });

  const generateSKU = () => {
    const randomDigits = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    setNewProductForm((prev) => ({ ...prev, sku: randomDigits }));
  };

  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const handleOpenNewProductModal = () => {
    generateSKU();
    setShowNewProductModal(true);
  };

  const handleSaveNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingProduct) return;
    if (!newProductForm.marca.trim() || !newProductForm.referencia.trim()) {
      toast.warning("Informe a marca e a referência do produto para cadastrar.", {
        title: "Campos Obrigatórios",
        icon: "warning",
      });
      return;
    }

    setIsSavingProduct(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const finalSku = newProductForm.sku.trim() || Math.floor(10000000000 + Math.random() * 90000000000).toString();
    const precoNum = parseFloat(newProductForm.preco.replace(",", ".")) || 0;
    const custoNum = parseFloat(newProductForm.custo.replace(",", ".")) || (precoNum > 0 ? precoNum * 0.45 : 0);
    const margemCalc = precoNum > 0 ? `${Math.round(((precoNum - custoNum) / precoNum) * 100)}%` : "50%";

    const newItem: FrameItem = {
      id: (catalogItems.length + 1).toString(),
      sku: finalSku,
      marca: newProductForm.marca.trim(),
      referencia: newProductForm.referencia.trim(),
      cor: newProductForm.cor.trim() || "Padrão",
      tamanho: newProductForm.tamanho.trim() || "54-18",
      qtd: parseInt(newProductForm.qtd, 10) || 1,
      preco: precoNum,
      custo: custoNum,
      margem: margemCalc,
      categoria: newProductForm.categoria,
    };

    setCatalogItems((prev) => [newItem, ...prev]);
    setActiveTab(newProductForm.categoria);
    setShowNewProductModal(false);
    setNewProductForm({
      categoria: "armacoes",
      marca: "",
      referencia: "",
      cor: "",
      tamanho: "",
      sku: "",
      preco: "",
      custo: "",
      qtd: "1",
    });
    setIsSavingProduct(false);

    toast.success(
      `Produto "${newItem.marca} ${newItem.referencia}" cadastrado com sucesso no estoque livre! SKU: ${newItem.sku}`,
      {
        title: "Produto Cadastrado",
        icon: "check_circle",
      }
    );
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return catalogItems.filter((item) => {
      if (item.categoria !== activeTab) return false;

      // Brand filter
      if (selectedBrand !== "Todas" && item.marca !== selectedBrand) {
        return false;
      }

      // Stock filter
      if (selectedStock === "Disponível (> 0)" && item.qtd <= 0) return false;
      if (selectedStock === "Crítico (≤ 2 un)" && (item.qtd > 2 || item.qtd === 0)) return false;
      if (selectedStock === "Zerado / Esgotado" && item.qtd > 0) return false;

      // Min Alert toggle
      if (onlyMinAlert && item.qtd > 2) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSku = item.sku.toLowerCase().includes(query);
        const matchesMarca = item.marca.toLowerCase().includes(query);
        const matchesRef = item.referencia.toLowerCase().includes(query);
        const matchesCor = item.cor.toLowerCase().includes(query);
        if (!matchesSku && !matchesMarca && !matchesRef && !matchesCor) {
          return false;
        }
      }

      return true;
    });
  }, [catalogItems, activeTab, selectedBrand, selectedStock, onlyMinAlert, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const counts = useMemo(() => {
    return {
      armacoes: catalogItems.filter((i) => i.categoria === "armacoes").length,
      lentes: catalogItems.filter((i) => i.categoria === "lentes").length,
      contato: catalogItems.filter((i) => i.categoria === "contato").length,
      criticos: catalogItems.filter((i) => i.categoria === activeTab && i.qtd <= 2).length,
    };
  }, [catalogItems, activeTab]);

  return (
    <div className="flex-1 bg-[#F0F6FC] min-h-screen pb-20 text-[#021024]">
      {/* 1. CABEÇALHO PADRONIZADO DA TELA */}
      <PageHeader
        id="header-estoque-catalogo"
        icon="inventory_2"
        title="Catálogo de Estoque"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#052659] text-white font-mono text-xs font-bold rounded-full border border-[#052659] shadow-2xs">
            <span className="material-symbols-outlined text-[13px] text-[#C1E8FF]">inventory_2</span>
            <span>KARDEX LIVRE</span>
          </span>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Estoque & Logística" },
          { label: "Catálogo de Estoque" },
        ]}
        actions={
          <>
            <button
              id="btn-estoque-exportar-excel"
              type="button"
              onClick={() =>
                toast.success("Relatório de inventário do estoque livre exportado com sucesso (XLSX).", {
                  title: "Exportação Concluída",
                  icon: "table_view",
                })
              }
              className="h-9 px-3.5 rounded-xl bg-[#5483B3] hover:bg-[#052659] text-white transition-all text-xs font-bold flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer ring-2 ring-[#5483B3]/25"
            >
              <span className="material-symbols-outlined text-[17px] text-white">table_view</span>
              <span>Exportar Excel</span>
            </button>

            <button
              id="btn-estoque-novo-produto"
              type="button"
              onClick={handleOpenNewProductModal}
              className="h-9 px-3.5 rounded-xl bg-[#5483B3] hover:bg-[#052659] text-white transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer ring-2 ring-[#5483B3]/20"
            >
              <span className="material-symbols-outlined text-[18px]">add_box</span>
              <span>+ Novo Produto</span>
            </button>

            <Link
              id="btn-estoque-nova-entrada"
              href="/kardex/entrada-nfe"
              className="h-9 px-4 rounded-xl bg-[#052659] hover:bg-[#021024] text-white transition-all text-xs font-bold flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer ring-2 ring-[#052659]/20"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>+ Entrada NF-e XML</span>
            </Link>
          </>
        }
      />

      {/* 2. CONTEÚDO PRINCIPAL */}
      <main className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Faixa de Indicadores Rápidos de Estoque Livre (Unificada via KpiCard) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            id="card-estoque-total-armacoes"
            title="Armações em Estoque"
            value={counts.armacoes}
            unit="modelos"
            icon={<OpticalFrameIcon size={18} />}
            trend={{ text: "8 itens em estoque livre", isPositive: true }}
            footerLeft="Disponíveis para venda"
            footerHref="#tab-estoque-armacoes"
            footerActionLabel="Ver catálogo"
          />
          <KpiCard
            id="card-estoque-lentes-prontas"
            title="Lentes em Estoque"
            value={counts.lentes}
            unit="pares"
            icon="lens"
            trend={{ text: "Visão Simples & Antirreflexo", isNeutral: true }}
            footerLeft="Prontas para montagem"
          />
          <KpiCard
            id="card-estoque-alerta-critico"
            title="Alerta de Reposição"
            value="3"
            unit="abaixo do mín."
            icon="warning"
            iconVariant="warning"
            trend={{ text: "Reposição imediata", isNeutral: true }}
            footerLeft="3 marcas sob demanda"
            footerHref="/kardex/sugestoes-compra"
            footerActionLabel="Comprar [F8]"
          />
          <KpiCard
            id="card-estoque-valor-total"
            title="Valor em Inventário"
            value="R$ 18.420"
            unit="custo"
            icon="payments"
            trend={{ text: "Margem média 52%", isPositive: true, icon: "trending_up" }}
            footerLeft="Conciliação: Hoje"
            footerRight={<span className="font-mono font-bold text-[#052659]">100% Auditado</span>}
          />
        </div>
        {/* BARRA DE CONTROLE: ABAS DE CATEGORIA + BARRA DE BUSCA ULTRA LARGA */}
        <div className="bg-white border border-[#C1E8FF] rounded-2xl p-5 flex flex-col gap-4 shadow-xs">
          {/* Abas de Categoria + Última Conciliação */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C1E8FF]/60 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                id="tab-estoque-armacoes"
                onClick={() => setActiveTab("armacoes")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === "armacoes"
                    ? "bg-[#052659] text-white shadow-xs"
                    : "text-[#5483B3] hover:text-[#052659] hover:bg-[#F0F6FC]"
                }`}
              >
                <span>Armações</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === "armacoes" ? "bg-white/20 text-white" : "bg-[#F0F6FC] text-[#5483B3] border border-[#C1E8FF]"
                }`}>
                  {counts.armacoes}
                </span>
              </button>

              <button
                id="tab-estoque-lentes"
                onClick={() => setActiveTab("lentes")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === "lentes"
                    ? "bg-[#052659] text-white shadow-xs"
                    : "text-[#5483B3] hover:text-[#052659] hover:bg-[#F0F6FC]"
                }`}
              >
                <span>Lentes Prontas</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === "lentes" ? "bg-white/20 text-white" : "bg-[#F0F6FC] text-[#5483B3] border border-[#C1E8FF]"
                }`}>
                  {counts.lentes}
                </span>
              </button>

              <button
                id="tab-estoque-contato"
                onClick={() => setActiveTab("contato")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === "contato"
                    ? "bg-[#052659] text-white shadow-xs"
                    : "text-[#5483B3] hover:text-[#052659] hover:bg-[#F0F6FC]"
                }`}
              >
                <span>Lentes de Contato</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === "contato" ? "bg-white/20 text-white" : "bg-[#F0F6FC] text-[#5483B3] border border-[#C1E8FF]"
                }`}>
                  {counts.contato}
                </span>
              </button>
            </div>

            <div id="badge-estoque-ultima-conciliacao" className="flex items-center gap-2 text-[#5483B3] font-mono text-xs pr-1 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="material-symbols-outlined text-[16px] text-[#5483B3]">sync</span>
              <span>Última conciliação: <strong className="text-[#052659] font-mono">Hoje às 14:32:09</strong></span>
            </div>
          </div>

        {/* Barra de Busca Full-Width + Atalhos + Filtros */}
        <div className="flex flex-col lg:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              id="input-estoque-busca"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por Código de Barras (SKU), Marca, Modelo ou Cor..."
              className="w-full h-10 pl-11 pr-24 bg-surface-container-low border border-[#C1E8FF]/80 rounded-xl text-sm text-on-surface placeholder:text-secondary/70 focus:bg-white focus:border-[#5483B3] focus:ring-2 focus:ring-[#5483B3]/40 shadow-2xs transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5 pointer-events-none">
              <kbd className="px-2 py-0.5 text-[11px] font-mono bg-white text-secondary border border-outline-variant rounded font-semibold shadow-2xs">
                Ctrl+K
              </kbd>
            </div>
          </div>

          {/* Filtros Rápidos */}
          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            {activeTab === "armacoes" && (
              <div className="flex items-center bg-white border border-outline-variant rounded-lg h-10 px-3 whitespace-nowrap">
                <span className="text-xs text-secondary mr-2 uppercase font-semibold">Marca:</span>
                <select
                  id="select-estoque-filtro-marca"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="bg-transparent border-none text-xs font-semibold text-on-surface p-0 pr-6 focus:ring-0 cursor-pointer"
                >
                  <option>Todas</option>
                  <option>Ray-Ban</option>
                  <option>Vogue</option>
                  <option>Oakley</option>
                  <option>Carrera</option>
                  <option>Emporio Armani</option>
                  <option>Silhouette</option>
                  <option>Prada</option>
                </select>
              </div>
            )}

            <div className="flex items-center bg-white border border-outline-variant rounded-lg h-10 px-3 whitespace-nowrap">
              <span className="text-xs text-secondary mr-2 uppercase font-semibold">Estoque:</span>
              <select
                id="select-estoque-filtro-estoque"
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-on-surface p-0 pr-6 focus:ring-0 cursor-pointer"
              >
                <option>Todos</option>
                <option>Disponível (&gt; 0)</option>
                <option>Crítico (≤ 2 un)</option>
                <option>Zerado / Esgotado</option>
              </select>
            </div>

            <button
              id="btn-estoque-alerta-minimo"
              onClick={() => setOnlyMinAlert(!onlyMinAlert)}
              className={`h-10 px-3 rounded-lg border transition-colors text-xs font-bold flex items-center gap-1.5 whitespace-nowrap ${
                onlyMinAlert
                  ? "border-amber-400 bg-amber-500 text-white shadow-xs"
                  : "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">warning</span>
              Alerta Mínimo ({counts.criticos})
            </button>
          </div>
        </div>
      </div>

      {/* 3. TABELA B2B SAAS DE ALTA DENSIDADE */}
      <div className="bg-white border border-[#C1E8FF]/60 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto w-full">
          <table id="table-estoque-catalogo" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0F6FC] sticky top-0 z-10 border-b border-[#C1E8FF]/80 text-[11px] font-bold text-[#052659] uppercase tracking-wider select-none shadow-2xs">
                <th className="w-10 px-4 py-3.5 text-center whitespace-nowrap">
                  <input
                    id="checkbox-estoque-selecionar-todos"
                    type="checkbox"
                    checked={filteredItems.length > 0 && selectedIds.length === filteredItems.length}
                    onChange={toggleSelectAll}
                    className="rounded border-outline-variant text-primary-container focus:ring-primary-container/20 h-4 w-4 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5 whitespace-nowrap">SKU / Cód. Barras</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Marca</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Referência</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Cor / Acabamento</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">Tamanho / Especificação</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap min-w-[140px]">Qtd. Disp.</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap min-w-[130px]">Preço de Venda</th>
                {isManager && (
                  <>
                    <th className="px-4 py-3.5 text-right whitespace-nowrap min-w-[120px]">Custo Médio</th>
                    <th className="px-4 py-3.5 text-center whitespace-nowrap min-w-[100px]">Margem</th>
                  </>
                )}
                <th className="px-4 py-3.5 text-center whitespace-nowrap min-w-[110px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-on-surface text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 11 : 9} className="px-6 py-12 text-center text-secondary">
                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">inventory_2</span>
                    <p className="font-semibold text-slate-700">Nenhum item encontrado no catálogo</p>
                    <p className="text-xs text-slate-500 mt-1">Ajuste os filtros de busca ou selecione outra categoria.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isCritical = item.qtd === 1;
                  const isZero = item.qtd === 0;

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors duration-150 cursor-default ${
                        isCritical
                          ? "bg-amber-50/30 hover:bg-amber-50/60 border-l-3 border-l-amber-500"
                          : isZero
                          ? "bg-slate-50/80 hover:bg-slate-100/80 opacity-70"
                          : "hover:bg-slate-50 bg-white"
                      }`}
                    >
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <input
                          id={`checkbox-estoque-item-${item.id}`}
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded border-outline-variant text-primary-container focus:ring-primary-container/20 h-4 w-4 cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <Link
                          id={`link-estoque-sku-${item.id}`}
                          href={`/kardex?sku=${item.sku}`}
                          className="font-mono font-bold text-xs text-[#052659] hover:text-white bg-[#F0F6FC] hover:bg-[#052659] px-2.5 py-1 rounded-lg border border-[#C1E8FF] hover:border-[#052659] transition-all inline-flex items-center gap-1 shadow-2xs hover:shadow-xs group cursor-pointer"
                          title="Inspecionar no Kardex"
                        >
                          <span className="material-symbols-outlined text-[13px] text-[#5483B3] group-hover:text-white transition-colors">qr_code</span>
                          <span>{item.sku}</span>
                        </Link>
                      </td>

                      <td className="px-4 py-4 font-bold text-on-surface whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{item.marca}</span>
                          {isCritical && (
                            <span className="material-symbols-outlined text-amber-600 text-[16px]" title="Ponto de pedido atingido">
                              info
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 font-mono-data text-secondary whitespace-nowrap">
                        {item.referencia}
                      </td>

                      <td className="px-4 py-4 text-on-surface whitespace-nowrap">
                        {item.cor}
                      </td>

                      <td className="px-4 py-4 font-mono-data text-center text-secondary whitespace-nowrap">
                        {item.tamanho}
                      </td>

                      {/* DESTAQUE VISUAL DE QUANTIDADE 1 OU 0 */}
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 font-mono text-xs font-bold shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                            1 un (Crítico)
                          </span>
                        ) : isZero ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-mono text-xs font-bold shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            0 un (Esgotado)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-mono text-xs font-bold shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            {item.qtd} un
                          </span>
                        )}
                      </td>

                      <td className={`px-4 py-4 text-right font-mono-data font-semibold whitespace-nowrap ${
                        isZero ? "line-through text-slate-400" : isCritical ? "font-bold text-slate-900" : "text-slate-800"
                      }`}>
                        R$ {item.preco.toFixed(2).replace(".", ",")}
                      </td>

                      {isManager && (
                        <>
                          <td className="px-4 py-4 text-right font-mono-data text-xs text-slate-500 whitespace-nowrap">
                            R$ {item.custo?.toFixed(2).replace(".", ",") || "—"}
                          </td>
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono bg-[#F0F6FC] text-[#052659] border border-[#C1E8FF] shadow-2xs">
                              {item.margem || "—"}
                            </span>
                          </td>
                        </>
                      )}

                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <Link
                          id={`link-estoque-kardex-${item.id}`}
                          href="/kardex"
                          className="h-8 px-3 rounded-lg bg-[#F0F6FC] hover:bg-[#052659] text-[#052659] hover:text-white border border-[#5483B3]/40 hover:border-[#052659] text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 group cursor-pointer"
                          title="Ver movimentações no Kardex"
                        >
                          <span className="material-symbols-outlined text-[15px] text-[#5483B3] group-hover:text-white transition-colors">manage_search</span>
                          <span>Kardex</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Tabela: Totalizador e Paginação */}
        <div className="p-4 bg-slate-50 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-secondary font-medium">
          <div className="flex items-center gap-3">
            <span>
              Exibindo <strong className="text-on-surface font-semibold">{filteredItems.length}</strong> de{" "}
              <strong className="text-on-surface font-semibold">{catalogItems.length}</strong> itens catalogados
            </span>
            {selectedIds.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-bold">
                {selectedIds.length} selecionados
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-estoque-paginacao-anterior"
              className="px-3 py-1.5 rounded-md border border-outline-variant bg-white text-secondary hover:bg-slate-100 disabled:opacity-50"
              disabled
            >
              Anterior
            </button>
            <span className="px-3 py-1.5 rounded-md bg-primary-container text-on-primary font-bold">1</span>
            <button
              id="btn-estoque-paginacao-proximo"
              className="px-3 py-1.5 rounded-md border border-outline-variant bg-white text-secondary hover:bg-slate-100"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>

      {/* 4. BARRA FLUTUANTE DE AÇÕES EM LOTE (BULK ACTIONS BAR) */}
      {selectedIds.length > 0 && (
        <div
          id="bar-estoque-acoes-em-lote"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#052659] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#5483B3]/40 flex items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center gap-2 pr-3 border-r border-[#5483B3]/40">
            <span className="h-6 px-2 rounded-full bg-[#C1E8FF] text-[#052659] text-xs font-mono font-bold flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold whitespace-nowrap text-slate-200 hidden sm:inline">
              {selectedIds.length === 1 ? "selecionado" : "selecionados"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-bulk-imprimir-etiquetas"
              type="button"
              onClick={() =>
                toast.success(
                  `Enviando ${selectedIds.length} etiquetas térmicas com código de barras para a impressora de balcão...`,
                  {
                    title: "Impressão de Etiquetas",
                    icon: "print",
                  }
                )
              }
              className="h-8 px-3 rounded-lg bg-[#5483B3] hover:bg-[#7DA0CA] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Imprimir Etiquetas</span>
            </button>

            <button
              id="btn-bulk-exportar-excel"
              type="button"
              onClick={() =>
                toast.success(
                  `Planilha XLSX gerada com os ${selectedIds.length} itens selecionados para conferência física.`,
                  {
                    title: "Exportar Selecionados",
                    icon: "table_view",
                  }
                )
              }
              className="h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span className="hidden sm:inline">Exportar Excel</span>
            </button>

            <Link
              id="btn-bulk-enviar-reposicao"
              href="/kardex/sugestoes-compra"
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">shopping_cart_checkout</span>
              <span className="hidden sm:inline">Repor no Kardex</span>
            </Link>

            <button
              id="btn-bulk-desmarcar-todos"
              type="button"
              onClick={() => setSelectedIds([])}
              className="h-8 w-8 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
              title="Desmarcar todos"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL CORPORATIVO DE CADASTRO RÁPIDO DE PRODUTO */}
      {showNewProductModal && (
        <div
          id="modal-estoque-novo-produto"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-xl border border-[#7DA0CA] shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#052659] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[22px] text-[#C1E8FF]">add_box</span>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Cadastrar Novo Produto no Estoque</h3>
                  <p className="text-[11px] text-[#7DA0CA]">Cadastro manual para peças avulsas ou de marca própria</p>
                </div>
              </div>
              <button
                id="btn-modal-novo-produto-fechar"
                type="button"
                onClick={() => setShowNewProductModal(false)}
                className="text-[#C1E8FF] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                title="Fechar"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form id="form-modal-novo-produto" onSubmit={handleSaveNewProduct} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Categoria */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Categoria do Produto <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    id="btn-modal-categoria-armacao"
                    type="button"
                    onClick={() => setNewProductForm({ ...newProductForm, categoria: "armacoes" })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      newProductForm.categoria === "armacoes"
                        ? "bg-[#052659] text-white border-[#052659] shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <OpticalFrameIcon size={16} className="shrink-0" />
                    <span className="truncate">Armação</span>
                  </button>
                  <button
                    id="btn-modal-categoria-lente"
                    type="button"
                    onClick={() => setNewProductForm({ ...newProductForm, categoria: "lentes" })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      newProductForm.categoria === "lentes"
                        ? "bg-[#052659] text-white border-[#052659] shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] shrink-0">visibility</span>
                    <span className="truncate">Lente</span>
                  </button>
                  <button
                    id="btn-modal-categoria-contato"
                    type="button"
                    onClick={() => setNewProductForm({ ...newProductForm, categoria: "contato" })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      newProductForm.categoria === "contato"
                        ? "bg-[#052659] text-white border-[#052659] shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] shrink-0">radio_button_checked</span>
                    <span className="truncate">Contato</span>
                  </button>
                </div>
              </div>

              {/* Marca & Modelo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="input-modal-produto-marca" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Marca / Fabricante <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-modal-produto-marca"
                    type="text"
                    required
                    placeholder="ex: Ray-Ban, Vogue, Marca Própria"
                    value={newProductForm.marca}
                    onChange={(e) => setNewProductForm({ ...newProductForm, marca: e.target.value })}
                    className="w-full h-9 px-3 border border-[#7DA0CA]/60 rounded-lg text-xs font-semibold focus:border-[#052659] focus:ring-1 focus:ring-[#052659]"
                  />
                </div>
                <div>
                  <label htmlFor="input-modal-produto-referencia" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Modelo / Referência <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-modal-produto-referencia"
                    type="text"
                    required
                    placeholder="ex: RB5228, Aviador Retrô"
                    value={newProductForm.referencia}
                    onChange={(e) => setNewProductForm({ ...newProductForm, referencia: e.target.value })}
                    className="w-full h-9 px-3 border border-[#7DA0CA]/60 rounded-lg text-xs font-semibold focus:border-[#052659] focus:ring-1 focus:ring-[#052659]"
                  />
                </div>
              </div>

              {/* Cor e Tamanho */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="input-modal-produto-cor" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cor / Acabamento
                  </label>
                  <input
                    id="input-modal-produto-cor"
                    type="text"
                    placeholder="ex: Tartaruga Fosco, Preto Brilho"
                    value={newProductForm.cor}
                    onChange={(e) => setNewProductForm({ ...newProductForm, cor: e.target.value })}
                    className="w-full h-9 px-3 border border-[#7DA0CA]/60 rounded-lg text-xs font-medium focus:border-[#052659] focus:ring-1 focus:ring-[#052659]"
                  />
                </div>
                <div>
                  <label htmlFor="input-modal-produto-tamanho" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tamanho / Calibre
                  </label>
                  <input
                    id="input-modal-produto-tamanho"
                    type="text"
                    placeholder="ex: 54-18, 52-16"
                    value={newProductForm.tamanho}
                    onChange={(e) => setNewProductForm({ ...newProductForm, tamanho: e.target.value })}
                    className="w-full h-9 px-3 border border-[#7DA0CA]/60 rounded-lg text-xs font-medium focus:border-[#052659] focus:ring-1 focus:ring-[#052659]"
                  />
                </div>
              </div>

              {/* SKU & Código de Barras */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="input-modal-produto-sku" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    SKU / Código EAN
                  </label>
                  <button
                    id="btn-modal-produto-gerar-sku"
                    type="button"
                    onClick={generateSKU}
                    className="text-[11px] font-semibold text-[#5483B3] hover:text-[#052659] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">autorenew</span>
                    Gerar Novo
                  </button>
                </div>
                <input
                  id="input-modal-produto-sku"
                  type="text"
                  value={newProductForm.sku}
                  onChange={(e) => setNewProductForm({ ...newProductForm, sku: e.target.value })}
                  className="w-full h-9 px-3 border border-[#7DA0CA]/60 rounded-lg text-xs font-mono font-bold text-[#052659] bg-[#F0F6FC] focus:border-[#052659]"
                />
              </div>

              {/* Valores & Quantidade */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label htmlFor="input-modal-produto-preco" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Preço Venda (R$)
                  </label>
                  <input
                    id="input-modal-produto-preco"
                    type="text"
                    required
                    placeholder="890,00"
                    value={newProductForm.preco}
                    onChange={(e) => setNewProductForm({ ...newProductForm, preco: e.target.value })}
                    className="w-full h-9 px-3 border border-[#7DA0CA]/60 rounded-lg text-xs font-mono font-bold focus:border-[#052659]"
                  />
                </div>
                {isManager && (
                  <div>
                    <label htmlFor="input-modal-produto-custo" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Custo Unit. (R$)
                    </label>
                    <input
                      id="input-modal-produto-custo"
                      type="text"
                      placeholder="380,00"
                      value={newProductForm.custo}
                      onChange={(e) => setNewProductForm({ ...newProductForm, custo: e.target.value })}
                      className="w-full h-9 px-3 border border-[#7DA0CA]/60 rounded-lg text-xs font-mono font-medium focus:border-[#052659]"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="input-modal-produto-qtd" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Qtd. Inicial
                  </label>
                  <input
                    id="input-modal-produto-qtd"
                    type="number"
                    min="1"
                    required
                    value={newProductForm.qtd}
                    onChange={(e) => setNewProductForm({ ...newProductForm, qtd: e.target.value })}
                    className="w-full h-9 px-3 border border-[#7DA0CA]/60 rounded-lg text-xs font-mono font-bold focus:border-[#052659]"
                  />
                </div>
              </div>

              {/* Modal Actions (Sticky Footer) */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs pt-3 pb-1 border-t border-slate-200 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  id="btn-modal-novo-produto-cancelar"
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <Button
                  id="btn-modal-novo-produto-salvar"
                  type="submit"
                  variant="primary"
                  size="md"
                  icon="save"
                  isLoading={isSavingProduct}
                  loadingText="Salvando no Estoque..."
                >
                  Salvar no Estoque
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
    </div>
  );
}

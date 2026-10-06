"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOperator } from "@/hooks/useOperator";
import { useToast } from "@/components/ToastProvider";
import PageHeader from "@/components/PageHeader";

export default function AjusteManualPage() {
  const router = useRouter();
  const toast = useToast();
  const { isManager, isLoaded } = useOperator();

  useEffect(() => {
    if (isLoaded && !isManager) {
      router.replace("/kardex");
    }
  }, [isLoaded, isManager, router]);

  const [motivo, setMotivo] = useState("quebra_lab");
  const [numeroOS, setNumeroOS] = useState("OS #10294 - Quebra de surfaçagem cilíndrica");
  const [responsavel, setResponsavel] = useState("Lucas Mendes (Técnico de Laboratório Óptico - Reg. CFT-1092)");
  const [skuBusca, setSkuBusca] = useState("78985201104 - Ray-Ban RX5228 Tartaruga 54-18-140 (Acetato Premium)");
  const [qtdAjuste, setQtdAjuste] = useState(1);
  const [justificativa, setJustificativa] = useState(
    "Lente direita trincada durante o biselamento em facetadora automática devido a microfissura estrutural no acetato da armação durante o aperto de bisel. Peça avariada separada para descarte técnico e termo de perda arquivado."
  );
  const [anexoNome, setAnexoNome] = useState("laudo_quebra_os10294_facetadora.jpg (2.4 MB)");
  const [sucessoRegistrado, setSucessoRegistrado] = useState(false);

  // Parâmetros fixos do SKU selecionado para simulação precisa
  const saldoAtual = 14;
  const custoUnitario = 410.0;
  const precoVenda = 890.0;
  const localizacao = "Gaveteiro A-04 (Gaveta Central)";

  const saldoProjetado = Math.max(0, saldoAtual - qtdAjuste);
  const impactoFinanceiro = qtdAjuste * custoUnitario;

  const handleRegistrarAjuste = () => {
    setSucessoRegistrado(true);
    toast.success(
      `Termo de baixa e ajuste manual registrado com sucesso! Protocolo #AJ-2026-10294 gerado (Saldo: ${saldoAtual} ➔ ${saldoProjetado} un).`,
      {
        title: "Ajuste Fiscal Homologado",
        icon: "verified",
      }
    );
  };

  const historicoAjustes = [
    {
      id: "1",
      dataHora: "Hoje, 14:15",
      operador: "Lucas Mendes",
      produto: "Lente Hoya MiYOSMART Poly 1.59",
      tipo: "Quebra Laboratório",
      qtd: "-1 par",
      impacto: "-R$ 472,50",
      protocolo: "#AJ-9921-OK",
    },
    {
      id: "2",
      dataHora: "Hoje, 11:30",
      operador: "Dra. Camila",
      produto: "Armação Vogue VO5352 Dourado",
      tipo: "Defeito de Fábrica",
      qtd: "-1 un",
      impacto: "-R$ 290,00",
      protocolo: "#AJ-9920-OK",
    },
    {
      id: "3",
      dataHora: "Hoje, 09:10",
      operador: "Marcos Almoxarife",
      produto: "Estojo Rígido Luxo Microfibra",
      tipo: "Balanço Físico",
      qtd: "+2 un",
      impacto: "+R$ 34,50",
      protocolo: "#AJ-9919-OK",
    },
  ];

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
        id="header-ajuste-manual"
        icon="tune"
        title="Ajuste Manual de Estoque"
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
            Protocolo Fiscal Ativo
          </span>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Kardex", href: "/kardex", id: "link-ajuste-breadcrumb-kardex" },
          { label: "Ajuste Manual" },
        ]}
        actions={
          <Link
            id="link-ajuste-voltar-kardex"
            href="/kardex"
            className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-xl text-xs font-bold border border-[#7DA0CA] text-[#052659] hover:bg-[#F0F6FC] bg-white transition-all shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#5483B3]">arrow_back</span>
            <span>Voltar ao Kardex</span>
          </Link>
        }
      />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner de Conformidade Fiscal */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-3 text-xs font-medium">
          <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0">shield</span>
          <span>
            <strong>Atenção:</strong> Toda movimentação manual gera evento irrevogável no Kardex auditável com assinatura digital e hash fiscal do operador (SHA-256).
          </span>
        </div>

        {sucessoRegistrado && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-400 text-emerald-900 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600 text-2xl">verified</span>
              <div>
                <div className="font-bold text-sm">Ajuste Manual Registrado e Termo Fiscal Emitido!</div>
                <div className="text-xs text-emerald-700">
                  Protocolo #AJ-2026-10294 gerado com sucesso. Saldo atualizado de {saldoAtual} para {saldoProjetado} un.
                </div>
              </div>
            </div>
            <Link
              id="link-ajuste-sucesso-ir-kardex"
              href="/kardex"
              className="px-4 py-1.5 rounded bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
            >
              Conferir no Kardex
            </Link>
          </div>
        )}

        {/* Formulário Principal Estruturado */}
        <div className="bg-[#FFFFFF] border border-[#7DA0CA] rounded-lg p-6 space-y-6 shadow-xs">
          {/* Seção 1: Natureza da Operação */}
          <div className="space-y-3 pb-6 border-b border-[#F0F6FC]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#052659] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#5483B3]">format_list_bulleted</span>
              1. Natureza da Operação &amp; Motivo do Ajuste
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { id: "quebra_lab", label: "Quebra em Laboratório / Montagem", desc: "Avaria em facetadora ou lixamento" },
                { id: "defeito_fabrica", label: "Defeito de Fabricação", desc: "Troca em garantia com fornecedor" },
                { id: "balanco_fisico", label: "Divergência de Contagem Física", desc: "Acerto de inventário periódico" },
                { id: "amostra_vitrine", label: "Amostra Grátis / Demonstração", desc: "Uso interno para clientes" },
              ].map((opcao) => {
                const isSelected = motivo === opcao.id;
                return (
                  <button
                    key={opcao.id}
                    id={`btn-ajuste-motivo-${opcao.id}`}
                    type="button"
                    onClick={() => setMotivo(opcao.id)}
                    className={`p-3 rounded text-left border transition-all ${
                      isSelected
                        ? "bg-[#052659] text-white border-[#052659] shadow-xs"
                        : "bg-[#FFFFFF] text-[#052659] border-[#7DA0CA] hover:bg-[#F0F6FC]"
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      {opcao.label}
                      {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${isSelected ? "text-[#C1E8FF]" : "text-slate-500"}`}>
                      {opcao.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#5483B3] uppercase">Tipo de Movimento</label>
                <div className="mt-1 h-9 px-3 rounded border border-rose-300 bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1.5 select-none">
                  <span className="material-symbols-outlined text-[16px]">remove_circle</span>
                  Baixa / Saída (- Subtrair do Saldo)
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5483B3] uppercase">Número da OS / Protocolo</label>
                <input
                  id="input-ajuste-numero-os"
                  type="text"
                  value={numeroOS}
                  onChange={(e) => setNumeroOS(e.target.value)}
                  className="mt-1 w-full h-9 px-3 rounded border border-[#7DA0CA] bg-[#FFFFFF] text-xs font-medium text-[#021024] focus:outline-none focus:ring-1 focus:ring-[#5483B3]"
                  placeholder="Ex: OS #10294"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5483B3] uppercase">Responsável Técnico</label>
                <select
                  id="select-ajuste-responsavel"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="mt-1 w-full h-9 px-3 rounded border border-[#7DA0CA] bg-[#FFFFFF] text-xs font-medium text-[#021024] focus:outline-none focus:ring-1 focus:ring-[#5483B3]"
                >
                  <option value="Lucas Mendes (Técnico de Laboratório Óptico - Reg. CFT-1092)">
                    Lucas Mendes (Técnico de Laboratório - CFT-1092)
                  </option>
                  <option value="Dra. Camila Vasconcelos (Optometrista - CRM-19283)">
                    Dra. Camila Vasconcelos (Optometrista)
                  </option>
                  <option value="Marcos Almoxarife (Controle de Estoque)">
                    Marcos Almoxarife (Controle de Estoque)
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Seção 2: Produto Afetado & Diagnóstico de Estoque */}
          <div className="space-y-3 pb-6 border-b border-[#F0F6FC]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#052659] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#5483B3]">barcode_scanner</span>
              2. Produto Afetado &amp; Conferência de Saldo Físico
            </h2>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#5483B3]">
                search
              </span>
              <input
                id="input-ajuste-busca-sku"
                type="text"
                value={skuBusca}
                onChange={(e) => setSkuBusca(e.target.value)}
                className="w-full h-10 pl-10 pr-3 rounded border border-[#7DA0CA] bg-[#FFFFFF] text-xs font-semibold text-[#052659] focus:outline-none focus:ring-1 focus:ring-[#5483B3]"
                placeholder="Buscar por SKU ou Código de Barras..."
              />
            </div>

            {/* Painel de Diagnóstico */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded bg-[#F0F6FC] border border-[#7DA0CA]">
              <div>
                <span className="text-[11px] font-semibold text-[#5483B3] uppercase">Saldo Físico Atual</span>
                <div className="text-base font-bold font-mono text-[#052659] mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {saldoAtual} Unidades
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#5483B3] uppercase">Custo Médio Unitário</span>
                <div className="text-sm font-bold font-mono text-[#021024] mt-0.5">
                  R$ {custoUnitario.toFixed(2).replace(".", ",")}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#5483B3] uppercase">Preço Venda Tabela</span>
                <div className="text-sm font-bold font-mono text-[#052659] mt-0.5">
                  R$ {precoVenda.toFixed(2).replace(".", ",")}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#5483B3] uppercase">Localização Almoxarifado</span>
                <div className="text-xs font-bold text-[#021024] mt-0.5 truncate">{localizacao}</div>
              </div>
            </div>

            {/* Bloco de Cálculo de Movimentação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded border border-[#7DA0CA] bg-[#FFFFFF]">
              <div>
                <label className="block text-[11px] font-bold text-[#052659] uppercase">Quantidade do Ajuste</label>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    id="btn-ajuste-qtd-diminuir"
                    type="button"
                    onClick={() => setQtdAjuste(Math.max(1, qtdAjuste - 1))}
                    className="w-9 h-9 rounded border border-[#7DA0CA] bg-[#F0F6FC] hover:bg-[#dce9f8] text-[#052659] font-bold text-sm"
                  >
                    -
                  </button>
                  <input
                    id="input-ajuste-qtd"
                    type="number"
                    value={qtdAjuste}
                    onChange={(e) => setQtdAjuste(Math.max(1, Number(e.target.value)))}
                    className="w-16 h-9 rounded border border-[#7DA0CA] text-center font-mono font-bold text-sm text-[#052659]"
                    min={1}
                    max={saldoAtual}
                  />
                  <button
                    id="btn-ajuste-qtd-aumentar"
                    type="button"
                    onClick={() => setQtdAjuste(Math.min(saldoAtual, qtdAjuste + 1))}
                    className="w-9 h-9 rounded border border-[#7DA0CA] bg-[#F0F6FC] hover:bg-[#dce9f8] text-[#052659] font-bold text-sm"
                  >
                    +
                  </button>
                  <span className="text-xs text-slate-500 font-medium">unidade(s)</span>
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-[#052659] uppercase">Saldo Resultante Projetado</span>
                <div className="mt-1 text-base font-bold font-mono text-[#052659] flex items-center gap-2">
                  <span>{saldoProjetado} Unidades</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                    -{qtdAjuste} un
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-[#052659] uppercase">Impacto Financeiro da Baixa</span>
                <div className="mt-1 text-base font-bold font-mono text-rose-700">
                  - R$ {impactoFinanceiro.toFixed(2).replace(".", ",")}
                </div>
                <span className="text-[10px] text-slate-500">Custo Médio debitado em Perdas Operacionais</span>
              </div>
            </div>
          </div>

          {/* Seção 3: Justificativa Técnica & Laudo */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#052659] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#5483B3]">description</span>
              3. Justificativa Clínica &amp; Laudo Técnico de Avaria (Obrigatório)
            </h2>

            <textarea
              id="textarea-ajuste-justificativa"
              rows={3}
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              className="w-full p-3 rounded border border-[#7DA0CA] bg-[#FFFFFF] text-xs font-medium text-[#021024] focus:outline-none focus:ring-1 focus:ring-[#5483B3]"
              placeholder="Descreva detalhadamente o motivo da perda técnica..."
            />

            {/* Dropzone de Evidência Fotográfica */}
            <div className="p-3.5 rounded border border-dashed border-[#7DA0CA] bg-[#F0F6FC] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#5483B3] text-2xl">photo_camera</span>
                <div>
                  <span className="text-xs font-bold text-[#052659] block">Foto da Peça / Laudo de Laboratório</span>
                  <span className="text-[11px] text-slate-500">Anexar evidência fotográfica da quebra ou avaria física</span>
                </div>
              </div>

              {anexoNome ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                  <span>{anexoNome}</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono">Verificado</span>
                </div>
              ) : (
                <button
                  id="btn-ajuste-selecionar-imagem"
                  type="button"
                  onClick={() => setAnexoNome("laudo_quebra_os10294_facetadora.jpg")}
                  className="px-3 py-1.5 rounded border border-[#7DA0CA] bg-[#FFFFFF] text-[#052659] hover:bg-[#F0F6FC] text-xs font-semibold"
                >
                  Selecionar Imagem
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabela de Histórico de Ajustes do Dia */}
        <section className="bg-[#FFFFFF] border border-[#7DA0CA] rounded-lg overflow-hidden shadow-xs">
          <div className="p-4 bg-[#F0F6FC] border-b border-[#7DA0CA] flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#052659] uppercase tracking-wide flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px] text-[#5483B3]">history</span>
              Últimos Ajustes Manuais Registrados Hoje (Filial Centro)
            </h3>
            <Link id="link-ajuste-ver-historico-kardex" href="/kardex" className="text-xs font-semibold text-[#5483B3] hover:underline">
              Ver Todo Histórico do Kardex →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table id="table-ajuste-historico-dia" className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F0F6FC] text-[#052659] border-b border-[#7DA0CA] text-[11px] font-bold uppercase tracking-wider select-none">
                  <th className="px-4 py-3 whitespace-nowrap">Data / Hora</th>
                  <th className="px-4 py-3 whitespace-nowrap">Operador</th>
                  <th className="px-4 py-3 whitespace-nowrap">Produto</th>
                  <th className="px-4 py-3 whitespace-nowrap">Tipo de Ajuste</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Qtd.</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Impacto</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Protocolo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#021024]">
                {historicoAjustes.map((item) => (
                  <tr key={item.id} className="hover:bg-[#C1E8FF]/20 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-600 whitespace-nowrap">
                      {item.dataHora}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#052659] whitespace-nowrap">{item.operador}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.produto}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0F6FC] text-[#052659] border border-[#7DA0CA]">
                        {item.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-rose-700 whitespace-nowrap">
                      {item.qtd}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold whitespace-nowrap">{item.impacto}</td>
                    <td className="px-4 py-3 text-center font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {item.protocolo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Sticky Bottom Bar */}
      <footer className="fixed bottom-0 left-0 md:left-64 right-0 z-30 bg-[#FFFFFF] border-t border-[#7DA0CA] px-6 lg:px-10 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Terminal Homologado SEFAZ/SP: Online | Auditoria Fiscal Ativa</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link
              id="link-ajuste-cancelar"
              href="/kardex"
              className="px-4 py-2 rounded border border-[#7DA0CA] text-[#052659] hover:bg-[#F0F6FC] text-xs font-semibold transition-colors"
            >
              Cancelar
            </Link>
            <button
              id="btn-ajuste-registrar-termo"
              type="button"
              onClick={handleRegistrarAjuste}
              className="px-5 py-2.5 rounded bg-[#052659] hover:bg-[#021024] text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">inventory_2</span>
              Registrar Ajuste &amp; Emitir Termo de Baixa (F8)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

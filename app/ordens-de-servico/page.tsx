"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import PageHeader from "@/components/PageHeader";
import OsStepper from "@/components/OsStepper";
import SelectableCard from "@/components/SelectableCard";

interface PrescriptionEye {
  esf: string;
  cil: string;
  eixo: string;
  add: string;
  dnp: string;
  altura: string;
}

export default function OrdensDeServicoPage() {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1); // Inicia limpo na Etapa 1 (Cliente)
  const [osSaved, setOsSaved] = useState(false);

  // Client Data (Inicia vazio para nova emissão real de balcão)
  const [clientData, setClientData] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    tipoAtendimento: "Particular",
    medico: "",
    crm: "",
    dataConsulta: "",
    validade: "",
  });

  // Prescription Data (Inicia vazio)
  const [od, setOd] = useState<PrescriptionEye>({
    esf: "",
    cil: "",
    eixo: "",
    add: "",
    dnp: "",
    altura: "",
  });

  const [oe, setOe] = useState<PrescriptionEye>({
    esf: "",
    cil: "",
    eixo: "",
    add: "",
    dnp: "",
    altura: "",
  });

  // Selected Frame & Lens
  const [selectedFrame, setSelectedFrame] = useState({
    sku: "",
    marca: "",
    referencia: "",
    preco: 0,
  });

  const [selectedLens, setSelectedLens] = useState({
    marca: "",
    modelo: "",
    tipo: "",
    preco: 0,
  });

  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);

  // Preenchimento rápido com dados de teste para homologação
  const handlePreencherExemplo = () => {
    setClientData({
      nome: "Mariana Souza",
      cpf: "341.592.810-08",
      telefone: "(11) 98765-4321",
      tipoAtendimento: "Particular",
      medico: "Dr. Eduardo F. Silveira",
      crm: "CRM/SP 148.920",
      dataConsulta: "24/10/2026",
      validade: "24/10/2027 (1 ano)",
    });
    setOd({
      esf: "+0.75",
      cil: "-1.00",
      eixo: "180",
      add: "+1.50",
      dnp: "31.5",
      altura: "19.0",
    });
    setOe({
      esf: "-1.25",
      cil: "0.00",
      eixo: "",
      add: "+1.50",
      dnp: "32.0",
      altura: "19.0",
    });
    setSelectedFrame({
      sku: "78985201104",
      marca: "Ray-Ban",
      referencia: "RX5228 Tartaruga 54-18",
      preco: 890.0,
    });
    setSelectedLens({
      marca: "Essilor",
      modelo: "Varilux Comfort Max Crizal Sapphire HR",
      tipo: "Multifocal Digital Campo Amplo",
      preco: 1250.0,
    });
    setSelectedTreatments([
      "Antirreflexo Crizal HR",
      "Filtro Luz Azul Blue UV",
    ]);

    toast.info("Dados de teste preenchidos com sucesso! Você já pode avançar pelas etapas da Ordem de Serviço.", {
      title: "Exemplo Carregado",
      icon: "science",
    });
  };

  // Limpeza completa do formulário para novo atendimento
  const handleLimparFormulario = () => {
    setClientData({
      nome: "",
      cpf: "",
      telefone: "",
      tipoAtendimento: "Particular",
      medico: "",
      crm: "",
      dataConsulta: "",
      validade: "",
    });
    setOd({
      esf: "",
      cil: "",
      eixo: "",
      add: "",
      dnp: "",
      altura: "",
    });
    setOe({
      esf: "",
      cil: "",
      eixo: "",
      add: "",
      dnp: "",
      altura: "",
    });
    setSelectedFrame({
      sku: "",
      marca: "",
      referencia: "",
      preco: 0,
    });
    setSelectedLens({
      marca: "",
      modelo: "",
      tipo: "",
      preco: 0,
    });
    setSelectedTreatments([]);
    setCurrentStep(1);

    toast.info("O formulário de Nova OS foi limpo.", {
      title: "Formulário Resetado",
      icon: "restart_alt",
    });
  };

  // Sanitização e formatação inteligente de dioptrias ópticas
  const sanitizeDiopterInput = (text: string): string => {
    // Permite apenas números, vírgula, ponto e sinal (+ ou -) no início
    let sanitized = text.replace(/[^0-9.,+-]/g, "");
    if (sanitized.length > 1) {
      const first = sanitized[0];
      const rest = sanitized.slice(1).replace(/[+-]/g, "");
      sanitized = (first === "+" || first === "-" ? first : "") + rest;
    }
    return sanitized.slice(0, 6);
  };

  const formatDiopterOnBlur = (val: string): string => {
    if (!val || val.trim() === "") return "";
    const cleanStr = val.replace(",", ".").trim();
    let num = parseFloat(cleanStr);
    if (isNaN(num)) return "";
    if (num > 30) num = 30;
    if (num < -30) num = -30;
    const rounded = Math.round(num / 0.25) * 0.25;
    const sign = rounded > 0 ? "+" : "";
    return `${sign}${rounded.toFixed(2)}`;
  };

  // Optical validation helpers
  const validateDiopter = (val: string): { isValid: boolean; message?: string } => {
    if (!val || val.trim() === "") return { isValid: true };
    const cleanStr = val.replace(",", ".").replace("+", "").trim();
    const num = parseFloat(cleanStr);
    if (isNaN(num)) return { isValid: false, message: "Valor inválido" };
    if (Math.abs(num) > 30) return { isValid: false, message: "Máx: ±30.00D" };

    // Check multiple of 0.25
    const remainder = Math.abs(Math.round(num * 100)) % 25;
    if (remainder !== 0) {
      const lower = (Math.floor(num / 0.25) * 0.25).toFixed(2);
      const upper = (Math.ceil(num / 0.25) * 0.25).toFixed(2);
      return {
        isValid: false,
        message: `Passo 0.25 (sugestão: ${lower > "0" ? "+" + lower : lower} ou ${upper > "0" ? "+" + upper : upper})`,
      };
    }
    return { isValid: true };
  };

  const isCilindricoActive = (cil: string) => {
    if (!cil) return false;
    const num = parseFloat(cil.replace("+", ""));
    return !isNaN(num) && num !== 0;
  };

  const validateAxis = (cil: string, eixo: string): { isValid: boolean; message?: string } => {
    if (!isCilindricoActive(cil)) return { isValid: true };
    if (!eixo || eixo.trim() === "") {
      return { isValid: false, message: "Obrigatório (0º a 180º) para cilíndrico preenchido" };
    }
    const num = parseInt(eixo, 10);
    if (isNaN(num) || num < 0 || num > 180) {
      return { isValid: false, message: "O eixo deve estar entre 0º e 180º" };
    }
    return { isValid: true };
  };

  // Run validations
  const odEsfValidation = useMemo(() => validateDiopter(od.esf), [od.esf]);
  const odCilValidation = useMemo(() => validateDiopter(od.cil), [od.cil]);
  const odEixoValidation = useMemo(() => validateAxis(od.cil, od.eixo), [od.cil, od.eixo]);

  const oeEsfValidation = useMemo(() => validateDiopter(oe.esf), [oe.esf]);
  const oeCilValidation = useMemo(() => validateDiopter(oe.cil), [oe.cil]);
  const oeEixoValidation = useMemo(() => validateAxis(oe.cil, oe.eixo), [oe.cil, oe.eixo]);

  const validationErrors = useMemo(() => {
    const list: string[] = [];
    if (!odEsfValidation.isValid) list.push("Esférico OD fora do passo de 0.25");
    if (!odCilValidation.isValid) list.push("Cilíndrico OD fora do passo de 0.25");
    if (!odEixoValidation.isValid) list.push("Eixo OD obrigatório (astigmatismo ativo)");

    if (!oeEsfValidation.isValid) list.push("Esférico OE fora do passo de 0.25");
    if (!oeCilValidation.isValid) list.push("Cilíndrico OE fora do passo de 0.25");
    if (!oeEixoValidation.isValid) list.push("Eixo OE obrigatório (astigmatismo ativo)");

    return list;
  }, [
    odEsfValidation,
    odCilValidation,
    odEixoValidation,
    oeEsfValidation,
    oeCilValidation,
    oeEixoValidation,
  ]);

  const hasErrors = validationErrors.length > 0;

  // Auto-correct helper for demo / quick test
  const handleAutoCorrect = () => {
    setOd((prev) => ({
      ...prev,
      esf: formatDiopterOnBlur(prev.esf) || "+0.75",
      cil: formatDiopterOnBlur(prev.cil) || "-1.00",
      eixo: prev.eixo && parseInt(prev.eixo, 10) >= 0 && parseInt(prev.eixo, 10) <= 180 ? prev.eixo : "180",
      add: prev.add || "+1.50",
      dnp: prev.dnp || "31.5",
      altura: prev.altura || "19.0",
    }));
    setOe((prev) => ({
      ...prev,
      esf: formatDiopterOnBlur(prev.esf) || "-1.25",
      cil: formatDiopterOnBlur(prev.cil) || "0.00",
      eixo: prev.cil && parseFloat(prev.cil) !== 0 ? (prev.eixo || "180") : "",
      add: prev.add || "+1.50",
      dnp: prev.dnp || "32.0",
      altura: prev.altura || "19.0",
    }));

    toast.success("Dioptrias ajustadas para valores clinicamente válidos!", {
      title: "Prescrição Corrigida",
      icon: "auto_fix_high",
    });
  };

  // Máscaras de entrada em tempo real
  const maskCPF = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const maskPhone = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const isCPFValid = (cpf: string): boolean => {
    const clean = cpf.replace(/\D/g, "");
    return clean.length === 11;
  };

  const isPhoneValid = (phone: string): boolean => {
    const clean = phone.replace(/\D/g, "");
    return clean.length >= 10 && clean.length <= 11;
  };

  // Validações de completude de cada etapa
  const isStep1Complete = useMemo(() => {
    return (
      clientData.nome.trim().length >= 3 &&
      isCPFValid(clientData.cpf) &&
      isPhoneValid(clientData.telefone)
    );
  }, [clientData.nome, clientData.cpf, clientData.telefone]);

  const isStep2Complete = useMemo(() => {
    const hasAnyDiopter = Boolean(od.esf?.trim() || oe.esf?.trim());
    return hasAnyDiopter && !hasErrors;
  }, [od.esf, oe.esf, hasErrors]);

  const isStep3Complete = useMemo(() => {
    return Boolean(selectedFrame.sku && selectedLens.marca);
  }, [selectedFrame.sku, selectedLens.marca]);

  const isCurrentStepReady = useMemo(() => {
    if (currentStep === 1) return isStep1Complete;
    if (currentStep === 2) return isStep2Complete;
    if (currentStep === 3) return isStep3Complete;
    return true;
  }, [currentStep, isStep1Complete, isStep2Complete, isStep3Complete]);

  const canAccessStep = (step: 1 | 2 | 3 | 4): boolean => {
    if (step <= currentStep) return true;
    if (step === 2) return isStep1Complete;
    if (step === 3) return isStep1Complete && isStep2Complete;
    if (step === 4) return isStep1Complete && isStep2Complete && isStep3Complete;
    return false;
  };

  // Governança Estrita do Stepper com Validação Bloqueante e Feedback via Toast
  const navigateToStep = (targetStep: 1 | 2 | 3 | 4) => {
    if (targetStep === currentStep) return;

    // Retorno para etapas anteriores é sempre livre
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    // 1. Validação obrigatória da Etapa 1 (Cliente) para avançar
    if (targetStep >= 2) {
      if (!clientData.nome.trim() || clientData.nome.trim().length < 3) {
        toast.warning("Informe o Nome Completo do cliente (mínimo 3 caracteres) para prosseguir.", {
          title: "Nome Obrigatório",
          icon: "person",
        });
        return;
      }
      if (!isCPFValid(clientData.cpf)) {
        toast.warning("Informe o CPF com 11 dígitos no formato 000.000.000-00.", {
          title: "CPF Incompleto",
          icon: "pin",
        });
        return;
      }
      if (!isPhoneValid(clientData.telefone)) {
        toast.warning("Informe o Telefone / WhatsApp com DDD (mínimo 10 dígitos).", {
          title: "Telefone Incompleto",
          icon: "call",
        });
        return;
      }
    }

    // 2. Validação obrigatória da Etapa 2 (Receita) para avançar
    if (targetStep >= 3) {
      const hasAnyDiopter = Boolean(od.esf?.trim() || oe.esf?.trim());
      if (!hasAnyDiopter) {
        toast.warning("Preencha ao menos a dioptria esférica de OD ou OE da receita médica para prosseguir.", {
          title: "Receita em Branco",
          icon: "visibility",
        });
        return;
      }
      if (hasErrors) {
        toast.warning(`Corrija os ${validationErrors.length} bloqueio(s) clínicos na receita médica antes de selecionar as peças.`, {
          title: "Prescrição com Pendências",
          icon: "lock",
        });
        return;
      }
    }

    // 3. Validação obrigatória da Etapa 3 (Produtos) para avançar
    if (targetStep >= 4) {
      if (!selectedFrame.sku) {
        toast.warning("Selecione uma armação do estoque livre para montar a Ordem de Serviço.", {
          title: "Armação Não Selecionada",
          icon: "eyeglasses",
        });
        return;
      }
      if (!selectedLens.marca) {
        toast.warning("Selecione o bloco de lentes oftálmicas adequado para a receita.", {
          title: "Lente Não Selecionada",
          icon: "visibility",
        });
        return;
      }
    }

    setCurrentStep(targetStep);
  };

  // Financial calculations
  const totalGeral = useMemo(() => {
    return selectedFrame.preco + selectedLens.preco + selectedTreatments.length * 90;
  }, [selectedFrame, selectedLens, selectedTreatments]);

  return (
    <div className="min-h-screen bg-[#f6f9fc] text-[#021024] flex flex-col justify-between">
      {/* 1. TOP COMPONENTIZED HEADER & ADAPTIVE STEPPER */}
      <PageHeader
        id="header-ordens-de-servico"
        icon="add_circle"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Ordens de Serviço", href: "/ordens-de-servico/fila" },
          { label: "Nova Ordem de Serviço" },
        ]}
        backHref="/"
        backLabel="Dashboard"
        backId="link-os-voltar-dashboard"
        title="Nova Ordem de Serviço #10315"
        badge={
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#c1e8ff]/60 text-[#052659] border border-[#7da0ca]/40 whitespace-nowrap">
            Em Aberto
          </span>
        }
        subtitle={
          <span title={clientData.nome || undefined}>
            {clientData.nome ? `Cliente: ${clientData.nome}` : "Balcão & Prescrição Óptica"}
          </span>
        }
        centerSlot={
          <OsStepper
            currentStep={currentStep}
            onSelectStep={navigateToStep}
            canAccessStep={canAccessStep}
          />
        }
        actions={
          <button
            id="btn-os-salvar-rascunho-top"
            type="button"
            onClick={() =>
              toast.success("Rascunho da Ordem de Serviço salvo temporariamente no navegador.", {
                title: "Rascunho Salvo",
                icon: "save",
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#052659] border border-[#7da0ca]/40 bg-white hover:bg-[#f0f6fc] rounded-lg transition-colors shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Salvar Rascunho</span>
          </button>
        }
      />

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 max-w-[1760px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* STEP 1: DADOS DO CLIENTE */}
        {currentStep === 1 && (
          <section className="bg-white rounded-xl border border-[#C1E8FF]/60 shadow-sm p-6 space-y-6">
            <div className="border-b border-[#d0e2f2] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#052659]">1. Identificação do Cliente &amp; Atendimento</h2>
                <p className="text-xs text-slate-500 mt-0.5">Cadastre ou selecione o cliente para emissão da Ordem de Serviço</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id="btn-os-step1-preencher-teste"
                  type="button"
                  onClick={handlePreencherExemplo}
                  className="px-3 py-1.5 rounded-lg bg-[#052659] hover:bg-[#021024] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Preencher com dados fictícios para teste rápido"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#C1E8FF]">science</span>
                  <span>Preencher Dados de Teste</span>
                </button>
                {clientData.nome && (
                  <button
                    id="btn-os-step1-limpar"
                    type="button"
                    onClick={handleLimparFormulario}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    title="Limpar formulário"
                  >
                    <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                    <span>Limpar</span>
                  </button>
                )}
                <span className="px-2.5 py-1.5 rounded-lg bg-[#f0f6fc] text-[#052659] text-xs font-semibold border border-[#7da0ca]/40 whitespace-nowrap">
                  {clientData.nome && isCPFValid(clientData.cpf) && isPhoneValid(clientData.telefone)
                    ? "Cliente 100% Validado"
                    : "Campos Obrigatórios Pendentes"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-os-cliente-nome"
                  type="text"
                  maxLength={70}
                  value={clientData.nome}
                  onChange={(e) => setClientData({ ...clientData, nome: e.target.value.slice(0, 70) })}
                  className="w-full h-10 px-3 border border-[#d0e2f2] rounded-lg text-sm font-medium focus:border-[#052659] focus:ring-1 focus:ring-[#052659]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {clientData.nome.length}/70 caracteres
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>CPF <span className="text-rose-500">*</span></span>
                  {clientData.cpf && (
                    <span className={`text-[10px] font-bold ${isCPFValid(clientData.cpf) ? "text-emerald-700" : "text-amber-700"}`}>
                      {isCPFValid(clientData.cpf) ? "✓ Válido" : "11 dígitos obrigatórios"}
                    </span>
                  )}
                </label>
                <input
                  id="input-os-cliente-cpf"
                  type="text"
                  maxLength={14}
                  placeholder="000.000.000-00"
                  value={clientData.cpf}
                  onChange={(e) => setClientData({ ...clientData, cpf: maskCPF(e.target.value) })}
                  className="w-full h-10 px-3 border border-[#d0e2f2] rounded-lg text-sm font-mono focus:border-[#052659] focus:ring-1 focus:ring-[#052659]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Formato: 000.000.000-00
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Telefone / WhatsApp <span className="text-rose-500">*</span></span>
                  {clientData.telefone && (
                    <span className={`text-[10px] font-bold ${isPhoneValid(clientData.telefone) ? "text-emerald-700" : "text-amber-700"}`}>
                      {isPhoneValid(clientData.telefone) ? "✓ Válido" : "DDD + número"}
                    </span>
                  )}
                </label>
                <input
                  id="input-os-cliente-telefone"
                  type="text"
                  maxLength={15}
                  placeholder="(00) 00000-0000"
                  value={clientData.telefone}
                  onChange={(e) => setClientData({ ...clientData, telefone: maskPhone(e.target.value) })}
                  className="w-full h-10 px-3 border border-[#d0e2f2] rounded-lg text-sm font-medium focus:border-[#052659] focus:ring-1 focus:ring-[#052659]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Formato: (00) 00000-0000
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tipo de Atendimento</label>
                <select
                  id="select-os-cliente-atendimento"
                  value={clientData.tipoAtendimento}
                  onChange={(e) => setClientData({ ...clientData, tipoAtendimento: e.target.value })}
                  className="w-full h-10 px-3 border border-[#d0e2f2] rounded-lg text-sm font-medium focus:border-[#052659] focus:ring-1 focus:ring-[#052659]"
                >
                  <option>Particular</option>
                  <option>Convênio Oftalmológico Amil</option>
                  <option>Convênio Bradesco Saúde</option>
                  <option>Cortesia / Garantia de Adaptação</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Consultor Responsável</label>
                <input
                  type="text"
                  disabled
                  value="Dr. Carlos Ramos (Gerente)"
                  className="w-full h-10 px-3 bg-[#f0f6fc] border border-[#d0e2f2] rounded-lg text-sm font-semibold text-[#052659] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Filial de Atendimento</label>
                <input
                  type="text"
                  disabled
                  value="Filial Centro - Loja 01"
                  className="w-full h-10 px-3 bg-[#f0f6fc] border border-[#d0e2f2] rounded-lg text-sm font-semibold text-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Quick Autocomplete: Clientes Frequentes de Balcão */}
            <div className="pt-5 border-t border-[#d0e2f2]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#052659] text-[18px]">history</span>
                  <h3 className="text-xs font-bold text-[#052659] uppercase tracking-wider">
                    Clientes Frequentes de Balcão (Acesso Rápido)
                  </h3>
                </div>
                <span className="text-[11px] text-[#5483B3] font-mono hidden sm:inline">1-Clique para preenchimento ágil</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {
                    nome: "Roberto Mendes de Oliveira",
                    cpf: "348.912.778-05",
                    telefone: "(11) 98765-4321",
                    convenio: "Particular",
                    tag: "Última OS: #10287",
                  },
                  {
                    nome: "Beatriz Fagundes Rocha",
                    cpf: "882.143.905-22",
                    telefone: "(11) 97412-3390",
                    convenio: "Convênio Bradesco Saúde",
                    tag: "Última OS: #10279",
                  },
                  {
                    nome: "Claudio Nogueira Dias",
                    cpf: "512.638.441-90",
                    telefone: "(11) 96321-8854",
                    convenio: "Convênio Oftalmológico Amil",
                    tag: "Última OS: #10274",
                  },
                ].map((frequent, idx) => (
                  <div
                    key={idx}
                    id={`card-os-cliente-recente-${idx + 1}`}
                    className="p-3.5 rounded-xl border border-[#C1E8FF]/80 bg-[#F0F6FC]/60 hover:bg-[#F0F6FC] hover:border-[#5483B3] transition-all flex flex-col justify-between shadow-2xs group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-[#052659] truncate group-hover:text-[#5483B3] transition-colors">
                          {frequent.nome}
                        </span>
                        <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#C1E8FF] text-[#052659] shrink-0">
                          {frequent.tag}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500 font-mono space-y-0.5">
                        <div>CPF: {frequent.cpf}</div>
                        <div>WhatsApp: {frequent.telefone}</div>
                        <div className="text-[10px] text-[#5483B3] font-sans font-medium">{frequent.convenio}</div>
                      </div>
                    </div>

                    <button
                      id={`btn-os-usar-cliente-recente-${idx + 1}`}
                      type="button"
                      onClick={() => {
                        setClientData({
                          ...clientData,
                          nome: frequent.nome,
                          cpf: frequent.cpf,
                          telefone: frequent.telefone,
                          tipoAtendimento: frequent.convenio,
                        });
                        toast.info(`Dados de ${frequent.nome.split(" ")[0]} preenchidos no formulário!`, {
                          title: "Cliente Selecionado",
                          icon: "person_check",
                        });
                      }}
                      className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-white hover:bg-[#052659] text-[#052659] hover:text-white border border-[#7DA0CA]/60 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">touch_app</span>
                      <span>Preencher Dados</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                id="btn-os-avancar-step-2"
                type="button"
                onClick={() => navigateToStep(2)}
                className={`h-10 px-6 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-2 select-none ${
                  !isStep1Complete
                    ? "bg-slate-200 text-slate-500 border border-slate-300 hover:bg-slate-300 cursor-not-allowed"
                    : "bg-[#052659] hover:bg-[#021024] text-white cursor-pointer"
                }`}
              >
                <span>Avançar para Receita Óptica</span>
                <span className="material-symbols-outlined text-[16px]">
                  {!isStep1Complete ? "lock" : "arrow_forward"}
                </span>
              </button>
            </div>
          </section>
        )}

        {/* STEP 2: PRESCRIÇÃO ÓPTICA & MATRIZ DIÓPTRICA */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Global Warning Banner if Errors are Present */}
            {hasErrors ? (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-950">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-rose-100 rounded-lg text-rose-700 mt-0.5">
                    <span className="material-symbols-outlined text-[20px]">error</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
                      <span>Inconsistências Clínicas Detectadas</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-200 text-rose-900 font-bold">
                        {validationErrors.length} BLOQUEIO{validationErrors.length > 1 ? "S" : ""}
                      </span>
                    </h3>
                    <p className="text-xs text-rose-800 mt-0.5">
                      {validationErrors.join(" • ")}. Corrija os valores ou utilize a correção automática para liberar o próximo passo.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    id="btn-os-corrigir-dioptrias"
                    type="button"
                    onClick={handleAutoCorrect}
                    className="h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-2xs whitespace-nowrap flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">auto_fix_high</span>
                    <span>Corrigir Dioptrias</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 shadow-xs flex items-center gap-3 text-emerald-950">
                <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">Prescrição Óptica 100% Validada</h3>
                  <p className="text-xs text-emerald-800">
                    Todos os passos dióptricos (múltiplos de 0.25) e regras de eixo/astigmatismo estão em conformidade com as normas ópticas.
                  </p>
                </div>
              </div>
            )}

            {/* Diopter Matrix Card */}
            <section className="bg-white rounded-xl border border-[#d0e2f2] shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-[#d0e2f2] bg-[#f8fbfe] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#052659] text-[22px]">visibility</span>
                    <h2 className="text-base font-bold text-[#052659]">Prescrição Oftalmológica (Matriz Dióptrica)</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Insira os valores da receita médica. Validação estrita de passos de 0.25 e regra técnica de astigmatismo.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    id="btn-os-matriz-preencher-exemplo"
                    type="button"
                    onClick={handleAutoCorrect}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#052659] text-white hover:bg-[#021024] font-semibold text-xs transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                    title="Ajustar valores para receita padrão válida com passos de 0.25D"
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#C1E8FF]">auto_fix_high</span>
                    <span>Preencher Prescrição Válida</span>
                  </button>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#c1e8ff]/60 text-[#052659] font-mono-data text-xs font-bold border border-[#7da0ca]/40">
                    <span className="material-symbols-outlined text-[14px]">tune</span> Intervalo: 0.25D
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#f0f6fc] text-[#5483b3] font-mono-data text-xs border border-[#d0e2f2]">
                    Notação: Esfero-Cilíndrica (-)
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="p-6 overflow-x-auto">
                <table id="table-os-matriz-dioptrica" className="w-full min-w-[760px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-[#d0e2f2] text-xs font-bold text-left uppercase tracking-wider">
                      <th className="px-4 py-3 w-36 font-bold text-[#021024]">Olho</th>
                      <th className="px-3 py-3 text-center min-w-[130px]">Esférico (D)</th>
                      <th className="px-3 py-3 text-center min-w-[130px]">Cilíndrico (D)</th>
                      <th className="px-3 py-3 text-center min-w-[110px]">Eixo (º)</th>
                      <th className="px-3 py-3 text-center min-w-[110px]">Adição (D)</th>
                      <th className="px-3 py-3 text-center min-w-[100px]">DNP (mm)</th>
                      <th className="px-3 py-3 text-center min-w-[100px]">Altura (mm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d0e2f2] text-sm">
                    {/* LINHA 1: OD */}
                    <tr className="hover:bg-[#f0f6fc]/50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-[#052659] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            OD
                          </span>
                          <div>
                            <span className="font-bold text-[#021024] block text-xs">Olho Direito</span>
                            <span className="text-[10px] text-[#5483b3] block font-mono">Oculus Dexter</span>
                          </div>
                        </div>
                      </td>

                      {/* Esférico OD */}
                      <td className="px-3 py-4 text-center">
                        <div className="inline-block w-full max-w-[120px]">
                          <input
                            id="input-os-od-esferico"
                            type="text"
                            maxLength={6}
                            value={od.esf}
                            onChange={(e) => setOd({ ...od, esf: sanitizeDiopterInput(e.target.value) })}
                            onBlur={(e) => setOd({ ...od, esf: formatDiopterOnBlur(e.target.value) })}
                            placeholder="±0.00"
                            className={`w-full h-11 text-center font-mono text-sm md:text-base font-bold rounded-lg border transition-all ${
                              !odEsfValidation.isValid
                                ? "bg-rose-50 border-2 border-rose-500 text-rose-900 ring-2 ring-rose-200"
                                : "bg-white border-[#d0e2f2] text-[#052659] focus:border-[#052659] focus:ring-2 focus:ring-[#5483b3]/20"
                            }`}
                          />
                        </div>
                        <div className="mt-1">
                          {odEsfValidation.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span> Passo 0.25
                            </span>
                          ) : (
                            <span className="block text-[11px] text-rose-600 font-bold">{odEsfValidation.message}</span>
                          )}
                        </div>
                      </td>

                      {/* Cilíndrico OD */}
                      <td className="px-3 py-4 text-center">
                        <div className="inline-block w-full max-w-[120px]">
                          <input
                            id="input-os-od-cilindrico"
                            type="text"
                            maxLength={6}
                            value={od.cil}
                            onChange={(e) => setOd({ ...od, cil: sanitizeDiopterInput(e.target.value) })}
                            onBlur={(e) => setOd({ ...od, cil: formatDiopterOnBlur(e.target.value) })}
                            placeholder="-0.00"
                            className={`w-full h-11 text-center font-mono text-sm md:text-base font-bold rounded-lg border transition-all ${
                              !odCilValidation.isValid
                                ? "bg-rose-50 border-2 border-rose-500 text-rose-900 ring-2 ring-rose-200"
                                : "bg-white border-[#d0e2f2] text-[#052659] focus:border-[#052659] focus:ring-2 focus:ring-[#5483b3]/20"
                            }`}
                          />
                        </div>
                        <div className="mt-1">
                          {isCilindricoActive(od.cil) ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#5483b3] font-medium">
                              Astigmatismo ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                              Sem astigmatismo
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Eixo OD */}
                      <td className="px-3 py-4 text-center">
                        <div className="inline-block w-full max-w-[110px]">
                          <input
                            id="input-os-od-eixo"
                            type="text"
                            maxLength={3}
                            disabled={!isCilindricoActive(od.cil)}
                            value={od.eixo}
                            onChange={(e) => setOd({ ...od, eixo: e.target.value.replace(/[^0-9]/g, "").slice(0, 3) })}
                            placeholder={isCilindricoActive(od.cil) ? "0 a 180" : "—"}
                            className={`w-full h-11 text-center font-mono text-sm md:text-base font-bold rounded-lg border transition-all ${
                              !isCilindricoActive(od.cil)
                                ? "bg-slate-100 border-[#d0e2f2] text-slate-400 cursor-not-allowed"
                                : !odEixoValidation.isValid
                                ? "bg-rose-50 border-2 border-rose-500 text-rose-900 ring-2 ring-rose-200"
                                : "bg-white border-[#d0e2f2] text-[#052659] focus:border-[#052659] focus:ring-2 focus:ring-[#5483b3]/20"
                            }`}
                          />
                        </div>
                        <div className="mt-1">
                          {!isCilindricoActive(od.cil) ? (
                            <span className="text-[11px] text-slate-400">Bloqueado (Cil = 0.00)</span>
                          ) : !odEixoValidation.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-bold">
                              <span className="material-symbols-outlined text-[14px]">warning</span> Obrigatório (0º a 180º)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span> Eixo Válido
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Adição OD */}
                      <td className="px-3 py-4 text-center">
                        <div className="inline-block w-full max-w-[110px]">
                          <input
                            id="input-os-od-adicao"
                            type="text"
                            maxLength={6}
                            value={od.add}
                            onChange={(e) => setOd({ ...od, add: sanitizeDiopterInput(e.target.value) })}
                            onBlur={(e) => setOd({ ...od, add: formatDiopterOnBlur(e.target.value) })}
                            placeholder="+0.00"
                            className="w-full h-11 text-center font-mono text-sm md:text-base font-bold rounded-lg border border-[#d0e2f2] bg-white text-[#052659] focus:border-[#052659] focus:ring-2 focus:ring-[#5483b3]/20"
                          />
                        </div>
                        <div className="mt-1">
                          <span className="text-[11px] text-slate-500">Presbiopia</span>
                        </div>
                      </td>

                      {/* DNP OD */}
                      <td className="px-3 py-4 text-center">
                        <div className="inline-block w-full max-w-[100px]">
                          <input
                            id="input-os-od-dnp"
                            type="text"
                            maxLength={5}
                            value={od.dnp}
                            onChange={(e) => setOd({ ...od, dnp: e.target.value.replace(/[^0-9.]/g, "").slice(0, 5) })}
                            placeholder="32.0"
                            className="w-full h-11 text-center font-mono text-sm md:text-base font-bold rounded-lg border border-[#d0e2f2] bg-white text-[#052659] focus:border-[#052659] focus:ring-2 focus:ring-[#5483b3]/20"
                          />
                        </div>
                        <div className="mt-1">
                          <span className="text-[11px] text-slate-500">Monocular</span>
                        </div>
                      </td>

                      {/* Altura OD */}
                      <td className="px-3 py-4 text-center">
                        <div className="inline-block w-full max-w-[100px]">
                          <input
                            id="input-os-od-altura"
                            type="text"
                            maxLength={5}
                            value={od.altura}
                            onChange={(e) => setOd({ ...od, altura: e.target.value.replace(/[^0-9.]/g, "").slice(0, 5) })}
                            placeholder="19.0"
                            className="w-full h-11 text-center font-mono text-sm md:text-base font-bold rounded-lg border border-[#d0e2f2] bg-white text-[#052659] focus:border-[#052659] focus:ring-2 focus:ring-[#5483b3]/20"
                          />
                        </div>
                        <div className="mt-1">
                          <span className="text-[11px] text-slate-500">Montagem</span>
                        </div>
                      </td>
                    </tr>

                    {/* LINHA 2: OE */}
                    <tr className="hover:bg-[#f0f6fc]/50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-[#5483b3] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            OE
                          </span>
                          <div>
                            <span className="font-bold text-[#021024] block text-xs">Olho Esquerdo</span>
                            <span className="text-[10px] text-[#5483b3] block font-mono">Oculus Sinister</span>
                          </div>
                        </div>
                      </td>

                      {/* Esférico OE */}
                      <td className="px-3 py-4 text-center">
                        <div className="inline-block w-full max-w-[120px]">
                          <input
                            id="input-os-oe-esferico"
                            type="text"
                            maxLength={6}
                            value={oe.esf}
                            onChange={(e) => setOe({ ...oe, esf: sanitizeDiopterInput(e.target.value) })}
                            onBlur={(e) => setOe({ ...oe, esf: formatDiopterOnBlur(e.target.value) })}
                            placeholder="±0.00"
                            className={`w-full h-11 text-center font-mono text-sm md:text-base font-bold rounded-lg border transition-all ${
                              !oeEsfValidation.isValid
                                ? "bg-rose-50 border-2 border-rose-500 text-rose-900 ring-2 ring-rose-200"
                                : "bg-white border-[#d0e2f2] text-[#052659] focus:border-[#052659] focus:ring-2 focus:ring-[#5483b3]/20"
                            }`}
                          />
                        </div>
                        <div className="mt-1">
                          {!oeEsfValidation.isValid ? (
                            <span className="block text-[11px] text-rose-600 font-bold text-center">
                              {oeEsfValidation.message || "Fora do passo 0.25"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span> Passo 0.25
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cilíndrico OE */}
                      <td className="px-3 py-4 text-center">
                        <div className="inline-block w-full max-w-[120px]">
                          <input
                            id="input-os-oe-cilindrico"
                            type="text"
                            maxLength={6}
                            value={oe.cil}
                            onChange={(e) => setOe({ ...oe, cil: sanitizeDiopterInput(e.target.value) })}
                            onBlur={(e) => setOe({ ...oe, cil: formatDiopterOnBlur(e.target.value) })}
                            placeholder="-0.00"
                            className={`w-full h-11 text-center font-mono text-sm md:text-base font-bold rounded-lg border transition-all ${
                              !oeCilValidation.isValid
                                ? "bg-rose-50 border-2 border-rose-500 text-rose-900 ring-2 ring-rose-200"
                                : "bg-white border-[#d0e2f2] text-[#052659] focus:border-[#052659] focus:ring-2 focus:ring-[#5483b3]/20"
                            }`}
                          />
                        </div>
                        <div className="mt-1">
                          <span className="text-[11px] text-slate-500">
                            {isCilindricoActive(oe.cil) ? "Astigmatismo ativo" : "Sem astigmatismo"}
                          </span>
                        </div>
                      </td>

                      {/* Eixo OE */}
                      <td className="px-3 py-4 text-center">
                        <div className="inline-block w-full max-w-[110px]">
                          <input
                            id="input-os-oe-eixo"
                            type="text"
                            maxLength={3}
                            disabled={!isCilindricoActive(oe.cil)}
                            value={isCilindricoActive(oe.cil) ? oe.eixo : "—"}
                            onChange={(e) => setOe({ ...oe, eixo: e.target.value.replace(/[^0-9]/g, "").slice(0, 3) })}
                            placeholder={isCilindricoActive(oe.cil) ? "0 a 180" : "—"}
                            className={`w-full h-11 text-center font-mono text-sm md:text-base font-bold rounded-lg border transition-all ${
                              !isCilindricoActive(oe.cil)
                                ? "bg-slate-100 border-[#d0e2f2] text-slate-400 cursor-not-allowed"
                                : !oeEixoValidation.isValid
                                ? "bg-rose-50 border-2 border-rose-500 text-rose-900 ring-2 ring-rose-200"
                                : "bg-white border-[#d0e2f2] text-[#052659] focus:border-[#052659] focus:ring-2 focus:ring-[#5483b3]/20"
                            }`}
                          />
                        </div>
                        <div className="mt-1">
                          <span className="text-[11px] text-slate-400">
                            {!isCilindricoActive(oe.cil) ? "Bloqueado (Cil = 0.00)" : oeEixoValidation.isValid ? "Eixo Válido" : "Obrigatório (0º a 180º)"}
                          </span>
                        </div>
                      </td>

                      {/* Adição OE */}
                      <td className="px-3 py-4 text-center">
                        <div className="inline-block w-full max-w-[110px]">
                          <input
                            id="input-os-oe-adicao"
                            type="text"
                            maxLength={6}
                            value={oe.add}
                            onChange={(e) => setOe({ ...oe, add: sanitizeDiopterInput(e.target.value) })}
                            onBlur={(e) => setOe({ ...oe, add: formatDiopterOnBlur(e.target.value) })}
                            placeholder="+0.00"
                            className="w-full h-11 text-center font-mono text-sm md:text-base font-bold rounded-lg border border-[#d0e2f2] bg-white text-[#052659] focus:border-[#052659] focus:ring-2 focus:ring-[#5483b3]/20"
                          />
                        </div>
                        <div className="mt-1">
                          <span className="text-[11px] text-slate-500">Presbiopia</span>
                        </div>
                      </td>

                      {/* DNP OE */}
                      <td className="px-3 py-4 text-center">
                        <div className="inline-block w-full max-w-[100px]">
                          <input
                            id="input-os-oe-dnp"
                            type="text"
                            maxLength={5}
                            value={oe.dnp}
                            onChange={(e) => setOe({ ...oe, dnp: e.target.value.replace(/[^0-9.]/g, "").slice(0, 5) })}
                            placeholder="32.0"
                            className="w-full h-11 text-center font-mono text-sm md:text-base font-bold rounded-lg border border-[#d0e2f2] bg-white text-[#052659] focus:border-[#052659] focus:ring-2 focus:ring-[#5483b3]/20"
                          />
                        </div>
                        <div className="mt-1">
                          <span className="text-[11px] text-slate-500">Monocular</span>
                        </div>
                      </td>

                      {/* Altura OE */}
                      <td className="px-3 py-4 text-center">
                        <div className="inline-block w-full max-w-[100px]">
                          <input
                            id="input-os-oe-altura"
                            type="text"
                            maxLength={5}
                            value={oe.altura}
                            onChange={(e) => setOe({ ...oe, altura: e.target.value.replace(/[^0-9.]/g, "").slice(0, 5) })}
                            placeholder="19.0"
                            className="w-full h-11 text-center font-mono text-sm md:text-base font-bold rounded-lg border border-[#d0e2f2] bg-white text-[#052659] focus:border-[#052659] focus:ring-2 focus:ring-[#5483b3]/20"
                          />
                        </div>
                        <div className="mt-1">
                          <span className="text-[11px] text-slate-500">Montagem</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Quick Matrix Footer */}
              <div className="px-6 py-3 bg-[#f8fbfe] border-t border-[#d0e2f2] flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> DNP Total:{" "}
                    <strong className="font-mono text-[#021024]">
                      {(parseFloat(od.dnp) || 0) + (parseFloat(oe.dnp) || 0) > 0
                        ? `${((parseFloat(od.dnp) || 0) + (parseFloat(oe.dnp) || 0)).toFixed(1)} mm`
                        : "---"}
                    </strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#052659] inline-block"></span> Tipo Calculado:{" "}
                    <strong className="text-[#052659]">
                      {parseFloat(od.add) > 0 || parseFloat(oe.add) > 0
                        ? "Multifocal / Progressiva"
                        : "Visão Simples"}
                    </strong>
                  </span>
                </div>
                <div className="text-slate-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#5483b3]">info</span>
                  <span>A transposição cilíndrica automática será validada na seleção de bloco no passo 3.</span>
                </div>
              </div>
            </section>

            {/* Prescribing Doctor & Prescription Document Section */}
            <section className="bg-white rounded-xl border border-[#d0e2f2] shadow-xs p-6">
              <div className="flex items-center justify-between border-b border-[#d0e2f2] pb-3 mb-5">
                <h3 className="text-sm font-bold text-[#052659] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#5483b3]">medical_services</span>
                  <span>Dados do Médico Prescritor & Documento</span>
                </h3>
                <span className="text-[11px] font-bold text-[#5483b3] uppercase tracking-wider">
                  Metadados Oficiais
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Oftalmologista</label>
                  <input
                    type="text"
                    readOnly
                    value={clientData.medico}
                    className="w-full h-9 px-3 bg-[#f0f6fc] border border-[#d0e2f2] rounded-lg text-xs font-semibold text-[#021024]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">CRM / UF</label>
                  <input
                    type="text"
                    readOnly
                    value={clientData.crm}
                    className="w-full h-9 px-3 bg-[#f0f6fc] border border-[#d0e2f2] rounded-lg text-xs font-mono font-semibold text-[#021024]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Data da Consulta</label>
                  <input
                    type="text"
                    readOnly
                    value={clientData.dataConsulta}
                    className="w-full h-9 px-3 bg-[#f0f6fc] border border-[#d0e2f2] rounded-lg text-xs font-mono font-semibold text-[#021024]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Validade da Receita</label>
                  <div className="h-9 px-3 bg-[#f0f6fc] border border-[#d0e2f2] rounded-lg flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-slate-700">{clientData.validade}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Válida
                    </span>
                  </div>
                </div>
              </div>

              {/* Digitalized Prescription Component */}
              <div className="rounded-xl border border-dashed border-[#7da0ca] bg-[#f8fbfe] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs border border-rose-200 shadow-2xs">
                    PDF
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#021024]">receita_dr_eduardo_digitalizada.pdf</span>
                      <span className="text-[10px] font-mono bg-[#c1e8ff]/60 text-[#052659] px-1.5 py-0.5 rounded font-bold">
                        1.8 MB
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Receita digitalizada com carimbo médico e assinatura digital ICP-Brasil verificada.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-os-receita-visualizar-pdf"
                    type="button"
                    className="px-3 py-1.5 text-xs font-bold text-[#052659] bg-white border border-[#d0e2f2] hover:bg-[#f0f6fc] rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Visualizar</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* STEP 3: ARMAÇÃO & LENTES */}
        {currentStep === 3 && (
          <section className="bg-white rounded-2xl border border-[#C1E8FF] shadow-xs p-6 space-y-6">
            <div className="border-b border-[#C1E8FF] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#052659] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#5483B3]">visibility</span>
                  <span>3. Escolha da Armação &amp; Lentes Oftálmicas</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Selecione peças do estoque livre e defina o bloco e tratamentos homologados</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#F0F6FC] text-[#052659] text-xs font-bold border border-[#C1E8FF] flex items-center gap-1.5 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Estoque Livre Conectado</span>
              </span>
            </div>

            {/* Armações Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#052659] uppercase tracking-wider">
                  Armação Escolhida (Catálogo de Estoque Livre)
                </label>
                <span className="text-[11px] text-[#5483B3] font-medium">3 opções disponíveis para prova</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { sku: "78985201104", marca: "Ray-Ban", ref: "RX5228 Tartaruga Clássica 54-18", preco: 890.0, estoque: "14 em estoque", tipo: "Acetato Masculino" },
                  { sku: "78985201120", marca: "Oakley", ref: "OX8156 Satin Black 55-16", preco: 620.0, estoque: "6 em estoque", tipo: "O-Matter Esportivo" },
                  { sku: "78985201107", marca: "Emporio Armani", ref: "EA3147 Azul Translúcido 53-17", preco: 920.0, estoque: "1 em estoque (Último)", tipo: "Acetato Premium" },
                ].map((frame) => {
                  const isSelected = selectedFrame.sku === frame.sku;
                  return (
                    <SelectableCard
                      key={frame.sku}
                      id={`card-os-armacao-${frame.sku}`}
                      isSelected={isSelected}
                      onClick={() =>
                        setSelectedFrame({
                          sku: frame.sku,
                          marca: frame.marca,
                          referencia: frame.ref,
                          preco: frame.preco,
                        })
                      }
                      title={frame.marca}
                      subtitle={frame.ref}
                      description={frame.tipo}
                      code={`SKU: ${frame.sku}`}
                      badge={frame.estoque}
                      badgeVariant={frame.estoque.includes("Último") ? "warning" : "neutral"}
                      price={frame.preco}
                    />
                  );
                })}
              </div>
            </div>

            {/* Lentes Selector */}
            <div className="space-y-3 pt-5 border-t border-[#C1E8FF]">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#052659] uppercase tracking-wider">
                  Bloco de Lentes Oftálmicas (Calculado para a Prescrição)
                </label>
                <span className="text-[11px] text-[#5483B3] font-medium">Cálculo de transposição validado</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    marca: "Essilor",
                    modelo: "Varilux Comfort Max Crizal Sapphire HR",
                    tipo: "Multifocal Digital Campo Amplo • Índice 1.60",
                    preco: 1250.0,
                    badge: "Laboratório Essilor SP",
                  },
                  {
                    marca: "Hoya",
                    modelo: "Hoyalux ID MySelf Poly 1.59 HVLL",
                    tipo: "Multifocal Premium Personalizada • Proteção UV400",
                    preco: 1680.0,
                    badge: "Lab Hoya Brasil",
                  },
                ].map((lens) => {
                  const isSelected = selectedLens.modelo === lens.modelo;
                  return (
                    <SelectableCard
                      key={lens.modelo}
                      id={`card-os-lente-${lens.marca.toLowerCase()}`}
                      isSelected={isSelected}
                      onClick={() => setSelectedLens(lens)}
                      title={lens.marca}
                      subtitle={lens.modelo}
                      description={lens.tipo}
                      badge={lens.badge}
                      badgeVariant="info"
                      price={lens.preco}
                    />
                  );
                })}
              </div>
            </div>

            {/* Tratamentos Adicionais */}
            <div className="space-y-3 pt-5 border-t border-[#C1E8FF]">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#052659] uppercase tracking-wider">
                  Tratamentos Antirreflexo &amp; Proteções (+ R$ 90,00 cada)
                </label>
                <span className="text-[11px] font-mono text-[#5483B3] font-bold">
                  {selectedTreatments.length} selecionado(s) (+ R$ {(selectedTreatments.length * 90).toFixed(2).replace(".", ",")})
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: "crizal-hr", nome: "Antirreflexo Crizal HR" },
                  { id: "blue-uv", nome: "Filtro Luz Azul Blue UV" },
                  { id: "transitions", nome: "Fotossensível Transitions Gen S" },
                  { id: "oleofobico", nome: "Camada Oleofóbica Antiaderente" },
                ].map((treatment, idx) => {
                  const isChecked = selectedTreatments.includes(treatment.nome);
                  return (
                    <button
                      key={treatment.id}
                      id={`btn-os-tratamento-${idx}`}
                      type="button"
                      onClick={() => {
                        setSelectedTreatments((prev) =>
                          prev.includes(treatment.nome)
                            ? prev.filter((t) => t !== treatment.nome)
                            : [...prev, treatment.nome]
                        );
                      }}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-2xs select-none hover:-translate-y-0.5 ${
                        isChecked
                          ? "bg-[#052659] text-white border-[#052659] shadow-xs"
                          : "bg-white text-[#052659] border-[#C1E8FF] hover:bg-[#F0F6FC] hover:border-[#5483B3]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isChecked ? "check_box" : "check_box_outline_blank"}
                      </span>
                      <span>{treatment.nome}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* STEP 4: RESUMO & ENVIO */}
        {currentStep === 4 && (
          <section className="bg-white rounded-xl border border-[#d0e2f2] shadow-xs p-6 space-y-6">
            <div className="border-b border-[#d0e2f2] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#052659]">4. Resumo Financeiro & Envio ao Laboratório</h2>
                <p className="text-xs text-slate-500 mt-0.5">Revise os dados antes de gerar a Ordem de Serviço final</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                Pronta para Faturamento
              </span>
            </div>

            {/* Sucesso se já emitiu */}
            {osSaved && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5 shadow-xs flex items-center justify-between text-emerald-950">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-200 rounded-xl text-emerald-800">
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-950">Ordem de Serviço #10315 Emitida com Sucesso!</h3>
                    <p className="text-xs text-emerald-800">
                      Ordem enviada para a fila de montagem no laboratório e armação reservada no Kardex.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-os-imprimir-resumo"
                    type="button"
                    onClick={() => window.print()}
                    className="h-9 px-4 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    <span>Imprimir OS</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resumo da Receita */}
              <div className="p-4 rounded-xl border border-[#d0e2f2] bg-[#f8fbfe] space-y-3">
                <h4 className="text-xs font-bold text-[#052659] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Prescrição Oftalmológica Aprovada</span>
                </h4>
                <div className="text-xs font-mono space-y-1">
                  <div className="flex justify-between border-b border-[#d0e2f2] pb-1">
                    <span className="font-bold text-[#052659]">OD:</span>
                    <span>Esf {od.esf} • Cil {od.cil} • Eixo {od.eixo || "0"}º • Add {od.add}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="font-bold text-[#5483b3]">OE:</span>
                    <span>Esf {oe.esf} • Cil {oe.cil} • Eixo {oe.eixo || "—"} • Add {oe.add}</span>
                  </div>
                </div>
              </div>

              {/* Resumo da Peça e Lente */}
              <div className="p-4 rounded-xl border border-[#d0e2f2] bg-[#f8fbfe] space-y-3">
                <h4 className="text-xs font-bold text-[#052659] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                  <span>Produtos Selecionados</span>
                </h4>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between border-b border-[#d0e2f2] pb-1">
                    <span className="text-slate-600">Armação {selectedFrame.marca} ({selectedFrame.referencia}):</span>
                    <strong className="font-mono text-[#021024]">R$ {selectedFrame.preco.toFixed(2).replace(".", ",")}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#d0e2f2] pb-1">
                    <span className="text-slate-600">Lente {selectedLens.marca} {selectedLens.modelo}:</span>
                    <strong className="font-mono text-[#021024]">R$ {selectedLens.preco.toFixed(2).replace(".", ",")}</strong>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-600">Tratamentos ({selectedTreatments.length}):</span>
                    <strong className="font-mono text-[#021024]">
                      R$ {(selectedTreatments.length * 90).toFixed(2).replace(".", ",")}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Totalizador Financeiro */}
            <div className="p-4 rounded-xl bg-[#052659] border border-[#021024] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <span className="text-xs font-medium text-[#c1e8ff] uppercase tracking-wider">Valor Total da Ordem de Serviço</span>
                <div className="text-2xl font-bold font-mono text-white mt-0.5">
                  R$ {totalGeral.toFixed(2).replace(".", ",")}
                </div>
                <span className="text-[11px] text-slate-300">Em até 10x sem juros de R$ {(totalGeral / 10).toFixed(2).replace(".", ",")}</span>
              </div>

              {!osSaved && (
                <button
                  id="btn-os-emitir-ordem-resumo"
                  type="button"
                  onClick={() => setOsSaved(true)}
                  className="h-11 px-6 rounded-lg bg-[#5483b3] hover:bg-[#7da0ca] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Emitir Ordem de Serviço</span>
                </button>
              )}
            </div>
          </section>
        )}
      </main>

      {/* 3. FIXED ACTION FOOTER */}
      <footer className="sticky bottom-0 z-20 bg-white border-t border-[#d0e2f2] shadow-lg py-3">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStep > 1 && (
              <button
                id="btn-os-etapa-anterior"
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-[#d0e2f2] text-[#052659] hover:bg-[#f0f6fc] rounded-lg text-xs font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Etapa Anterior</span>
              </button>
            )}
            <Link
              id="link-os-cancelar"
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 text-slate-500 hover:text-rose-600 rounded-lg text-xs font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              <span>Cancelar</span>
            </Link>
          </div>

          {/* Center warning if errors */}
          <div className="flex items-center gap-2 text-center text-xs font-medium">
            {!isCurrentStepReady ? (
              <span className="text-rose-700 font-semibold flex items-center gap-1.5 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                <span className="material-symbols-outlined text-rose-600 text-[16px]">lock</span>
                {currentStep === 1
                  ? "Preencha Nome, CPF e Telefone para liberar a próxima etapa."
                  : currentStep === 2
                  ? hasErrors
                    ? `Existem ${validationErrors.length} inconsistência(s) na receita. Corrija para avançar.`
                    : "Preencha a prescrição óptica (OD/OE) para liberar a próxima etapa."
                  : "Selecione uma armação e lente do estoque para liberar o resumo final."}
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                Tudo pronto para seguir para a próxima etapa.
              </span>
            )}
          </div>

          {/* Right forward action */}
          <div className="w-full sm:w-auto flex items-center justify-end">
            {currentStep < 4 ? (
              <button
                id="btn-os-avancar-proxima-etapa"
                type="button"
                onClick={() => navigateToStep((currentStep + 1) as 2 | 3 | 4)}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs select-none ${
                  !isCurrentStepReady
                    ? "bg-slate-200 text-slate-500 border border-slate-300 hover:bg-slate-300 cursor-not-allowed"
                    : "bg-[#052659] hover:bg-[#021024] text-white cursor-pointer"
                }`}
              >
                <span>
                  {!isCurrentStepReady
                    ? currentStep === 1
                      ? "Bloqueado: Dados Incompletos"
                      : currentStep === 2
                      ? "Bloqueado: Corrija a Receita Óptica"
                      : "Bloqueado: Selecione Peças"
                    : currentStep === 1
                    ? "Ir para Receita Óptica →"
                    : currentStep === 2
                    ? "Próximo: Armação & Lentes →"
                    : "Revisão & Resumo Final →"}
                </span>
                <span className="material-symbols-outlined text-[16px]">
                  {!isCurrentStepReady ? "lock" : "arrow_forward"}
                </span>
              </button>
            ) : (
              <button
                id="btn-os-finalizar-enviar-lab"
                type="button"
                onClick={() => setOsSaved(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Finalizar & Enviar ao Laboratório</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

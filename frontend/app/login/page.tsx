"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OpticalBrandLogo from "@/components/OpticalBrandLogo";

interface BranchOption {
  id: string;
  name: string;
  role: string;
  cnpj: string;
  status: string;
}

const BRANCHES: BranchOption[] = [
  {
    id: "matriz",
    name: "Filial Centro - Loja 01 (Matriz)",
    role: "Varejo & Consultório",
    cnpj: "14.238.991/0001-44",
    status: "SEFAZ Online",
  },
  {
    id: "filial_02",
    name: "Filial Shopping Norte - Loja 02",
    role: "Varejo Express",
    cnpj: "14.238.991/0002-25",
    status: "SEFAZ Online",
  },
  {
    id: "laboratorio",
    name: "Laboratório Central de Surfaçagem",
    role: "Unidade Fabril & Montagem",
    cnpj: "14.238.991/0003-06",
    status: "SEFAZ Online",
  },
];

export default function LoginPage() {
  const router = useRouter();

  // Form State
  const [username, setUsername] = useState("carlos.ramos@faturaotica.com.br");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("matriz");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successToast, setSuccessToast] = useState(false);

  // Recovery Modal State
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Por favor, preencha o e-mail/CPF e a senha.");
      return;
    }

    setIsLoading(true);

    // Simulate clinical authorization & branch handshake
    setTimeout(() => {
      setIsLoading(false);
      setSuccessToast(true);

      // Persist operator name for demonstration
      if (typeof window !== "undefined") {
        const branchObj = BRANCHES.find((b) => b.id === selectedBranch);
        const isMariana = username.toLowerCase().includes("mariana");
        const operatorData = {
          name: isMariana ? "Mariana Souza" : "Dr. Carlos Ramos",
          role: isMariana ? "Consultora de Atendimento" : "Gerente Operacional & Optometrista",
          roleType: isMariana ? "consultor" : "gerente",
          branch: branchObj ? branchObj.name : "Filial Centro - Loja 01",
          loginTime: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        };
        localStorage.setItem("fatura_otica_operator", JSON.stringify(operatorData));
        window.dispatchEvent(new Event("fatura_otica_operator_change"));
      }

      setTimeout(() => {
        router.push("/");
      }, 700);
    }, 900);
  };

  const handleFastLogin = (user: "carlos" | "mariana") => {
    if (user === "carlos") {
      setUsername("carlos.ramos@faturaotica.com.br");
      setPassword("dr.carlos2026@secure");
      setSelectedBranch("matriz");
    } else {
      setUsername("mariana.souza@faturaotica.com.br");
      setPassword("mariana.balcao@2026");
      setSelectedBranch("filial_02");
    }
    setErrorMessage("");
  };

  const handleSendRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryIdentifier) return;
    setRecoverySent(true);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-[#F0F6FC] text-[#021024] select-none font-sans">
      {/* SUCCESS TOAST NOTIFICATION */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#052659] text-white px-5 py-3.5 rounded-lg shadow-xl border border-[#7DA0CA] flex items-center gap-3 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
          <div>
            <div className="text-sm font-bold">Autenticação Homologada!</div>
            <div className="text-xs text-[#C1E8FF]">Redirecionando para o terminal clínico...</div>
          </div>
        </div>
      )}

      {/* LEFT PANEL: TECHNICAL HERO & BRAND AUTHORITY (CLINICAL PRECISION PALETTE) */}
      <div className="lg:w-[46%] xl:w-[44%] bg-[#052659] border-r border-[#021024] flex flex-col justify-between p-8 lg:p-12 relative overflow-hidden text-white">
        {/* Subtle Precision Background Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div
            className="w-full h-full border-b border-r border-[#7DA0CA]"
            style={{
              backgroundSize: "32px 32px",
              backgroundImage:
                "linear-gradient(to right, #7DA0CA 1px, transparent 1px), linear-gradient(to bottom, #7DA0CA 1px, transparent 1px)",
            }}
          />
        </div>

        {/* Top Header & Brand Identity */}
        <div className="relative z-10">
          <div className="flex items-center justify-between pb-8 border-b border-[#021024]">
            <OpticalBrandLogo size="lg" subtitle="PRECISION OPTICAL ERP" badge="MATRIZ" />

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#021024] border border-[#5483B3]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-medium text-white">v4.8 Enterprise</span>
            </div>
          </div>

          {/* Headline & Core Clinical Positioning */}
          <div className="mt-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#021024] border border-[#7DA0CA]/40">
              <span className="material-symbols-outlined text-[15px] text-[#5483B3]">biotech</span>
              <span className="text-[11px] font-bold text-[#C1E8FF] tracking-wider uppercase">
                Plataforma Certificada ISO 13485
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
              O ERP definitivo para controle dióptrico, rastreabilidade fiscal de lentes e automação
              de atendimento de óticas.
            </h1>

            <p className="text-sm text-[#C1E8FF] leading-relaxed max-w-xl">
              Ambiente unificado para redes de óticas e laboratórios oftálmicos de alta precisão.
              Processamento de ordens técnicas, comunicação direta com a SEFAZ e padronização
              clínica estrita sem margem para refrações divergentes.
            </p>
          </div>

          {/* Technical Trust Cards (Bento Cluster) */}
          <div className="mt-8 space-y-3">
            {/* Card 1 */}
            <div className="p-3.5 rounded bg-[#021024]/80 border border-[#7DA0CA]/30 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded bg-[#052659] border border-[#5483B3] flex items-center justify-center text-[#5483B3] flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">SEFAZ NF-e 4.0 Integrado</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#052659] text-[#C1E8FF] font-mono text-[10px] font-bold">
                    SYNC 0.3s
                  </span>
                </div>
                <p className="text-xs text-[#C1E8FF]/80">
                  Sincronização imediata de entrada de notas e cálculo automatizado de custo médio
                  ponderado por dioptria.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-3.5 rounded bg-[#021024]/80 border border-[#7DA0CA]/30 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded bg-[#052659] border border-[#5483B3] flex items-center justify-center text-[#5483B3] flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">tune</span>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    Matriz Dióptrica em Tempo Real
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[#052659] text-[#C1E8FF] font-mono text-[10px] font-bold">
                    ±0.25D
                  </span>
                </div>
                <p className="text-xs text-[#C1E8FF]/80">
                  Validação rígida de passos 0.25, cilindro negativo e regras técnicas internacionais
                  de astigmatismo e adição multifocal.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-3.5 rounded bg-[#021024]/80 border border-[#7DA0CA]/30 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded bg-[#052659] border border-[#5483B3] flex items-center justify-center text-[#5483B3] flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Auditoria Fiscal Kardex A1</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#052659] text-[#C1E8FF] font-mono text-[10px] font-bold">
                    ISO LAB
                  </span>
                </div>
                <p className="text-xs text-[#C1E8FF]/80">
                  Rastreabilidade imutável de blocos brutos, armações de grife e controle contábil
                  de perdas em surfaçagem e quebras de balcão.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Left Panel Footer: Operational Status Widget */}
        <div className="relative z-10 pt-6 mt-8 border-t border-[#021024]">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[#C1E8FF] font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Status dos Servidores: Operação 100% Estável</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-[#C1E8FF]/70">
                Latência: <strong className="text-white">14ms</strong>
              </span>
              <span className="inline-flex items-center gap-1 text-[#C1E8FF]">
                <span className="material-symbols-outlined text-[15px] text-[#5483B3]">verified</span>
                ICP-Brasil A1 Homologado
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: AUTHENTICATION & MULTI-TENANT TERMINAL SELECTION */}
      <div className="flex-1 bg-[#F0F6FC] flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto">
        {/* Top Bar: Technical Status & Environment */}
        <div className="w-full max-w-xl mx-auto flex items-center justify-between pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#7DA0CA]/50 text-[#052659] shadow-2xs">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">lock</span>
            <span className="text-xs font-semibold">Terminal Autenticado & Seguro | TLS 1.3</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-500">Ambiente:</span>
            <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-300 font-mono text-xs text-amber-800 font-bold">
              PRODUÇÃO SP-01
            </span>
          </div>
        </div>

        {/* Main Login Container (Solid White Tier 1 Card) */}
        <div className="w-full max-w-xl mx-auto my-auto py-4">
          <div className="bg-white border border-[#7DA0CA]/60 rounded-xl p-7 sm:p-8 space-y-6 shadow-xs">
            {/* Card Header */}
            <div className="space-y-1 border-b border-[#F0F6FC] pb-4">
              <h2 className="text-2xl font-bold text-[#052659] tracking-tight">
                Acesso ao Terminal
              </h2>
              <p className="text-xs text-slate-600">
                Entre com suas credenciais ou selecione o perfil de operação homologado.
              </p>
            </div>

            {/* Error Feedback */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[18px]">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Area */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Field 1: User / Email / CPF */}
              <div className="space-y-1.5">
                <label
                  className="flex items-center justify-between text-xs font-bold text-[#052659] uppercase tracking-wider"
                  htmlFor="input-login-identificador"
                >
                  <span>E-mail Corporativo ou CPF</span>
                  <span className="font-mono text-[11px] font-medium text-slate-500 lowercase">
                    identificação
                  </span>
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7DA0CA]">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </div>
                  <input
                    id="input-login-identificador"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ex: consultor@faturaotica.com.br ou 000.000.000-00"
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-[#7DA0CA]/60 rounded-lg text-[#021024] font-mono text-sm placeholder-slate-400 focus:ring-2 focus:ring-[#5483B3] focus:border-[#052659] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Field 2: Password with Mask & Toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="text-xs font-bold text-[#052659] uppercase tracking-wider"
                    htmlFor="input-login-senha"
                  >
                    Senha de Acesso
                  </label>
                  <button
                    id="btn-login-esqueci-senha"
                    type="button"
                    onClick={() => setShowRecoveryModal(true)}
                    className="text-xs font-semibold text-[#5483B3] hover:text-[#052659] underline underline-offset-2 cursor-pointer transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7DA0CA]">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </div>
                  <input
                    id="input-login-senha"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 bg-white border border-[#7DA0CA]/60 rounded-lg text-[#021024] font-mono text-sm placeholder-slate-400 focus:ring-2 focus:ring-[#5483B3] focus:border-[#052659] outline-none transition-all"
                  />
                  <button
                    id="btn-login-toggle-senha"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7DA0CA] hover:text-[#052659] cursor-pointer"
                    title={showPassword ? "Ocultar senha" : "Ver senha"}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Field 3: Multi-Tenant / Branch Selection */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label
                    className="text-xs font-bold text-[#052659] uppercase tracking-wider"
                    htmlFor="select-login-filial"
                  >
                    Filial Ativa / Unidade de Operação
                  </label>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    SEFAZ Conectada
                  </span>
                </div>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7DA0CA]">
                    <span className="material-symbols-outlined text-[18px]">apartment</span>
                  </div>
                  <select
                    id="select-login-filial"
                    name="branch"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 bg-white border border-[#7DA0CA]/60 rounded-lg text-[#052659] text-sm font-semibold focus:ring-2 focus:ring-[#5483B3] focus:border-[#052659] outline-none appearance-none cursor-pointer"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} — ({b.role})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#7DA0CA]">
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Utility Controls: Remember device & Security note */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none" htmlFor="checkbox-login-lembrar">
                  <input
                    id="checkbox-login-lembrar"
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="w-4 h-4 rounded border-[#7DA0CA] text-[#052659] focus:ring-[#5483B3] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    Lembrar este dispositivo por 30 dias
                  </span>
                </label>
                <span className="font-mono text-xs text-slate-500">Terminal ID: LAB-09</span>
              </div>

              {/* Primary Submission Button */}
              <div className="pt-2">
                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-[#052659] text-white rounded-lg font-bold text-sm hover:bg-[#021024] active:scale-[0.99] transition-all flex items-center justify-center gap-2 border border-[#021024] shadow-xs cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Validando Certificado & Permissões...</span>
                    </>
                  ) : (
                    <>
                      <span>Acessar Terminal Óptico</span>
                      <span className="material-symbols-outlined text-[18px]">login</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider: Homologation Fast-Login */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#7DA0CA]/30"></div>
              </div>
              <div className="relative flex justify-center text-center">
                <span className="bg-white px-3 font-mono text-[11px] text-slate-500 tracking-wider uppercase font-semibold">
                  Ou Acesso Rápido de Homologação
                </span>
              </div>
            </div>

            {/* 1-Click Fast Login Demonstration Profiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Quick Profile 1 */}
              <button
                id="btn-login-fast-gerente"
                type="button"
                onClick={() => handleFastLogin("carlos")}
                className="p-3 text-left border border-[#7DA0CA]/50 rounded-lg bg-[#F0F6FC]/60 hover:bg-[#EBF3FA] hover:border-[#5483B3] transition-all flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-[#052659] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs group-hover:bg-[#5483B3] transition-colors">
                  CR
                </div>
                <div className="overflow-hidden min-w-0">
                  <span className="text-xs font-bold text-[#052659] block truncate group-hover:text-[#021024]">
                    Dr. Carlos Ramos
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    Gerente & Optometrista (Loja 01)
                  </span>
                </div>
              </button>

              {/* Quick Profile 2 */}
              <button
                id="btn-login-fast-consultor"
                type="button"
                onClick={() => handleFastLogin("mariana")}
                className="p-3 text-left border border-[#7DA0CA]/50 rounded-lg bg-[#F0F6FC]/60 hover:bg-[#EBF3FA] hover:border-[#5483B3] transition-all flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-[#5483B3] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs group-hover:bg-[#052659] transition-colors">
                  MS
                </div>
                <div className="overflow-hidden min-w-0">
                  <span className="text-xs font-bold text-[#052659] block truncate group-hover:text-[#021024]">
                    Mariana Souza
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    Consultora Balcão (Loja 02)
                  </span>
                </div>
              </button>
            </div>

            {/* Security Badge / Note */}
            <div className="p-3 rounded-lg bg-[#f0f3ff] border border-[#7DA0CA]/40 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-[#5483B3] mt-0.5">
                verified_user
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                O acesso a este ambiente é monitorado sob as normas da LGPD e Diretrizes Clínicas
                ANVISA RDC 327. Qualquer emissão de NF-e e receita vinculada registra o hash SHA-256
                do usuário logado no Kardex.
              </p>
            </div>
          </div>
        </div>

        {/* Institutional Footer */}
        <div className="w-full max-w-xl mx-auto pt-4 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#5483B3]">
              support_agent
            </span>
            <span>
              Suporte Técnico: <strong className="text-[#052659]">0800 892 4000</strong> (Plantão
              24/7)
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a className="hover:text-[#052659] hover:underline" href="#">
              Políticas Clínicas & LGPD
            </a>
            <span>•</span>
            <span className="font-mono text-slate-600">Fatura Ótica S.A.</span>
          </div>
        </div>
      </div>

      {/* PASSWORD RECOVERY MODAL */}
      {showRecoveryModal && (
        <div id="modal-login-recuperar-senha" className="fixed inset-0 bg-[#021024]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#7DA0CA] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0F6FC] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C1E8FF] text-[#052659] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                </div>
                <h3 className="text-base font-bold text-[#052659]">Recuperação de Acesso</h3>
              </div>
              <button
                id="btn-modal-recuperar-fechar"
                type="button"
                onClick={() => {
                  setShowRecoveryModal(false);
                  setRecoverySent(false);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {recoverySent ? (
              <div className="space-y-4 py-2 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-2xl">check_circle</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#052659] text-sm">Token de Verificação Enviado!</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Um link seguro de redefinição e código de 6 dígitos foram enviados para{" "}
                    <strong className="text-[#021024]">{recoveryIdentifier}</strong> via WhatsApp e
                    e-mail corporativo cadastrado.
                  </p>
                </div>
                <div className="p-3 bg-[#F0F6FC] rounded-lg border border-[#7DA0CA]/40 font-mono text-xs text-[#052659]">
                  Token temporário: <strong className="text-emerald-700">FO-8924-OK</strong>
                </div>
                <button
                  id="btn-modal-recuperar-voltar-login"
                  type="button"
                  onClick={() => {
                    setShowRecoveryModal(false);
                    setRecoverySent(false);
                  }}
                  className="w-full py-2 bg-[#052659] hover:bg-[#021024] text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Voltar ao Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendRecovery} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Informe o seu e-mail corporativo ou CPF cadastrado no sistema. Enviaremos um código
                  de recuperação de 2 fatores para restabelecer seu acesso.
                </p>
                <div className="space-y-1">
                  <label htmlFor="input-modal-recuperar-identificador" className="text-xs font-bold text-[#052659] uppercase tracking-wider block">
                    E-mail ou CPF
                  </label>
                  <input
                    id="input-modal-recuperar-identificador"
                    type="text"
                    required
                    value={recoveryIdentifier}
                    onChange={(e) => setRecoveryIdentifier(e.target.value)}
                    placeholder="ex: seu.nome@faturaotica.com.br"
                    className="w-full h-10 px-3 border border-[#7DA0CA]/60 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#5483B3] outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    id="btn-modal-recuperar-cancelar"
                    type="button"
                    onClick={() => setShowRecoveryModal(false)}
                    className="px-4 py-2 border border-[#7DA0CA]/50 text-slate-600 hover:bg-[#F0F6FC] rounded-lg text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-modal-recuperar-enviar"
                    type="submit"
                    className="px-5 py-2 bg-[#052659] hover:bg-[#021024] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Enviar Código</span>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

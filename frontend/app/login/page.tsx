"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOperator } from "@/hooks/useOperator";
import Button from "@/components/Button";
import { identityClient } from "@/services/identityClient";
import OpticalBrandLogo from "@/components/OpticalBrandLogo";

export default function LoginPage() {
  const router = useRouter();
  const { me: restoredMe, isLoaded, sessionError } = useOperator();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
  const me = restoredMe;
  const activeSelection = selectedBranch || me?.activeBranchId || me?.branches[0]?.id || "";
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const submitting = useRef(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setIsLoading(true);
    setErrorMessage("");
    try {
      if (me) {
        if (!me.branches.some(branch => branch.id === activeSelection)) {
          throw new Error("Selecione uma filial autorizada.");
        }
        await identityClient.selectBranch(activeSelection);
        router.replace("/");
        return;
      }
      const session = await identityClient.login(username.trim(), password);
      setPassword("");
      const authenticated = session.me;
      if (!authenticated.branches.length) {
        if (authenticated.tenantRoles.some(role => role === "owner" || role === "accessAdministrator")) {
          router.replace("/admin/usuarios");
        } else {
          setErrorMessage("Sua conta ainda não possui uma filial autorizada. Contate o administrador de acessos.");
        }
      } else if (authenticated.activeBranchId && authenticated.branches.some(branch => branch.id === authenticated.activeBranchId)) {
        router.replace("/");
      } else {
        setSelectedBranch(authenticated.branches[0].id);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Falha ao autenticar. Tente novamente.");
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div id="login-div-estrutura-1" className="min-h-screen flex flex-col lg:flex-row w-full bg-[#F0F6FC] text-[#021024] select-none font-sans">
      {/* LEFT PANEL: TECHNICAL HERO & BRAND AUTHORITY (CLINICAL PRECISION PALETTE) */}
      <div id="login-div-estrutura-2" className="lg:w-[46%] xl:w-[44%] bg-[#052659] border-r border-[#021024] flex flex-col justify-between p-8 lg:p-12 relative overflow-hidden text-white">
        {/* Subtle Precision Background Grid Lines */}
        <div id="login-div-estrutura-3" className="absolute inset-0 pointer-events-none opacity-10">
          <div id="login-div-estrutura-4"
            className="w-full h-full border-b border-r border-[#7DA0CA]"
            style={{
              backgroundSize: "32px 32px",
              backgroundImage:
                "linear-gradient(to right, #7DA0CA 1px, transparent 1px), linear-gradient(to bottom, #7DA0CA 1px, transparent 1px)",
            }}
          />
        </div>

        {/* Top Header & Brand Identity */}
        <div id="login-div-estrutura-5" className="relative z-10">
          <div id="login-div-estrutura-6" className="flex items-center justify-between pb-8 border-b border-[#021024]">
            <OpticalBrandLogo size="lg" subtitle="PRECISION OPTICAL ERP" badge="MATRIZ" />

            <div id="login-div-estrutura-7" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#021024] border border-[#5483B3]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-medium text-white">v4.8 Enterprise</span>
            </div>
          </div>

          {/* Headline & Core Clinical Positioning */}
          <div id="login-div-estrutura-8" className="mt-8 space-y-4">
            <div id="login-div-estrutura-9" className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#021024] border border-[#7DA0CA]/40">
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
          <div id="login-div-estrutura-10" className="mt-8 space-y-3">
            {/* Card 1 */}
            <div id="login-div-estrutura-11" className="p-3.5 rounded bg-[#021024]/80 border border-[#7DA0CA]/30 flex items-start gap-3.5">
              <div id="login-div-estrutura-12" className="w-8 h-8 rounded bg-[#052659] border border-[#5483B3] flex items-center justify-center text-[#5483B3] flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              </div>
              <div id="login-div-estrutura-13" className="space-y-0.5">
                <div id="login-div-estrutura-14" className="flex items-center gap-2">
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
            <div id="login-div-estrutura-15" className="p-3.5 rounded bg-[#021024]/80 border border-[#7DA0CA]/30 flex items-start gap-3.5">
              <div id="login-div-estrutura-16" className="w-8 h-8 rounded bg-[#052659] border border-[#5483B3] flex items-center justify-center text-[#5483B3] flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">tune</span>
              </div>
              <div id="login-div-estrutura-17" className="space-y-0.5">
                <div id="login-div-estrutura-18" className="flex items-center gap-2">
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
            <div id="login-div-estrutura-19" className="p-3.5 rounded bg-[#021024]/80 border border-[#7DA0CA]/30 flex items-start gap-3.5">
              <div id="login-div-estrutura-20" className="w-8 h-8 rounded bg-[#052659] border border-[#5483B3] flex items-center justify-center text-[#5483B3] flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              </div>
              <div id="login-div-estrutura-21" className="space-y-0.5">
                <div id="login-div-estrutura-22" className="flex items-center gap-2">
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
        <div id="login-div-estrutura-23" className="relative z-10 pt-6 mt-8 border-t border-[#021024]">
          <div id="login-div-estrutura-24" className="flex flex-wrap items-center justify-between gap-3 text-[#C1E8FF] font-mono text-xs">
            <div id="login-div-estrutura-25" className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Status dos Servidores: Operação 100% Estável</span>
            </div>
            <div id="login-div-estrutura-26" className="flex items-center gap-4 text-xs">
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
      <div id="login-div-estrutura-27" className="flex-1 bg-[#F0F6FC] flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto">
        {/* Top Bar: Technical Status & Environment */}
        <div id="login-div-estrutura-28" className="w-full max-w-xl mx-auto flex items-center justify-between pb-4">
          <div id="login-div-estrutura-29" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#7DA0CA]/50 text-[#052659] shadow-2xs">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">lock</span>
            <span className="text-xs font-semibold">Terminal Autenticado & Seguro | TLS 1.3</span>
          </div>
          <div id="login-div-estrutura-30" className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-500">Ambiente:</span>
            <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-300 font-mono text-xs text-amber-800 font-bold">
              PRODUÇÃO SP-01
            </span>
          </div>
        </div>

        {/* Main Login Container (Solid White Tier 1 Card) */}
        <div id="login-div-estrutura-31" className="w-full max-w-xl mx-auto my-auto py-4">
          <div id="login-div-estrutura-32" className="bg-white border border-[#7DA0CA]/60 rounded-xl p-7 sm:p-8 space-y-6 shadow-xs">
            {/* Card Header */}
            <div id="login-div-estrutura-33" className="space-y-1 border-b border-[#F0F6FC] pb-4">
              <h2 className="text-2xl font-bold text-[#052659] tracking-tight">
                Acesso ao Terminal
              </h2>
              <p className="text-xs text-slate-600">
                Entre com seu e-mail corporativo e sua senha.
              </p>
            </div>

            {/* Error Feedback */}
            {(errorMessage || sessionError) && (
              <div id="login-div-estrutura-34" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[18px]">error</span>
                <span>{errorMessage || sessionError}</span>
              </div>
            )}

            {/* Form Area */}
            <form id="form-login-acesso" className="space-y-4" onSubmit={handleSubmit}>
              {/* Field 1: User / Email / CPF */}
              <div id="login-div-estrutura-36" className="space-y-1.5">
                <label
                  className="flex items-center justify-between text-xs font-bold text-[#052659] uppercase tracking-wider"
                  htmlFor="input-login-identificador"
                >
                  <span>E-mail Corporativo</span>
                  <span className="font-mono text-[11px] font-medium text-slate-500 lowercase">
                    identificação
                  </span>
                </label>
                <div id="login-div-estrutura-37" className="relative rounded-lg">
                  <div id="login-div-estrutura-38" className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7DA0CA]">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </div>
                  <input
                    id="input-login-identificador"
                    name="username"
                    type="email"
                    autoComplete="username"
                    disabled={!!me}
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="seu.nome@empresa.com.br"
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-[#7DA0CA]/60 rounded-lg text-[#021024] font-mono text-sm placeholder-slate-400 focus:ring-2 focus:ring-[#5483B3] focus:border-[#052659] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Field 2: Password with Mask & Toggle */}
              <div id="login-div-estrutura-39" className="space-y-1.5">
                <div id="login-div-estrutura-40" className="flex items-center justify-between">
                  <label
                    className="text-xs font-bold text-[#052659] uppercase tracking-wider"
                    htmlFor="input-login-senha"
                  >
                    Senha de Acesso
                  </label>
                  <Button
                    id="btn-login-esqueci-senha"
                    type="button"
                    onClick={() => setShowRecoveryModal(true)}
                    className="text-xs font-semibold text-[#5483B3] hover:text-[#052659] underline underline-offset-2 cursor-pointer transition-colors"
                  >
                    Esqueci minha senha
                  </Button>
                </div>
                <div id="login-div-estrutura-41" className="relative rounded-lg">
                  <div id="login-div-estrutura-42" className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7DA0CA]">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </div>
                  <input
                    id="input-login-senha"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required={!me}
                    disabled={!!me}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 bg-white border border-[#7DA0CA]/60 rounded-lg text-[#021024] font-mono text-sm placeholder-slate-400 focus:ring-2 focus:ring-[#5483B3] focus:border-[#052659] outline-none transition-all"
                  />
                  <Button
                    id="btn-login-toggle-senha"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7DA0CA] hover:text-[#052659] cursor-pointer"
                    title={showPassword ? "Ocultar senha" : "Ver senha"}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Field 3: Multi-Tenant / Branch Selection */}
              <div id="login-div-estrutura-43" className="space-y-1.5 pt-1">
                <div id="login-div-estrutura-44" className="flex items-center justify-between">
                  <label
                    className="text-xs font-bold text-[#052659] uppercase tracking-wider"
                    htmlFor="select-login-filial"
                  >
                    Filial Ativa / Unidade de Operação
                  </label>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Filiais autorizadas após autenticar
                  </span>
                </div>
                <div id="login-div-estrutura-45" className="relative rounded-lg">
                  <div id="login-div-estrutura-46" className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7DA0CA]">
                    <span className="material-symbols-outlined text-[18px]">apartment</span>
                  </div>
                  <select
                    disabled={!me || !me.branches.length}
                    id="select-login-filial"
                    name="branch"
                    value={activeSelection}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 bg-white border border-[#7DA0CA]/60 rounded-lg text-[#052659] text-sm font-semibold focus:ring-2 focus:ring-[#5483B3] focus:border-[#052659] outline-none appearance-none cursor-pointer"
                  >
                    {(me?.branches ?? []).map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <div id="login-div-estrutura-47" className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#7DA0CA]">
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Utility Controls: Remember device & Security note */}


              {/* Primary Submission Button */}
              <div id="login-div-estrutura-48" className="pt-2">
                <Button
                  id="btn-login-submit"
                  type="submit"
                  disabled={!isLoaded || isLoading || (!!me && !me.branches.length)}
                isLoading={isLoading}
                  className="w-full h-11 bg-[#052659] text-white rounded-lg font-bold text-sm hover:bg-[#021024] active:scale-[0.99] transition-all flex items-center justify-center gap-2 border border-[#021024] shadow-xs cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Validando Certificado & Permissões...</span>
                    </>
                  ) : (
                    <>
                      <span>{me ? "Confirmar Filial" : "Acessar Terminal Óptico"}</span>
                      <span className="material-symbols-outlined text-[18px]">login</span>
                    </>
                  )}
                </Button>
              </div>
            </form>

            {me && !me.branches.length && me.tenantRoles.some(role => role === "owner" || role === "accessAdministrator") && <Button id="btn-login-administrar-acessos" href="/admin/usuarios">Administrar acessos</Button>}
            {me && <Button id="btn-login-trocar-conta" variant="outline" onClick={async () => {
              await identityClient.logout();
              setUsername("");
              setSelectedBranch("");
              setErrorMessage("");
            }}>Trocar conta</Button>}
            {/* Security Badge / Note */}
            <div id="login-div-estrutura-49" className="p-3 rounded-lg bg-[#f0f3ff] border border-[#7DA0CA]/40 flex items-start gap-2.5">
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
        <div id="login-div-estrutura-50" className="w-full max-w-xl mx-auto pt-4 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs gap-2">
          <div id="login-div-estrutura-51" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#5483B3]">
              support_agent
            </span>
            <span>
              Suporte Técnico: <strong className="text-[#052659]">0800 892 4000</strong> (Plantão
              24/7)
            </span>
          </div>
          <div id="login-div-estrutura-52" className="flex items-center gap-4 text-[11px]">
            <a id="link-login-politica" className="hover:text-[#052659] hover:underline" href="#">
              Políticas Clínicas & LGPD
            </a>
            <span>•</span>
            <span className="font-mono text-slate-600">Fatura Ótica S.A.</span>
          </div>
        </div>
      </div>

      {showRecoveryModal && (
        <div id="modal-login-recuperar-senha" role="dialog" aria-modal="true" aria-labelledby="login-recuperar-titulo" className="fixed inset-0 bg-[#021024]/70 z-50 flex items-center justify-center p-4">
          <div id="card-login-recuperacao" className="bg-white rounded-xl border border-[#7DA0CA] max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 id="login-recuperar-titulo" className="font-bold text-[#052659]">Recuperação de acesso</h3>
            <p className="text-sm text-slate-600">Entre em contato com o administrador de acessos da sua organização para receber orientação sobre sua conta.</p>
            <Button id="btn-login-recuperacao-fechar" onClick={() => setShowRecoveryModal(false)}>Voltar ao login</Button>
          </div>
        </div>
      )}
    </div>
  );
}

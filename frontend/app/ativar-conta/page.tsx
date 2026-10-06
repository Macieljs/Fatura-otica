"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import OpticalBrandLogo from "@/components/OpticalBrandLogo";
import Button from "@/components/Button";
import { useToast } from "@/components/ToastProvider";
import { identityMockService } from "@/services/identityMockService";

function AtivarContaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const tokenParam = searchParams.get("token") || "FO-ACT-2026-X89";

  const [token, setToken] = useState(tokenParam);
  const [name, setName] = useState("Dra. Camila Vasconcelos");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validação dinâmica da força da senha
  const passwordChecks = useMemo(() => {
    return {
      minLen: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      match: password.length > 0 && password === confirmPassword,
    };
  }, [password, confirmPassword]);

  const isFormValid =
    passwordChecks.minLen &&
    passwordChecks.hasUpper &&
    passwordChecks.hasNumber &&
    passwordChecks.hasSpecial &&
    passwordChecks.match;

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.warning("Por favor, atenda a todos os requisitos de segurança da senha.", {
        title: "Requisitos de Senha",
      });
      return;
    }

    try {
      await identityMockService.activateAccount(token, password, name);
      setIsSuccess(true);
      toast.success("Conta ativada com sucesso! Redirecionando para o login...", {
        title: "Acesso Homologado",
        icon: "verified_user",
      });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao ativar conta.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F6FC] text-[#021024] flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans">
      {/* Top Header */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-between pb-6">
        <OpticalBrandLogo size="md" subtitle="ATIVADOR DE CREDENCIAL" />
        <Link
          id="link-ativar-voltar-login"
          href="/login"
          className="text-xs font-semibold text-[#5483B3] hover:text-[#052659] flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Voltar ao Login</span>
        </Link>
      </div>

      {/* Main Activation Card */}
      <main className="w-full max-w-lg mx-auto my-auto">
        <div className="bg-white border border-[#7DA0CA]/60 rounded-2xl p-7 sm:p-9 space-y-6 shadow-sm">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <span className="material-symbols-outlined text-3xl">verified</span>
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#052659]">Conta Ativada com Sucesso!</h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Sua senha pessoal foi criptografada com Argon2id. Você já pode acessar o terminal
                  clínico com suas novas credenciais.
                </p>
              </div>
              <div className="pt-3">
                <Link
                  id="link-ativar-ir-login"
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#052659] hover:bg-[#021024] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <span>Ir para o Login Agora</span>
                  <span className="material-symbols-outlined text-[16px]">login</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Card Title */}
              <div className="space-y-1.5 border-b border-[#F0F6FC] pb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C1E8FF] text-[#052659] text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]">lock_open</span>
                  <span>Primeiro Acesso de Colaborador</span>
                </div>
                <h1 className="text-2xl font-bold text-[#052659] tracking-tight">
                  Definição de Senha Pessoal
                </h1>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bem-vindo à equipe do Fatura Ótica. Para garantir a rastreabilidade fiscal das
                  suas operações, defina sua senha exclusiva de acesso.
                </p>
              </div>

              {/* Form de Ativação */}
              <form onSubmit={handleActivate} className="space-y-4">
                {/* Nome Confirmado */}
                <div className="space-y-1">
                  <label
                    htmlFor="input-ativar-nome"
                    className="text-xs font-bold text-[#052659] uppercase tracking-wider block"
                  >
                    Nome do Colaborador
                  </label>
                  <input
                    id="input-ativar-nome"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3.5 border border-[#7DA0CA]/60 rounded-xl text-xs font-semibold text-[#052659] bg-[#F0F6FC]/50 focus:bg-white focus:border-[#5483B3] outline-none"
                  />
                </div>

                {/* Token de Convite (Somente Leitura ou Validado) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="input-ativar-token"
                      className="text-xs font-bold text-[#052659] uppercase tracking-wider"
                    >
                      Token de Autorização
                    </label>
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Válido (24h)
                    </span>
                  </div>
                  <input
                    id="input-ativar-token"
                    type="text"
                    readOnly
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full h-10 px-3.5 border border-[#7DA0CA]/60 rounded-xl text-xs font-mono font-bold text-slate-600 bg-slate-50 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Nova Senha */}
                <div className="space-y-1">
                  <label
                    htmlFor="input-ativar-senha"
                    className="text-xs font-bold text-[#052659] uppercase tracking-wider block"
                  >
                    Criar Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      id="input-ativar-senha"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-10 pl-3.5 pr-10 border border-[#7DA0CA]/60 rounded-xl text-xs font-mono text-[#021024] focus:border-[#5483B3] focus:ring-2 focus:ring-[#5483B3]/20 outline-none"
                    />
                    <button
                      id="btn-ativar-toggle-senha"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#052659] p-0.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-1">
                  <label
                    htmlFor="input-ativar-confirmar-senha"
                    className="text-xs font-bold text-[#052659] uppercase tracking-wider block"
                  >
                    Confirmar Nova Senha
                  </label>
                  <input
                    id="input-ativar-confirmar-senha"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-10 px-3.5 border border-[#7DA0CA]/60 rounded-xl text-xs font-mono text-[#021024] focus:border-[#5483B3] focus:ring-2 focus:ring-[#5483B3]/20 outline-none"
                  />
                </div>

                {/* Checklist Dinâmico de Segurança */}
                <div className="p-3.5 bg-[#F0F6FC] rounded-xl border border-[#7DA0CA]/40 space-y-1.5 text-[11px]">
                  <span className="font-bold text-[#052659] block uppercase tracking-wider text-[10px]">
                    Requisitos de Segurança da Senha (Argon2id):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <div
                      className={`flex items-center gap-1.5 ${
                        passwordChecks.minLen ? "text-emerald-700 font-bold" : "text-slate-500"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {passwordChecks.minLen ? "check_circle" : "cancel"}
                      </span>
                      <span>Mínimo 8 caracteres</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        passwordChecks.hasUpper ? "text-emerald-700 font-bold" : "text-slate-500"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {passwordChecks.hasUpper ? "check_circle" : "cancel"}
                      </span>
                      <span>Letra maiúscula</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        passwordChecks.hasNumber ? "text-emerald-700 font-bold" : "text-slate-500"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {passwordChecks.hasNumber ? "check_circle" : "cancel"}
                      </span>
                      <span>Pelo menos 1 número</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        passwordChecks.hasSpecial ? "text-emerald-700 font-bold" : "text-slate-500"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {passwordChecks.hasSpecial ? "check_circle" : "cancel"}
                      </span>
                      <span>Caractere especial (!@#$)</span>
                    </div>
                  </div>

                  {confirmPassword && (
                    <div
                      className={`pt-1 border-t border-[#7DA0CA]/30 flex items-center gap-1.5 ${
                        passwordChecks.match ? "text-emerald-700 font-bold" : "text-rose-600 font-semibold"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {passwordChecks.match ? "check_circle" : "error"}
                      </span>
                      <span>{passwordChecks.match ? "Senhas coincidem" : "As senhas não coincidem"}</span>
                    </div>
                  )}
                </div>

                {/* Botão de Ativação */}
                <div className="pt-2">
                  <Button
                    id="btn-ativar-conta-submit"
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon="verified_user"
                    disabled={!isFormValid}
                    loadingText="Ativando Conta..."
                    className="w-full"
                  >
                    Ativar Conta &amp; Concluir Acesso
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="w-full max-w-lg mx-auto pt-6 text-center text-slate-500 text-[11px] space-y-1">
        <p>Fatura Ótica Enterprise • Protocolo de Identidade e Acesso RLS</p>
        <p className="text-slate-400">Em conformidade com as diretrizes da LGPD e ISO 13485</p>
      </footer>
    </div>
  );
}

export default function AtivarContaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F0F6FC]">
          <span className="material-symbols-outlined animate-spin text-3xl text-[#5483B3]">
            progress_activity
          </span>
        </div>
      }
    >
      <AtivarContaContent />
    </Suspense>
  );
}

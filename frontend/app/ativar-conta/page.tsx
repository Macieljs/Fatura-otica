"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import OpticalBrandLogo from "@/components/OpticalBrandLogo";
import Button from "@/components/Button";
import { useToast } from "@/components/ToastProvider";
import { identityService } from "@/services/identityService";

function AtivarContaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [token, setToken] = useState("");
  const capturedToken = useRef(false);
  useEffect(() => {
    if (capturedToken.current) return;
    capturedToken.current = true;
    const fragmentToken = new URLSearchParams(window.location.hash.slice(1)).get("token");
    setToken(fragmentToken || searchParams.get("token") || "");
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("token");
    cleanUrl.hash = "";
    window.history.replaceState(null, "", cleanUrl);
  }, [searchParams]);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const submitting = useRef(false);
  const passwordChecks = {
    minLen: password.length >= 12 && password.length <= 128,
    match: password.length > 0 && password === confirmPassword,
  };
  const isFormValid = !!token && !!name.trim() && passwordChecks.minLen && passwordChecks.match;

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    if (!isFormValid) {
      toast.warning("Por favor, atenda a todos os requisitos de segurança da senha.", {
        title: "Requisitos de Senha",
      });
      return;
    }

    submitting.current = true;
    setIsLoading(true);
    try {
      await identityService.activateAccount(token, password, name);
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
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div id="ativar-conta-div-estrutura-1" className="min-h-screen bg-[#F0F6FC] text-[#021024] flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans">
      {/* Top Header */}
      <div id="ativar-conta-div-estrutura-2" className="w-full max-w-lg mx-auto flex items-center justify-between pb-6">
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
      <main id="ativar-conta-main-estrutura-3" className="w-full max-w-lg mx-auto my-auto">
        <div id="ativar-conta-div-estrutura-4" className="bg-white border border-[#7DA0CA]/60 rounded-2xl p-7 sm:p-9 space-y-6 shadow-sm">
          {isSuccess ? (
            <div id="ativar-conta-div-estrutura-5" className="text-center py-6 space-y-4">
              <div id="ativar-conta-div-estrutura-6" className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <span className="material-symbols-outlined text-3xl">verified</span>
              </div>
              <div id="ativar-conta-div-estrutura-7" className="space-y-1">
                <h2 className="text-xl font-bold text-[#052659]">Conta Ativada com Sucesso!</h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Sua conta foi ativada. Você já pode entrar com seu e-mail e sua nova senha.
                </p>
              </div>
              <div id="ativar-conta-div-estrutura-8" className="pt-3">
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
              <div id="ativar-conta-div-estrutura-9" className="space-y-1.5 border-b border-[#F0F6FC] pb-4">
                <div id="ativar-conta-div-estrutura-10" className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C1E8FF] text-[#052659] text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]">lock_open</span>
                  <span>Primeiro Acesso de Colaborador</span>
                </div>
                <h1 className="text-2xl font-bold text-[#052659] tracking-tight">
                  Definição de Senha Pessoal
                </h1>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Defina sua senha pessoal usando o link de uso único emitido pelo administrador da
                  sua empresa.
                </p>
              </div>

              {/* Form de Ativação */}
              <form id="form-ativar-conta" onSubmit={handleActivate} className="space-y-4">
                {/* Nome Confirmado */}
                <div id="ativar-conta-div-estrutura-12" className="space-y-1">
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
                <div id="ativar-conta-div-estrutura-13" className="space-y-1">
                  <div id="ativar-conta-div-estrutura-14" className="flex items-center justify-between">
                    <label
                      htmlFor="input-ativar-token"
                      className="text-xs font-bold text-[#052659] uppercase tracking-wider"
                    >
                      Token de Autorização
                    </label>
                    <span className="text-[11px] text-[#5483B3]">{token ? "A validar no envio" : "Link sem token"}</span>
                  </div>
                  <input
                    id="input-ativar-token"
                    type="text"
                    readOnly
                    value={token}
                    className="w-full h-10 px-3.5 border border-[#7DA0CA]/60 rounded-xl text-xs font-mono font-bold text-slate-600 bg-slate-50 outline-none cursor-not-allowed"
                  />
                </div>

                {/* Nova Senha */}
                <div id="ativar-conta-div-estrutura-15" className="space-y-1">
                  <label
                    htmlFor="input-ativar-senha"
                    className="text-xs font-bold text-[#052659] uppercase tracking-wider block"
                  >
                    Criar Nova Senha
                  </label>
                  <div id="ativar-conta-div-estrutura-16" className="relative">
                    <input
                      id="input-ativar-senha"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={12}
                      maxLength={128}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-10 pl-3.5 pr-10 border border-[#7DA0CA]/60 rounded-xl text-xs font-mono text-[#021024] focus:border-[#5483B3] focus:ring-2 focus:ring-[#5483B3]/20 outline-none"
                    />
                    <Button variant="ghost"
                      id="btn-ativar-toggle-senha"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#052659] p-0.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </Button>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div id="ativar-conta-div-estrutura-17" className="space-y-1">
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
                <div id="ativar-conta-div-estrutura-18" className="p-3.5 bg-[#F0F6FC] rounded-xl border border-[#7DA0CA]/40 space-y-1.5 text-[11px]">
                  <span className="font-bold text-[#052659] block uppercase tracking-wider text-[10px]">
                    Requisitos da Senha:
                  </span>
                  <div id="ativar-conta-div-estrutura-19" className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <div id="ativar-conta-div-estrutura-20"
                      className={`flex items-center gap-1.5 ${
                        passwordChecks.minLen ? "text-emerald-700 font-bold" : "text-slate-500"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {passwordChecks.minLen ? "check_circle" : "cancel"}
                      </span>
                      <span>De 12 a 128 caracteres</span>
                    </div>

                  </div>

                  {confirmPassword && (
                    <div id="ativar-conta-div-estrutura-21"
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
                <div id="ativar-conta-div-estrutura-22" className="pt-2">
                  <Button
                    id="btn-ativar-conta-submit"
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon="verified_user"
                    disabled={!isFormValid || isLoading}
                    isLoading={isLoading}
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
      <footer id="ativar-conta-footer-estrutura-23" className="w-full max-w-lg mx-auto pt-6 text-center text-slate-500 text-[11px] space-y-1">
        <p>Fatura Ótica • Ativação de conta corporativa</p>
        <p className="text-slate-400">O link de ativação é temporário e pode ser reemitido por um administrador.</p>
      </footer>
    </div>
  );
}

export default function AtivarContaPage() {
  return (
    <Suspense
      fallback={
        <div id="ativar-conta-div-estrutura-24" className="min-h-screen flex items-center justify-center bg-[#F0F6FC]">
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

"use client";

import React from "react";

export interface OsStepperProps {
  currentStep: 1 | 2 | 3 | 4;
  onSelectStep: (step: 1 | 2 | 3 | 4) => void;
  canAccessStep: (step: 1 | 2 | 3 | 4) => boolean;
}

const steps = [
  { step: 1, label: "Cliente", fullLabel: "1. Cliente" },
  { step: 2, label: "Receita Óptica", fullLabel: "2. Receita Óptica" },
  { step: 3, label: "Armação & Lentes", fullLabel: "3. Armação & Lentes" },
  { step: 4, label: "Resumo & Envio", fullLabel: "4. Resumo & Envio" },
] as const;

export default function OsStepper({
  currentStep,
  onSelectStep,
  canAccessStep,
}: OsStepperProps) {
  return (
    <nav
      id="nav-os-stepper-fluxo"
      aria-label="Progresso da Ordem de Serviço"
      className="flex items-center gap-1.5 sm:gap-2 bg-[#F0F6FC] px-3 py-1.5 rounded-xl border border-[#7DA0CA]/30 shadow-2xs select-none"
    >
      {steps.map(({ step, label, fullLabel }, idx) => {
        const isActive = currentStep === step;
        const isPast = currentStep > step;
        const isAccessible = canAccessStep(step);

        return (
          <React.Fragment key={step}>
            <button
              id={`btn-os-stepper-etapa-${step}`}
              type="button"
              disabled={!isAccessible}
              onClick={() => onSelectStep(step)}
              title={
                !isAccessible
                  ? "Complete os passos anteriores para liberar esta etapa"
                  : `Ir para ${fullLabel}`
              }
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#052659] text-white font-bold shadow-xs"
                  : isPast
                  ? "text-slate-700 hover:bg-slate-200/60 font-medium cursor-pointer"
                  : isAccessible
                  ? "text-slate-600 hover:bg-white font-medium cursor-pointer"
                  : "text-slate-400 opacity-50 cursor-not-allowed"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shrink-0 ${
                  isActive
                    ? "bg-white text-[#052659]"
                    : isPast
                    ? "bg-slate-600 text-white"
                    : "border border-slate-300 text-slate-500"
                }`}
              >
                {isPast ? (
                  <span className="material-symbols-outlined text-[13px] leading-none">check</span>
                ) : (
                  step
                )}
              </div>
              {/* No desktop ultrawide/full hd mostra todos; em larguras menores mantém o passo ativo visível e compacta os demais */}
              <span
                className={`text-xs ${
                  isActive
                    ? "inline font-bold"
                    : "hidden 2xl:inline"
                }`}
              >
                {label}
              </span>
            </button>

            {idx < steps.length - 1 && (
              <div
                className={`w-3 sm:w-4 h-0.5 rounded-full transition-colors shrink-0 ${
                  currentStep > step ? "bg-slate-400" : "bg-slate-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

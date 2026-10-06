import React from "react";

interface OpticalFrameIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}

/**
 * OpticalFrameIcon - Ícone vetorial proprietário para o Design System Clinical Precision Enterprise.
 * Substitui o ícone infantil "eyeglasses" do Google Material Symbols por uma representação
 * óptica de precisão médica/executiva inspirada em armações de titânio (Silhouette / Lindberg).
 */
export default function OpticalFrameIcon({
  size = 20,
  className = "",
  strokeWidth = 1.8,
  ...props
}: OpticalFrameIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block shrink-0 select-none ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Aro Esquerdo: Contorno Anatômico Sofisticado (Leve afilamento inferior) */}
      <path d="M3 8.5C3 7.12 4.12 6 5.5 6H8C9.38 6 10.5 7.12 10.5 8.5V11.8C10.5 13.57 9.07 15 7.3 15H6.2C4.43 15 3 13.57 3 11.8V8.5Z" />

      {/* Aro Direito: Simetria Perfeita */}
      <path d="M13.5 8.5C13.5 7.12 14.62 6 16 6H18.5C19.88 6 21 7.12 21 8.5V11.8C21 13.57 19.57 15 17.8 15H16.7C14.93 15 13.5 13.57 13.5 11.8V8.5Z" />

      {/* Ponte Nasal Anatômica (Arco Superior Ergonômico) */}
      <path d="M10.5 9.2C11.2 8.3 12.8 8.3 13.5 9.2" />

      {/* Charneira / Encaixe da Haste Esquerda */}
      <path d="M3 9.2H1.5" />

      {/* Charneira / Encaixe da Haste Direita */}
      <path d="M21 9.2H22.5" />
    </svg>
  );
}

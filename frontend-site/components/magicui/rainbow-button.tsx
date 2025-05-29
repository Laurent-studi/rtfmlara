"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface RainbowButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function RainbowButton({
  children,
  className,
  variant = "default",
  size = "default",
  onClick,
  type = "button",
  disabled = false,
  ...props
}: RainbowButtonProps) {
  const baseClasses = cn(
    "group relative inline-flex items-center justify-center overflow-hidden rounded-md font-medium transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    {
      // Tailles
      "h-9 px-4 py-2 text-sm": size === "default",
      "h-8 px-3 text-xs": size === "sm", 
      "h-10 px-8 text-base": size === "lg",
      "h-9 w-9": size === "icon",
    }
  );

  if (variant === "outline") {
    return (
      <button
        className={cn(
          baseClasses,
          "rainbow-button-outline", // Classe pour les styles spécifiques aux thèmes
          "border border-input bg-transparent text-foreground shadow-sm",
          "hover:bg-accent hover:text-accent-foreground",
          "before:absolute before:inset-0 before:rounded-md before:border-2 before:border-transparent",
          // Utilisation des variables CSS des thèmes pour les couleurs rainbow
          "before:bg-gradient-to-r before:from-[var(--color-primary)] before:via-[var(--color-secondary)] before:to-[var(--color-accent)]",
          "before:bg-[length:400%_400%] before:animate-[rainbow_6s_ease-in-out_infinite]",
          "before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
          "before:[mask-composite:xor] before:opacity-0",
          "hover:before:opacity-100 before:transition-opacity before:duration-300",
          // Assurer que le texte reste visible sur tous les thèmes
          "text-foreground hover:text-accent-foreground",
          className
        )}
        onClick={onClick}
        type={type}
        disabled={disabled}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  }

  return (
    <button
      className={cn(
        baseClasses,
        // Utilisation des variables CSS des thèmes pour les couleurs rainbow
        "bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)]",
        "bg-[length:400%_400%] animate-[rainbow_6s_ease-in-out_infinite]",
        // Couleur du texte adaptée au thème
        "text-primary-foreground shadow-lg",
        "hover:shadow-xl hover:scale-105",
        "active:scale-95",
        className
      )}
      onClick={onClick}
      type={type}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}

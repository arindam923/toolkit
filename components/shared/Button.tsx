import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  isActive?: boolean;
}

export default function Button({
  children,
  variant = "outline",
  size = "md",
  isActive = false,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses = "rounded-[10px] text-xs font-medium border transition-all";
  
  const variantClasses = {
    primary: "bg-[#FF5C35] text-white border-[#FF5C35] hover:opacity-90 active:scale-[0.98]",
    secondary: "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)] hover:border-[#FF5C35] hover:text-[#FF5C35]",
    outline: isActive 
      ? "bg-[#FF5C35] text-white border-[#FF5C35]" 
      : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)] hover:border-[#FF5C35] hover:text-[#FF5C35]",
  };
  
  const sizeClasses = {
    sm: "px-2 py-1",
    md: "px-3 py-1.5",
    lg: "px-4 py-2",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "settings" | "tip" | "error";
  children: React.ReactNode;
}

export default function Container({
  children,
  variant = "settings",
  className = "",
  ...props
}: ContainerProps) {
  const baseClasses = "rounded-[14px]";
  
  const variantStyles = {
    settings: {
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      padding: "16px",
    },
    tip: {
      background: "var(--color-background-secondary)",
      padding: "12px",
      borderRadius: "10px",
    },
    error: {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      padding: "12px",
      borderRadius: "10px",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`${baseClasses} ${className}`}
      style={styles}
      {...props}
    >
      {children}
    </div>
  );
}
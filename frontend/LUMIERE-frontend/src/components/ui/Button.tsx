import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium transition-colors border rounded-md";

  const variants: Record<string, string> = {
    primary: "bg-black text-white border-black hover:bg-gray-900 disabled:bg-gray-300 disabled:border-gray-300",
    secondary: "bg-white text-black border-gray-300 hover:border-black disabled:opacity-50",
    ghost: "bg-transparent text-black border-transparent hover:bg-gray-100 disabled:opacity-50",
  };

  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-sm",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

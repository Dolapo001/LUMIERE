import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-gray-600">{label}</label>
      )}
      <input
        className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-[14px] transition-colors placeholder:text-gray-400 focus:border-black focus:outline-none hover:border-black disabled:bg-gray-50 disabled:text-gray-400 ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

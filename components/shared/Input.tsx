import React from "react";

interface RangeInputProps {
  label?: string;
  min?: number;
  max?: number;
  value: number;
  onChange: (value: number) => void;
  showValues?: boolean;
  valueFormat?: (value: number) => string;
  className?: string;
  [key: string]: any;
}

export function RangeInput({
  label,
  min = 10,
  max = 100,
  value,
  onChange,
  showValues = true,
  valueFormat = (val) => `${val}%`,
  className = "",
  ...props
}: RangeInputProps) {
  const id = `range-${label}`;
  
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-xs font-medium" 
          style={{ color: "var(--color-text-primary)" }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full"
        style={{ accentColor: "#FF5C35" }}
        {...props}
      />
      {showValues && (
        <div className="flex justify-between text-xs" style={{ color: "var(--color-text-secondary)" }}>
          <span>{valueFormat(min)}</span>
          <span>{valueFormat(max)}</span>
        </div>
      )}
    </div>
  );
}

interface NumberInputProps {
  label?: string;
  min?: number;
  max?: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  [key: string]: any;
}

export function NumberInput({
  label,
  min = 1,
  max = 10000,
  value,
  onChange,
  className = "",
  ...props
}: NumberInputProps) {
  const id = `number-${label}`;
  
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-xs font-medium" 
          style={{ color: "var(--color-text-primary)" }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
        style={{
          background: "var(--color-background-secondary)",
          borderColor: "var(--color-border-tertiary)",
          color: "var(--color-text-primary)",
        }}
        {...props}
      />
    </div>
  );
}

interface CheckboxInputProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  [key: string]: any;
}

export function CheckboxInput({
  label,
  checked,
  onChange,
  className = "",
  ...props
}: CheckboxInputProps) {
  const id = `checkbox-${label}`;
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-3 h-3"
        style={{ accentColor: "#FF5C35" }}
        {...props}
      />
      {label && (
        <label 
          htmlFor={id} 
          className="text-xs" 
          style={{ color: "var(--color-text-primary)" }}
        >
          {label}
        </label>
      )}
    </div>
  );
}

interface TextInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  [key: string]: any;
}

export function TextInput({
  label,
  value,
  onChange,
  className = "",
  ...props
}: TextInputProps) {
  const id = `text-${label}`;
  
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-xs font-medium" 
          style={{ color: "var(--color-text-primary)" }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
        style={{
          background: "var(--color-background-secondary)",
          borderColor: "var(--color-border-tertiary)",
          color: "var(--color-text-primary)",
        }}
        {...props}
      />
    </div>
  );
}
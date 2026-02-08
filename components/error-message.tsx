import React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function ErrorMessage({ children, className }: Props) {
  return (
    <div className={`text-sm text-error-foreground ${className}`}>
      {children}
    </div>
  );
}

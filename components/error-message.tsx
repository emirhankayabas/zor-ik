import React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function ErrorMessage({ children, className }: Props) {
  return (
    <div className={`text-xs ml-1 font-medium text-destructive ${className}`}>
      {children}
    </div>
  );
}

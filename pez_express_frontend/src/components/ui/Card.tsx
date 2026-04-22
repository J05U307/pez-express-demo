// src/components/ui/Card.tsx

import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-white rounded-xl shadow-md p-4 transition hover:shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}
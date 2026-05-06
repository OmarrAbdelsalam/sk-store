import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  noPadding?: boolean;
}

const Card = ({ children, className = "", noPadding = false }: CardProps) => {
  return (
    <div className={`content-card ${noPadding ? "" : "p-4 lg:p-5"} ${className}`}>
      {children}
    </div>
  );
};

export default Card;

import { Shield } from "lucide-react";

interface BenefitGuardLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { container: "w-8 h-8", icon: "w-4 h-4" },
  md: { container: "w-10 h-10", icon: "w-5 h-5" },
  lg: { container: "w-16 h-16", icon: "w-8 h-8" },
};

export function BenefitGuardLogo({ size = "sm", className = "" }: BenefitGuardLogoProps) {
  const s = sizeMap[size];
  return (
    <div className={`${s.container} rounded-full bg-primary/10 flex items-center justify-center ${className}`}>
      <Shield className={`${s.icon} text-primary`} />
    </div>
  );
}

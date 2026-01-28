import * as React from "react";
import { cn } from "@/lib/utils";

interface NavitelLogoProps {
  readonly className?: string;
  readonly size?: "sm" | "md" | "lg" | "xl";
  readonly variant?: "full" | "icon" | "text";
  readonly showText?: boolean;
}

const sizes = {
  sm: { icon: 28, text: "text-lg" },
  md: { icon: 36, text: "text-xl" },
  lg: { icon: 44, text: "text-2xl" },
  xl: { icon: 56, text: "text-3xl" },
};

// Logo Icon Component - Custom N with road/route design
function LogoIcon({ size = 36, className }: Readonly<{ size?: number; className?: string }>) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00c9ff" />
          <stop offset="100%" stopColor="#0077ff" />
        </linearGradient>
        <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>
      
      {/* Rounded square background */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoGradient)" />
      
      {/* Letter N stylized as a road/route */}
      <path 
        d="M14 36V12L24 28L34 12V36" 
        stroke="white" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Road markings (dots representing route) */}
      <circle cx="14" cy="32" r="2" fill="white" opacity="0.6" />
      <circle cx="19" cy="24" r="1.5" fill="white" opacity="0.6" />
      <circle cx="24" cy="18" r="1.5" fill="white" opacity="0.6" />
      <circle cx="29" cy="24" r="1.5" fill="white" opacity="0.6" />
      <circle cx="34" cy="32" r="2" fill="white" opacity="0.6" />
      
      {/* Location pin on top */}
      <circle cx="24" cy="10" r="3" fill="white" />
      <circle cx="24" cy="10" r="1.5" fill="#00c9ff" />
    </svg>
  );
}

// Alternative Icon - Truck with N
function LogoIconTruck({ size = 36, className }: Readonly<{ size?: number; className?: string }>) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradientTruck" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00c9ff" />
          <stop offset="100%" stopColor="#0077ff" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoGradientTruck)" />
      
      {/* Truck body */}
      <rect x="8" y="20" width="22" height="14" rx="2" fill="white" />
      
      {/* Cabin */}
      <path 
        d="M30 24H38C39.1 24 40 24.9 40 26V32C40 33.1 39.1 34 38 34H30V24Z" 
        fill="white" 
        opacity="0.9"
      />
      
      {/* Window */}
      <rect x="32" y="26" width="6" height="4" rx="1" fill="#00c9ff" />
      
      {/* Wheels */}
      <circle cx="16" cy="36" r="4" fill="#1e293b" />
      <circle cx="16" cy="36" r="2" fill="#64748b" />
      <circle cx="34" cy="36" r="4" fill="#1e293b" />
      <circle cx="34" cy="36" r="2" fill="#64748b" />
      
      {/* N Letter on truck */}
      <path 
        d="M13 30V24L19 30V24" 
        stroke="#00c9ff" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Signal/GPS indicator */}
      <circle cx="38" cy="14" r="3" fill="white" />
      <circle cx="38" cy="14" r="1.5" fill="#00c9ff" />
      <path d="M42 12C43.5 13.5 43.5 16 42 17.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M44 10C46.5 12.5 46.5 17.5 44 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// Modern minimalist icon
function LogoIconModern({ size = 36, className }: Readonly<{ size?: number; className?: string }>) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradientModern" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00c9ff" />
          <stop offset="50%" stopColor="#00a8e8" />
          <stop offset="100%" stopColor="#0077ff" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#logoGradientModern)" />
      
      {/* Abstract route/path design */}
      <path 
        d="M12 36 L12 16 L24 30 L24 16" 
        stroke="white" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      <path 
        d="M24 30 L36 16 L36 36" 
        stroke="white" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
        opacity="0.8"
      />
      
      {/* Location marker */}
      <circle cx="24" cy="12" r="4" fill="white" />
      <circle cx="24" cy="12" r="2" fill="#00c9ff" />
    </svg>
  );
}

export function NavitelLogo({ 
  className, 
  size = "md", 
  variant = "full",
  showText = true 
}: NavitelLogoProps) {
  const { icon: iconSize, text: textSize } = sizes[size];

  if (variant === "icon") {
    return <LogoIconModern size={iconSize} className={className} />;
  }

  if (variant === "text") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <span className={cn("font-bold text-foreground", textSize)}>Navitel</span>
        <span className={cn("font-light text-primary", textSize)}>TMS</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoIconModern size={iconSize} />
      {showText && (
        <div className="flex items-center gap-1">
          <span className={cn("font-bold text-foreground", textSize)}>Navitel</span>
          <span className={cn("font-light text-primary", textSize)}>TMS</span>
        </div>
      )}
    </div>
  );
}

// Export individual icons for flexibility
export { LogoIcon, LogoIconTruck, LogoIconModern };

// Simple icon wrapper for places using Package icon
export function NavitelIcon({ className, size = 24 }: Readonly<{ className?: string; size?: number }>) {
  return <LogoIconModern size={size} className={className} />;
}

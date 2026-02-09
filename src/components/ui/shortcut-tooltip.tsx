"use client";

import { useState, useRef } from "react";
import { getKeysById } from "@/lib/keyboard-shortcuts";

interface ShortcutTooltipProps {
  shortcutId: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export function ShortcutTooltip({ shortcutId, children, side = "bottom" }: ShortcutTooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keys = getKeysById(shortcutId);

  if (keys.length === 0) return <>{children}</>;

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), 500);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  const positionClass = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }[side];

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div
          className={`absolute ${positionClass} z-50 pointer-events-none animate-in fade-in duration-100`}
        >
          <div className="flex items-center gap-0.5 bg-foreground text-background px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
            {keys.map((key, i) => (
              <span key={i} className="flex items-center gap-0.5">
                {i > 0 && <span className="text-[9px] opacity-60 mx-0.5">+</span>}
                <kbd className="text-[11px] font-mono font-medium">{key}</kbd>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

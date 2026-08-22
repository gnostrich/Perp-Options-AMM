"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type Props = {
  buyMarket: string;
};

export default function BuyMarketDisplay({ buyMarket }: Props) {
  const textRef = useRef<HTMLDivElement>(null);
  const previousValueRef = useRef<string>("");

  useEffect(() => {
    if (!textRef.current || previousValueRef.current === buyMarket) return;

    const el = textRef.current;

    // Animate out
    gsap.to(el, {
      opacity: 0,
      y: -5,
      duration: 0.2,
      onComplete: () => {
        // After fade out, update text
        if (el) el.textContent = buyMarket || "Choose market";

        // Animate in
        gsap.fromTo(
          el,
          { opacity: 0, y: 5 },
          { opacity: 1, y: 0, duration: 0.2 }
        );
      },
    });

    previousValueRef.current = buyMarket;
  }, [buyMarket]);

  return (
    <div className="px-2 py-0 w-full">
      <div className="h-8 px-2 w-full text-2xs rounded-sm text-[#14E800]  flex items-center justify-center">
        <div ref={textRef} className="text-2xs">{buyMarket || "Choose market"}</div>
      </div>
    </div>
  );
}

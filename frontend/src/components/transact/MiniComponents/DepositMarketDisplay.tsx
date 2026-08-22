"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";

type Props = {
  sellMarket: string;
};

function TokenLogo({ token }: { token: string }) {
  const [error, setError] = useState(false);

  // Render a gray circle if error occurs
  if (error) {
    return <div className="h-5 w-5 rounded-full bg-gray-700 shrink-0" />;
  }

  return (
    <div className="relative h-5 w-5 rounded-full overflow-hidden shrink-0">
      <Image
        src={`/logo_${token}.svg`}
        alt={token}
        fill
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

export default function DepositMarketDisplay({ sellMarket }: Props) {
  const textRef = useRef<HTMLDivElement>(null);
  const previousValueRef = useRef<string>("");

  useEffect(() => {
    if (!textRef.current || previousValueRef.current === sellMarket) return;

    const el = textRef.current;

    // Animate out
    gsap.to(el, {
      opacity: 0,
      y: -5,
      duration: 0.2,
      onComplete: () => {
        // After fade out, update text
        if (el) el.textContent = sellMarket || "Choose market";

        // Animate in
        gsap.fromTo(
          el,
          { opacity: 0, y: 5 },
          { opacity: 1, y: 0, duration: 0.2 }
        );
      },
    });

    previousValueRef.current = sellMarket;
  }, [sellMarket]);

  const token = sellMarket ? sellMarket.split(" ")[0] : "";

  return (
    <div className="text-2xs font-normal text-white">
      <div className="flex items-center gap-2">
        {sellMarket ? <TokenLogo token={token} /> : null}
        <div ref={textRef}>{sellMarket || "Choose market"}</div>
      </div>
    </div>
  );
}

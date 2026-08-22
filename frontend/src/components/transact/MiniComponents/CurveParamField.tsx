"use client";

import * as React from "react";
import { ibmPlexMono } from "@/lib/font";

interface CurveParamFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  error?: string;
  /** Small muted marker under the input, e.g. N's "= from notional" in DERIVED MODE
   *  (UNITS_AND_SEMANTICS moving-parts label — states which value drives this field
   *  right now). Undefined renders nothing; only the N field ever passes this. */
  hint?: string;
}

/**
 * Labeled numeric field + slider, generalized from LevSlider's drag-then-commit pattern
 * (V2_UX_SPEC.md §B.4). Reused 6x for the CURVE PARAMETERS block. Existing EarnComponent
 * field-grid chrome: label cell bg-[#112226], body bg-[#222223] border-[#465E58].
 */
export default function CurveParamField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  error,
  hint,
}: CurveParamFieldProps) {
  const clamp = React.useCallback((v: number) => Math.min(max, Math.max(min, v)), [min, max]);

  const [temp, setTemp] = React.useState(value);
  const [dragging, setDragging] = React.useState(false);
  const [text, setText] = React.useState(String(value));

  React.useEffect(() => {
    if (!dragging) {
      setTemp(value);
      setText(String(value));
    }
  }, [value, dragging]);

  const commitNumber = (raw: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      setText(String(value));
      return;
    }
    const c = clamp(n);
    setTemp(c);
    setText(String(c));
    if (c !== value) onChange(c);
  };

  const startDrag = () => setDragging(true);
  const commitSlider = () => {
    setDragging(false);
    const c = clamp(temp);
    setText(String(c));
    if (c !== value) onChange(c);
  };

  const pct = ((temp - min) / (max - min)) * 100;

  return (
    <div className="mb-2.5">
      {/* Label chips run long ("S̄ (mean strike)", "N (rungs/wing)") — give the chip its
          own fixed column and drop tracking-widest so it stops crowding the input. */}
      <div className="rounded-sm grid grid-cols-[minmax(132px,44%)_minmax(88px,1fr)] items-stretch mx-0 bg-[#222223] border border-[#465E58]">
        <div className="flex items-center rounded-l-sm justify-center m-0 px-2 py-2 bg-[#112226] border-r border-[#465E58]">
          <span className="font-normal text-2xs tracking-wide leading-tight text-center text-[#E4E4E4]">
            {label}
          </span>
        </div>
        <div className="flex items-center justify-center px-2">
          <input
            type="number"
            inputMode="decimal"
            value={text}
            min={min}
            max={max}
            step={step}
            onChange={(e) => setText(e.target.value)}
            onBlur={(e) => commitNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitNumber((e.target as HTMLInputElement).value);
            }}
            className={`h-6 w-full rounded-sm bg-[#222223] p-2 text-xs font-light text-white placeholder:text-gray-400 focus:outline-none focus:ring-0 ${ibmPlexMono.className}`}
          />
        </div>
      </div>

      {hint && (
        <div className={`text-2xs text-[#677275] mt-0.5 px-2 ${ibmPlexMono.className}`}>{hint}</div>
      )}

      <div className="px-2 pt-2">
        <div className="relative h-1 bg-[#4E4E4E] rounded-full">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-[#465E58]"
            style={{ width: `${pct}%` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={temp}
            onChange={(e) => setTemp(Number(e.target.value))}
            onPointerDown={startDrag}
            onPointerUp={commitSlider}
            onPointerCancel={commitSlider}
            onBlur={commitSlider}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
        </div>
        <div className={`flex justify-between text-2xs text-[#677275] mt-1.5 ${ibmPlexMono.className}`}>
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>

      {error && (
        <div className={`text-2xs text-[#FF6767] mt-0.5 px-2 ${ibmPlexMono.className}`}>
          {error}
        </div>
      )}
    </div>
  );
}

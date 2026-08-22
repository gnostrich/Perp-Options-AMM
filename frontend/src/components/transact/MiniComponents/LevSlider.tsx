"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { useCallback } from "react"

interface LeverageSliderProps {
  leverage: number
  handleLeverageChange: (value: number) => void
  /** Upper bound. Default 40 (trader whole-account, CreatePerpComponent's own
   *  cap, unaffected). EARN passes 10 (the LP maintenance cap, CLAUDE.md "LP
   *  leverage cap — 10× maintenance") — the slider is UX only, the backend
   *  refuses over-cap N·S regardless of what this prop is set to. */
  max?: number
}

const MIN = 1
const DEFAULT_MAX = 40
const STEP = 1

export default function LeverageSlider({
  leverage,
  handleLeverageChange,
  max = DEFAULT_MAX,
}: LeverageSliderProps) {
  const clamp = useCallback((v: number) => Math.max(MIN, Math.min(max, v)), [max])
  const roundClamp = useCallback((v: number) => clamp(Math.round(v)), [clamp])

  // Local state while dragging
  const [temp, setTemp] = React.useState<number>(roundClamp(leverage))
  const [dragging, setDragging] = React.useState(false)

  // Keep local state in sync when parent changes externally
  React.useEffect(() => {
    if (!dragging) setTemp(roundClamp(leverage))
  }, [leverage, dragging, roundClamp])

  const startDrag = () => setDragging(true)

  const commit = React.useCallback(() => {
    setDragging(false)
    const committed = roundClamp(temp)
    if (committed !== leverage) handleLeverageChange(committed)
  }, [temp, leverage, handleLeverageChange, roundClamp])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemp(Number(e.target.value))
  }

  const increment = () => {
    const next = roundClamp(leverage + STEP)
    setTemp(next)
    handleLeverageChange(next) // commit immediately for +/- clicks
  }

  const decrement = () => {
    const next = roundClamp(leverage - STEP)
    setTemp(next)
    handleLeverageChange(next) // commit immediately for +/- clicks
  }

  const pct = (v: number) => ((v - MIN) / (max - MIN)) * 100
  const thumbLeft = pct(temp)

  return (
    <div className="w-full py-2 px-2">
      <div className="flex items-start gap-4">
        <Button
          variant="noShadow"
          size="icon"
          onClick={decrement}
          disabled={leverage <= MIN}
          className="h-4 w-4 rounded-xs -m-1 bg-[#112226] border border-white hover:bg-gray-600"
        >
          <Minus className="h-1 w-1 text-white" />
        </Button>

        {/* Slider */}
        <div className="flex-1 relative">
          {/* Track */}
          <div className="relative h-1 bg-[#4E4E4E] rounded-full">
            {/* Progress fill */}
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-[#465E58]"
              style={{ width: `${thumbLeft}%` }}
            />

            {/* Input */}
            <input
              type="range"
              min={MIN}
              max={max}
              step={STEP}
              value={temp}
              onChange={handleSliderChange}
              onPointerDown={startDrag}
              onPointerUp={commit}
              onPointerCancel={commit}
              onBlur={commit}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />

            {/* Thumb with value */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 pointer-events-none"
              style={{ left: `${thumbLeft}%` }}
            >
              <div className="rounded-sm p-0.5 text-2xs font-medium tabular-nums text-white bg-[#112226] border border-white shadow">
                {temp}x
              </div>
            </div>
          </div>

          {/* Tick marks */}
          <div className="relative h-5 mt-1.5 select-none">
            {Array.from({ length: Math.floor(max / 5) }, (_, i) => {
              const tickValue = (i + 1) * 5
              const isLabel = tickValue % 10 === 0
              return (
                <div
                  key={tickValue}
                  className="absolute text-center"
                  style={{ left: `${pct(tickValue)}%` }}
                >
                  <div className="w-px h-2 bg-gray-500/80 mb-1" />
                  {isLabel && (
                    <span
                      className="text-2xs text-gray-400 font-medium tabular-nums"
                      style={{ marginLeft: "-5px" }}
                    >
                      {tickValue}x
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <Button
          variant="noShadow"
          size="icon"
          onClick={increment}
          disabled={leverage >= max}
          className="h-4 w-4 rounded-xs -my-1 bg-[#112226] border border-white hover:bg-gray-600"
        >
          <Plus className="h-1 w-1 text-white" />
        </Button>
      </div>
    </div>
  )
}

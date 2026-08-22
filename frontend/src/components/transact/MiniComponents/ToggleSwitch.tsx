
interface ToggleSwitchProps {
  isPercentageMode: boolean
  onToggle: () => void
}

export default function ToggleSwitch({ isPercentageMode, onToggle }: ToggleSwitchProps) {
  return (
    <button
      onClick={onToggle}
      className="relative w-10 h-6 bg-[#373737] border-2 border-[#4F4F4F] rounded-sm p-0.5 transition-all duration-300 ease-in-out focus:outline-none"
      aria-label="Toggle between percentage and dollar mode"
    >
      {/* Sliding white indicator */}
      <div
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-sm shadow-md transition-transform duration-300 ease-in-out z-20 ${isPercentageMode ? "translate-x-0" : "translate-x-4"
          }`}
      />

      {!isPercentageMode && (
        <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-xs font-bold text-white z-10">$</div>
      )}

      {isPercentageMode && (
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs font-bold text-white z-10">%</div>
      )}
    </button>
  )
}
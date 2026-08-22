import { ibmPlexMono } from "@/lib/font";
import { Skeleton } from "@/components/ui/skeleton";

function pretty(n: number, maxFrac = 6) {
    if (!Number.isFinite(n)) return "";
    const s = n.toFixed(Math.min(Math.max(0, maxFrac), 10));
    return s.replace(/\.?0+$/g, "");
}

export default function MaxChip({
    qty,
    variant,
    active,
    disabled,
    onClick,
    approx,
    title,
}: {
    qty: number;
    variant: "sell" | "buy";
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    /** Book-depth affordance ("MAX ≈ x.xx BTC") vs. the default owned-quantity chip ("MAX: x.xxxxxx BTC"). */
    approx?: boolean;
    title?: string;
}) {
    const base = active
        ? variant === "sell"
            ? "bg-[#523C4C] hover:bg-[#5B4355] transition-colors duration-200"
            : "bg-[#12310E] border-[#2D5A1A] hover:bg-[#153A10] transition-colors duration-200"
        : variant === "sell"
            ? "bg-[#935A71] hover:bg-[#A4647E] transition-colors duration-200"
            : "bg-[#1B4D14] border-[#37770F] hover:bg-[#206018] transition-colors duration-200";

    if (disabled) {
        return (
            <Skeleton className="rounded-sm mr-4 px-2 py-0 h-4 w-32 inline-block" />
        );
    }

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`rounded-sm mr-4 px-3 py-1 border text-2xs text-white ${ibmPlexMono.className}
          uppercase tracking-wider leading-none
          disabled:opacity-60 ${base}`}
            title={title ?? `Max available: ${pretty(qty, 6)} BTC`}
        >
            {approx
                ? `MAX ≈${qty > 0 ? ` ${pretty(qty, 2)}` : " —"} BTC`
                : `MAX:${qty > 0 ? ` ${pretty(qty, 6)}` : " —"} BTC`}
        </button>
    );
}

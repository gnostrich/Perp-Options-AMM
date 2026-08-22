"use client";

import { Loader2 } from "lucide-react";

type Props = {
  triggerTransaction: boolean;
};

export default function SplitTextTransact({ triggerTransaction }: Props) {
  if (triggerTransaction) {
    return (
      <span className="text-white font-semibold tracking-widest flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        PROCESSING...
      </span>
    );
  }

  return (
    <span className="text-white font-semibold tracking-widest">
      TRANSACT
    </span>
  );
}

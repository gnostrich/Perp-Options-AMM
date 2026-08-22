"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useConnect, useDisconnect, useSwitchChain, useWalletClient } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { toast } from "sonner";
import { registerReferralAction } from "@/app/actions/registerReferralAction";
import { ensurePaperWalletAction } from "@/app/actions/ensurePaperWalletAction";
import { useAccount } from "@/lib/hooks/useAccount";
import { useDemoAccountStore } from "@/store/demoAccountStore";
import { generateDemoKey, demoAddressFromKey, normalizePrivateKey } from "@/lib/demoAccount";
import { isPaperMode } from "@/lib/execMode";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { formatAddress } from "@/lib/utils";
import { ChevronDown, X, Copy, Check } from "lucide-react";
import { chakraPetch } from "@/lib/font";
import type { Hex } from "viem";

/** Shared reveal/view box for a demo private key — used by both the
 * "create" (must acknowledge) and "view" (already saved) dialogs. */
function KeyBox({ privateKey }: { privateKey: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(privateKey);
        } catch {
            const el = document.createElement("textarea");
            el.value = privateKey;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="flex items-center border border-[#1e3535] rounded-sm overflow-hidden bg-[#0A1416]">
            <div className="flex-1 px-3 py-2.5 overflow-x-auto">
                <span className="text-[#0ABAB5] font-mono text-xs break-all">{privateKey}</span>
            </div>
            <Button
                type="button"
                onClick={handleCopy}
                variant="noShadow"
                className="rounded-none bg-[#448D7A] hover:bg-[#3a7a6a] text-white text-2xs tracking-widest uppercase shrink-0 h-full px-3 flex items-center gap-1"
            >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "COPIED" : "COPY"}
            </Button>
        </div>
    );
}

export function WalletConnectButton() {
    const { address, isConnected, chain, isDemo } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const { switchChain, chains } = useSwitchChain();
    const { data: walletClient } = useWalletClient();
    const [showArbitrumDialog, setShowArbitrumDialog] = useState(false);
    const referralRegistered = useRef(false);
    const paperWalletSeeded = useRef(false);

    const connector = connectors[0];
    const paperMode = isPaperMode();

    // ─── Demo (key-based paper) account ────────────────────────────────
    const demoStore = useDemoAccountStore();
    const [pendingDemoKey, setPendingDemoKey] = useState<Hex | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [ackSaved, setAckSaved] = useState(false);
    const [showViewKeyDialog, setShowViewKeyDialog] = useState(false);
    const [showDisconnectWarn, setShowDisconnectWarn] = useState(false);
    const [showPasteDialog, setShowPasteDialog] = useState(false);
    const [pasteValue, setPasteValue] = useState("");
    const [pasteError, setPasteError] = useState<string | null>(null);

    const handleTryDemo = () => {
        if (demoStore.privateKey) {
            // Browser already has a saved key — resume it, no need to re-show it.
            demoStore.login(demoStore.privateKey);
            return;
        }
        setAckSaved(false);
        setPendingDemoKey(generateDemoKey());
        setShowCreateDialog(true);
    };

    const confirmCreateDemo = () => {
        if (!pendingDemoKey || !ackSaved) return;
        demoStore.login(pendingDemoKey);
        setShowCreateDialog(false);
        setPendingDemoKey(null);
    };

    const submitPasteKey = () => {
        const key = normalizePrivateKey(pasteValue);
        if (!key) {
            setPasteError("Not a valid private key (64 hex chars).");
            return;
        }
        demoStore.login(key);
        setShowPasteDialog(false);
        setPasteValue("");
        setPasteError(null);
    };

    const confirmDisconnectDemo = () => {
        demoStore.disconnect();
        setShowDisconnectWarn(false);
    };

    // ─── Paper wallet seed (v2 item P4, §13.4) ─────────────────────────
    // Idempotent on the backend; fires alongside referral registration on connect.
    // Runs for demo identities too — useAccount() surfaces the demo address
    // through the same {isConnected, address} shape as a real wallet.
    useEffect(() => {
      if (!isConnected || !address || paperWalletSeeded.current) return;
      paperWalletSeeded.current = true;

      ensurePaperWalletAction(address).catch((err) => {
        console.error("Paper wallet seed error:", err);
      });
    }, [isConnected, address]);

    // ─── Referral registration ───────────────────────────────────────
    useEffect(() => {
      if (!isConnected || !address || referralRegistered.current) return;
      referralRegistered.current = true;

      const referrer = localStorage.getItem("temporal_referrer");
      if (!referrer || referrer.toLowerCase() === address.toLowerCase()) {
        return;
      }

      registerReferralAction(referrer, address)
        .then((result) => {
          if (result.success) {
            toast.success("Referral registered! You were referred successfully.");
            localStorage.removeItem("temporal_referrer");
          } else if (result.alreadyReferred) {
            toast.info("This wallet has already been referred.");
            localStorage.removeItem("temporal_referrer");
          } else {
            // Unexpected backend error (400, 500, etc.)
            toast.error("Referral registration failed. Please try again later.");
            // Don't clear localStorage so we can retry on next connect
          }
        })
        .catch((err) => {
          console.error("Referral registration error:", err);
          toast.error("Referral registration failed. Please try again later.");
        });
    }, [isConnected, address]);

    const shouldShowArbitrumButton =
        isConnected &&
        !isDemo &&
        address &&
        (!walletClient || chain?.id !== arbitrum.id);

    return (
        <div>
            {isConnected ? (
                <div className="flex-col md:flex-row flex gap-2">
                    {shouldShowArbitrumButton && (
                        <Button
                            size="sm"
                            className="text-white text-xs"
                            onClick={() => setShowArbitrumDialog(true)}
                        >
                            Connect to Arbitrum
                        </Button>
                    )}

                    <Dialog open={showArbitrumDialog} onOpenChange={setShowArbitrumDialog}>
                        <DialogContent className="rounded-none bg-[#112226] border-[#808080] text-[#C9C8C8]">
                            {/* Close button */}
                            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-0 h-auto w-auto border-0 bg-transparent hover:bg-transparent">
                                <X className="h-4 w-4 text-white" />
                                <span className="sr-only">Close</span>
                            </DialogClose>

                            <DialogHeader>
                                <DialogTitle className={`${chakraPetch.className} text-[#C7B7A5] text-left`}>
                                    SWITCH TO ARBITRUM ONE
                                </DialogTitle>
                                <DialogDescription className="text-[#C9C8C8] text-left">
                                    This application requires the Arbitrum One network. Your wallet may prompt you to switch networks.
                                    <br />
                                    Once connected to Arbitrum, this button will disappear automatically.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="sm:justify-start gap-4">
                                <Button
                                    className="bg-temporal hover:bg-temporal/80 text-white border-0"
                                    onClick={() => {
                                        switchChain({ chainId: arbitrum.id });
                                        setShowArbitrumDialog(false);
                                    }}
                                >
                                    Switch Network
                                </Button>
                                <Button
                                variant="noShadow"
                                    className="bg-transparent text-white hover:bg-white/10 border-0"
                                    onClick={() => setShowArbitrumDialog(false)}
                                >
                                    Cancel
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="z-20 flex items-center justify-center py-1.5 px-3 text-xs text-white bg-main border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none h-9">
                                {isDemo && (
                                    <span className="text-2xs px-1 py-0.5 mr-1.5 bg-[#0ABAB5]/20 text-[#0ABAB5] rounded-sm tracking-wider">
                                        DEMO
                                    </span>
                                )}
                                {formatAddress(address)} <ChevronDown className="h-4 w-4 ml-1" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full flex justify-center bg-[#3B3B3B] text-[#C7B7A5] text-sm">
                            {isDemo ? (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => setShowViewKeyDialog(true)}
                                        className="cursor-pointer w-full flex justify-center"
                                    >
                                        View / copy key
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setShowDisconnectWarn(true)}
                                        className="cursor-pointer w-full flex justify-center"
                                    >
                                        Disconnect
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <DropdownMenuItem
                                    onClick={() => disconnect()}
                                    className="cursor-pointer w-full flex justify-center "
                                >
                                    Disconnect
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ) : (
                <div className="flex-col md:flex-row flex gap-2 items-center">
                    <Button
                        size="sm"
                        className="text-white text-xs"
                        onClick={() => connect({ connector })}
                    >
                        Connect Wallet
                    </Button>
                    {paperMode && (
                        <>
                            <Button
                                size="sm"
                                variant="neutral"
                                className="text-xs"
                                onClick={handleTryDemo}
                            >
                                Try Demo
                            </Button>
                            <button
                                type="button"
                                onClick={() => setShowPasteDialog(true)}
                                className={`text-2xs text-[#0ABAB5] hover:underline tracking-wide ${chakraPetch.className}`}
                            >
                                Log in with key
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* ─── Create demo account: reveal key once, require ack ─────── */}
            <Dialog
                open={showCreateDialog}
                onOpenChange={(open) => {
                    if (!open) {
                        setShowCreateDialog(false);
                        setPendingDemoKey(null);
                    }
                }}
            >
                <DialogContent className="rounded-none bg-[#112226] border-[#808080] text-[#C9C8C8]">
                    <DialogHeader>
                        <DialogTitle className={`${chakraPetch.className} text-[#C7B7A5] text-left`}>
                            YOUR DEMO ACCOUNT
                        </DialogTitle>
                        <DialogDescription className="text-[#C9C8C8] text-left">
                            This private key is your login. Save it — paste it back in on any
                            browser to log back into this account, or import it into MetaMask
                            to turn it into a normal wallet. Temporal cannot recover it for you.
                        </DialogDescription>
                    </DialogHeader>

                    {pendingDemoKey && (
                        <div className="space-y-3">
                            <div className="text-2xs text-[#8B949E] tracking-widest uppercase">
                                Address
                            </div>
                            <div className="text-[#0ABAB5] font-mono text-xs break-all">
                                {demoAddressFromKey(pendingDemoKey)}
                            </div>
                            <KeyBox privateKey={pendingDemoKey} />

                            <label className="flex items-start gap-2 pt-2 cursor-pointer">
                                <Checkbox
                                    checked={ackSaved}
                                    onCheckedChange={(v) => setAckSaved(v === true)}
                                    className="mt-0.5"
                                />
                                <span className="text-xs text-[#C9C8C8]">
                                    I saved my key. I understand Temporal cannot recover it.
                                </span>
                            </label>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-start gap-4">
                        <Button
                            className="bg-temporal hover:bg-temporal/80 text-white border-0 disabled:opacity-40"
                            disabled={!ackSaved}
                            onClick={confirmCreateDemo}
                        >
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── View / copy an already-saved demo key ──────────────────── */}
            <Dialog open={showViewKeyDialog} onOpenChange={setShowViewKeyDialog}>
                <DialogContent className="rounded-none bg-[#112226] border-[#808080] text-[#C9C8C8]">
                    <DialogHeader>
                        <DialogTitle className={`${chakraPetch.className} text-[#C7B7A5] text-left`}>
                            DEMO ACCOUNT KEY
                        </DialogTitle>
                        <DialogDescription className="text-[#C9C8C8] text-left">
                            Paste this into another browser to log back into this same account.
                        </DialogDescription>
                    </DialogHeader>
                    {demoStore.privateKey && <KeyBox privateKey={demoStore.privateKey} />}
                    <DialogFooter className="sm:justify-start gap-4">
                        <DialogClose asChild>
                            <Button
                                variant="noShadow"
                                className="bg-transparent text-white hover:bg-white/10 border-0"
                            >
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Log in with an existing key ────────────────────────────── */}
            <Dialog
                open={showPasteDialog}
                onOpenChange={(open) => {
                    setShowPasteDialog(open);
                    if (!open) {
                        setPasteValue("");
                        setPasteError(null);
                    }
                }}
            >
                <DialogContent className="rounded-none bg-[#112226] border-[#808080] text-[#C9C8C8]">
                    <DialogHeader>
                        <DialogTitle className={`${chakraPetch.className} text-[#C7B7A5] text-left`}>
                            LOG IN WITH KEY
                        </DialogTitle>
                        <DialogDescription className="text-[#C9C8C8] text-left">
                            Paste the private key from a previous demo account to resume it.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        value={pasteValue}
                        onChange={(e) => {
                            setPasteValue(e.target.value);
                            setPasteError(null);
                        }}
                        placeholder="0x…"
                        className="font-mono text-xs bg-[#0A1416] text-[#0ABAB5] border-[#1e3535]"
                        onKeyDown={(e) => e.key === "Enter" && submitPasteKey()}
                    />
                    {pasteError && <p className="text-xs text-red-400">{pasteError}</p>}
                    <DialogFooter className="sm:justify-start gap-4">
                        <Button
                            className="bg-temporal hover:bg-temporal/80 text-white border-0"
                            onClick={submitPasteKey}
                        >
                            Log In
                        </Button>
                        <DialogClose asChild>
                            <Button
                                variant="noShadow"
                                className="bg-transparent text-white hover:bg-white/10 border-0"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Warn before ending a demo session ──────────────────────── */}
            <AlertDialog open={showDisconnectWarn} onOpenChange={setShowDisconnectWarn}>
                <AlertDialogContent className="rounded-none bg-[#112226] border-[#808080] text-[#C9C8C8]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className={`${chakraPetch.className} text-[#C7B7A5] text-left`}>
                            END DEMO SESSION?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[#C9C8C8] text-left">
                            Your key stays saved in this browser, so demo mode will just reload
                            it next time. If you haven&apos;t copied the key somewhere safe,
                            clearing browser data or switching browsers will lose access to
                            this account for good.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button
                            variant="noShadow"
                            className="bg-[#448D7A] hover:bg-[#3a7a6a] text-white border-0"
                            onClick={() => {
                                setShowDisconnectWarn(false);
                                setShowViewKeyDialog(true);
                            }}
                        >
                            View key first
                        </Button>
                        <AlertDialogCancel className="bg-transparent text-white hover:bg-white/10 border-0">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-temporal hover:bg-temporal/80 text-white border-0"
                            onClick={confirmDisconnectDemo}
                        >
                            End Session
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

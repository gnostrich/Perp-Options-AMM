"use client"

import Link from "next/link"
import Image from 'next/image';
import dynamic from 'next/dynamic';

// import { useNextStep } from "nextstepjs";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
// import { usePathname, useRouter } from "next/navigation";
import { ibmPlexMono } from "@/lib/font";
import { SetMarkPriceDialog } from "./PerpMarkPriceDialog";

import { WagmiProvider } from 'wagmi'
import { useAccount } from '@/lib/hooks/useAccount'
import { WalletConnectButton } from './WalletConnectButton'
import { Button } from "../ui/button";
import { Gift } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import ReferralDialogContent from "./ReferralDialog";

// import { Button } from "../ui/button";
// import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";

const navigationLinks = [
    // {
    //     id: 1,
    //     name: "Markets",
    //     url: "/",
    //     icon: "/icon_markets.svg",
    //     iconSelected: "/icon_markets_selected.svg",
    // },
    {
        id: 2,
        name: "Transact",
        url: "/",
        icon: "/icon_orders.svg",
        iconSelected: "/icon_orders_selected.svg",
    },
    {
        id: 3,
        name: "Portfolio",
        url: "/portfolio",
        icon: "/icon_positions.svg",
        iconSelected: "/icon_positions_selected.svg",
    },
    // {
    //     id: 4,
    //     name: "Feedback",
    //     url: "/feedback",
    //     icon: "/icon_positions.svg",
    //     iconSelected: "/icon_positions_selected.svg",
    // },
];

const tourKeys: { [key: string]: string } = {
    Markets: 'marketTourCompleted',
    Transact: 'transactTourCompleted',
    Portfolio: 'portfolioTourCompleted',
};

export default function NavBar() {
    // const router = useRouter();
    const currentPathname = usePathname();
    const { isConnected } = useAccount();
    // const { startNextStep } = useNextStep();

    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    const [tourCompleted, setTourCompleted] = useState<boolean | null>(null);

    const [activePage, setActivePage] = useState<string>('');

    useEffect(() => {

        if (currentPathname === '/') {
            setActivePage('Transact');
        } else {
            const matchedNav = navigationLinks.find(nav => nav.url === currentPathname);
            if (matchedNav) {
                setActivePage(matchedNav.name);
            } else {
                setActivePage('');
            }
        }
    }, [currentPathname]);



    // const tourNames: { [key: string]: string } = {
    //     Markets: 'marketTour',
    //     Transact: 'transactTour',
    //     Portfolio: 'portfolioTour',
    // };

    useEffect(() => {
        const completed = localStorage.getItem(tourKeys[activePage]);
        setTourCompleted(completed ? JSON.parse(completed) : false);
    }, [activePage]);

    // const handleLogout = async () => {
    //     try {
    //         await fetch('/api/logout', { method: 'GET' });
    //         router.push('/login');
    //     } catch (error) {
    //         console.error('Logout failed:', error);
    //     }
    // };

    // const startTour = () => {
    //     startNextStep(tourNames[activePage]);
    // };

    return (
        <>
            {/* Desktop Navigation */}
            <header className="hidden md:flex h-16 w-full items-center justify-between px-6 pt-4">
                <div className="flex items-center gap-8">
                    <Link href="https://temporal.exchange/" className="flex items-center gap-2">
                        <Image
                            src={"/TemporalLogoSmall.svg"}
                            alt="Temporal Logo"
                            width={80}
                            height={80}
                            priority
                        />
                    </Link>
                    <nav className="flex items-center gap-6">
                        {navigationLinks.map((link) => (
                            <Link
                                key={link.id}
                                href={link.url}
                                className={`${ibmPlexMono.className} uppercase text-white text-base font-medium py-1.5 px-3 hover:bg-[#00222d] hover:shadow-[4px_4px_0px_#00475d] transition-all duration-300
                                        ${link.name === activePage ? 'bg-[#00222d] shadow-[4px_4px_0px_#00475d]' : ''}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex gap-4">
                    {/* <Button
                        className="mr-4 bg-[#448D7A] p-6 text-white flex items-center hover:bg-[#2c715f]"
                        onClick={handleLogout}
                    >
                        <ArrowLeftStartOnRectangleIcon className="h-16 w-16 mr-2" aria-hidden="true" />
                    </Button> */}

                    {/* <SetMarkPriceDialog /> */}

                    {/* <div data-cy="wallet-button" id="tour1-step2-wallet-button" className="z-20  text-main-foreground bg-main border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none">
                        <WalletMultiButtonDynamic style={{ backgroundColor: "transparent", fontWeight: "normal" }} />
                    </div> */}

                    <Button size="sm">
                        <Link
                            href="https://docs.temporal.exchange/"
                            className="flex items-center gap-2 text-white text-xs"
                            target="_blank"
                            rel="noreferrer"
                        >
                            DOCS
                        </Link>
                    </Button>

                    {isConnected && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    aria-label="Referrals"
                                    className="text-white text-xs"
                                >
                                    <Gift className="h-3 w-3 mr-1" />
                                    REFER
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="border-0 p-0 rounded-none bg-transparent">
                                <DialogHeader className="hidden">
                                    <DialogTitle>Referrals</DialogTitle>
                                </DialogHeader>
                                <ReferralDialogContent />
                            </DialogContent>
                        </Dialog>
                    )}

                    <WalletConnectButton />

                </div>


            </header>

            {/* Mobile Navigation (Logo + Wallet + Nav) */}
            <header className="md:hidden flex flex-col w-full px-4 pt-6">
                {/* Top row: logo on left, wallet on right */}
                <div className="flex h-12 w-full items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/TemporalLogoSmall.svg"
                            alt="Temporal Logo"
                            width={60}
                            height={60}
                            priority
                        />
                    </Link>
                    <div className="flex gap-4">
                        {/* <SetMarkPriceDialog /> */}

                        {/* <div
                            data-cy="wallet-button"
                            id="tour1-step2"
                            className="z-20 text-main-foreground bg-main border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
                        >
                            <WalletMultiButtonDynamic
                                style={{ backgroundColor: "transparent", fontWeight: "normal" }}
                            />
                        </div> */}
                        <Button size="sm">
                            <Link
                                href="https://docs.temporal.exchange/"
                                className="flex items-center gap-2 text-white text-xs"
                                target="_blank"
                                rel="noreferrer"
                            >
                                DOCS
                            </Link>
                        </Button>

                        {isConnected && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        aria-label="Referrals"
                                        className="text-white px-3"
                                    >
                                        <Gift className="h-3 w-3" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="border-0 p-0 rounded-none bg-transparent">
                                    <DialogHeader className="hidden">
                                        <DialogTitle>Referrals</DialogTitle>
                                    </DialogHeader>
                                    <ReferralDialogContent />
                                </DialogContent>
                            </Dialog>
                        )}

                        <WalletConnectButton />


                    </div>
                </div>

                {/* Bottom row: nav buttons right below */}
                <div className="flex justify-center gap-8 py-2">
                    <nav className="flex items-center gap-6">
                        {navigationLinks.map((link) => (
                            <Link
                                key={link.id}
                                href={link.url}
                                className={`${ibmPlexMono.className} uppercase text-white text-sm font-medium py-1.5 px-3 hover:bg-[#00222d] hover:shadow-[4px_4px_0px_#00475d] transition-all duration-300
                                        ${link.name === activePage ? 'bg-[#00222d] shadow-[4px_4px_0px_#00475d]' : ''}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>
        </>
    )
}

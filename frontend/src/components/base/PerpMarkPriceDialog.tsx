"use client";

import { useState, useTransition, FormEvent } from "react";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { ibmPlexMono } from "@/lib/font";
import { updateMarkPrice } from "@/lib/data";
import { toast } from "sonner";
import { useGraphStore } from "@/store/graphStore";


const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
};

export function SetMarkPriceDialog() {
    const [price, setPrice] = useState("");
    const [isPending, startTransition] = useTransition();

    const setCurrentMarkPrice = useGraphStore(
        (state) => state.setCurrentMarkPrice,
    );

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            try {
                const priceNum = Number(price);
                if (Number.isNaN(priceNum) || priceNum <= 0) {
                    toast.error("Invalid price value");
                    return;
                }

                const res = await updateMarkPrice(priceNum);
                if (typeof res?.oracle_price === "number") {
                    setCurrentMarkPrice(res.oracle_price);
                    toast.success(res.message ?? "Mark price updated");
                } else {
                    toast.error("Perp mark price not updated");
                }

                setPrice("");
            } catch (err: unknown) {
                const message =
                    err instanceof Error ? err.message : "Failed to set price";
                toast.error(message);
            }
        });
    };

    const disabled =
        isPending || !price.trim() || Number(price) <= 0 || Number.isNaN(Number(price));

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    aria-label="Set mark price"
                    className="z-20 flex items-center justify-center py-2 px-4 text-white bg-main border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
                >
                    <DollarSign className="h-5 w-5" />
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[unset] bg-transparent border-none p-0">
                <DialogHeader className="hidden">
                    <DialogTitle>Feedback</DialogTitle>
                </DialogHeader>
                <Card className="bg-[#1A1A1A] border-2 border-black rounded-none w-full md:w-fit md:min-w-[600px] mx-auto my-6 py-6">
                    <CardHeader>
                        <CardTitle
                            className={`text-coffee text-xl font-normal text-center mx-auto ${ibmPlexMono.className}`}
                        >
                            SET MARK PRICE
                        </CardTitle>
                    </CardHeader>

                    <div className="rounded-md p-4 mx-8 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-6 border border-[#D1D1D1] rounded-sm p-2">
                                <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                                    <div className="overflow-hidden rounded-sm border border-gray-600">
                                        <div className="bg-[#757575] text-[#E4E4E4] text-sm font-mono px-2 py-1 uppercase">
                                            MARK PRICE
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="------"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full bg-black text-gray-100 placeholder-gray-600 font-mono px-2 py-2 focus:outline-none"
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            <div className="flex justify-center gap-4">
                                <Button
                                    type="submit"
                                    disabled={disabled}
                                    className={`bg-[#448D7A] text-white ${disabled ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                >
                                    SUBMIT
                                </Button>
                                <DialogClose asChild>
                                    <Button className="bg-[#575757] border-[#7B7B7B] text-white">
                                        CANCEL
                                    </Button>
                                </DialogClose>
                            </div>
                        </form>
                    </div>
                </Card>
            </DialogContent>
        </Dialog>
    );
}


import React, { ReactNode } from "react";

import NavBar from "@/components/base/NavBar";
import { Toaster } from "@/components/ui/sonner";
import { NextStepProvider, NextStep } from 'nextstepjs';
import steps from "@/lib/steps";
import OnboardingCard from "@/components/base/OnboardingCard";
interface LayoutProps {
    children: ReactNode;
}

const AppLayout = ({ children }: LayoutProps) => {

    return (
        <>
            {/* pb-20 clears the floating feedback button on short/stacked layouts; on lg
                the panes are viewport-bounded, so that much bottom padding would push a
                scrollbar onto a page that otherwise needs none. */}
            <section className="max-w-[95vw] mx-auto pb-20 lg:pb-6 ">
                <NextStepProvider>
                    <NextStep
                        steps={steps}
                        cardComponent={OnboardingCard}
                        shadowRgb="2,2,2"
                        shadowOpacity="0.7"
                        cardTransition={{ duration: 0.5, type: "tween" }}
                    >
                        <NavBar></NavBar>
                        {children}
                    </NextStep>
                </NextStepProvider>
            </section>
            <Toaster position="top-center" />
        </>


    );
}

export default AppLayout;

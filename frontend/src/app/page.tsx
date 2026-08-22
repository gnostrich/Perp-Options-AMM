import AppLayout from "@/layouts/AppLayout";
import React from "react";
import { GraphCardWrapperDropdown } from "@/components/transact/GraphCardWrapperDropdown";
import PlaceOrderCard from "@/components/transact/PlaceOrderCard";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquareWarning } from "lucide-react";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import DisclaimerDialog from "@/components/base/DisclaimerDialog";
import StartTourButton from "@/components/base/StartTourButton";
import { GraphCardWrapperTab } from "@/components/transact/GraphCardWrapperTab";

function TradeView() {
  return (
    <AppLayout>
      {/* Main grid. On lg the trade view is a FIXED viewport pane (nav 5rem + section
          pb 1.5rem + my-3 1.5rem of chrome), never a min-height that content can grow:
          the book is thousands of rows, so an unbounded pane let the table stretch the
          document — scrolling the header and tabs off-screen and stranding the order
          panel mid-page. Bounded here, each column scrolls inside itself instead. */}
      <div className="flex justify-center lg:h-[calc(100lvh-8rem)]">
        <div className="my-3 mx-3 grid gap-3 w-full min-w-0 min-h-0 md:grid-cols-1 lg:grid-cols-[440px_1fr] items-stretch">
          <div className="z-20 order-2 lg:order-1 h-full min-h-0 flex flex-col">
            <PlaceOrderCard />
          </div>
          {/* min-w-0: a grid/flex item's default min-width is its content's max-content
              size, not 0 — without this, a wide child (e.g. the book's ~120-strike
              tables) forces this 1fr track wider instead of scrolling inside its own
              pane, dragging the whole document's scrollWidth past the viewport. */}
          <div className="z-10 order-1 lg:order-2 h-full min-w-0 min-h-0 flex flex-col">
            <GraphCardWrapperTab />
          </div>
        </div>
      </div>

      {/* ───────────────────────── Floating Action Buttons (Feedback + Tour) ───────────────────────── */}
      <div
        className="
          fixed 
          bottom-16 
          right-6 
          sm:right-12 
          z-50 
          flex 
          flex-row 
          gap-x-4
        "
      >
        {/* <StartTourButton /> */}

        <Dialog>
          <DialogTrigger asChild>
            <Button
              aria-label="Give feedback"
              className="bg-[#575757] border border-[#7B7B7B] text-[#F1F1F1] text-xs">
              <MessageSquareWarning className="h-5 w-5 mr-1" />
              FEEDBACK
            </Button>
          </DialogTrigger>

          <DialogContent className="border-0 p-0 rounded-none bg-transparent">
            <DialogHeader className="hidden">
              <DialogTitle>Feedback</DialogTitle>
            </DialogHeader>
            <FeedbackForm />
          </DialogContent>
        </Dialog>
      </div>


      <DisclaimerDialog />

    </AppLayout>
  );
}

export default TradeView;

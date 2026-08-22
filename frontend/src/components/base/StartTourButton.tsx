"use client";

import { useNextStep } from "nextstepjs";
import { Button } from "@/components/ui/button";
import { AppWindowMac } from "lucide-react";

const StartTourButton = () => {
  const { startNextStep} = useNextStep();
  
  const handleStartTour = () => {
    startNextStep("TransactTour");
  };

  return (
    <Button className="bg-[#575757] border border-[#7B7B7B] text-[#F1F1F1]" onClick={handleStartTour}>
      <AppWindowMac className="w-4 h-4 mr-2" />
      APP TOUR
    </Button>
  );
};

export default StartTourButton;
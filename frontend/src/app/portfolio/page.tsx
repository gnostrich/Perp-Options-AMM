import React from "react";
import AppLayout from "@/layouts/AppLayout";
import PositionsClient from "@/components/portfolio/positionsClient";

export default function PortfolioPage() {
  return (
    <AppLayout>
      <PositionsClient />
    </AppLayout>
  );
}
"use client";

import React, { useEffect, useState } from "react";

import TableContainer from "@/components/portfolio/tableContainer";
import PerpTableContainer from "@/components/portfolio/perpTableContainer";
import EarnTableContainer from "@/components/portfolio/earnTableContainer";
import OverviewContent from "@/components/portfolio/OverviewContent";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ibmPlexMono } from "@/lib/font";
import { TriangleAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ToggleSwitch from "../transact/MiniComponents/ToggleSwitch";
import { useGraphStore } from "@/store/graphStore";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useEarnExposureStore } from "@/store/earnExposureStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useAccount } from "@/lib/hooks/useAccount";

export default function PositionsClient() {
  const { address, isConnected, chain } = useAccount();

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isPercentageMode, setIsPercentageMode] = useState<boolean>(true);

  // Portfolio store
  const {
    tableData: bandsData,
    perpData: perpsData,
    loadingBands,
    loadingPerps,
    currentMarkPrice,
    setCurrentMarkPrice,
    connectUserWebSocket,
    disconnectUserWebSocket,
    clearPortfolio,
  } = usePortfolioStore();

  // Earn exposure store (item 24) — accumulated LP exposure feeding the EARN tab table.
  const { positions: lpPositions, byLp, totals: exposureTotals, loading: loadingExposure, fetchExposure, clear: clearExposure } =
    useEarnExposureStore();

  useEffect(() => {
    if (!isConnected || !address) {
      clearExposure();
      return;
    }
    fetchExposure(address);
  }, [isConnected, address, fetchExposure, clearExposure]);

  // Graph store for mark price updates
  const graphMarkPrice = useGraphStore(s => s.currentMarkPrice);
  const connectDataWebSocket = useGraphStore(s => s.connectDataWebSocket);
  const disconnectDataWebSocket = useGraphStore(s => s.disconnectDataWebSocket);
  const connectHyperliquidMidPriceWebSocket = useGraphStore(s => s.connectHyperliquidMidPriceWebSocket);
  const disconnectHyperliquidMidPriceWebSocket = useGraphStore(s => s.disconnectHyperliquidMidPriceWebSocket);

  // Connect graph data WebSocket on mount
  useEffect(() => {
    connectDataWebSocket();
    return () => {
      disconnectDataWebSocket();
    };
  }, [connectDataWebSocket, disconnectDataWebSocket]);

  // Connect Hyperliquid mid price WebSocket for live mark price updates
  useEffect(() => {
    connectHyperliquidMidPriceWebSocket("BTC");
    return () => {
      disconnectHyperliquidMidPriceWebSocket();
    };
  }, [connectHyperliquidMidPriceWebSocket, disconnectHyperliquidMidPriceWebSocket]);

  // Sync mark price from graph store to portfolio store
  useEffect(() => {
    setCurrentMarkPrice(graphMarkPrice);
  }, [graphMarkPrice, setCurrentMarkPrice]);

  // Connect/disconnect user WebSocket based on wallet connection
  useEffect(() => {
    if (!isConnected || !address) {
      // Disconnect and clear data when disconnected
      disconnectUserWebSocket();
      clearPortfolio();
      return;
    }

    // Connect WebSocket for user data
    connectUserWebSocket(address, "BTC");

    // Cleanup on unmount or disconnect
    return () => {
      disconnectUserWebSocket();
    };
  }, [isConnected, address, connectUserWebSocket, disconnectUserWebSocket, clearPortfolio]);

  return (
    <Card className="mt-6 bg-[#0E1B1E] rounded-none w-full flex flex-col h-full min-h-[635px]">
      <CardHeader className="flex justify-between">
        <span
          className={`text-base font-normal text-coffee uppercase ${ibmPlexMono.className}`}
        >
          PORTFOLIO
        </span>

        {activeTab !== "overview" && (
          <div className=" items-center justify-center space-x-4 hidden lg:flex">
            <span className="text-2xs text-white font-normal">BOUND VALUE</span>
            <ToggleSwitch isPercentageMode={isPercentageMode} onToggle={() => setIsPercentageMode(!isPercentageMode)} />
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-grow  flex flex-col">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-grow flex flex-col"
        >
          <div className="flex justify-between mb-4">
            <TabsList className=" w-full bg-[#191919] border border-[#004240] rounded-none gap-4 p-2">
              <TabsTrigger
                value="overview"
                className="py-4 text-white hover:bg-gray-700/50 data-[state=active]:bg-transparent data-[state=active]:text-[#0ABAB5] border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#0ABAB5] rounded-none transition-all duration-200"
              >
                <span className={`text-xs tracking-wider font-medium ${ibmPlexMono.className}`}>
                  OVERVIEW
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="perps"
                className="py-4 text-white hover:bg-gray-700/50 data-[state=active]:bg-transparent data-[state=active]:text-[#0ABAB5] border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#0ABAB5] rounded-none transition-all duration-200"
              >
                <span className={`text-xs tracking-wider font-medium ${ibmPlexMono.className}`}>
                  PERPS
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="bands"
                className="py-4 text-white hover:bg-gray-700/50 data-[state=active]:bg-transparent data-[state=active]:text-[#0ABAB5] border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#0ABAB5] rounded-none transition-all duration-200"
              >
                <span className={`text-xs tracking-wider font-medium ${ibmPlexMono.className}`}>
                  BANDS
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="earn"
                className="py-4 text-white hover:bg-gray-700/50 data-[state=active]:bg-transparent data-[state=active]:text-[#0ABAB5] border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#0ABAB5] rounded-none transition-all duration-200"
              >
                {/* <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center">
                        <TriangleAlert className="h-4 w-4 mr-1 text-red-500 cursor-help" />
                      </span>
                    </TooltipTrigger>

                    <TooltipContent
                      side="right"
                      align="center"
                      className={`max-w-md text-red-400 ${ibmPlexMono.className}`}

                    >
                      <p>
                        Under Active Development
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider> */}

                <span className={`text-xs tracking-wider font-medium ${ibmPlexMono.className}`}>
                  EARN
                </span>
              </TabsTrigger>
            </TabsList>


          </div>

          {/* Tab Contents */}
          <TabsContent value="overview" className="flex-grow">
            <OverviewContent />
          </TabsContent>
          <TabsContent value="perps" className="flex-grow">
            <PerpTableContainer tableData={perpsData} loading={loadingPerps} />
          </TabsContent>
          <TabsContent value="bands" className="flex-grow">
            <TableContainer tableData={bandsData} loading={loadingBands} isPercentageMode={isPercentageMode} />
          </TabsContent>
          <TabsContent value="earn" className="flex-grow">
            <EarnTableContainer
              positions={lpPositions}
              byLp={byLp}
              totals={exposureTotals}
              loading={loadingExposure}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
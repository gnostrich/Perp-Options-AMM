"use client";

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ibmPlexMono } from '@/lib/font';
import CreatePerpComponent from './CreatePerpComponent';

import TradeInsuranceComponent from './TradeInsuranceComponent';
import EarnComponent from './EarnComponent';
import { useTradeStore } from '@/store/tradeStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TriangleAlert } from 'lucide-react';
import { useGraphStore } from '@/store/graphStore';


const TABS = ['create-perp', 'trade-bands', 'earn'];

const App = () => {
  // const [activeTab, setActiveTab] = useState('trade-insurance');
  const {
    activeTab,
    setActiveTab,
  } = useTradeStore();

  // Connect data WebSocket when PlaceOrderCard loads
  const connectDataWebSocket = useGraphStore(s => s.connectDataWebSocket);
  const connectionState = useGraphStore(s => s.connectionState);

  // Deep-link target tab (portfolio "Manage" row → /?tab=earn&lp=…).
  const tabParam = useSearchParams().get('tab');
  useEffect(() => {
    if (tabParam && tabParam !== activeTab && TABS.includes(tabParam)) setActiveTab(tabParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  useEffect(() => {
    // Only connect if not already connecting or connected
    // The connectDataWebSocket function now handles state checking internally
    if (connectionState === "disconnected" || connectionState === "error") {
      connectDataWebSocket();
    }

    // Note: We intentionally don't disconnect on unmount to prevent
    // disconnections during hot reload. The WebSocket will naturally
    // close when the page is closed or navigated away.
    // If you need to disconnect on navigation, handle it at the route level.
  }, [connectDataWebSocket, connectionState]);

  return (
    // items-stretch, not items-center: inside a viewport-bounded pane the card must fill
    // its column and scroll internally. Centering made it float to the middle of whatever
    // height the neighbouring book happened to force.
    <div className="h-full min-h-0 flex items-stretch justify-center font-inter">
      {/* Main Card container */}
      <Card className=" bg-[#0E1B1E] border-2 border-black rounded-none flex flex-col w-full h-full min-h-0 lg:min-w-[440px]">
        <CardHeader className="flex flex-row items-center justify-between shrink-0">
          <CardTitle className={`text-coffee text-base font-normal  ${ibmPlexMono.className}`}>TRANSACT</CardTitle>
        </CardHeader>

        {/* The ticket is taller than the pane on most screens — it owns the scroll. */}
        <CardContent className='p-0 flex-1 min-h-0 overflow-y-auto'>

          {/* Tabs component */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full grow flex flex-col">
            {/* h-auto: the base TabsList is h-9, which clipped these py-4 triggers'
                active underline (owner review, item 4). */}
            <TabsList className="w-full bg-[#191919] border border-[#004240] h-auto px-3 py-1 rounded-none">
              <TabsTrigger
                value="create-perp"
                className="h-auto px-2 py-2.5 text-white hover:bg-gray-700/50 data-[state=active]:bg-[#191919] data-[state=active]:text-[#0ABAB5] border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#0ABAB5] rounded-none transition-all duration-200"
              >
                <span className={`text-xs tracking-wider font-medium ${ibmPlexMono.className}`}>CREATE PERP</span>
              </TabsTrigger>
              <TabsTrigger
                value="trade-bands"
                id='tour1-step2-trade-bands'
                className="h-auto px-2 py-2.5 text-white hover:bg-gray-700/50 data-[state=active]:bg-[#191919] data-[state=active]:text-[#0ABAB5] border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#0ABAB5] rounded-none transition-all duration-200"
              >
                <span className={`text-xs tracking-wider font-medium ${ibmPlexMono.className}`}>TRADE BANDS</span>
              </TabsTrigger>
              <TabsTrigger
                value="earn"
                className="h-auto px-2 py-2.5 text-white hover:bg-gray-700/50 data-[state=active]:bg-[#191919] data-[state=active]:text-[#0ABAB5] border-0 data-[state=active]:border-b-2 data-[state=active]:border-[#0ABAB5] rounded-none transition-all duration-200"
              >
                <span className={`text-xs tracking-wider font-medium ${ibmPlexMono.className}`}>EARN</span>
                {/* <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center">
                        <TriangleAlert className="h-4 w-4 mr-1 text-red-500" />
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
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <TabsContent value="create-perp" className="min-h-[580px] flex flex-col">
              <CreatePerpComponent />
            </TabsContent>
            <TabsContent value="trade-bands" className="min-h-[580px] flex flex-col">
              <TradeInsuranceComponent />
            </TabsContent>
            <TabsContent value="earn" className="min-h-[580px] flex flex-col">
              <EarnComponent />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;

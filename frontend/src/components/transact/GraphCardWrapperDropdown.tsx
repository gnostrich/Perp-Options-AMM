"use client";

import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "../ui/select";
import GraphCard from "./GraphCard";
import { useGraphStore } from "@/store/graphStore";
import GraphCardMarketTV from "./GraphCardMarketTV";
import { CandleResolution } from "@/lib/data";
import { useTradeStore } from "@/store/tradeStore";
import { Card } from "../ui/card";

const graphOptions = [
  { label: "Perp Mark Price", value: "PerpGraph" },
  { label: "Options Pricing", value: "OptionsGraph" },
];

const resolutionOptions = [
  {
    label: "MINUTES",
    options: [
      { label: "5 Minutes", value: "5m" },
      { label: "15 Minutes", value: "15m" },
    ],
  },
  {
    label: "HOURS",
    options: [
      { label: "1 Hour", value: "1h" },
      { label: "4 Hours", value: "4h" },
    ],
  },
  {
    label: "DAYS",
    options: [
      { label: "1 Day", value: "1d" },
      { label: "1 Week", value: "1w" },
      { label: "1 Month", value: "1M" },
    ],
  },
];

export function GraphCardWrapperDropdown() {
  const { selectedGraph, setSelectedGraph, resolution, setResolution } =
    useGraphStore();
  const { activeTab } = useTradeStore();

  // Force selectedGraph to "PerpGraph" when on create-perp or earn tabs
  useEffect(() => {
    if (activeTab === "create-perp" || activeTab === "earn") {
      if (selectedGraph !== "PerpGraph") {
        setSelectedGraph("PerpGraph");
      }
    }
  }, [activeTab, selectedGraph, setSelectedGraph]);

  return (
    <Card className=" bg-[#0E1B1E] border-2 border-black rounded-none p-2 lg:p-4 flex flex-col h-full min-h-0">
      <div className="relative rounded-none p-2 flex flex-col h-full min-h-0 text-white">

        <div className="h-10 mb-2 w-full flex items-center shrink-0">
          {activeTab === "trade-bands" ? (
            <div className="flex gap-2 justify-between w-full">
              {/* Graph Type Selector */}
              <Select value={selectedGraph} onValueChange={setSelectedGraph}>
                <SelectTrigger className="h-8 w-52 justify-between font-light border border-gray-800 bg-gray-600 px-2 text-left text-white placeholder:text-gray-400 focus:ring-0">
                  <SelectValue placeholder="Select a graph" />
                </SelectTrigger>
                <SelectContent className="bg-[#3B3B3B] text-[#C7B7A5] text-sm">
                  {graphOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Resolution Selector (Only for Graph 1) */}
              {selectedGraph === "PerpGraph" && (
                <Select
                  value={resolution}
                  onValueChange={(val) => setResolution(val as CandleResolution)}
                >
                  <SelectTrigger className="w-40 h-8 text-white border border-gray-600 bg-[#1a1a1a]">
                    <SelectValue placeholder="Resolution" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] text-white">
                    {resolutionOptions.map((group) => (
                      <SelectGroup key={group.label}>
                        <SelectLabel className="text-gray-400 text-xs px-2 pt-2">
                          {group.label}
                        </SelectLabel>
                        {group.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : activeTab === "create-perp" ? (
            <div className="flex gap-2 justify-end w-full">
              {/* Resolution Selector for Create Perp tab */}
              <Select
                value={resolution}
                onValueChange={(val) => setResolution(val as CandleResolution)}
              >
                <SelectTrigger className="w-40 h-8 text-white border border-gray-600 bg-[#1a1a1a]">
                  <SelectValue placeholder="Resolution" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] text-white">
                  {resolutionOptions.map((group) => (
                    <SelectGroup key={group.label}>
                      <SelectLabel className="text-gray-400 text-xs px-2 pt-2">
                        {group.label}
                      </SelectLabel>
                      {group.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex px-12">
              <h1>&nbsp;</h1>
            </div>
          )}
        </div>

        {/* Chart Display */}
        <div className="flex-1 min-h-0 h-full">
          <div className="h-full w-full">
            {activeTab === "create-perp" || activeTab === "earn" ? (
              <GraphCardMarketTV />
            ) : selectedGraph === "PerpGraph" ? (
              <GraphCardMarketTV />
            ) : (
              <GraphCard />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Info, Circle } from "lucide-react";
import { ibmPlexMono } from "@/lib/font";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Type definitions
export type BentoBoxType = "simple" | "keyValue" | "subsections" | "capacity";

export interface KeyValueItem {
  titleIcon?: React.ReactNode;
  label: string;
  value: string;
}

export interface ProgressBarConfig {
  current: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
}

export interface Subsection {
  label: string;
  value: string;
  percentage?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  color?: "green" | "red" | "gray";
  isHighlight?: boolean; // New optional prop to force full background
}

export interface CapacityItem {
  label: string;
  current: number;
  max: number;
  color: "green" | "red";
  showDot?: boolean;
  displayMax?: number; // Optional display value for max (used when actual max is 0)
}

// Base props for simple type (backward compatible)
export interface SimpleBentoBoxProps {
  title: string;
  icon?: React.ReactNode;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  align?: "left" | "center";
}

// Extended props with type discrimination
export type BentoBoxProps =
  | (SimpleBentoBoxProps & {
    type?: "simple";
  })
  | {
    type: "keyValue";
    title: string;
    infoIcon?: boolean;
    infoText?: string;
    keyValues: KeyValueItem[];
    progressBar?: ProgressBarConfig;
  }
  | {
    type: "subsections";
    title: string;
    statusIndicator?: boolean;
    infoIcon?: boolean;
    infoText?: string;
    subsections: Subsection[];
  }
  | {
    type: "capacity";
    title: string;
    statusIndicator?: boolean;
    infoIcon?: boolean;
    infoText?: string;
    capacityItems: CapacityItem[];
  };

export type BentoContent = Record<string, BentoBoxProps>;

// Reusable Progress Bar Component
function ProgressBar({ current, max, label, showPercentage = true, displayMax }: ProgressBarConfig & { displayMax?: number }) {
  const remainingPercentage =
    max <= 0 ? 0 : Math.max(0, Math.min(100, 100 - (current / max) * 100));
  const percentageText = showPercentage ? `${Math.round(remainingPercentage)}%` : "";

  // Use displayMax if provided, otherwise use max
  const maxToDisplay = displayMax !== undefined ? displayMax : max;

  return (
    <div className="w-full">
      <div className="w-full bg-[#D7D7D710] rounded-full h-2 mb-1">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${remainingPercentage}%`,
            backgroundColor: '#D7D7D7' // Whiter shade for remaining portion
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          {label && (
            <div className={`text-2xs ${ibmPlexMono.className} ${showPercentage ? "text-[#C9C8C8]" : "text-[#C9C8C8]"
              }`}>
              {label}
            </div>
          )}
          {showPercentage && percentageText && (
            <div className="text-2xs text-[#C9C8C8]">{percentageText}</div>
          )}
        </div>
        <div className="text-2xs text-[#969696]">
          ${maxToDisplay.toLocaleString()} Max
        </div>
      </div>
    </div>
  );
}

// Key-Value Content (RISK & COLLATERAL HEALTH style)
function KeyValueContent({
  keyValues,
  progressBar
}: {
  keyValues: KeyValueItem[];
  progressBar?: ProgressBarConfig;
}) {
  return (
    <div className="flex flex-col gap-4">
      {keyValues.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {item.titleIcon && (
              <div className="flex-shrink-0 flex items-center justify-center">
                {item.titleIcon}
              </div>
            )}
            <div className="text-[#C9C8C8] text-2xs ">{item.label}</div>
          </div>
          <div className={`text-white text-2xs font-bold ${ibmPlexMono.className}`}>
            {item.value}
          </div>
        </div>
      ))}

      {progressBar && (
        <div className="mt-2">
          <ProgressBar {...progressBar} />
        </div>
      )}
    </div>
  );
}

// Subsections Content (PNL SUMMARY style)
function SubsectionsContent({ subsections }: { subsections: Subsection[] }) {
  return (
    <div className="flex flex-col gap-1">
      {subsections.map((section, idx) => {
        const isTotalRow = section.label === "TOTAL PNL" || section.isHighlight;
        const isPositive = section.isPositive ?? true;

        const accentColor = isPositive ? "#00FF9C" : "#FF6767";
        const iconBgColor = isPositive ? "bg-[#00FF9C]/15" : "bg-[#FF6767]/15";

        let rowBackground = "bg-transparent";
        if (isTotalRow) {
          rowBackground = isPositive
            ? "bg-[#112226]" // Existing Dark Green
            : "bg-[#2D0F0F]"; // New Dark Red for negative total
        }

        let rowBorder = isPositive ? "border-[#1E4B59]" : "border-[#401818]";

        const isGray = section.color === "gray";
        const finalTextColor = isGray ? "white" : accentColor;
        const finalIconColor = isGray ? "#808080" : accentColor;
        const finalIconBg = isGray ? "bg-[#1A1A1A]" : iconBgColor;

        return (
          <div
            key={idx}
            className={`flex items-center justify-between mb-2 py-1 rounded-sm transition-colors ${isTotalRow ? "px-1 border" : "px-0"} ${rowBackground}  ${rowBorder}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-6 w-6 flex-shrink-0 flex items-center justify-center rounded-sm ${finalIconBg}`}
              >
                <div style={{ color: finalIconColor }}>
                  {section.icon}
                </div>
              </div>

              <div
                className={`text-2xs tracking-wider ${ibmPlexMono.className} ${isTotalRow ? "text-white" : "text-[#808080]"
                  }`}
              >
                {section.label}
              </div>
            </div>

            <div className="text-right flex gap-2 items-center">
              <div
                className={`text-2xs font-bold ${ibmPlexMono.className}`}
                style={{ color: isGray ? "white" : finalTextColor }}
              >
                {section.value}
              </div>
              {section.percentage && (
                <div
                  className={`text-2xs ${ibmPlexMono.className}`}
                  style={{ color: isGray ? "#808080" : finalTextColor }}
                >
                  {section.percentage}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Capacity Content (PERP CAPACITY style)
function CapacityContent({ capacityItems }: { capacityItems: CapacityItem[] }) {
  return (
    <div className="flex flex-col gap-4">
      {capacityItems.map((item, idx) => {
        const remainingPercentage =
          item.max <= 0 ? 0 : Math.max(0, Math.min(100, 100 - (item.current / item.max) * 100));
        const colorClass = item.color === "green" ? "text-[#00FF9C]" : "text-[#FF6767CC]";
        const dotColor = item.color === "green" ? "bg-[#00FF9C]" : "bg-[#FF6767CC]";

        return (
          <div key={idx} className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {item.showDot && (
                  <div className={`h-2 w-2 rounded-full ${dotColor}`} />
                )}
                <span className={`text-2xs uppercase ${colorClass} ${ibmPlexMono.className}`}>{item.label}</span>
              </div>
              <div className={`text-2xs font-bold ${ibmPlexMono.className} ${colorClass}`}>
                ${item.current.toLocaleString()}
              </div>
            </div>
            <ProgressBar
              current={item.current}
              max={item.max}
              displayMax={item.displayMax}
              label={`${Math.round(remainingPercentage)}% Remaining`}
              showPercentage={false}
            />
          </div>
        );
      })}
    </div>
  );
}

// Simple Content (existing BentoBox style - backward compatible)
function SimpleContent({
  value,
  trend,
  icon
}: {
  value: string;
  trend?: { value: string; isPositive: boolean };
  icon?: React.ReactNode;
}) {
  return (
    <>
      <div className="mb-0 mt-2">
        <div className={`text-white text-2xs font-bold ${ibmPlexMono.className}`}>
          {value}
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-0">
          {trend.isPositive ? (
            <TrendingUp className="h-4 w-4 text-[#0ABAB5]" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span
            className={`text-xs ${trend.isPositive ? "text-[#0ABAB5]" : "text-red-500"
              } ${ibmPlexMono.className}`}
          >
            {trend.value}
          </span>
        </div>
      )}
    </>
  );
}

export default function BentoBox(props: BentoBoxProps) {
  const type = props.type || "simple";

  // Extract common properties safely
  const title = props.title;
  const statusIndicator = "statusIndicator" in props ? props.statusIndicator : undefined;
  const infoIcon = "infoIcon" in props ? props.infoIcon : undefined;
  const infoText = "infoText" in props ? props.infoText : undefined;

  const align = type === "simple" && "align" in props ? props.align : "left";
  const isCentered = align === "center";

  return (
    <Card className="bg-[#0F171A] border-2 border-[#B4C9CF80] shadow-[#B4C9CF80] rounded-sm p-3 flex flex-col h-full">
      {isCentered ? (
        <div className="flex flex-row items-center justify-between h-full w-full">
          <div className="flex flex-col px-2 py-4 justify-center text-left">
            <h3 className={`text-[#C9C8C8] uppercase tracking-widest text-2xs leading-none ${ibmPlexMono.className}`}>
              {title}
              {infoIcon && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="inline-block ml-1.5 h-3.5 w-3.5 -mt-0.5 text-[#09ABA6]" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    align="center"
                    className={`max-w-md ${ibmPlexMono.className}`}
                  >
                    <p>{infoText}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </h3>
            {type === "simple" && (
              <SimpleContent
                value={(props as Extract<BentoBoxProps, { type?: "simple" }>).value}
                trend={(props as Extract<BentoBoxProps, { type?: "simple" }>).trend}
              />
            )}
          </div>
          {type === "simple" && "icon" in props && props.icon && (
            <div className="flex-shrink-0 rounded-md bg-[#222c31] p-2 flex items-center justify-center">
              {props.icon}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between ">
            <div className="flex justify-between w-full">
              <h3 className={`text-white uppercase tracking-wider text-2xs ${ibmPlexMono.className}`}>
                {title}
              </h3>

              {infoIcon && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 -mx-1 -my-1 text-[#09ABA6] bg-[#09ABA6]/15 border border-[#09ABA6]/20 rounded-full p-1" />
                  </TooltipTrigger>

                  <TooltipContent
                    side="right"
                    align="center"
                    className={`max-w-md ${ibmPlexMono.className}`}
                  >
                    <p>
                      {infoText}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {type === "simple" && "icon" in props && props.icon && (
              <div className="flex-shrink-0 rounded-lg bg-[#09332C] p-1.5 flex items-center justify-center">
                {props.icon}
              </div>
            )}
          </div>

          {/* Content based on type */}
          {type === "keyValue" && (
            <KeyValueContent
              keyValues={(props as Extract<BentoBoxProps, { type: "keyValue" }>).keyValues}
              progressBar={(props as Extract<BentoBoxProps, { type: "keyValue" }>).progressBar}
            />
          )}
          {type === "subsections" && (
            <SubsectionsContent subsections={(props as Extract<BentoBoxProps, { type: "subsections" }>).subsections} />
          )}
          {type === "capacity" && (
            <CapacityContent capacityItems={(props as Extract<BentoBoxProps, { type: "capacity" }>).capacityItems} />
          )}
          {type === "simple" && (
            <SimpleContent
              value={(props as Extract<BentoBoxProps, { type?: "simple" }>).value}
              trend={(props as Extract<BentoBoxProps, { type?: "simple" }>).trend}
            />
          )}
        </>
      )}
    </Card>
  );
}


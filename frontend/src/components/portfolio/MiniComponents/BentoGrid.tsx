"use client";

import * as React from "react";
import { BentoContent, BentoBoxProps } from "./BentoBox";
import BentoBox from "./BentoBox";
import { Skeleton } from "@/components/ui/skeleton";

interface BentoGridProps {
  content: BentoContent;
  loading?: boolean;
  className?: string;
}

export default function BentoGrid({
  content,
  loading = false,
  className = "",
}: BentoGridProps) {
  const boxes = Object.values(content);
  const boxCount = boxes.length;

  // Determine grid columns based on number of boxes
  const getGridCols = () => {
    if (boxCount === 1) return "grid-cols-1";
    if (boxCount === 2) return "grid-cols-1 md:grid-cols-2";
    if (boxCount === 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  const renderSkeletonBox = (box: BentoBoxProps, index: number) => {
    const type = box.type ?? "simple";

    return (
      <div
        key={index}
        className="bg-[#0F171A] border-2 border-[#B4C9CF80] shadow-[#B4C9CF80] rounded-sm p-4 flex flex-col h-full"
      >
        {/* Header skeleton – title + optional info icon */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-32 bg-gray-500" />
          {/* <Skeleton className="h-4 w-4 rounded-full bg-gray-500" /> */}
        </div>

        {/* Body skeletons based on box type */}
        {type === "keyValue" && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center my-2 justify-between">
                <Skeleton className="h-3 w-28 bg-gray-500" />
                <Skeleton className="h-4 w-16 bg-gray-500" />
              </div>
            ))}
          </div>
        )}

        {type === "subsections" && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`flex items-center justify-between my-1 py-1 px-1 rounded-sm ${
                  i === 2 ? "bg-[#112226]" : "bg-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded bg-gray-500" />
                  <Skeleton className="h-3 w-20 bg-gray-500" />
                </div>
                <Skeleton className="h-4 w-16 bg-gray-500" />
              </div>
            ))}
          </div>
        )}

        {type === "capacity" && (
          <div className="flex flex-col gap-4 mt-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-2 w-2 rounded-full bg-gray-500" />
                    <Skeleton className="h-3 w-10 bg-gray-500" />
                  </div>
                  <Skeleton className="h-4 w-16 bg-gray-500" />
                </div>
                <Skeleton className="h-2 w-full rounded-full bg-gray-500" />
              </div>
            ))}
          </div>
        )}

        {type === "simple" && (
          <div className="flex flex-col gap-4 mt-2">
            <Skeleton className="h-8 w-24 bg-gray-500" />
            <Skeleton className="h-4 w-16 bg-gray-500" />
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`grid ${getGridCols()} gap-4 mb-4 ${className}`}>
        {boxes.map((box, index) => renderSkeletonBox(box as BentoBoxProps, index))}
      </div>
    );
  }

  return (
    <div className={`grid ${getGridCols()} gap-4 mb-4 ${className}`}>
      {boxes.map((box, index) => (
        <BentoBox key={index} {...box} />
      ))}
    </div>
  );
}


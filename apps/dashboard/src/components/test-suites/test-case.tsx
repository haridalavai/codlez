import { cn } from "@repo/ui/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Icons } from "@repo/ui/components/icons";
import invariant from "tiny-invariant";
import { Reorder } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSocket } from "@/contexts/socket-provider";

export interface TestCaseProps {
  cardId: string;
  name: string;
  description: string;
  action: string;
  status: StepStatus;
  updateTestCaseStatus: (testCaseId: string, status: string) => void;
}

enum StepStatus {
  NOT_RUN = "NOT_RUN",
  PASSED = "PASSED",
  FAILED = "FAILED",
  RUNNING = "RUNNING",
}

const stepStatusMap = {
  NOT_RUN: {
    color: "fill-current text-neutral-400",
    background: "bg-neutral-500 bg-opacity-30",
    animation: "",
    text: "Ready",
    icon: "ready",
  },
  PASSED: {
    color: "fill-current text-green-400",
    background: "bg-green-500 bg-opacity-30",
    text: "Passed",
    icon: "passed",
    animation: "",
  },
  FAILED: {
    color: " text-red-400",
    background: "bg-red-500 bg-opacity-30",
    text: "Failed",
    icon: "failed",
    animation: "animate-pulse",
  },
  RUNNING: {
    color: " text-blue-400",
    background: "bg-blue-500 bg-opacity-30",
    text: "Running",
    icon: "spinner",
    animation: "animate-spin",
  },
};

const TestCase = ({ cardId, status, action, updateTestCaseStatus }: TestCaseProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: cardId });

  console.log(cardId);

  const {socket} =useSocket();

  socket?.on(`test-case-status-${cardId}`, (statusData) => {
    updateTestCaseStatus(cardId, statusData.latest_result);
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = Icons[stepStatusMap[status].icon as keyof typeof Icons];
  return (
    <div
      className={cn([
        "flex flex-row justify-between p-4 border rounded-md bg-background",
        `hover:bg-neutral-500 hover:bg-opacity-30`,
        // stepStatusMap[status].color,
      ])}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {/* drag handle */}
      <div className="flex flex-row items-center gap-4">
        <Icon
          className={cn([
            "w-5 h-5",
            stepStatusMap[status]?.animation,
            stepStatusMap[status]?.color,
          ])}
        />

        <p>{action}</p>
      </div>
      {/* <p>{status}</p>
       */}
      {/* <Badge
        color={stepStatusMap[status].color}
        variant={"outline"}
        className={cn([stepStatusMap[status].background, "text-xs"])}
      >
        {stepStatusMap[status].text}
      </Badge> */}
    </div>
  );
};

export default TestCase;

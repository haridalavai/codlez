import { timeAgo } from "@/utils";
import { Icons } from "@repo/ui/components/icons";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import React from "react";
import DataInfo from "@repo/ui/components/data-info";

const statusMap = {
  NOT_RUN: "Ready",
  PASSED: "Passed",
  FAILED: "Failed",
  RUNNING: "Running",
  PENDING: "Pending",
};

interface TestSuiteDetailsProps extends React.HTMLAttributes<HTMLDivElement> {
  testSuite: Record<string, any>;
}

const TestSuiteDetails = ({ testSuite }: TestSuiteDetailsProps) => {
  return (
    <div className="flex flex-col justify-between items-start gap-4 border shadow-md border-t-0 border-l-0 border-r-0 p-4">
      <div className="flex flex-row">
        <div className="flex flex-col gap-2">
          <div className="text-lg font-bold">{testSuite?.name}</div>
          <div className="text-sm ">{testSuite?.description}</div>
        </div>
      </div>
      <div className="flex flex-row gap-10">
        <div className="flex flex-col ">
          <DataInfo
            title="Created"
            value={`${timeAgo(testSuite?.created_at)} by ${
              testSuite?.created_by_user?.full_name
            }`}
            info={new Date(testSuite?.created_at).toLocaleString()}
          />
        </div>
        <div className="flex flex-col">
          <DataInfo
            title="Status"
            value={statusMap[testSuite?.latest_result]}
            info={testSuite?.latest_run}
          />
        </div>
      </div>
    </div>
  );
};

export default TestSuiteDetails;

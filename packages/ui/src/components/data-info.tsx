import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Icons } from "./icons";

interface DataInfoProps {
  title: string;
  value: string;
  info?: string;
}

const DataInfo = ({ title, value, info }: DataInfoProps) => {
  return (
    <div className="">
      <span className="font-light text-neutral-500">
        <div className="flex flex-row gap-2">
          {title}
          {info && (
            <Tooltip>
              <TooltipTrigger>
                <Icons.info className="w-4 h-4" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">{info}</div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </span>
      <div className="flex flex-row items-center justify-center gap-3">
        <div>{value}</div>
      </div>
    </div>
  );
};

export default DataInfo;

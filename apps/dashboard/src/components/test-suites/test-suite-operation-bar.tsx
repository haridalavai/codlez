import { Icons } from "@repo/ui/components/icons";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import React from "react";

interface OperationBarProps extends React.HTMLAttributes<HTMLDivElement> {
    onStartExecution?: () => void;
}

const OperationBar = (props: OperationBarProps) => {


  return (
    <div className="w-full border border-b-1 border-t-0 border-l-0 border-r-0 ">

    <Card
      className="flex flex-row justify-between rounded-md mx-2 my-2 items-center p-3  w-fit "
      {...props}
      
      >
      <div  className="flex flex-row gap-4 ">
        <Button variant={"ghost"} size={"icon"} className=" p-0 h-6 w-6" onClick={props.onStartExecution}>
            <Icons.play className="h-4 w-4"/>
        </Button>
        <Button variant={"ghost"} size={"icon"} className=" p-0 h-6 w-6">
            <Icons.stop className="h-4 w-4"/>
        </Button>
        <Button variant={"ghost"} size={"icon"} className=" p-0 h-6 w-6">
            <Icons.pause className="h-4 w-4"/>
        </Button>
      </div>
    </Card>
        </div>
  );
};

export default OperationBar;

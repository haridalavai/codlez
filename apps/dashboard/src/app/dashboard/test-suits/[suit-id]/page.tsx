import LiveStreamer from "@/components/live-debugger/live-streamer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@repo/ui/components/ui/resizable";
import React from "react";

const SuitPage = () => {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>Test Suit Area</ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <LiveStreamer />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default SuitPage;

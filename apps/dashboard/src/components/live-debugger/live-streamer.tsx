"use client";
import { useSocket } from "@/contexts/socket-provider";
import { useState, useEffect, useCallback, useRef } from "react";
import socketIO from "socket.io-client";

interface LiveStreamerProps {
  testSuiteId: string;
  organizationId: string;
  debuggerUrl: string;
}

const LiveStreamer = ({ testSuiteId, debuggerUrl }: LiveStreamerProps) => {
  const ref = useRef(null);
  const [image, setImage] = useState("");
  const [fullHeight, setFullHeight] = useState("");
  const [cursor, setCursor] = useState("");

  const { socket } = useSocket();

  const mouseMove = useCallback((event: any) => {
    const position = event.currentTarget.getBoundingClientRect();
    const widthChange = 1255 / position.width;
    const heightChange = 800 / position.height;

    socket?.emit("mouseMove", {
      x: widthChange * (event.pageX - position.left),
      y:
        heightChange *
        (event.pageY - position.top - document.documentElement.scrollTop),
    });
  }, []);

  const mouseClick = useCallback((event: any) => {
    const position = event.currentTarget.getBoundingClientRect();
    const widthChange = 1255 / position.width;
    const heightChange = 800 / position.height;
    socket?.emit("mouseClick", {
      x: widthChange * (event.pageX - position.left),
      y:
        heightChange *
        (event.pageY - position.top - document.documentElement.scrollTop),
    });
  }, []);

  const mouseScroll = useCallback((event: any) => {
    const position = event.currentTarget.scrollTop;
    socket?.emit("scroll", {
      position,
    });
  }, []);

  const keyPress = useCallback((event: any) => {
    console.log(event.key);
    socket?.emit("keyPress", {
      key: event.key,
    });
  }, []);

  useEffect(() => {
    /*
        👇🏻 Listens for the images and full height 
             from the PuppeteerMassScreenshots.
           The image is also converted to a readable file.
        */
    socket?.on(
      `image-${testSuiteId}`,
      ({ img, fullHeight }: { img: string; fullHeight: string }) => {
        setImage("data:image/jpeg;base64," + img);
        setFullHeight(fullHeight);
      }
    );

    socket?.on("cursor", (cur) => {
      setCursor(cur);
    });
  }, [socket, testSuiteId]);

  useEffect(() => {
  }, [debuggerUrl]);

  return (
    <div
      className="p-4 rounded-md flex flex-col h-full"
      onScroll={mouseScroll}
      onKeyDown={keyPress}
    >
      <div
        ref={ref}
        className="popup-ref flex-1"
        // style={{ cursor, height: fullHeight }} //👈🏼 cursor is added
      >
        {image && (
          <img
            className="rounded-md"
            src={image}
            onMouseMove={mouseMove}
            onClick={mouseClick}
            alt=""
          />
        )}
      </div>
      {debuggerUrl.length > 0 && (
        <iframe
          src={debuggerUrl}
          className="w-full flex-1 h-full"
          title="Debugger"
        ></iframe>
      )} 
    </div>
  );
};

export default LiveStreamer;

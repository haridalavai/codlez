"use client";
import React, { useCallback, useEffect, useMemo, useReducer } from "react";
import { io, Socket } from "socket.io-client";
import { produce } from "immer";

type SocketState = {
  state: "stale" | "connected" | "retrying" | "disconnected" | "error";
  reason: string | null;
  reconnectAttempts: number | null;
};

interface SocketContextData {
  socket: Socket | null;
  state: SocketState;
}

type ActionType =
  | {
      type: "RECONNECT_ATTEMPT";
      payload: number;
    }
  | {
      type: "CONNECTED";
    }
  | {
      type: "DISCONNECTED";
      payload: string;
    };

const url = "http://localhost:3002";
const SocketContext = React.createContext<SocketContextData>({
  socket: null,
  state: {
    state: "stale",
    reason: null,
    reconnectAttempts: null,
  },
});

function socketReducer(state: SocketState, action: ActionType) {
  return produce(state, (draft: any) => {
    switch (action.type) {
      case "RECONNECT_ATTEMPT":
        draft.state = "retrying";
        draft.reconnectAttempts = action.payload;
        break;
      case "CONNECTED":
        draft.state = "connected";
        break;
      case "DISCONNECTED":
        draft.state = "disconnected";
        draft.reason = action.payload;
        break;
    }
  });
}

function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = useMemo(() => io(url), [url]);

  const [state, dispatch] = useReducer(socketReducer, {
    state: "stale",
    reason: null,
    reconnectAttempts: null,
  });

  const handleConnect = useCallback(() => {
    dispatch({ type: "CONNECTED" });
  }, []);

  const handleDisconnect = useCallback((reason: string) => {
    dispatch({ type: "DISCONNECTED", payload: reason });
  }, []);

  const handleReconnectAttempt = useCallback((attempt: number) => {
    dispatch({ type: "RECONNECT_ATTEMPT", payload: attempt });
  }, []);

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    // Fired upon a successful connection.
    socket.on("connect", handleConnect);
    // Fired upon a disconnection.
    socket.on("disconnect", handleDisconnect);
    // Fired upon an attempt to reconnect.
    socket.on("reconnect_attempt", handleReconnectAttempt);
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("reconnect_attempt", handleReconnectAttempt);
    };
  }, [socket, handleConnect, handleDisconnect, handleReconnectAttempt]);

  return (
    <SocketContext.Provider value={{ socket: socket, state }}>
      {children}
    </SocketContext.Provider>
  );
}

const useSocket = () => React.useContext(SocketContext);

export { SocketContext, SocketProvider, useSocket };

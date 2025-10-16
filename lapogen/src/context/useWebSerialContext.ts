import { createContext, useContext } from "react";
import type { WebSerialContextType } from "./WebSerialProvider";

export const WebSerialContext = createContext<WebSerialContextType | null>(
  null
);

export function useWebSerialContext() {
  const ctx = useContext(WebSerialContext);
  if (!ctx)
    throw new Error(
      "useWebSerialContext must be used within WebSerialProvider"
    );
  return ctx;
}

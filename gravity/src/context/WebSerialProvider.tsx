import type { ReactNode } from "react";
import { WebSerialContext } from "./useWebSerialContext";
import { useWebSerial } from "../hooks/useWebSerial";
export type WebSerialContextType = ReturnType<typeof useWebSerial>;

export function WebSerialProvider({ children }: { children: ReactNode }) {
    const value = useWebSerial();
    return <WebSerialContext.Provider value={value}>{children}</WebSerialContext.Provider>;
}

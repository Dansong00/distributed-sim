import { createContext } from "react";
import type { DiagramEdge } from "../domain/model";

export type ConnectorPreferences = Required<Pick<DiagramEdge, "stroke" | "path" | "direction">>;
export const defaultConnectorPreferences: ConnectorPreferences = { stroke: "solid", path: "straight", direction: "one-way" };
export const ConnectorPreferencesContext = createContext(defaultConnectorPreferences);
const key = "system-canvas:connector-preferences";
export function readConnectorPreferences(): ConnectorPreferences {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "null");
    return {
      stroke: ["solid", "dashed", "dotted"].includes(value?.stroke) ? value.stroke : "solid",
      path: ["straight", "curved", "elbow"].includes(value?.path) ? value.path : "straight",
      direction: ["one-way", "both"].includes(value?.direction) ? value.direction : "one-way",
    };
  } catch { return { ...defaultConnectorPreferences }; }
}
export function saveConnectorPreferences(value: ConnectorPreferences) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Keep preferences in memory if browser storage is unavailable. */ }
}

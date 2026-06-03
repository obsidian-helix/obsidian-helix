
export type CursorShape = "block" | "bar"

export type HelixEvent =
    | { type: "switch-helix-mode", enabled: boolean }
    | { type: "set-cursor-shape", shape: CursorShape }

import { EditorView } from '@codemirror/view';

export interface HelixSettings {
    enableHelixKeybindings: boolean;
    cursorInInsertMode: "block" | "bar";
}


export const DEFAULT_SETTINGS: HelixSettings = {
    enableHelixKeybindings: false,
    // Following the defualt Obsidian behavior, instead of the Helix one.
    cursorInInsertMode: "bar",
}

export const DEFAULT_EDITOR_VIEW = EditorView.theme({
    ".cm-hx-block-cursor .cm-hx-cursor": {
        background: "var(--text-accent)",
    },
});

export type CursorShape = "block" | "bar"

export type HelixEvent =
    | { type: "switch-helix-mode", enabled: boolean }
    | { type: "set-cursor-shape", shape: CursorShape }

export interface EventLoop {
    on(event: HelixEvent): Promise<void>;
}

export interface DataStorage {
    loadData(): Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    saveData(data: any): Promise<void>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export class HelixSettingsStorage {
    constructor(private store: DataStorage) {
    }

    async loadSettings(): Promise<HelixSettings> {
        return Object.assign({}, DEFAULT_SETTINGS, await this.store.loadData()) as HelixSettings;
    }

    async saveSettings(settings: HelixSettings) {
        await this.store.saveData(settings);
    }
}

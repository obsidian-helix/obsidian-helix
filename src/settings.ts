import { CursorShape } from "./model";
import { DataStorage } from "./obsidian-api";

export interface HelixSettings {
    enableHelixKeybindings: boolean;
    cursorInInsertMode: CursorShape;
}

export const DEFAULT_SETTINGS: HelixSettings = {
    enableHelixKeybindings: false,
    // Following the defualt Obsidian behavior, instead of the Helix one.
    cursorInInsertMode: "bar",
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

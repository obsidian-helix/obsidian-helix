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

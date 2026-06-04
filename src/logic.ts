import { EditorView } from '@codemirror/view';
import { HelixEvent } from './model';

export const DEFAULT_EDITOR_VIEW = EditorView.theme({
    ".cm-hx-block-cursor .cm-hx-cursor": {
        background: "var(--text-accent)",
    },
});

export interface EventLoop {
    on(event: HelixEvent): Promise<void>;
}

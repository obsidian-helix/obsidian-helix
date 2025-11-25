import { describe, it } from "node:test";
import * as assert from "node:assert";
import { DEFAULT_SETTINGS } from "../src/logic";

describe("Default Settings", () => {
    it('Default Cursor is Bar', () => {
        assert.strictEqual(DEFAULT_SETTINGS.cursorInInsertMode, "bar");
    });
});

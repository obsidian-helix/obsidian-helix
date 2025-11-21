import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { helix } from 'codemirror-helix';
import { Extension, Prec } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

interface HelixSettings {
    enableHelixKeybindings: boolean;
    cursorInInsertMode: "block" | "bar";
}

const DEFAULT_SETTINGS: HelixSettings = {
    enableHelixKeybindings: false,
    // Following the defualt Obsidian behavior, instead of the Helix one.
    cursorInInsertMode: "bar",
}

export default class HelixPlugin extends Plugin {
    settings: HelixSettings;
    extensions: Extension[]

    async onload() {
        await this.loadSettings();
        this.extensions = [];
        this.addSettingTab(new HelixSettingsTab(this.app, this));
        this.setEnabled(this.settings.enableHelixKeybindings, false);
        this.registerEditorExtension(this.extensions);

        this.addCommand({
            id: "toggle-helix-keybindings",
            name: "Toggle Helix keybindings",
            callback: async () => this.setEnabled(!this.settings.enableHelixKeybindings, true, true),
        });
    }

    onunload() {

    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async setEnabled(value: boolean, reload: boolean = true, print: boolean = false) {
        this.settings.enableHelixKeybindings = value;
        this.extensions.length = 0;
        if (value) {
            this.extensions.push(Prec.high(EditorView.theme({
                ".cm-hx-block-cursor .cm-hx-cursor": {
                    background: "var(--text-accent)",
                },
            })));
            this.extensions.push(Prec.high(helix({
                config: {
                    "editor.cursor-shape.insert": this.settings.cursorInInsertMode,
                }
            })));
        }
        await this.saveSettings();
        if (reload) this.app.workspace.updateOptions();
        if (print) {
            const msg = value ? "Enabled" : "Disabled";
            new Notice(`${msg} Helix keybindings`);
        }
    }

    async reload() {
        await this.setEnabled(this.settings.enableHelixKeybindings);
    }
}

class HelixSettingsTab extends PluginSettingTab {
    plugin: HelixPlugin;

    constructor(app: App, plugin: HelixPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();
        containerEl.createEl("p", { text: "Vim keybindings must be disabled for the plugin to work" });

        new Setting(containerEl)
            .setName('Enable Helix keybindings')
            .addToggle(async (value) => {
                value
                    .setValue(this.plugin.settings.enableHelixKeybindings)
                    .onChange(async (value) => this.plugin.setEnabled(value))
            });
        new Setting(containerEl)
            .setName('Cursor in insert mode')
            .addDropdown(dropDown => {
                dropDown.addOption('block', 'Block');
                dropDown.addOption('bar', 'Bar');
                dropDown.setValue(this.plugin.settings.cursorInInsertMode)
                dropDown.onChange(async (value) => {
                    if (value == "block" || value == "bar") {
                        this.plugin.settings.cursorInInsertMode = value;
                        await this.plugin.saveSettings();
                        await this.plugin.reload();
                    }
                });
            });
    }
}

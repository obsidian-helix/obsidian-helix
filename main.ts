import { helix } from 'codemirror-helix';
import { Extension, Prec } from '@codemirror/state';
import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { DEFAULT_EDITOR_VIEW, DEFAULT_SETTINGS, HelixSettings } from 'src/logic';

export default class HelixPlugin extends Plugin {
    settings: HelixSettings;
    extensions: Extension[]

    async onload() {
        await this.loadSettings();
        this.extensions = [];
        this.addSettingTab(new HelixSettingsTab(this.app, this));
        await this.setEnabled(this.settings.enableHelixKeybindings, false);
        this.registerEditorExtension(this.extensions);

        this.addCommand({
            id: "toggle-keybindings",
            name: "Toggle helix mode",
            callback: async () => this.setEnabled(!this.settings.enableHelixKeybindings, true, true),
        });
    }

    onunload() {

    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()); // eslint-disable-line
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async setEnabled(value: boolean, reload: boolean = true, print: boolean = false) {
        this.settings.enableHelixKeybindings = value;
        this.extensions.length = 0;
        if (value) {
            this.extensions.push(Prec.high(DEFAULT_EDITOR_VIEW));
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
            .setName('Enable helix mode')
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

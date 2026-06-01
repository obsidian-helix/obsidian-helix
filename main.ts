import { helix } from 'codemirror-helix';
import { Extension, Prec } from '@codemirror/state';
import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { DEFAULT_EDITOR_VIEW, DEFAULT_SETTINGS, EventLoop, HelixEvent, HelixSettings } from 'src/logic';

class EventLoopImpl implements EventLoop {
    constructor(private plugin: HelixPlugin) {}

    on = async (event: HelixEvent) => {
        switch (event.type) {
            case "switch-helix-mode":
                await this.plugin.setEnabled(event.enabled);
                break;
            case "set-cursor-shape":
                this.plugin.settings.cursorInInsertMode = event.shape;
                await this.plugin.saveSettings();
                await this.plugin.reload();
                break;
        }
    }
}

export default class HelixPlugin extends Plugin {

    private _settings: HelixSettings;
    extensions: Extension[];
    private readonly eventLoop = new EventLoopImpl(this);

    async onload() {
        await this.loadSettings();
        this.extensions = [];
        this.addSettingTab(new HelixSettingsTab(this.app, this, this.eventLoop));
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

    public get settings() {
        return this._settings;
    }

    async loadSettings() {
        this._settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as HelixSettings;
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
                },
                drawSelection: false
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

    constructor(app: App, plugin: HelixPlugin, private eventLoop: EventLoop) {
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
                    .onChange(async (value) => await this.eventLoop.on({ type: "switch-helix-mode", enabled: value }))
            });
        new Setting(containerEl)
            .setName('Cursor in insert mode')
            .addDropdown(dropDown => {
                dropDown.addOption('block', 'Block');
                dropDown.addOption('bar', 'Bar');
                dropDown.setValue(this.plugin.settings.cursorInInsertMode)
                dropDown.onChange(async (value) => {
                    if (value == "block" || value == "bar") {
                        await this.eventLoop.on({ type: "set-cursor-shape", shape: value});
                    }
                });
            });
    }
}

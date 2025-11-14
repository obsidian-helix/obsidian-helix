import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { helix } from 'codemirror-helix';
import { Extension, Prec } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { additionalHelixKeymap } from './helix-keymap';

interface HelixSettings {
	enableHelixKeybindings: boolean;
	cursorInInsertMode: "block" | "bar";
	enableAdditionalKeybindings: boolean;
}

const DEFAULT_SETTINGS: HelixSettings = {
	enableHelixKeybindings: false,
	// Following the defualt Obsidian behavior, instead of the Helix one.
	cursorInInsertMode: "bar",
	enableAdditionalKeybindings: true,
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
		try {
			await this.saveData(this.settings);
		} catch (error) {
			console.error('obsidian-helix: Failed to save settings:', error);
		}
	}

	async setEnabled(value: boolean, reload: boolean = true, print: boolean = false) {
		this.settings.enableHelixKeybindings = value;
		// Clear extensions array (will be repopulated below if enabled)
		this.extensions.length = 0;
		if (value) {
			this.extensions.push(Prec.high(EditorView.theme({
				".cm-hx-block-cursor .cm-hx-cursor": {
					background: "var(--text-accent)",
				},
			})));
			// Add additional keybindings BEFORE helix to allow overrides
			if (this.settings.enableAdditionalKeybindings) {
				this.extensions.push(additionalHelixKeymap());
			}
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
			.addToggle((toggle) => {
				toggle
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
					if (value === "block" || value === "bar") {
						this.plugin.settings.cursorInInsertMode = value;
						await this.plugin.saveSettings();
						await this.plugin.reload();
					} else {
						console.warn('obsidian-helix: Invalid cursor mode value:', value);
					}
				});
			});
		new Setting(containerEl)
			.setName('Enable additional keybindings')
			.setDesc('Enable additional Helix keybindings not in codemirror-helix (e, W, B, E, s, S, X, C, G, etc.)')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.enableAdditionalKeybindings)
					.onChange(async (value) => {
						this.plugin.settings.enableAdditionalKeybindings = value;
						await this.plugin.saveSettings();
						await this.plugin.reload();
					});
			});
	}
}

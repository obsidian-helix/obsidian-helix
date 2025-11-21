import { App, Command, Notice, Plugin, PluginSettingTab, Setting, SuggestModal, WorkspaceLeaf } from 'obsidian';
import { commands, externalCommands, helix } from 'codemirror-helix';
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
			this.extensions.push(
				Prec.high(EditorView.theme({
					".cm-hx-block-cursor .cm-hx-cursor": {
						background: "var(--text-accent)",
					},
					".cm-panel .cm-hx-command-help": {
						backgroundColor: "var(--modal-background)"
					},
					".cm-panel .cm-hx-command-popup": {
						backgroundColor: "var(--modal-background)",
						color: "var(--text-normal)",
						padding: "0 0.5rem",
						borderColor: "var(--modal-border-color)",
						borderWidth: "var(--modal-border-width)",
					}
				})),
				Prec.high(helix({
					config: {
						"editor.cursor-shape.insert": this.settings.cursorInInsertMode,
					}
				})),
				externalCommands.of({
					file_picker: () => {
						// @ts-ignore
						(this.app?.commands?.commands?.["switcher:open"] as Command)?.callback?.()
					},
					":buffer-close": () => {
						this.app.workspace.activeLeaf?.detach()
					},
					":buffer-next": () => {
						this.switchTab(1)
					},
					":buffer-previous": () => {
						this.switchTab(-1)
					},
					buffer_picker: () => {
						const modal = new BufferModal(this.app)
						modal.open()
					}
				}),
				commands.of([
					{
						name: "vsplit",
						aliases: ['vs'],
						help: "Open the file in vertical split",
						handler: (_view) => {
							const activeLeaf = this.app.workspace.activeLeaf;
							if (activeLeaf) {
								this.app.workspace.duplicateLeaf(activeLeaf, "split", "vertical")
							}
						}
					},
					{
						name: "vsplit-new",
						aliases: ['vnew'],
						help: "Open a new Note on vertical Split",
						handler: (_view) => {
							const activeLeaf = this.app.workspace.activeLeaf;
							if (activeLeaf) {
								this.app.workspace.duplicateLeaf(activeLeaf, "split", "vertical")
							}
						}
					},
					{
						name: "hsplit",
						aliases: ['hs'],
						help: "Open the file in horizontal split",
						handler: (_view) => {
							const activeLeaf = this.app.workspace.activeLeaf;
							if (activeLeaf) {
								this.app.workspace.duplicateLeaf(activeLeaf, "split", "horizontal")
							}
						}
					},
					{
						name: "hsplit-new",
						aliases: ['hnew'],
						help: "Open a new Note on Horizontal Split",
						handler: (_view) => {
							const activeLeaf = this.app.workspace.activeLeaf;
							if (activeLeaf) {
								this.app.workspace.duplicateLeaf(activeLeaf, "split", "horizontal")
							}
						}
					}
				])
			);
		}
		await this.saveSettings();
		if (reload) this.app.workspace.updateOptions();
		if (print) {
			const msg = value ? "Enabled" : "Disabled";
			new Notice(`${msg} Helix keybindings`);
		}
	}

	switchTab(direction: 1 | -1) {
		const leaves = this.app.workspace.getLeavesOfType("markdown");
		const activeLeaf = this.app.workspace.activeLeaf;
		if (!activeLeaf || leaves.length <= 1) return;

		const currentIndex = leaves.indexOf(activeLeaf);
		let newIndex = (currentIndex + direction + leaves.length) % leaves.length;

		this.app.workspace.setActiveLeaf(leaves[newIndex], { focus: true })
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

type Buffer = {
	title: string
	leaf: WorkspaceLeaf
};

class BufferModal extends SuggestModal<Buffer> {
	constructor(app: App) {
		super(app)
		this.buffers = this.app.workspace.getLeavesOfType('markdown')
							.map(a => ({ title: a.getDisplayText(), leaf: a }))
	}

	buffers: Buffer[] = []

	getSuggestions(query: string): Buffer[] {
		return this.buffers.filter((buf) =>
			buf.title.toLowerCase().includes(query.toLowerCase())
		);
	}

	renderSuggestion(buf: Buffer, el: HTMLElement) {
		el.createEl('div', { text: buf.title });
	}

	onChooseSuggestion(buf: Buffer) {
		this.app.workspace.setActiveLeaf(buf.leaf, { focus: true })
	}

}

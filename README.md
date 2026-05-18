# Obsidian Helix Keybindings

This plugin enables [Helix](https://helix-editor.com/) keybindings in [Obsidian.md](https://obsidian.md/) using the [Helix CodeMirror6 extension by jrvidal](https://gitlab.com/_rvidal/codemirror-helix).
This plugin simply adds the extension to the editor, all credit goes to [jrvidal](https://github.com/jrvidal) for actually implementing the extension.

Keep in mind the CM6 extension is in a very early stage of development.

## Installation

This plugin can be installed and enabled like any other community plugin in the official list of plugins: https://community.obsidian.md/plugins/helix

## Usage

1) Make sure Vim keybindings are disabled in `Options->Editor->Advanced`.
2) Enable Helix keybindings in the plugin settings or toggle them via the command.

### Customize cursor color

By default, the cursor color is the accent color. You can set it to another color by creating a custom CSS snippet for your vault, such as this:

```css
.cm-hx-block-cursor .cm-hx-cursor {
  background: red !important;
}
```

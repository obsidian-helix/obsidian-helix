forked from [Sinono3/obsidian-helix](https://github.com/Sinono3/obsidian-helix)

> [!CAUTION]
> **Just transfered** This is a fork/transfer from [Sinono3/obsidian-helix](https://github.com/Sinono3/obsidian-helix)
and still very early stages.

# Obsidian Helix Keybindings

This plugin enables [Helix](https://helix-editor.com/) keybindings in [Obsidian.md](https://obsidian.md/) using the [Helix CodeMirror6 extension by jrvidal](https://gitlab.com/_rvidal/codemirror-helix).

This plugin adds keybindings missing from `codemirror-helix`. See [KEYBINDINGS.md](KEYBINDINGS.md) for the full list.

**Note:** The CM6 extension is in early development. Expect bugs and incomplete features.

## Installation

Because this plugin isn't oficially in the Obsidian plugin list (yet), you must install it directly from the repo.
Two ways to do this are using BRAT or manually.

### Via BRAT

1. [Install BRAT](https://obsidian.md/plugins?search=brat)
2. Copy the link to this Git repository
3. Follow [these instructions](https://tfthacker.com/brat-quick-guide#Adding+a+beta+plugin)

### Manually

1. Clone the repository into `<your vault directory>/.obsidian/plugins` and then run:
  ```
  $ npm i
  $ npm run build
  ```
2. Go to Settings in Obsidian and enable `Helix Keybindings`.

## Usage

1) Make sure Vim keybindings are disabled in `Options->Editor->Advanced`.
2) Enable Helix keybindings in the plugin settings or toggle them via the command.

## Features

### Additional Keybindings

Additional keybindings that supplement `codemirror-helix`:

- **Word movement**: `e`, `W`, `B`, `E`
- **Selection commands**: `s`, `S`, `Alt-s`, `X`
- **Editing commands**: `C` (copy line), `G` (goto line)
- **Insert mode**: `Ctrl-w`, `Alt-d`, `Ctrl-u`, `Ctrl-k`, `Ctrl-h`, `Ctrl-d`

Toggle in plugin settings. See [KEYBINDINGS.md](KEYBINDINGS.md) for details.

### Limitations

- `s` selects word at cursor only (no regex prompt)
- `S` splits on whitespace only (no regex support)
- `=` does nothing (requires formatter integration)
- `G` goes to last line only (no line number support)
- Insert mode `Alt-d` may conflict with normal mode `Alt-d`
- Insert mode commands (`Ctrl-w`, `Ctrl-u`, `Ctrl-k`, `Ctrl-h`, `Ctrl-d`) only work in insert mode

### Customize cursor color

By default, the cursor color is the accent color. You can set it to another color by creating a custom CSS snippet for your vault, such as this:

```css
.cm-hx-block-cursor .cm-hx-cursor {
  background: red !important;
}
```

# Additional Helix Keybindings

Additional keybindings implemented to supplement `codemirror-helix`. Toggle on/off in plugin settings.

## Overview

The `codemirror-helix` extension implements many Helix keybindings, but some were missing. This plugin adds them.

## Additional Keybindings

### Normal Mode - Word Movement

| Key | Command | Description |
|-----|---------|-------------|
| `e` | move_next_word_end | Move cursor to the end of the next word |
| `W` | move_next_long_word_start | Move to the start of the next WORD (whitespace-delimited) |
| `B` | move_prev_long_word_start | Move to the start of the previous WORD (whitespace-delimited) |
| `E` | move_next_long_word_end | Move to the end of the next WORD (whitespace-delimited) |

**Note:** In Helix, a "word" is delimited by word boundaries (e.g., punctuation, whitespace), while a "WORD" is only delimited by whitespace.

### Normal Mode - Selection

| Key | Command | Description |
|-----|---------|-------------|
| `s` | select_regex | Selects word at cursor (no regex prompt) |
| `S` | split_selection | Splits selection on whitespace only |
| `Alt-s` | split_selection_on_newline | Splits selection at newlines |
| `X` | extend_to_line_bounds | Extends selection to full lines |

### Normal Mode - Editing

| Key | Command | Description |
|-----|---------|-------------|
| `C` | copy_selection_on_next_line | Duplicates current line(s) to next line |
| `=` | format_selections | Does nothing (requires formatter integration) |
| `G` | goto_line | Goes to last line only |

### Insert Mode - Enhanced Editing

| Key | Command | Description |
|-----|---------|-------------|
| `Ctrl-w` | delete_word_backward | Delete the word before the cursor |
| `Alt-d` | delete_word_forward | Delete the word after the cursor |
| `Ctrl-u` | kill_to_line_start | Delete from cursor to start of line |
| `Ctrl-k` | kill_to_line_end | Delete from cursor to end of line |
| `Ctrl-h` | delete_char_backward | Delete character before cursor (same as Backspace) |
| `Ctrl-d` | delete_char_forward | Delete character after cursor (same as Delete) |

## Already Implemented by codemirror-helix

The following keybindings are already provided by the `codemirror-helix` extension:

### Normal Mode - Basic Movement
- `h`, `j`, `k`, `l` - Move left, down, up, right
- `w`, `b` - Move to next/previous word start
- Arrow keys - Directional movement
- `Home`, `End` - Move to line start/end
- `PageUp`, `PageDown` (or `Ctrl-u`, `Ctrl-d`) - Half-page scroll

### Normal Mode - Find/Replace
- `f`, `F` - Find next/previous character
- `t`, `T` - Till next/previous character
- `r` - Replace character
- `R` - Replace with yanked text

### Normal Mode - Selection
- `v` - Toggle visual/select mode
- `%` - Select all
- `x` - Extend line selection
- `;` - Collapse selection to cursor
- `Alt-;` - Flip selection direction
- `Alt-:` - Ensure selections are forward

### Normal Mode - Text Manipulation
- `d` - Delete selection
- `Alt-d` - Delete selection without yanking
- `c` - Change selection (delete and enter insert mode)
- `Alt-c` - Change selection without yanking
- `y` - Yank (copy) selection
- `p` - Paste after
- `P` - Paste before
- `J` - Join lines
- `>`, `<` - Indent/unindent
- `~` - Toggle case
- `` ` `` - Convert to lowercase
- ``Alt-` `` - Convert to uppercase

### Normal Mode - Insert Modes
- `i` - Enter insert mode before cursor
- `I` - Enter insert mode at line start
- `a` - Enter insert mode after cursor
- `A` - Enter insert mode at line end
- `o` - Open new line below and enter insert mode
- `O` - Open new line above and enter insert mode

### Normal Mode - Undo/Redo
- `u` - Undo
- `U` - Redo

### Normal Mode - Search
- `/` - Start forward search
- `n` - Find next match
- `N` - Find previous match
- `*` - Use selection as search pattern

### Goto Mode (press `g` first)
- `g` - Go to file start
- `e` - Go to file end
- `h` - Go to line start
- `l` - Go to line end
- `j`, `k` - Go to next/previous line with scroll
- `n` - Go to next buffer
- `p` - Go to previous buffer

### Space Leader Commands (press `Space` first)
- `y` - Yank to system clipboard
- `p` - Paste from system clipboard after
- `P` - Paste from system clipboard before
- `R` - Replace with system clipboard
- `f` - File picker (if configured)
- `b` - Buffer picker (if configured)
- `/` - Global search (if configured)

### Match Mode (press `m` first)
- `s` - Surround selection with character pair
- `m` - Go to matching bracket

### Bracket Commands
- `[Space` - Insert blank line above
- `]Space` - Insert blank line below

### Other
- `:` - Enter command mode
- `Ctrl-c` - Toggle comment
- `_` - Trim whitespace from selection
- `Alt-o` / `Alt-ArrowUp` - Expand syntax selection
- `Alt-i` / `Alt-ArrowDown` - Shrink syntax selection
- `Alt-n` / `Alt-ArrowRight` - Go to next sibling in syntax tree
- `Alt-p` / `Alt-ArrowLeft` - Go to previous sibling in syntax tree

### Insert Mode
- `Escape` - Return to normal mode
- `Backspace` - Delete character before cursor
- `Delete` - Delete character after cursor
- `Enter` - Insert newline
- Arrow keys - Move cursor

## Implementation Notes

### Limitations

Commands with limited functionality:

1. **`s` (select_regex)**: Selects word at cursor. Does not prompt for regex pattern.
2. **`S` (split_selection)**: Splits on whitespace only. Does not support regex patterns.
3. **`=` (format_selections)**: Does nothing. Requires formatter or LSP integration.
4. **`G` (goto_line)**: Goes to last line only. Does not accept line numbers.

### Keybinding Conflicts

- High precedence keybindings may override other plugins
- `Alt-d` exists in both insert mode (this plugin) and normal mode (codemirror-helix)
- Disable in plugin settings if conflicts occur

### Not Implemented

LSP-related commands (code actions, diagnostics, etc.) are not implemented. These require LSP integration.

## Configuration

Toggle additional keybindings in plugin settings:

1. Settings → Community plugins → Helix Keybindings
2. Toggle "Enable additional keybindings"
3. Editor reloads automatically

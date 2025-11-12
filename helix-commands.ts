import { EditorView } from '@codemirror/view';
import { EditorSelection, SelectionRange, ChangeSpec } from '@codemirror/state';
import {
	deleteToLineStart,
	deleteToLineEnd,
	deleteCharBackward,
	deleteCharForward
} from '@codemirror/commands';

/**
 * Additional Helix commands not provided by codemirror-helix
 * These supplement the core keybindings to match the official Helix editor
 */

/**
 * Check if editor is in insert mode by examining helix's mode field
 * Mode types: 0 = Normal, 1 = Insert, 4 = Select
 */
function isInsertMode(view: EditorView): boolean {
	try {
		// Access helix mode field - it's not exported, so we iterate through fields
		const state = view.state as any;

		// Try to find a field that looks like helix's mode field
		// It should have properties: type (number), minor (number)
		for (const key of Object.keys(state)) {
			const value = state[key];
			if (value && typeof value === 'object' &&
			    typeof value.type === 'number' &&
			    typeof value.minor === 'number' &&
			    value.type >= 0 && value.type <= 4) {
				return value.type === 1; // 1 = Insert mode
			}
		}

		// Fallback: check if selection is a cursor (empty selection = likely insert mode)
		// This is not perfect but better than assuming true
		return view.state.selection.main.empty;
	} catch {
		// If we can't determine mode, assume insert mode to not break functionality
		return true;
	}
}

// ============================================================================
// WORD MOVEMENT COMMANDS
// ============================================================================

/**
 * Move to the end of the next word (e)
 */
export function moveNextWordEnd(view: EditorView): boolean {
	const { state } = view;
	const selection = state.selection;

	view.dispatch({
		selection: EditorSelection.create(
			selection.ranges.map(range => {
				let pos = range.head;
				const line = state.doc.lineAt(pos);
				const text = state.doc.sliceString(pos, line.to);

				let i = 0;
				// Skip whitespace if we're on it
				while (i < text.length && /\s/.test(text[i])) i++;
				// Move to end of current/next word
				while (i < text.length && /\S/.test(text[i])) i++;

				// If we didn't move, we must be at the end of the line
				if (i === 0 && line.number < state.doc.lines) {
					const nextLine = state.doc.line(line.number + 1);
					return EditorSelection.cursor(nextLine.from);
				}

				return EditorSelection.cursor(Math.min(pos + i, state.doc.length));
			}),
			selection.mainIndex
		),
		scrollIntoView: true
	});

	return true;
}

/**
 * Move to next WORD start (W) - whitespace-delimited
 */
export function moveNextLongWordStart(view: EditorView): boolean {
	const { state } = view;
	const selection = state.selection;

	view.dispatch({
		selection: EditorSelection.create(
			selection.ranges.map(range => {
				let pos = range.head;
				const line = state.doc.lineAt(pos);
				const text = state.doc.sliceString(pos, line.to);

				// Skip non-whitespace
				let i = 0;
				while (i < text.length && !/\s/.test(text[i])) i++;
				// Skip whitespace
				while (i < text.length && /\s/.test(text[i])) i++;

				if (i === 0 && pos < line.to) i = 1;
				else if (pos + i >= line.to && line.number < state.doc.lines) {
					const nextLine = state.doc.line(line.number + 1);
					return EditorSelection.cursor(nextLine.from);
				}

				return EditorSelection.cursor(Math.min(pos + i, state.doc.length));
			}),
			selection.mainIndex
		),
		scrollIntoView: true
	});

	return true;
}

/**
 * Move to previous WORD start (B) - whitespace-delimited
 */
export function movePrevLongWordStart(view: EditorView): boolean {
	const { state } = view;
	const selection = state.selection;

	view.dispatch({
		selection: EditorSelection.create(
			selection.ranges.map(range => {
				let pos = range.head;
				if (pos === 0) return EditorSelection.cursor(0);

				const line = state.doc.lineAt(pos);
				const text = state.doc.sliceString(line.from, pos);

				// Move back one char
				let i = text.length - 1;
				// Skip whitespace
				while (i > 0 && /\s/.test(text[i])) i--;
				// Skip non-whitespace
				while (i > 0 && !/\s/.test(text[i])) i--;
				// Move forward to start of word if we're in whitespace
				if (i > 0 && /\s/.test(text[i])) i++;

				if (i === text.length - 1 && line.number > 1) {
					const prevLine = state.doc.line(line.number - 1);
					return EditorSelection.cursor(prevLine.from);
				}

				return EditorSelection.cursor(line.from + i);
			}),
			selection.mainIndex
		),
		scrollIntoView: true
	});

	return true;
}

/**
 * Move to next WORD end (E) - whitespace-delimited
 */
export function moveNextLongWordEnd(view: EditorView): boolean {
	const { state } = view;
	const selection = state.selection;

	view.dispatch({
		selection: EditorSelection.create(
			selection.ranges.map(range => {
				let pos = range.head;
				const line = state.doc.lineAt(pos);
				const text = state.doc.sliceString(pos, line.to);

				let i = 0;
				// Skip whitespace if we're on it
				while (i < text.length && /\s/.test(text[i])) i++;
				// Move to end of current/next WORD
				while (i < text.length && !/\s/.test(text[i])) i++;

				// If we didn't move, we must be at the end of the line
				if (i === 0 && line.number < state.doc.lines) {
					const nextLine = state.doc.line(line.number + 1);
					return EditorSelection.cursor(nextLine.from);
				}

				return EditorSelection.cursor(Math.min(pos + i, state.doc.length));
			}),
			selection.mainIndex
		),
		scrollIntoView: true
	});

	return true;
}

// ============================================================================
// SELECTION COMMANDS
// ============================================================================

/**
 * Split selection on newlines (Alt-s)
 */
export function splitSelectionOnNewline(view: EditorView): boolean {
	const { state } = view;
	const ranges: SelectionRange[] = [];

	for (const range of state.selection.ranges) {
		const text = state.sliceDoc(range.from, range.to);
		const lines = text.split('\n');
		let pos = range.from;

		for (let i = 0; i < lines.length; i++) {
			const lineLen = lines[i].length;
			if (lineLen > 0 || i < lines.length - 1) {
				ranges.push(EditorSelection.range(pos, pos + lineLen));
			}
			pos += lineLen + 1; // +1 for newline
		}
	}

	if (ranges.length > 0) {
		view.dispatch({
			selection: EditorSelection.create(ranges, 0),
			scrollIntoView: true
		});
		return true;
	}

	return false;
}

/**
 * Split selection (S)
 * Splits selection on whitespace. Does not support regex patterns.
 */
export function splitSelection(view: EditorView): boolean {
	const { state } = view;
	const ranges: SelectionRange[] = [];

	for (const range of state.selection.ranges) {
		const text = state.sliceDoc(range.from, range.to);
		const parts = text.split(/\s+/);
		let searchFrom = 0;

		for (const part of parts) {
			if (part.length > 0) {
				const idx = text.indexOf(part, searchFrom);
				if (idx !== -1) {
					const actualPos = range.from + idx;
					ranges.push(EditorSelection.range(actualPos, actualPos + part.length));
					searchFrom = idx + part.length;
				}
			}
		}
	}

	if (ranges.length > 0) {
		view.dispatch({
			selection: EditorSelection.create(ranges, 0),
			scrollIntoView: true
		});
		return true;
	}

	return false;
}

/**
 * Extend to line bounds (X)
 */
export function extendToLineBounds(view: EditorView): boolean {
	const { state } = view;

	view.dispatch({
		selection: EditorSelection.create(
			state.selection.ranges.map(range => {
				const startLine = state.doc.lineAt(range.from);
				const endLine = state.doc.lineAt(range.to);
				return EditorSelection.range(startLine.from, endLine.to);
			}),
			state.selection.mainIndex
		),
		scrollIntoView: true
	});

	return true;
}

/**
 * Copy selection on next line (C)
 */
export function copySelectionOnNextLine(view: EditorView): boolean {
	const { state } = view;
	const changes: ChangeSpec[] = [];
	const newRanges: SelectionRange[] = [];
	let offset = 0;

	for (const range of state.selection.ranges) {
		const startLine = state.doc.lineAt(range.from);
		const endLine = state.doc.lineAt(range.to);
		const text = state.sliceDoc(startLine.from, endLine.to);

		changes.push({
			from: endLine.to,
			insert: state.lineBreak + text
		});

		// Calculate new cursor position after this insertion
		const newStart = endLine.to + offset + state.lineBreak.length;
		newRanges.push(EditorSelection.range(newStart, newStart + text.length));
		offset += state.lineBreak.length + text.length;
	}

	if (changes.length > 0) {
		view.dispatch({
			changes,
			selection: EditorSelection.create(newRanges, newRanges.length - 1),
			scrollIntoView: true
		});
		return true;
	}

	return false;
}

/**
 * Select regex (s)
 * Selects word at cursor. Does not prompt for regex pattern.
 */
export function selectRegex(view: EditorView): boolean {
	const { state } = view;
	const range = state.selection.main;
	const word = state.wordAt(range.head);

	if (word) {
		view.dispatch({
			selection: EditorSelection.range(word.from, word.to),
			scrollIntoView: true
		});
		return true;
	}

	return false;
}

// ============================================================================
// GOTO COMMANDS
// ============================================================================

/**
 * Go to line (G)
 * Goes to last line, or specified line if lineNum provided.
 */
export function gotoLine(view: EditorView, lineNum?: number): boolean {
	const { state } = view;
	const targetLine = lineNum ?? state.doc.lines;

	if (targetLine >= 1 && targetLine <= state.doc.lines) {
		const line = state.doc.line(targetLine);
		view.dispatch({
			selection: EditorSelection.cursor(line.from),
			scrollIntoView: true
		});
		return true;
	}

	return false;
}

// ============================================================================
// INSERT MODE COMMANDS
// ============================================================================

/**
 * Delete word backward in insert mode (Ctrl-w)
 */
export function deleteWordBackward(view: EditorView): boolean {
	const { state } = view;
	const changes: ChangeSpec[] = [];

	for (const range of state.selection.ranges) {
		const line = state.doc.lineAt(range.from);
		const lineText = state.doc.sliceString(line.from, range.from);

		// Find start of previous word
		let i = lineText.length - 1;
		while (i >= 0 && /\s/.test(lineText[i])) i--;
		while (i >= 0 && /\S/.test(lineText[i])) i--;

		const deleteFrom = line.from + i + 1;
		if (deleteFrom < range.from) {
			changes.push({ from: deleteFrom, to: range.from });
		}
	}

	if (changes.length > 0) {
		view.dispatch({ changes });
		return true;
	}

	return false;
}

/**
 * Delete word forward in insert mode (Alt-d)
 */
export function deleteWordForward(view: EditorView): boolean {
	const { state } = view;
	const changes: ChangeSpec[] = [];

	for (const range of state.selection.ranges) {
		const line = state.doc.lineAt(range.from);
		const lineText = state.doc.sliceString(range.from, line.to);

		// Find end of next word
		let i = 0;
		while (i < lineText.length && /\s/.test(lineText[i])) i++;
		while (i < lineText.length && /\S/.test(lineText[i])) i++;

		const deleteTo = range.from + i;
		if (deleteTo > range.from) {
			changes.push({ from: range.from, to: deleteTo });
		}
	}

	if (changes.length > 0) {
		view.dispatch({ changes });
		return true;
	}

	return false;
}

/**
 * Kill to line start (Ctrl-u)
 * Only runs in insert mode to avoid conflicting with helix page-up
 */
export function killToLineStart(view: EditorView): boolean {
	if (!isInsertMode(view)) return false;
	return deleteToLineStart(view);
}

/**
 * Kill to line end (Ctrl-k)
 * Only runs in insert mode
 */
export function killToLineEnd(view: EditorView): boolean {
	if (!isInsertMode(view)) return false;
	return deleteToLineEnd(view);
}

/**
 * Delete char backward (Ctrl-h)
 * Only runs in insert mode
 */
export function deleteCharBackwardCommand(view: EditorView): boolean {
	if (!isInsertMode(view)) return false;
	return deleteCharBackward(view);
}

/**
 * Delete char forward (Ctrl-d)
 * Only runs in insert mode to avoid conflicting with helix page-down
 */
export function deleteCharForwardCommand(view: EditorView): boolean {
	if (!isInsertMode(view)) return false;
	return deleteCharForward(view);
}

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format selections (=)
 * Does nothing. Requires formatter or LSP integration.
 */
export function formatSelections(view: EditorView): boolean {
	return true;
}

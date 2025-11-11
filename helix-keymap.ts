import { keymap } from '@codemirror/view';
import { Extension, Prec } from '@codemirror/state';
import {
	moveNextWordEnd,
	moveNextLongWordStart,
	movePrevLongWordStart,
	moveNextLongWordEnd,
	splitSelectionOnNewline,
	splitSelection,
	extendToLineBounds,
	copySelectionOnNextLine,
	selectRegex,
	gotoLine,
	deleteWordBackward,
	deleteWordForward,
	killToLineStart,
	killToLineEnd,
	deleteCharBackwardCommand,
	deleteCharForwardCommand,
	formatSelections
} from './helix-commands';

/**
 * Additional Helix keybindings to supplement codemirror-helix.
 * Implements commands missing from the core extension.
 */
export function additionalHelixKeymap(): Extension {
	return Prec.high(keymap.of([
		// ====================================================================
		// NORMAL MODE - WORD MOVEMENT
		// ====================================================================

		// e - move to end of next word
		{
			key: 'e',
			run: moveNextWordEnd,
			shift: moveNextWordEnd
		},

		// W - move to next WORD (whitespace-delimited)
		{
			key: 'Shift-w',
			run: moveNextLongWordStart
		},

		// B - move to previous WORD (whitespace-delimited)
		{
			key: 'Shift-b',
			run: movePrevLongWordStart
		},

		// E - move to end of next WORD (whitespace-delimited)
		{
			key: 'Shift-e',
			run: moveNextLongWordEnd
		},

		// ====================================================================
		// NORMAL MODE - SELECTION
		// ====================================================================

		// Alt-s - split selection on newlines
		{
			key: 'Alt-s',
			run: splitSelectionOnNewline
		},

		// S - split selection (on whitespace as basic implementation)
		{
			key: 'Shift-s',
			run: splitSelection
		},

		// X - extend to line bounds
		{
			key: 'Shift-x',
			run: extendToLineBounds
		},

		// s - select regex (basic word selection for now)
		{
			key: 's',
			run: selectRegex
		},

		// ====================================================================
		// NORMAL MODE - EDITING
		// ====================================================================

		// C - copy selection on next line
		{
			key: 'Shift-c',
			run: copySelectionOnNextLine
		},

		// = - format selections (placeholder)
		{
			key: '=',
			run: formatSelections
		},

		// ====================================================================
		// GOTO MODE
		// ====================================================================

		// G - go to last line (or line number with count)
		{
			key: 'Shift-g',
			run: (view) => gotoLine(view)
		},

		// ====================================================================
		// INSERT MODE - ENHANCED EDITING
		// ====================================================================

		// Ctrl-w - delete word backward
		{
			key: 'Ctrl-w',
			run: deleteWordBackward
		},

		// Alt-d - delete word forward
		{
			key: 'Alt-d',
			run: deleteWordForward
		},

		// Ctrl-u - kill to line start
		{
			key: 'Ctrl-u',
			run: killToLineStart
		},

		// Ctrl-k - kill to line end
		{
			key: 'Ctrl-k',
			run: killToLineEnd
		},

		// Ctrl-h - delete char backward (same as backspace)
		{
			key: 'Ctrl-h',
			run: deleteCharBackwardCommand
		},

		// Ctrl-d - delete char forward (same as delete)
		{
			key: 'Ctrl-d',
			run: deleteCharForwardCommand
		}
	]));
}

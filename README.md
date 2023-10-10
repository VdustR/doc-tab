# Doc Tab

Edit the doc comments in a new tab.

"Doc Tab" is a Visual Studio Code extension that allows you to edit the doc comments in a new tab.

## The problem

Editors like VSCode support markdown preview for JSDoc / TSDoc. But it's pretty hard to edit or format, indent it in the comment block. This extension provides a new tab to edit the doc comments.

## Usage

1. Choose or position the cursor within the documentation comment block.
2. Access the command palette:
   - `Ctrl+Shift+P` on Windows/Linux
   - `Cmd+Shift+P` on macOS
3. Enter `Doc Tab: Edit Comment In New Tab` and hit `Enter`.
4. Modify the documentation comment in the new tab.
5. Close the tab without saving to discard any alterations.
6. The changes will be applied to the documentation comment block. 🎉🎉

## Recommended Workflow

1. Format the code (using eslint, prettier, etc.).
2. Edit the documentation comments in a new tab. It's advisable to [preview](https://code.visualstudio.com/docs/languages/markdown#_markdown-preview) while editing.
3. Format the code in the new tab.
4. Close the tab without saving.
5. Format the code once again.
6. Reformat the documentation comments (using [Rewrap](https://marketplace.visualstudio.com/items?itemName=stkb.rewrap)).

## Recommended Extensions for Combined Use

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [eslint-stylistic](https://github.com/eslint-stylistic/eslint-stylistic)
- [Rewrap](https://marketplace.visualstudio.com/items?itemName=stkb.rewrap)

## License

[VdustR](https://github.com/VdustR) © [MIT](https://github.com/VdustR/doc-tab/LICENSE)

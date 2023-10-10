import * as vscode from "vscode";
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "doc-tab.edit-comment-in-new-tab",
    async () => {
      const disposableArray: vscode.Disposable[] = [];
      if (!vscode.window.activeTextEditor) {
        return;
      }
      const editor = vscode.window.activeTextEditor;
      const selection = editor.selection;
      // Find all comments position in the current file
      const comments = editor.document.getText().match(/\/\*\*[\s\S]*?\*\//g);
      if (!comments) {
        vscode.window.showInformationMessage(
          "No comments found in the current file."
        );
        return;
      }
      const commentRanges = comments.flatMap((comment) => {
        let currentCursor = 0;
        let result: vscode.Range[] = [];
        while (1) {
          const index = editor.document
            .getText()
            .indexOf(comment, currentCursor);
          if (index === -1) {
            break;
          }
          currentCursor = index + comment.length;
          const commentStart = editor.document.positionAt(index);
          const commentEnd = editor.document.positionAt(index + comment.length);
          result.push(new vscode.Range(commentStart, commentEnd));
        }
        return result;
      });
      // Find the nearest comment in the current active line or in the current selection.
      let commentRange = commentRanges.find((range) => {
        return (
          range.contains(selection) ||
          selection.contains(range) ||
          (selection.start.line >= range.start.line &&
            selection.start.line <= range.end.line) ||
          (selection.end.line >= range.start.line &&
            selection.end.line <= range.end.line)
        );
      });

      if (!commentRange) {
        vscode.window.showInformationMessage(
          "No comments found at the cursor position."
        );
        return;
      }
      const startWithComments = editor.document
        .lineAt(commentRange.start.line)
        .text.startsWith("/**");
      const eol = editor.document.eol === vscode.EndOfLine.LF ? "\n" : "\r\n";
      const indent: string = (() => {
        if (!startWithComments) {
          return " ".repeat(commentRange.start.character);
        }
        const thisLine = editor.document.lineAt(commentRange.start.line);
        return thisLine.text.match(/^\[ \t]*/)?.[0] || "";
      })();
      let commentText = editor.document.getText(commentRange);
      if (startWithComments) {
        commentRange = new vscode.Range(
          commentRange.start.line,
          0,
          commentRange.end.line,
          editor.document.lineAt(commentRange.end.line).text.length
        );
        commentText = editor.document.getText(commentRange);
      }

      const commentContent = commentText
        .replace(/^\s*\/\*\*|\*\/\s*$/g, "")
        .replace(/( |\t)*\* ?/gm, "")
        .trim();

      const doc = await vscode.workspace.openTextDocument({
        content: commentContent,
        language: "markdown",
      });
      vscode.window.showTextDocument(doc, {
        preview: false,
        viewColumn: vscode.ViewColumn.Beside,
      });
      const originalCharCount = editor.document.getText().length;
      // On change and sync back to the original file
      const disposableFinish = vscode.workspace.onDidCloseTextDocument(
        (mdDoc) => {
          if (mdDoc !== doc) {
            if (mdDoc === editor.document) {
              // remove document
            }
            return;
          }
          if (!commentRange) {
            throw new Error("No commentRange");
          }
          const mdEol = mdDoc.eol === vscode.EndOfLine.LF ? "\n" : "\r\n";
          const edit = new vscode.WorkspaceEdit();
          const newComment =
            `${!startWithComments ? "" : indent}/**${eol}` +
            mdDoc
              .getText()
              .trim()
              .split(mdEol)
              .map((line) => `${indent} * ${line}`)
              .join(eol) +
            `${eol}${indent} */`;
          edit.replace(editor.document.uri, commentRange, newComment);
          vscode.workspace.applyEdit(edit).then(() => {
            if (!commentRange) {
              return;
            }
            const newCharCount = editor.document.getText().length;
            const diff = newCharCount - originalCharCount;
            const startOffset = editor.document.offsetAt(commentRange.start);
            const endOffset = editor.document.offsetAt(commentRange.end);
            const newSelection = new vscode.Selection(
              editor.document.positionAt(startOffset),
              editor.document.positionAt(endOffset + diff)
            );
            editor.selection = newSelection;
          });
          deactivate();
        }
      );
      disposableArray.push(disposableFinish);
      const disposableChange = vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document !== editor.document) {
          return;
        }
        deactivate();
        const edit = new vscode.WorkspaceEdit();
        edit.replace(
          doc.uri,
          new vscode.Range(
            doc.positionAt(0),
            doc.positionAt(doc.getText().length)
          ),
          "This document is disposed due to the change of the original file. Please reopen it."
        );
        vscode.workspace.applyEdit(edit);
      });
      disposableArray.push(disposableChange);
      function deactivate() {
        disposableArray.forEach((disposable) => {
          disposable.dispose();
        });
      }
      disposableArray.forEach((disposable) => {
        context.subscriptions.push(disposable);
      });
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

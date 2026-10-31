describe("Conservative lua indentation", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-lua");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.lua"));
    editor.update({ tabLength: 4, softTabs: true });
    await editor.whenGrammarSettled();
  });

  afterEach(() => editor?.destroy());

  for (const [name, source, row, columns] of [
    ["an if header", "if ready then\nend", 0, 4],
    ["a body", "if ready then\n    work()\nend", 1, 4],
    ["a closed block", "if ready then work() end", 0, 0],
    ["an else header", "if ready then\n    work()\nelse\nend", 2, 4],
    ["a comment", "-- if ready then {", 0, 0],
  ]) {
    it(`keeps the intended level after ${name}`, async () => {
      editor.setText(source);
      await editor.whenGrammarSettled();
      editor.setCursorBufferPosition([row, Infinity]);
      editor.insertText("\n", { autoIndent: true, autoIndentNewline: true });
      await editor.whenGrammarSettled();
      expect(editor.lineTextForBufferRow(row + 1)).toBe(" ".repeat(columns));
      expect(editor.getCursorBufferPosition().column).toBe(columns);
    });
  }

  it("preserves multiline literal contents during explicit reindent", async () => {
    const source = "local text = [[first\n\tkeep this tab\n  keep these spaces\n]]\n";
    editor.setText(source);
    await editor.whenGrammarSettled();
    editor.getBuffer().clearUndoStack();
    editor.autoIndentBufferRows(0, editor.getLastBufferRow() - 1);
    await editor.whenGrammarSettled();
    expect(editor.getText()).toBe(source);
    editor.autoIndentBufferRows(0, editor.getLastBufferRow() - 1);
    expect(editor.getText()).toBe(source);
  });
});

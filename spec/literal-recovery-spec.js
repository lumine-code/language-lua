describe("Literal recovery in lua", () => {
  let editor;
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-lua");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.lua"));
    editor.update({ tabLength: 4, softTabs: true });
    await editor.whenGrammarSettled();
  });
  afterEach(() => editor?.destroy());

  async function enterAfter(source, columns) {
    editor.setText(source);
    await editor.whenGrammarSettled();
    const row = editor.getLastBufferRow();
    editor.setCursorBufferPosition([row, Infinity]);
    editor.insertText("\n", { autoIndent: true, autoIndentNewline: true });
    await editor.whenGrammarSettled();
    expect(editor.lineTextForBufferRow(row + 1))
      .withContext(source)
      .toBe(" ".repeat(columns));
    expect(editor.getCursorBufferPosition().column).withContext(source).toBe(columns);
  }

  for (const [source, columns] of [
    ["local value = [[{", 0],
    ["local value = [=[{", 0],
    ["local value = [==[{", 0],
    ["local value = [[text\n{", 0],
    ["if ready then\n    local value = [[{", 4],
  ]) {
    it("keeps the literal margin for " + JSON.stringify(source), async () => {
      await enterAfter(source, columns);
    });
  }

  for (const source of [
    "local values = {",
    "local value = [[ok]]; local values = {",
    "if ready then",
  ]) {
    it("still indents a real container in " + JSON.stringify(source), async () => {
      await enterAfter(source, 4);
    });
  }
});

const fs = require("fs");
const path = require("path");

const packagePath = (name) => {
  const sibling = path.resolve(__dirname, "..", "..", name);
  return fs.existsSync(sibling) ? sibling : name;
};

describe("language-lua static annotation bodies", () => {
  let editor;

  beforeEach(async () => {
    for (const name of ["language-lua", "language-hyperlink", "language-todo"]) {
      await lumine.packages.activatePackage(packagePath(name));
    }
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.lua"));
  });

  afterEach(() => editor?.destroy());

  it("highlights annotations in comment bodies that have syntax children", async () => {
    const text =
      "-- TODO https://example.com/line\n--[[ FIXME https://example.com/block ]]\nlocal value = 1\n";
    editor.setText(text);
    await editor.languageMode.ready;
    await editor.languageMode.atGrammarSettlement();
    for (const token of ["TODO", "FIXME"]) {
      const position = editor.getBuffer().positionForCharacterIndex(text.indexOf(token));
      const scopes = editor.scopeDescriptorForBufferPosition(position).getScopesArray();
      expect(scopes).toContain("storage.type.class.todo");
      expect(scopes).not.toContain("text.todo");
    }
    for (const token of ["https://example.com/line", "https://example.com/block"]) {
      const position = editor.getBuffer().positionForCharacterIndex(text.indexOf(token));
      const scopes = editor.scopeDescriptorForBufferPosition(position).getScopesArray();
      expect(scopes).toContain("markup.underline.link.hyperlink");
      expect(scopes).not.toContain("text.hyperlink");
    }
  });
});

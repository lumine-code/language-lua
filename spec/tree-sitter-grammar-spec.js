const fs = require("fs");
const path = require("path");
const { Point } = require("lumine");

const highlightsPath = path.join(__dirname, "..", "grammars", "lua-highlights.scm");

// Asserts the scopes the grammar actually produces, using the fixture beside
// this file. `runGrammarTests` reads `<- scope` and `^ scope` assertions out of
// the fixture's own comments, so the fixture is the readable spec.
//
// A fixture whose assertions never run still reports green, so break one
// expected scope and confirm this fails before trusting it.

describe("Lua Tree-sitter grammar", () => {
  let editor;
  let languageMode;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-lua");
  });

  afterEach(() => editor?.destroy());

  async function setUp(text) {
    editor = await lumine.workspace.open("structural-highlights.lua");
    editor.setText(text);
    languageMode = editor.getBuffer().languageMode;
    await languageMode.ready;
  }

  function scopesAt(row, text, occurrence = 0) {
    const line = editor.lineTextForBufferRow(row);
    let column = -1;
    for (let i = 0; i <= occurrence; i++) column = line.indexOf(text, column + 1);
    expect(column).not.toBe(-1);
    return editor.scopeDescriptorForBufferPosition([row, column]).getScopesArray();
  }

  function rawCaptures(startRow, endRow) {
    const options =
      startRow == null
        ? undefined
        : {
            startPosition: new Point(startRow, 0),
            endPosition: new Point(endRow, 0),
          };
    const layer = languageMode.rootLanguageLayer;
    return layer.queries.highlightsQuery.captures(layer.tree.rootNode, options);
  }

  it("tokenizes the fixture", async () => {
    await runGrammarTests(path.join(__dirname, "fixtures", "sample.lua"), /--/);
  });

  it("keeps unbounded containers leaf-rooted and trims line endings", () => {
    const query = fs.readFileSync(highlightsPath, "utf8");

    expect(query).not.toMatch(/\((?:arguments|parameters|table_constructor)\s*\n\s*"/);
    expect(query).not.toMatch(/\(variable_list\s*\n\s*\(attribute/);
    expect(query).toContain("(#is? test.childOfType arguments)");
    expect(query).toContain("(#is? test.childOfType parameters)");
    expect(query).toContain("(#is? test.childOfType table_constructor)");
    expect(query).toContain("((identifier) @variable.parameter.lua");
    expect(query.match(/adjust\.endBeforeFirstMatchOf "\\\\r\?\$"/g)?.length).toBe(2);
  });

  it("preserves parameter, call, table, function-field, builtin, and EOL scopes", async () => {
    await setUp(`#!/usr/bin/env lua\r
-- generated\r
function run(first, second)
  local handlers = {execute = function() end}
  print(first)
  wrapper(print)
  return invoke({first, second})
end`);

    expect(scopesAt(0, "#!")).toContain("keyword.control.directive.lua");
    expect(scopesAt(1, "--")).toContain("comment.line.double-dash.lua");
    expect(scopesAt(2, "(")).toContain("punctuation.definition.parameters.begin.bracket.round.lua");
    expect(scopesAt(2, "first")).toContain("variable.parameter.lua");
    expect(scopesAt(2, ")")).toContain("punctuation.definition.parameters.end.bracket.round.lua");
    expect(scopesAt(3, "{")).toContain("punctuation.definition.table.begin.bracket.curly.lua");
    expect(scopesAt(3, "execute")).toContain("entity.name.function.lua");
    expect(scopesAt(3, "}")).toContain("punctuation.definition.table.end.bracket.curly.lua");
    expect(scopesAt(4, "print")).toContain("support.function.builtin.lua");
    expect(scopesAt(5, "print")).not.toContain("support.function.builtin.lua");
    expect(scopesAt(6, "(")).toContain("punctuation.definition.arguments.begin.bracket.round.lua");
    expect(scopesAt(6, ")")).toContain("punctuation.definition.arguments.end.bracket.round.lua");
    expect(scopesAt(2, "function")).not.toContain("comment.line.double-dash.lua");
  });

  it("keeps leaf-rooted captures viewport-local", async () => {
    await setUp(`function run(
  first,
  second
)
  local values = {
    first,
    second
  }
  return invoke(
    first,
    second
  )
end`);

    const parameterCaptures = rawCaptures(2, 4).filter(
      (capture) =>
        capture.name === "variable.parameter.lua" ||
        capture.name.startsWith("punctuation.definition.parameters."),
    );
    expect(parameterCaptures.map((capture) => capture.node.startPosition.row)).toEqual([2, 3]);
    expect(parameterCaptures.every((capture) => capture.node.startPosition.row >= 2)).toBe(true);

    const tableCaptures = rawCaptures(6, 8).filter((capture) =>
      capture.name.startsWith("punctuation.definition.table."),
    );
    expect(tableCaptures.map((capture) => capture.node.startPosition.row)).toEqual([7]);
    expect(tableCaptures.every((capture) => capture.node.startPosition.row >= 6)).toBe(true);

    const argumentCaptures = rawCaptures(10, 12).filter((capture) =>
      capture.name.startsWith("punctuation.definition.arguments."),
    );
    expect(argumentCaptures.map((capture) => capture.node.startPosition.row)).toEqual([11]);
    expect(argumentCaptures.every((capture) => capture.node.startPosition.row >= 10)).toBe(true);
  });

  it("bounds raw work inside a 6000-row table parent", async () => {
    const lines = ["local value = {"];
    for (let i = 0; i < 6000; i++) lines.push(`  key_${i} = value_${i},`);
    lines.push("}");
    await setUp(lines.join("\r\n"));

    const tileCaptures = rawCaptures(2998, 3004);
    expect(tileCaptures.length).toBeLessThanOrEqual(64);
    expect(
      tileCaptures
        .filter((capture) => capture.name.startsWith("punctuation.definition.table."))
        .every(
          (capture) =>
            capture.node.startPosition.row >= 2998 && capture.node.startPosition.row < 3004,
        ),
    ).toBe(true);
  });

  it("keeps attributes local inside a 6000-name variable list", async () => {
    const lines = Array.from({ length: 6000 }, (_, index) => {
      const prefix = index === 0 ? "local " : "  ";
      const suffix = index === 5999 ? "" : ",";
      return `${prefix}value_${index} <const>${suffix}`;
    });
    lines.push("= nil");
    await setUp(lines.join("\r\n"));
    expect(languageMode.tree.rootNode.hasError).toBe(false);

    expect(scopesAt(0, "<")).toContain("punctuation.definition.attribute.begin.bracket.angle.lua");
    expect(scopesAt(0, "const")).toContain("entity.other.attribute-name.lua");
    expect(scopesAt(0, ">")).toContain("punctuation.definition.attribute.end.bracket.angle.lua");

    const startRow = 2998;
    const endRow = startRow + 6;
    const captures = rawCaptures(startRow, endRow);
    expect(captures.length).toBeLessThanOrEqual(72);
    expect(
      captures
        .filter(({ name }) =>
          [
            "punctuation.definition.attribute.begin.bracket.angle.lua",
            "entity.other.attribute-name.lua",
            "punctuation.definition.attribute.end.bracket.angle.lua",
          ].includes(name),
        )
        .every(({ node }) => node.startPosition.row >= startRow && node.startPosition.row < endRow),
    ).toBe(true);
  });
});

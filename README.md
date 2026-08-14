# language-lua

Lua language support.

## Features

- **Grammars**: provides Tree-sitter grammars, built from [tree-sitter-lua](https://github.com/tree-sitter-grammars/tree-sitter-lua).
- **Syntax highlighting**: full tree-sitter grammar coverage for Lua files, including LuaDoc comments and the three string forms.
- **Folding**: folds functions, blocks and tables from the parse tree rather than by indentation.
- **Auto-indentation**: indents block bodies and lines up `else` and `elseif` with their `if`.
- **Symbol navigation**: functions, methods and table fields bound to functions.

## Installation

To install `language-lua` search for it in the Install pane of the Lumine settings, or run the command `lumine --install lumine-code/language-lua`.

## Services

- `hyperlink.injection`: consumed to highlight URLs inside Lua files as clickable links.
- `todo.injection`: consumed to highlight `TODO`-style markers inside comments.

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!

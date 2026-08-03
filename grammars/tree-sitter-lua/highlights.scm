; Keywords
"return" @keyword.control.return.lua

[
  "goto"
  "in"
  "local"
] @keyword.control.lua

(break_statement) @keyword.control.lua

(do_statement
  [
    "do"
    "end"
  ] @keyword.control.lua)

(while_statement
  [
    "while"
    "do"
    "end"
  ] @keyword.control.loop.lua)

(repeat_statement
  [
    "repeat"
    "until"
  ] @keyword.control.loop.lua)

(if_statement
  [
    "if"
    "elseif"
    "else"
    "then"
    "end"
  ] @keyword.control.conditional.lua)

(elseif_statement
  [
    "elseif"
    "then"
    "end"
  ] @keyword.control.conditional.lua)

(else_statement
  [
    "else"
    "end"
  ] @keyword.control.conditional.lua)

(for_statement
  [
    "for"
    "do"
    "end"
  ] @keyword.control.loop.lua)

(function_declaration
  [
    "function"
    "end"
  ] @storage.type.function.lua)

(function_definition
  [
    "function"
    "end"
  ] @storage.type.function.lua)

; Operators
[
  "and"
  "not"
  "or"
] @keyword.operator.word.lua

[
  "+"
  "-"
  "*"
  "/"
  "%"
  "^"
  "#"
  "=="
  "~="
  "<="
  ">="
  "<"
  ">"
  "="
  "&"
  "~"
  "|"
  "<<"
  ">>"
  "//"
  ".."
] @keyword.operator.lua

; Punctuation, named for the role each mark plays.
";" @punctuation.terminator.statement.lua
"," @punctuation.separator.comma.lua
"." @punctuation.separator.property.lua
":" @punctuation.separator.method.lua
"::" @punctuation.definition.label.lua

; Brackets, named for what each pair delimits.
(arguments
  "(" @punctuation.definition.arguments.begin.bracket.round.lua
  ")" @punctuation.definition.arguments.end.bracket.round.lua)
(parameters
  "(" @punctuation.definition.parameters.begin.bracket.round.lua
  ")" @punctuation.definition.parameters.end.bracket.round.lua)
(parenthesized_expression
  "(" @punctuation.definition.expression.begin.bracket.round.lua
  ")" @punctuation.definition.expression.end.bracket.round.lua)

(bracket_index_expression
  "[" @punctuation.definition.index.begin.bracket.square.lua
  "]" @punctuation.definition.index.end.bracket.square.lua)

(table_constructor
  "{" @punctuation.definition.table.begin.bracket.curly.lua
  "}" @punctuation.definition.table.end.bracket.curly.lua)

; Variables
(identifier) @variable.other.lua

((identifier) @constant.language.lua
  (#eq? @constant.language.lua "_VERSION"))

((identifier) @variable.language.lua
  (#eq? @variable.language.lua "self"))

((identifier) @support.other.module.lua
  (#any-of? @support.other.module.lua "_G" "debug" "io" "jit" "math" "os" "package" "string" "table" "utf8"))

((identifier) @keyword.control.lua
  (#eq? @keyword.control.lua "coroutine"))

(variable_list
  (attribute
    "<" @punctuation.definition.attribute.begin.bracket.angle.lua
    (identifier) @entity.other.attribute-name.lua
    ">" @punctuation.definition.attribute.end.bracket.angle.lua))

; Labels
(label_statement
  (identifier) @entity.name.label.lua)

(goto_statement
  (identifier) @entity.name.label.lua)

; Constants
((identifier) @constant.other.lua
  (#match? @constant.other.lua "^[A-Z][A-Z_0-9]*$"))

(nil) @constant.language.lua

[
  (false)
  (true)
] @constant.language.boolean.lua

; Tables
(field
  name: (identifier) @variable.other.member.lua)

(dot_index_expression
  field: (identifier) @variable.other.member.lua)

; Functions
(parameters
  (identifier) @variable.parameter.lua)

(vararg_expression) @variable.parameter.language.lua

(function_declaration
  name: [
    (identifier) @entity.name.function.lua
    (dot_index_expression
      field: (identifier) @entity.name.function.lua)
  ])

(function_declaration
  name: (method_index_expression
    method: (identifier) @entity.name.function.method.lua))

(assignment_statement
  (variable_list
    .
    name: [
      (identifier) @entity.name.function.lua
      (dot_index_expression
        field: (identifier) @entity.name.function.lua)
    ])
  (expression_list
    .
    value: (function_definition)))

(table_constructor
  (field
    name: (identifier) @entity.name.function.lua
    value: (function_definition)))

(function_call
  name: [
    (identifier) @support.other.function.lua
    (dot_index_expression
      field: (identifier) @support.other.function.lua)
    (method_index_expression
      method: (identifier) @support.other.function.method.lua)
  ])

(function_call
  (identifier) @support.function.builtin.lua
  (#any-of? @support.function.builtin.lua
    ; built-in functions in Lua 5.1
    "assert" "collectgarbage" "dofile" "error" "getfenv" "getmetatable" "ipairs" "load" "loadfile"
    "loadstring" "module" "next" "pairs" "pcall" "print" "rawequal" "rawget" "rawlen" "rawset"
    "require" "select" "setfenv" "setmetatable" "tonumber" "tostring" "type" "unpack" "xpcall"
    "__add" "__band" "__bnot" "__bor" "__bxor" "__call" "__concat" "__div" "__eq" "__gc" "__idiv"
    "__index" "__le" "__len" "__lt" "__metatable" "__mod" "__mul" "__name" "__newindex" "__pairs"
    "__pow" "__shl" "__shr" "__sub" "__tostring" "__unm"))

; Others
; `--[[ … ]]` is a block comment; anything else on the line is a line comment.
; A backslash has to survive the query parser to reach the regex, hence `\\`.
((comment) @comment.block.lua
  (#match? @comment.block.lua "^--\\[\\["))
((comment) @comment.line.double-dash.lua
  (#not-match? @comment.line.double-dash.lua "^--\\[\\["))

((comment) @punctuation.definition.comment.lua
  (#set! adjust.endAfterFirstMatchOf "^--"))

; LuaDoc: `---` and `-- @annotation`. `%s` in the upstream Lua pattern means
; whitespace, which is `\\s` here.
((comment) @comment.block.documentation.lua
  (#match? @comment.block.documentation.lua "^---"))
((comment) @comment.block.documentation.lua
  (#match? @comment.block.documentation.lua "^--\\s?@"))

(hash_bang_line) @keyword.control.directive.lua

(number) @constant.numeric.lua

; The delimiter decides the scope: Lua has double-quoted, single-quoted and
; `[[long]]` strings, and upstream scoped all three as double-quoted.
(string
  start: "\"") @string.quoted.double.lua
(string
  start: "'") @string.quoted.single.lua
(string
  start: _ @_IGNORE_.long
  (#match? @_IGNORE_.long "^\\[=*\\[")) @string.quoted.other.long.lua

(string
  start: _ @punctuation.definition.string.begin.lua)
(string
  end: _ @punctuation.definition.string.end.lua)

(escape_sequence) @constant.character.escape.lua

; string.match("123", "%d+")
(function_call
  (dot_index_expression
    field: (identifier) @_IGNORE_.method
    (#any-of? @_IGNORE_.method "find" "match" "gmatch" "gsub"))
  arguments: (arguments
    .
    (_)
    .
    (string
      content: (string_content) @string.regexp.lua)))

;("123"):match("%d+")
(function_call
  (method_index_expression
    method: (identifier) @_IGNORE_.method
    (#any-of? @_IGNORE_.method "find" "match" "gmatch" "gsub"))
  arguments: (arguments
    .
    (string
      content: (string_content) @string.regexp.lua)))

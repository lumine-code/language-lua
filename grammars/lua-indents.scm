; Written by hand rather than ported: upstream's indent model
; (@indent.begin/.end/.branch) does not map onto this one.
;
; Lua opens a block with a keyword and closes it with `end`, so the indent is
; driven by the token that actually ends the opening line — `then` and `do`,
; not `if`, `for` or `while`, which share their line with it.

[
  "function"
  "then"
  "do"
  "repeat"
  "else"
  "("
  "{"
] @indent

[
  "end"
  "until"
  "elseif"
  "else"
  ")"
  "}"
] @dedent

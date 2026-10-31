; An unfinished long string may recover its contents as ordinary delimiters.
; Only a literal-prefixed recovery owner covers unnamed long-string bytes.
((ERROR "[[") @preserve
  (#match? @preserve "^(?:=[ \\t]*)?\\[=*\\[")
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))

; A payload word may be recovered just outside that owner in an assignment.
(_ (ERROR "[[") (_) @preserve
  (#is? indent.reindent true)
  (#set! indent.force true))

(ERROR "[[" ["(" ")" "{" "}"] @match.next
  (#set! indent.match startPosition)
  (#set! capture.final true))

(ERROR "[[" @match.next
  (#set! indent.match startPosition))
(ERROR (ERROR "[[") ["(" ")" "{" "}"] @match.next
  (#set! indent.match startPosition))

; Preserve the exact contents of multiline literals during explicit reindent.
([(string) (comment)] @preserve
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))

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

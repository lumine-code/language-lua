-- Assertions live in the comments: `<- scope` checks the marker's own
-- column on the previous non-comment line, `^ scope` checks the caret's.
-- Scopes match by prefix, so the trailing `.lua` segment is left off.

--- A LuaDoc comment.
-- <- comment.block.documentation

--[[ a block comment ]]
-- <- comment.block

local MAX = 100
-- <- keyword.control
--    ^ constant.other
--        ^ keyword.operator
--          ^ constant.numeric

local t = { a = 1, b = 'two' }
--        ^ punctuation.definition.table.begin.bracket.curly
--          ^ variable.other.member
--               ^ punctuation.separator.comma
--                     ^ punctuation.definition.string.begin
--                      ^ string.quoted.single
--                           ^ punctuation.definition.table.end.bracket.curly

local s = "text"
--        ^ punctuation.definition.string.begin
--         ^ string.quoted.double

function M.run(n)
-- <- storage.type.function
--       ^ variable.other
--        ^ punctuation.separator.property
--            ^ punctuation.definition.parameters.begin.bracket.round
--             ^ variable.parameter
--              ^ punctuation.definition.parameters.end.bracket.round

  if n > 0 then
--^ keyword.control.conditional
--     ^ keyword.operator
--         ^ keyword.control.conditional

    return math.floor(n)
--  ^ keyword.control.return
--         ^ support.other.module
--              ^ support.other.function

  end
--^ keyword.control

end
-- <- storage.type.function

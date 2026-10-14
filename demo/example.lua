--- A LuaDoc comment.

--[[ a block comment ]]

local MAX = 100

local t = { a = 1, b = 'two' }

local handlers = {
  run = function() end
}

local s = "text"

function M.run(n)

  if n > 0 then

    return math.floor(n)

  end

end

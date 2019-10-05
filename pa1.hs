text = "He who controls the past controls the future. He who controls the present controls the past."

data Token = Word String | Blank | HypWord String deriving (Eq,Show)

-- Part 1
-- Define a function to convert a string into a line. (You may assume that the input contains no hyphenated words! This, of
-- course, is a gross oversimplification.) Note that blanks in the input do not convert into Blank tokens. The “words” function
-- may be useful.
-- str2line :: String ‐> Line
-- str2line text ⇒ [Word "He", Word "who", Word "controls", ...]

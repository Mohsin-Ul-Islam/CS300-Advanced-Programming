import Data.List
import Data.Char

data Token = Word String | Blank | HypWord String deriving (Eq,Show)
type Line = [Token] -- create the type LIne which is an array of the data Token


text = "He who controls"
-- 1.
str2line :: String -> Line
str2line = \s ->
    let wordsList = words s
    in map (Word) wordsList

-- 2.
unToken :: Token -> String
unToken = \t ->
    case t of
        Word s -> s
        HypWord s -> s ++ "-"
        Blank -> " "

line2str :: Line -> String
line2str = \l ->
    let wordsList = map unToken l
    in unwords wordsList

-- 3.
tokLen :: Token -> Int
tokLen = \t ->
    case t of -- cases for all token types
        Blank -> 1
        Word s -> length s
        HypWord s -> length s + 1

-- 4.
lineLen :: Line -> Int
lineLen = \l ->
    case l of
        [] -> -1 -- to subtract the extra space's length added at the end of the recursion
        x:xs -> tokLen x + lineLen xs + 1

-- 5. breakLine
getBrokenLine :: Int -> Line -> Line
getBrokenLine = \w -> \l ->
    case l of
        x:xs | w > tokLen x -> [x] ++ getBrokenLine (w - tokLen x) xs
        _ -> []

breakLine :: Int -> Line -> (Line, Line)
breakLine = \w -> \l ->
    let brokenLine = getBrokenLine w l
    in (brokenLine, l \\ brokenLine)
    
-- 6. mergers
mergers :: [String] -> [(String, String)]
mergers = \parts ->
    case parts of
        x1:x2:xs -> (x1,concat(x2:xs)) : mergers ((x1++x2):xs) -- destructure into three parts, keep recursively merging the first 2 elements as you go, doing the same for the rest
        _ -> []

-- 7. enHyp, hyphenate
-- only caters to Words for now
getWordHyp :: [(String,[String])] -> String -> [String]
getWordHyp = \hypmap -> \s ->  --find -- returns leftmost element found with pred, Nothing if no such element found    
    case find (\x->fst x==s) hypmap of -- anonymous function to get first element of the tuple then compare with string of Word
        Just x -> snd x
        Nothing -> []

hyphenate :: [(String,[String])] -> Token -> [(Token,Token)] -- break up a token in all possible ways defined
hyphenate = \hypmap -> \(Word s) -> -- s may have trailing punctuation
    let wordPunc = span (isAlpha) s -- fst wordPunc == word, snd wordPunc == Punc, --span (isAlpha) "future." = ("future",".")
        wordHyp = getWordHyp hypmap (fst wordPunc)
        combos = mergers wordHyp -- find word in hypmap and pass to mergers its hyp
    in map (\(x,y)->(HypWord x, Word (y++snd wordPunc))) combos --convert to required format, while adding punc to second part of the words

-- 8. lineBreaks *
-- enhyp 12 Line
enHyp = [("controls",["co","nt","ro","ls"]),("future",["fu","tu","re"]),("present",["pre","se","nt"])]

-- map, filter
lineBreaks :: [(String,[String])] -> Int -> Line -> [(Line,Line)]--[(Line, Line)] -- a list of tuples of split lines
lineBreaks = \hypmap -> \maxlen -> \l -> 
    let linePair = breakLine maxlen l
        lastHypList = hyphenate hypmap (last l)
    in if (lineLen l) > maxlen 
        then let result = [linePair] ++ (map (\(a,b)->((fst linePair)++[a],[b])) lastHypList) -- breakLine
            in filter (\(l1,l2)-> lineLen l1 <= maxlen) result
        else [(l,[])]

-- 9. insertions
insertAt :: a -> Int -> [a] -> [a]
insertAt = \var -> \pos -> \l -> take (pos-1) l ++ [var] ++ drop (pos-1) l

repeatInsert :: a -> Int -> [a] -> [[a]] -- recursive accumulator based helper function
repeatInsert = \var -> \n -> \l ->
    case n of    
        0 -> []
        _ -> insertAt var n l : repeatInsert var (n-1) l

insertions :: a -> [a] -> [[a]]
insertions = \var -> \l -> reverse(repeatInsert var (length l+1) l)
        
-- 10. insertBlanks
removeDup :: Eq a => [a] -> [a] -- lists are Equatable, so we can remove duplicate lists too from a list
removeDup = \l ->
    case l of
        [] -> []
        (x:xs) -> x : removeDup(filter (x /=) xs)

removeDupfilterHeadLast = removeDup . filter (\x -> head x /= Blank && last x /= Blank)

insertBlanksRepeat :: Int -> [Line] -> [Line]
insertBlanksRepeat = \n -> \lb ->
    let result = (removeDupfilterHeadLast . concat . map (\x -> insertions Blank x)) lb
    in case n of
        0 -> result
        _ -> insertBlanksRepeat (n-1) result
        
insertBlanks :: Int -> Line -> [Line]
insertBlanks = \n -> \l -> 
    let firstInserts = removeDupfilterHeadLast (insertions Blank l)
    in case n of
        0 -> [l]
        1 -> firstInserts
        _ -> insertBlanksRepeat (n-2) firstInserts -- (n-2) since one blank has been inserted already, and another one is inserted by the function called in the start
    
-- 11. blankDistances
countBetweenBlanks :: Line -> [Int] -> [Int]
countBetweenBlanks = \bl -> \acc -> -- accumulator based helper function
    case bl of
        [] -> init acc
        (x:xs) | x == Blank -> countBetweenBlanks xs (acc ++ [0]) -- concatenate a new element (counter for the next in-between blanks space)
        (x:xs) -> countBetweenBlanks xs ((init acc) ++ [(last acc + 1)]) -- this time, pass in the new accumulator list which has its last value incremented

blankDistances :: Line -> [Int]
blankDistances = \l ->
    let breakl = span (\x -> x /= Blank) l
        breakr = (span (\x -> x /= Blank) . reverse . snd) breakl
        leftlen = (length . fst) breakl -- length starting from the left until the first blank
        rightlen = (length . fst) breakr -- length starting from the right until the first blank
        blankLine = (reverse . snd) breakr -- line segment from the first blank to the last blank
    in case length blankLine of
        0 -> [length l]
        _ -> [leftlen] ++ (countBetweenBlanks blankLine []) ++ [rightlen]

-- 12. var
avg :: [Double] -> Double
avg l = (sum l) / (fromIntegral (length l)) 

var :: [Double] -> Double
var = \l -> let n = length l
                u = avg l
    in foldr ((+).(\x -> (x-u)^2)) 0 l / fromIntegral n -- (x-u)^2 for every element and sum them up, then finally divide by n (number of elements), fromIntegral convert to Num type
 
-- 13. data Costs, lineBadness
data Costs = Costs Double Double Double Double deriving (Eq,Show)
-- blankCost blankProxCost blankUnevenCost hypCost
-- (intoducing a blank) (blanks close) (blanks spread unevenly) (hyphenating the last word)
-- blankProxCost equals the number of tokens minus the average blank distances, (0 if no blanks)
-- blankUnevenCost variance of blank distances
defaultCosts = Costs 1.0 1.0 0.5 0.5

listInt2Double :: [Int] -> [Double] -- convert a list to double
listInt2Double = \il ->
    case il of
        (x:xs) -> [fromIntegral x] ++ listInt2Double xs
        _ -> []

hypCostCalc :: Token -> Double -- depending on the last token passed of the line
hypCostCalc = \t ->
    case t of
        HypWord s -> 1.0
        _ -> 0.0

lineBadness :: Costs -> Line -> Double
lineBadness = \(Costs blankCost blankProxCost blankUnevenCost hypCost) -> \l ->
    let numb = (fromIntegral . length . filter (==Blank)) l -- if number of blanks
        doubleBlankDistances = (listInt2Double . blankDistances) l
    in case numb of
        0 -> 0.0 -- 0.0 score if no blanks at all
        _ -> blankCost * numb + blankProxCost * ((fromIntegral . length) l - avg(doubleBlankDistances)) + blankUnevenCost * (var doubleBlankDistances) + hypCost * (hypCostCalc . last) l -- sum of all the individual weights == total score
    

-- 14. bestLineBreak *

-- 15. justifyText *
-- main = putStr $ show $ listInt2Double [1,2]

main = putStr $ show $ lineBadness defaultCosts [Word "He",Word "who",Blank,Word "controls"]

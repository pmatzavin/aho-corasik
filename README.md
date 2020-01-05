# Description

This is a nodejs implementation of the Aho–Corasick data structure and search algorithm.

# Usage
Given a list of patterns:
```
const patterns = ["a", "ab", "bc", "bca", "c", "caa"];
```
We can construct the Aho–Corasick data structure, corresponding to the given patterns:
```
const searcher = new AhoCorasik(patterns)
```
Then given a text:
```
const text = "bccb";
```
We can search for all the patterns inside the text:
```
/**
 * Searches for the pattern occurances inside the given text.
 *
 * @param {text} text The given text.
 * @param {onMatch} onMatch The callback to be called for each found match.
 */
searcher.search(text, (patternIndex, textIndex) => {
    // patternIndex is an array with the positions of the matching pattern, in the patterns array. The array length can be greater than one only if the the given patterns contain duplicate patterns.
    // textIndex is the ending position of the matching pattern, inside the text
    console.log(patternIndex, textIndex);
});
```

So the following snippet:
```
const AhoCorasik = require('./src/AhoCorasik');
const patterns = ["a", "ab", "bc", "bca", "c", "caa"];
const searcher = new AhoCorasik(patterns)
const text = "bccb";
searcher.search(text, (patternIndex, textIndex) => {
  console.log(patternIndex, textIndex);
});
```
Will print:
```
[ 2 ] 1
[ 4 ] 1
[ 4 ] 2
```
Which mean that:
The patterns[2]="bc" exists in the text="bccb" and ends at the text position 1.
The patterns[4]="c" exists in the text="bccb" and ends at the text position 1.
The patterns[2]="c" exists in the text="bccb" and ends at the text position 2.
Note that the positions are zzero based.


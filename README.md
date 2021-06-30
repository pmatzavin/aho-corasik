# Description

This is a Nodejs implementation of the Aho–Corasick data structure and search algorithm.
The Aho-Corasic is a string searching algorithm: https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm

# Usage
Given a list of patterns:
```
const patterns = ["a", "ab", "bc", "bca", "c", "caa"];
```
We can construct the Aho–Corasick data structure, corresponding to the given patterns:
```
const searcher = new AhoCorasick(patterns)
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
const AhoCorasick = require('./src/AhoCorasick');
const patterns = ["a", "ab", "bc", "bca", "c", "caa"];
const searcher = new AhoCorasick(patterns)
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
- The patterns[2]="bc" exists in the text="bccb" and ends at the text position 1.
- The patterns[4]="c" exists in the text="bccb" and ends at the text position 1.
- The patterns[4]="c" exists in the text="bccb" and ends at the text position 2.
- Note that the positions are zero based.
- Note that only the end position of the pattern is returned, as the start position can be infered from the end position and the pattern length.

# tests

run tests:
```
npm test
```
This will run all the tests in the `test` folder.

The `test/spec.js` contain test cases from the cloudflare implementation: https://github.com/cloudflare/ahocorasick/blob/master/ahocorasick_test.go

The `test/hacker-rank.js` contain test cases of the `determining-dna-health` Hacker-Rank challenge: https://www.hackerrank.com/challenges/determining-dna-health/problem


/* 
Most of the inputs: patterns and text strings, come from: 
https://github.com/cloudflare/ahocorasick/blob/master/ahocorasick_test.go

for these the following applies:
https://github.com/cloudflare/ahocorasick/blob/master/LICENSE:

Copyright (c) 2013 CloudFlare, Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.

* Neither the name of the CloudFlare, Inc. nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
const tap = require('tap');
tap.pass('tap should work');

const AhoCorasik = require('../src/index');

(function testNoPatterns() {
    const searcher = new AhoCorasik([]);
    const hits = [];
    searcher.search("foo bar baz", (h) => {
        hits.push(h);
    });
    tap.equal(hits.length, 0, 'test no patterns');
})();

(function testNoData() {
    const searcher = new AhoCorasik(["foo", "baz", "bar"]);
    hits = [];
	searcher.search("");
	tap.equal(hits.length, 0);
})();

(function testSuffixes() {
    const searcher = new AhoCorasik(["Superman", "uperman", "perman", "erman"]);
    const hits = [];
    searcher.search("The Man Of Steel: Superman", (patternPosition, textPosition) => {
        hits.push([patternPosition[0], textPosition]);
    })
    tap.equal(hits.length, 4);
    tap.equal(hits[0][0], 0);
    tap.equal(hits[0][1], 25);
    tap.equal(hits[1][0], 1);
    tap.equal(hits[1][1], 25);
    tap.equal(hits[2][0], 2);
    tap.equal(hits[2][1], 25);
    tap.equal(hits[3][0], 3);
    tap.equal(hits[3][1], 25);
})();

(function testPrefixes() {
    const searcher = new AhoCorasik(["Superman", "Superma", "Superm", "Super"]);
    const hits = [];
    searcher.search("The Man Of Steel: Superman", (patternPosition, textPosition) => {
        hits.push([patternPosition[0], textPosition]);
    });
    tap.equal(hits.length, 4);
    tap.equal(hits[0][0], 3);
    tap.equal(hits[0][1], 22);
    tap.equal(hits[1][0], 2);
    tap.equal(hits[1][1], 23);
    tap.equal(hits[2][0], 1);
    tap.equal(hits[2][1], 24);
    tap.equal(hits[3][0], 0);
    tap.equal(hits[3][1], 25);
})();

(function testInterior() {
    const searcher = new AhoCorasik(["Steel", "tee", "e"]);
    const hits = [];
    searcher.search("The Man Of Steel: Superman", (patternPosition, textPosition) => {
        hits.push([patternPosition[0], textPosition]);
    });
    tap.equal(hits.length, 6);
    tap.equal(hits[0][0], 2);
    tap.equal(hits[0][1], 2);
    tap.equal(hits[1][0], 2);
    tap.equal(hits[1][1], 13);
    tap.equal(hits[2][0], 1);
    tap.equal(hits[2][1], 14);
    tap.equal(hits[3][0], 2);
    tap.equal(hits[3][1], 14);
    tap.equal(hits[4][0], 0);
    tap.equal(hits[4][1], 15);
    tap.equal(hits[5][0], 2);
    tap.equal(hits[5][1], 21);
})();

(function testMatchAtStart() {
    const searcher = new AhoCorasik(["The", "Th", "he"]);
    const hits = [];
    searcher.search("The Man Of Steel: Superman", (patternPosition, textPosition) => {
        hits.push([patternPosition[0], textPosition]);
    });
    tap.equal(hits.length, 3);
    tap.equal(hits[0][0], 1);
    tap.equal(hits[0][1], 1);
    tap.equal(hits[1][0], 0);
    tap.equal(hits[1][1], 2);
    tap.equal(hits[2][0], 2);
    tap.equal(hits[2][1], 2);
})();

(function testMatchAtEnd() {
    const searcher = new AhoCorasik(["teel", "eel", "el"]);
    const hits = [];
    searcher.search("The Man Of Steel", (patternPosition, textPosition) => {
        hits.push([patternPosition[0], textPosition]);
    });
    tap.equal(hits.length, 3);
    tap.equal(hits[0][0], 0);
    tap.equal(hits[0][1], 15);
    tap.equal(hits[1][0], 1);
    tap.equal(hits[1][1], 15);
    tap.equal(hits[2][0], 2);
    tap.equal(hits[2][1], 15);
})();

(function testOverlappingPatterns() {
    const searcher = new AhoCorasik(["Man ", "n Of", "Of S"]);
    const hits = [];
    searcher.search("The Man Of Steels", (patternPosition, textPosition) => {
        hits.push([patternPosition[0], textPosition]);
    });
    tap.equal(hits.length, 3);
    tap.equal(hits[0][0], 0);
    tap.equal(hits[0][1], 7);
    tap.equal(hits[1][0], 1);
    tap.equal(hits[1][1], 9);
    tap.equal(hits[2][0], 2);
    tap.equal(hits[2][1], 11);
})();

(function testMultipleMatches() {
    const searcher = new AhoCorasik(["The", "Man", "an"]);
    const hits = [];
    searcher.search("A Man A Plan A Canal: Panama, which Man Planned The Canal",
            (patternPosition, textPosition) => {
        hits.push([patternPosition[0], textPosition]);
    });
    tap.equal(hits.length, 10);
    tap.equal(hits[0][0], 1);
    tap.equal(hits[0][1], 4);
    tap.equal(hits[1][0], 2);
    tap.equal(hits[1][1], 4);
    tap.equal(hits[2][0], 2);
    tap.equal(hits[2][1], 11);
    tap.equal(hits[3][0], 2);
    tap.equal(hits[3][1], 17);
    tap.equal(hits[4][0], 2);
    tap.equal(hits[4][1], 24);
    tap.equal(hits[5][0], 1);
    tap.equal(hits[5][1], 38);
    tap.equal(hits[6][0], 2);
    tap.equal(hits[6][1], 38);
    tap.equal(hits[7][0], 2);
    tap.equal(hits[7][1], 43);
    tap.equal(hits[8][0], 0);
    tap.equal(hits[8][1], 50);
    tap.equal(hits[9][0], 2);
    tap.equal(hits[9][1], 54);
})();

(function testSingleCharacterMatches() {
    const searcher = new AhoCorasik(["a", "M", "z"]);
    const hits = [];
    searcher.search("A Man A Plan A Canal: Panama, which Man Planned The Canal",
            (patternPosition, textPosition) => {
        hits.push([patternPosition[0], textPosition]);
    });
    tap.equal(hits.length, 13);
    tap.equal(
        JSON.stringify(hits),
        '[[1,2],[0,3],[0,10],[0,16],[0,18],[0,23],[0,25],[0,27],[1,36],[0,37],[0,42],[0,53],[0,55]]'
    );
})();

(function testNothingMatches() {
    const searcher = new AhoCorasik(["baz", "bar", "foo"]);
    const hits = [];
    searcher.search("A Man A Plan A Canal: Panama, which Man Planned The Canal",
            (patternPosition, textPosition) => {
        hits.push([patternPosition[0], textPosition]);
    });
    tap.equal(hits.length, 0);
})();

(function testWikipedia() {
    const searcher = new AhoCorasik(["a", "ab", "bc", "bca", "c", "caa"]);
    let hits = [];
    searcher.search("abccab", (patternPosition, textPosition) => {
        hits.push([patternPosition[0], textPosition]);
    });
    tap.equal(
        JSON.stringify(hits),
        '[[0,0],[1,1],[2,2],[4,2],[4,3],[0,4],[1,5]]'
    );

    hits = [];
    searcher.search("bccab", (patternPosition, textPosition) => {
        hits.push([patternPosition[0], textPosition]);
    });
    tap.equal(
        JSON.stringify(hits),
        '[[2,1],[4,1],[4,2],[0,3],[1,4]]'
    );

    hits = [];
    searcher.search("bccb", (patternPosition, textPosition) => {
        hits.push([patternPosition[0], textPosition]);
    });
    tap.equal(
        JSON.stringify(hits),
        '[[2,1],[4,1],[4,2]]'
    );
})();

(function testMatch() {
    const searcher = new AhoCorasik(["Mozilla", "Mac", "Macintosh", "Safari", "Sausage"]);
    let hits = [];
    searcher.search(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36",
        (patternPosition, textPosition) => {
            hits.push([patternPosition[0], textPosition]);
        }
    );
    tap.equal(
        JSON.stringify(hits), 
        "[[0,6],[1,15],[2,21],[1,32],[3,112]]"
    );

    hits = [];
    searcher.search(
        "Mozilla/5.0 (Mac; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36",
        (patternPosition, textPosition) => {
            hits.push([patternPosition[0], textPosition]);
        }
    );
    tap.equal(
        JSON.stringify(hits), 
        "[[0,6],[1,15],[1,26],[3,106]]"
    );

    hits = [];
    searcher.search(
        "Mozilla/5.0 (Moc; Intel Computer OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36",
        (patternPosition, textPosition) => {
            hits.push([patternPosition[0], textPosition]);
        }
    );
    tap.equal(
        JSON.stringify(hits), 
        "[[0,6],[3,111]]"
    );

    hits = [];
    searcher.search(
        "Mozilla/5.0 (Moc; Intel Computer OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Sofari/537.36",
        (patternPosition, textPosition) => {
            hits.push([patternPosition[0], textPosition]);
        }
    );
    tap.equal(
        JSON.stringify(hits), 
        "[[0,6]]"
    );

    hits = [];
    searcher.search(
        "Mazilla/5.0 (Moc; Intel Computer OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Sofari/537.36",
        (patternPosition, textPosition) => {
            hits.push([patternPosition[0], textPosition]);
        }
    );
    tap.equal(
        JSON.stringify(hits), 
        "[]"
    );
})();

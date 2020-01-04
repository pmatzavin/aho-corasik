const AhoCorasik = require('../../src/index');
const tap = require('tap');

tap.equal(1, 2);

let inputString = '';
let currentLine = 0;

init(main);

function init(start) {
  process.stdin.resume();
  process.stdin.setEncoding('utf-8');

  process.stdin.on('data', inputStdin => {
    inputString += inputStdin;
  });

  process.stdin.on('end', _ => {
    inputString = inputString.replace(/\s*$/, '')
      .split('\n')
      .map(str => str.replace(/\s*$/, ''));

    start();
  });
}

function main() {
  const { genes: patterns, health, strandsLength } = readGenes();

  const searcher = new AhoCorasik(patterns);
  const minMax = new MinMax();

  for (let strandIter = 0; strandIter < strandsLength; strandIter++) {
    const { text, fromHealthIndex, toHealthIndex } = readStrand();

    const res = { score: 0 };
    const computeScore = createComputeScore(health, fromHealthIndex, toHealthIndex, res);

    searcher.search(text, computeScore);
    minMax.insert(res.score);
  }

  const expected = readExpected();
  const res = `${minMax.min} ${minMax.max}`;

  // console.log(res);
  // console.log(expected);
  tap.equal(res, expected);
}

function readLine() {
  return inputString[currentLine++];
}

function readExpected() {
  return readLine();
}

function readStrand() {
  const firstLastText = readLine().split(' ');
  const fromHealthIndex = parseInt(firstLastText[0], 10);
  const toHealthIndex = parseInt(firstLastText[1], 10);
  const text = firstLastText[2];

  return { text, fromHealthIndex, toHealthIndex };
}

function readGenes() {
  parseInt(readLine(), 10);
  const genes = readLine().split(' ');
  const health = readLine().split(' ').map(healthTemp => parseInt(healthTemp, 10));
  const strandsLength = parseInt(readLine(), 10);

  return { genes, health, strandsLength };
}

function getInitMinMax() {
  const min = Math.pow(10, 15);
  const max = 0;

  return {
    min,
    max
  };
}

function createComputeScore(scores, fromScore, toScore, current) {
  return (patternIndexes) => {
    for (const patternIndex of patternIndexes) {
      if (patternIndex >= fromScore && patternIndex <= toScore) {
        current.score += scores[patternIndex];
      }
    }
  }
}

class MinMax {
  constructor() {
    this.min = Math.pow(10, 15);
    this.max = 0;
  }

  insert(x) {
    if (x > this.max) {
      this.max = x;
    }

    if (x < this.min) {
      this.min = x;
    }
  }
}


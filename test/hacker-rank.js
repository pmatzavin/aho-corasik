const AhoCorasik = require('../src/index');
const tap = require('tap');
const fs = require('fs');

let inputString = '';
let currentLine = 0;
let mainCount = -1;

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

  const files = fs.readdirSync(`${__dirname}/hacker-rank-data`);
  for (file of files) {
    if (file.startsWith('input')) {
      const filename = `${__dirname}/hacker-rank-data/${file}`;
      const input = fs.readFileSync(filename, 'utf8');
      process.stdin.emit('data', input);
      process.stdin.emit('end');
      inputString = '';
      currentLine = 0;
    }
  }
  process.exit(0);
}

function main() {
  mainCount++;

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
  const actual = `${minMax.min} ${minMax.max}`;

  tap.equal(actual, expected, `input: ${mainCount}`);
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

function createComputeScore(scores, fromScore, toScore, current) {
  return (patternIndexes) => {
    for (const patternIndex of patternIndexes) {
      if (patternIndex >= fromScore && patternIndex <= toScore) {
        current.score += scores[patternIndex];
      }
    }
  }
}


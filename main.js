const path = require('path');
const fs = require('fs');

const NUMBERS_FILE_IN = path.join(process.cwd(), 'cases', 'case2', 'numbers.in');
const BOARDS_FILE_IN = path.join(process.cwd(), 'cases', 'case2', 'boards.in');

// This could also be determined after parsing the boards file.
const BOARD_LINE_LEN = 5;

const parseNumbersFile = () => {
  const rawContent = fs.readFileSync(NUMBERS_FILE_IN, { encoding: 'utf-8', flag: 'r' });

  return rawContent.split(',').map(n => Number(n));
}

const parseBoardsFile = () => {
  const rawContent = fs.readFileSync(BOARDS_FILE_IN, { encoding: 'utf-8', flag: 'r' });

  const boards = rawContent
    .split(/\n\n/g)
    .map(rawBoard => {
      return rawBoard
        .trim()
        .split('\n')
        .map(rawLine => rawLine.split(' ').filter(Boolean).map(n => Number(n)));
    });

  return boards;
}

const numbers = parseNumbersFile();
const boards = parseBoardsFile();

// Mainly used for debugging purposes, but it can also be used
// if we'd want to know, for example, which line has made a board win.
const boardsHelper = boards.map(
  () => ({
    cols: Array.from({ length: BOARD_LINE_LEN }).map(() => []),
    rows: Array.from({ length: BOARD_LINE_LEN }).map(() => []),
  })
);

const getSumOfUnmarkedNumbers = (board, markedNumsArray) => {
  const markedNums = new Set(markedNumsArray);

  let sum = 0;
  for (let i = 0; i < BOARD_LINE_LEN; i++) {
    for (let j = 0; j < BOARD_LINE_LEN; j++) {
      const val = board[i][j];
      if (markedNums.has(val)) {
        continue;
      }

      sum += val;
    }
  }

  return sum;
}

// When a board has won, we immediately calculate the sum
// of unmarked numbers.
let lastBoardUnmarkedSum = null;
// Used to keep track of the last drawn number that has made
// the *last* board win.
let lastWinningBoardNumberIdx = -1;

let lastWinningBoardIdx = null;

boardLoop: for (const boardIdx in boards) {
  const board = boards[boardIdx];

  // It's necessary to follow the order of the drawn numbers.
  for (let numIdx in numbers) {
    numIdx = +numIdx;
    const num = numbers[numIdx];

    for (let i = 0; i < BOARD_LINE_LEN; i++) {
      for (let j = 0; j < BOARD_LINE_LEN; j++) {
        const val = board[i][j];
        if (val !== num) {
          continue;
        }

        const { cols, rows } = boardsHelper[boardIdx];
        rows[i].push(+numIdx);
        cols[j].push(+numIdx);

        const hasRowWon = rows[i].length === BOARD_LINE_LEN;
        const hasColWon = cols[j].length === BOARD_LINE_LEN;
        if (hasRowWon || hasColWon) {
          if (numIdx > lastWinningBoardNumberIdx) {
            lastWinningBoardNumberIdx = +numIdx;
            lastBoardUnmarkedSum = getSumOfUnmarkedNumbers(board, numbers.slice(0, numIdx + 1));
            lastWinningBoardIdx = +boardIdx;
          }
          continue boardLoop;
        }
      }
    }
  }
}

const score = lastBoardUnmarkedSum * numbers[lastWinningBoardNumberIdx];
console.log({
  'The board that won last': lastWinningBoardIdx + 1,
  score,
});

// =====================================

/* 
* Ways to optimize *
The current time complexity seems to be: O(boardsLen * numsLen * 5 * 5).
(One top of that, we also have O(5 * 5) for getting the sum of unmarked numbers)

A think a way to optimize this is to avoid searching through the matrix
every time a number is drawn.
The way to do that is, for each board, to create a Map object that has
this shape: { value: { i, j } }. Then, we can check for the drawn number directly.
*/
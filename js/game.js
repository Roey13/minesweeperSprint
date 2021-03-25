'use strict'
//vars & consts
const MINE = '💣'
const EMPTY = '✅'
const FLAG = '🚩'
const HIDDEN = ''
var gBoard;
var timer;
var gLevel = {};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


//functions
function initGame() {
    gBoard = buildBoard()
    printMat(gBoard, '.board-container');
}

function buildBoard() {
    var size = 4;
    var board = [];
    for (var i = 0; i < size; i++) {
        board.push([]);
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 4,
                isShown: false,
                isMine: false,
                isMarked: false,
                i,
                j
            }
        }
    }
    board[getRandomIntInclusive(0, 3)][getRandomIntInclusive(0, 3)].isMine = true
    board[getRandomIntInclusive(0, 3)][getRandomIntInclusive(0, 3)].isMine = true;
    return board;
}

function printMat(mat, selector) {

    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
      strHTML += '<tr>';
      for (var j = 0; j < mat[0].length; j++) {
        var cell = mat[i][j];

        if (cell.isShown) gGame.shownCount ++

        if (!cell.isShown && !cell.isMarked) cell = HIDDEN
        if (!cell.isShown && cell.isMarked) cell = FLAG
        if (cell.isMarked) cell = FLAG;
  
        if (cell.isShown) {
          if (cell.isMine) cell = MINE
          else {
            cell = EMPTY
            var negs = setMinesNegsCount(mat, i, j)
            if (negs > 0) cell = negs
          }
        }
        var className = 'cell cell' + i + '-' + j;
        strHTML +=
          '<td onclick="cellClicked(this,' + i + ',' + j +
          ') "oncontextmenu="cellMarked(this,' + i + ',' + j +
          '); return false "class="' + className + '"> ' + cell + ' </td>'
      }
      strHTML += '</tr>'
    }

    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function setMinesNegsCount(mat, cellI, cellJ) {
    var neighborsSum = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (mat[i][j].isMine) neighborsSum++;
        }
    }
    return neighborsSum;
}


function cellClicked(elCell, cellI, cellJ) {

    if (gGame.shownCount === 0 && gGame.markedCount === 0) {
        gGame.isOn = true;
        timer = setInterval(setTime, 1000);
    }

    if (gBoard[cellI][cellJ].isMarked === true) return

    gBoard[cellI][cellJ].isShown = true;
    if (gBoard[cellI][cellJ].isMine) gameOver();
    else {
        for (var i = cellI - 1; i <= cellI + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                if (j < 0 || j >= gBoard[i].length) continue;
                if (i === cellI && j === cellJ) continue;
                if (!gBoard[i][j].isMine) gBoard[i][j].isShown = true;
            }
        }
    }
    printMat(gBoard, '.board-container')
};


function cellMarked(elCell, cellI, cellJ) {

    if (gGame.shownCount === 0 && gGame.markedCount === 0) {
        gGame.isOn = true;
        setInterval(setTime, 1000);
    }

    var elCell = gBoard[cellI][cellJ]
    elCell.isMarked = !elCell.isMarked
    printMat(gBoard, '.board-container')
    gGame.markedCount++
};

function checkGameOver() {

    

};

function gameOver() {
clearInterval(timer)
gGame.isOn = false;
for (var i = 0; i <gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++){
        if (gBoard[i][j].isMine) gBoard[i][j].isShown = true;
    }
}
}

function expandShown(board, elCell, i, j) {};
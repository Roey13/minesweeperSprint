'use strict'
//vars & consts
const MINE = '💣'
const EMPTY = '✅'
const FLAG = '🚩'
const HIDDEN = ''
var gBoard;
var timer;
var gSize = 4;
var gLevel = {};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

//functions
function initGame() {
    totalSeconds = 0;
    clearInterval(timer);
    resetTimer()
    gGame.isOn = true;
    gGame.shownCount = 0;
    gBoard = buildBoard(gSize)
    printMat(gBoard, '.board-container');
    createDiffs()
    smiley('😀')
}

function smiley(face) {
    var smiley = document.querySelector('.smiley');
    var strHTML = `<button onclick="initGame()">${face}</button>`
    smiley.innerHTML = strHTML
}

function buildBoard(size) {
    var mines;
    if (size === 4) mines = 2
    if (size === 8) mines = 12
    if (size === 12) mines = 30

    var board = [];
    for (var i = 0; i < size; i++) {
        board.push([]);
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                i,
                j
            }
        }
    }

    for (var i = 0; i < mines; i++) {
        board[getRandomIntInclusive(0, size - 1)][getRandomIntInclusive(0, size - 1)].isMine = true;
    }

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            setMinesNegsCount(board, i, j)
        }
    }

    return board;
}

function printMat(mat, selector) {

    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];

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
    mat[cellI][cellJ].minesAroundCount = neighborsSum
    return neighborsSum;
}


function cellClicked(elCell, cellI, cellJ) {



    if (gGame.shownCount === 0 && gGame.markedCount === 0) {
        gGame.isOn = true;
        timer = setInterval(setTime, 1000);
    }

    if (gGame.isOn === false) return;

    if (gBoard[cellI][cellJ].isMarked === true) return

    if (gBoard[cellI][cellJ].isMine) {
        gameOver()
        smiley('🤯')
    }

    gBoard[cellI][cellJ].isShown = true
    gGame.shownCount += 1;


    if (gBoard[cellI][cellJ].minesAroundCount === 0) {
        for (var i = cellI - 1; i <= cellI + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                if (j < 0 || j >= gBoard.length) continue;
                if (i === cellI && j === cellJ) continue;
                if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                    gBoard[i][j].isShown = true;
                    gGame.shownCount++
                }
            }
        }
    }

    console.log('gGame.shownCount', gGame.shownCount);
    printMat(gBoard, '.board-container')
    checkGameOver()
};


function cellMarked(elCell, cellI, cellJ) {


    if (gGame.shownCount === 0 && gGame.markedCount === 0) {
        gGame.isOn = true;
        timer = setInterval(setTime, 1000);
    }

    if (!gGame.isOn) return;


    var elCell = gBoard[cellI][cellJ]
    elCell.isMarked = !elCell.isMarked
    printMat(gBoard, '.board-container')
    checkGameOver()
};

function checkGameOver() {
    var hiddenMinesCount = 0;
    var flagsCount = 0;

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMarked) flagsCount++;
            if (gBoard[i][j].isMine && !gBoard[i][j].isShown && gBoard[i][j].isMarked) hiddenMinesCount++;
        }
    }
    gGame.markedCount = flagsCount

    if (gSize === 4) {
        if (hiddenMinesCount === 2 && gGame.shownCount === (gSize ** 2 - hiddenMinesCount)) {
            smiley('😎')
            gameOver();
        }
    }

    if (gSize === 8) {
        if (hiddenMinesCount === 12 && gGame.shownCount === (gSize ** 2 - hiddenMinesCount)) {
            smiley('😎')
            gameOver();
        }
    }


    if (gSize === 12) {
        if (hiddenMinesCount === 30 && (gSize ** 2 - hiddenMinesCount)) {
            smiley('😎')
            gameOver();
        }
    }
};

function gameOver() {
    clearInterval(timer)
    gGame.isOn = false;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) gBoard[i][j].isShown = true;
        }
    }
}

function createDiffs() {
    var body = document.querySelector('.diffs')
    var strHTML =
        `<button onclick="activateDiffS(4)">Easy</button>
        <button onclick="activateDiffS(8)">Medium</button>
        <button onclick="activateDiffS(12)">Hard</button>`
    body.innerHTML = strHTML
}

function activateDiffS(diff) {
    clearInterval(timer)
    gSize = diff
    initGame()
}

function resetTimer() {
    var minutesLabel = document.getElementById("minutes");
    var secondsLabel = document.getElementById("seconds");
    var strMinutes = `<label id="minutes">00</label>`
    var strSeconds = `<label id="seconds">00</label>`
    minutesLabel.innerHTML = strMinutes
    secondsLabel.innerHTML = strSeconds
}
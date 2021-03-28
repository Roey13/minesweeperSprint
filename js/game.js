'use strict'
const MINE = '💣'
const EMPTY = ''
const FLAG = '🚩'
const HIDDEN = ''
var gBoard;
var gTimer;
var gSize = 4;
var gHints = 2;
var gMines = 0;
var gCellClickedCount = 0;
var gHintsClicked = 0;
var gLevel = {};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: +localStorage.getItem('minutes', minutesLabel.innerHTML) * 60 + +localStorage.getItem('seconds', secondsLabel.innerHTML),
    livesLeft: 2,
    isHint: false
}

function initGame() {
    clearInterval(gTimer);
    resetTimer()
    createHints()
    createLives()
    createRecord()
    gGame.isOn = false;
    gGame.isHint = false;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gHintsClicked = 0;
    gBoard = buildBoard(gSize)
    createDiffs()
    smiley('😀')
}

function smiley(face) {
    var smiley = document.querySelector('.smiley');
    var strHTML = `<button onclick="initGame()">${face}</button>`
    smiley.innerHTML = strHTML
}

function createLives() {
    var heart = '';
    for (var i = 0; i < gGame.livesLeft; i++) {
        heart += '💜'
    }
    var strHTML = `Lives Left: ${heart}`
    var lives = document.querySelector('.lives');
    lives.innerHTML = strHTML;
}

function createHints() {
    var hint = '';
    for (var i = 0; i < gHints; i++) {
        hint += `<button onclick="displayHint(this)" class="hint${i+1}">💡</button>`
    }
    var strHTML = `Hints: ${hint}`;
    var hints = document.querySelector('.hints');
    hints.innerHTML = strHTML;
}

function displayHint(hint) {
    if (!hint.classList.contains('hint1') || !gGame.isOn) return;
    gGame.isHint = !gGame.isHint
    if (gGame.isHint) hint.style.backgroundColor = 'yellow'
    else hint.style.background = '#aaa'
}

function buildBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board.push([]);
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isHinted: false,
                i,
                j
            }
        }
    }
    printMat(board, '.board-container');
    return board;
}

function placeMines(board, mines, clcikedI, clikedJ) {
    for (var i = 0; i < mines; i++) {
        var cellI = getRandomIntInclusive(0, board.length - 1);
        var cellJ = getRandomIntInclusive(0, board.length - 1);
        while (board[cellI][cellJ].isMine || cellI === clcikedI && cellJ === clikedJ) {
            cellI = getRandomIntInclusive(0, board.length - 1);
            cellJ = getRandomIntInclusive(0, board.length - 1);
        }
        board[cellI][cellJ].isMine = true;
    }
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

function activateHint(cellI, cellJ) {
    if (gHintsClicked > 0) return;
    gHintsClicked++;
    var clickedCell = gBoard[cellI][cellJ];
    clickedCell.isHinted = true;
    printMat(gBoard, '.board-container')
    clickedCell.isShown = true;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (i === cellI && j === cellJ) continue;
            if (!gBoard[i][j].isShown) {
                gBoard[i][j].isHinted = true;
                gBoard[i][j].isShown = true;
            }
        }
    }
    printMat(gBoard, '.board-container')
    checkIfShownOrHinted()
    setTimeout(stopHints.bind(null, cellI, cellJ), 1000)
}

function stopHints(cellI, cellJ) {
    var clickedCell = gBoard[cellI][cellJ];
    clickedCell.isHinted = false;
    clickedCell.isShown = false;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (i === cellI && j === cellJ) continue;
            if (gBoard[i][j].isHinted) {
                gBoard[i][j].isHinted = false;
                gBoard[i][j].isShown = false;
            }
        }
    }
    gGame.isHint = false;
    gHints--;
    gHintsClicked--;
    createHints()
    printMat(gBoard, '.board-container')
    checkIfShownOrHinted()
}

function cellClicked(elCell, cellI, cellJ) {
    var clickedCell = gBoard[cellI][cellJ];
    if (clickedCell.isShown) return;
    if (gGame.isHint) {
        activateHint(cellI, cellJ);
        return;
    }
    if (gSize === 4) gMines = 2
    if (gSize === 8) gMines = 12
    if (gSize === 12) gMines = 30
    if (gGame.shownCount === 0 && gGame.markedCount === 0) {
        gGame.isOn = true;
        gTimer = setInterval(setTime, 1000);
        clickedCell.isMine = false;
        placeMines(gBoard, gMines, cellI, cellJ)
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                setMinesNegsCount(gBoard, i, j)
            }
        }
        printMat(gBoard, '.board-container');
    }
    if (gGame.isOn === false) return;
    if (clickedCell.isMarked === true) return
    if (clickedCell.isMine) {
        gGame.livesLeft--;
        createLives()
        checkIfShownOrHinted()
    }
    if (clickedCell.isMine && gGame.livesLeft === 0) {
        gGame.livesLeft--;
        createLives()
        gameOver()
        smiley('🤯')
        printMat(gBoard, '.board-container')
        checkIfShownOrHinted()
        return
    }
    clickedCell.isShown = true
    gGame.shownCount += 1;
    if (clickedCell.minesAroundCount === 0) {
        for (var i = cellI - 1; i <= cellI + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                if (j < 0 || j >= gBoard.length) continue;
                if (i === cellI && j === cellJ) continue;
                if (gBoard[i][j].minesAroundCount === 0) expandShown(i, j)
                if (!gBoard[i][j].isMine && !gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
                    gBoard[i][j].isShown = true;
                    gGame.shownCount++
                }
            }
        }
    }
    printMat(gBoard, '.board-container')
    checkGameOver()
    checkIfShownOrHinted()
};

function cellMarked(elCell, cellI, cellJ) {
    if (gGame.shownCount === 0 && gGame.markedCount === 0) {
        gGame.isOn = true;
        gTimer = setInterval(setTime, 1000);
    }
    if (!gGame.isOn) return;
    var elCell = gBoard[cellI][cellJ]
    elCell.isMarked = !elCell.isMarked
    printMat(gBoard, '.board-container')
    checkGameOver()
    checkIfShownOrHinted()
};

function checkIfShownOrHinted() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var elCell = document.querySelector('.cell' + i + '-' + j)
            if (gBoard[i][j].isShown && !gBoard[i][j].isHinted) {
                elCell.style.backgroundColor = '#888';
                elCell.style.borderColor = '#bbb #aaa';
            }
            if (gBoard[i][j].isShown && gBoard[i][j].isHinted) {
                elCell.style.backgroundColor = 'yellow';
                elCell.style.borderColor = '#bbb #aaa';
            }
        }
    }
}

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
        if (gGame.markedCount === 2 && gGame.shownCount === (gSize ** 2 - hiddenMinesCount)) {
            smiley('😎')
            gameOver();
            checkRecord();
        }
    }
    if (gSize === 8) {
        if (gGame.markedCount === 12 && gGame.shownCount === (gSize ** 2 - hiddenMinesCount)) {
            smiley('😎')
            gameOver();
            checkRecord();
        }
    }
    if (gSize === 12) {
        if (gGame.markedCount === 30 && gGame.shownCount === (gSize ** 2 - hiddenMinesCount)) {
            smiley('😎')
            gameOver();
            checkRecord();
        }
    }
};

function gameOver() {
    clearInterval(gTimer)
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
    if (diff === 8 || diff === 12) {
        gGame.livesLeft = 3
        gHints = 3;
    } else {
        gGame.livesLeft = 2
        gHints = 2;
    }
    clearInterval(gTimer)
    gSize = diff
    initGame()
}

function resetTimer() {
    totalSeconds = 0
    var minutesLabel = document.getElementById("minutes");
    var secondsLabel = document.getElementById("seconds");
    var strMinutes = `<label id="minutes">00</label>`
    var strSeconds = `<label id="seconds">00</label>`
    minutesLabel.innerHTML = strMinutes
    secondsLabel.innerHTML = strSeconds
}

function checkRecord() {
    localStorage.setItem('seconds', secondsLabel.innerHTML);
    localStorage.setItem('minutes', minutesLabel.innerHTML);
    var totalSeconds = +minutesLabel.innerHTML * 60 + +secondsLabel.innerHTML
    if (gGame.secsPassed > 0) {
        if (totalSeconds < gGame.secsPassed)
            gGame.secsPassed = +localStorage.getItem('minutes', minutesLabel.innerHTML) * 60 + +localStorage.getItem('seconds', secondsLabel.innerHTML)
        createRecord()
    }
}

function createRecord() {
    var record = document.querySelector('.best')
    var minutes = pad(parseInt(gGame.secsPassed / 60))
    var seconds = pad(gGame.secsPassed % 60);
    record.innerHTML = "Best Time Record: " + minutes + ":" + seconds
}

function expandShown(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (i === cellI && j === cellJ) continue;
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
                gBoard[i][j].isShown = true;
                gGame.shownCount++
                if (gBoard[i][j].minesAroundCount === 0) expandShown(i, j)
            }
        }
    }

}
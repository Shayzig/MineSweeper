


var gLevel = {
    size: 4,
    mine: 0
}

var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secPassed: 0,
    life: 3
}

var gUserName
var gScore = 0
var gisHintOn = false
var gHintCount = 4
var gIsMarked = false
var timerInterval

const MINE = '💣'
const MARKED = '🎁'




//---------------foundtion-------------------------------

function chooseDif(diff) {
    gLevel.size = diff
    gLevel.mine = Math.floor((diff ** 2) / 3)
    clearInterval(timerInterval)
    gGame.isOn = true
    handleDiffList(diff)

    onInit()
}

function onInit() {
    gBoard = buildBoard(gLevel.size)
    renderBoard(gBoard)
    rightClick()
    clearInterval(timerInterval)
    clearTimer()

    // deleteScores()

    const elBtn = document.querySelector('.restart h1')
    elBtn.innerText = '😃'

    gGame.secPassed = 0
    gGame.shownCount = 0
    gGame.isMarked = 0
    gGame.markedCount = 0
    gScore = 0

    gGame.life = 3
    const elLife = document.querySelector('.life')
    elLife.innerText = '🛟🛟🛟'

    turnOfLights()

}

function buildBoard(size) {
    var board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                content: '',
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j]
            var className = `cell cell-${i}-${j}`
            strHTML += `
     <td title="${i},${j}" onclick="onCellClicked(${i},${j},this)" class="${className}"></td>`
        }
        strHTML += '</tr>'
    }
    document.querySelector('table').innerHTML = strHTML
}

//---------------------Clicks--------------------------

function onCellClicked(i, j, elCell) {
    var cell = gBoard[i][j];
    if (gGame.isOn) {
        if (gGame.shownCount === 0) {
            handleFirstClick(i, j, elCell)
            gScore++
        }

        if (!cell.isShown) {
            if (gisHintOn) {
                revealNegs(i, j, elCell);
                setTimeout(hideNegs, 1000, i, j, elCell)
                gisHintOn = false
            } else {
                if (cell.isMine) {
                    handleMine(elCell);
                    return;
                }

                var minesAroundCell = countMinesAround(gBoard, i, j);
                if (minesAroundCell === 0) {
                    expandShown(gBoard, i, j, elCell);
                }
                cell.isShown = true;

                gGame.shownCount++;
                gScore++

                elCell.innerText = minesAroundCell;

                checkGameOver();
            }
        }
    }
}

function rightClick() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            const element = document.querySelector(`.cell-${i}-${j}`)
            element.addEventListener('contextmenu', function (event) {
                event.preventDefault();
                onCellMarked(this)
            });
        }
    }
}

function onCellMarked(elCell) {
    var pos = getPos(elCell);
    var cell = gBoard[pos[1]][pos[2]];

    if (gGame.markedCount === 0) startTimer();

    if (cell.isMarked) {
        cell.isMarked = false;
        elCell.innerText = '';
        gGame.markedCount--;
        // console.log('gGame.markedCount', gGame.markedCount)
    } else {
        cell.isMarked = true;
        elCell.innerText = MARKED;
        gGame.markedCount++;
        // console.log('gGame.markedCount', gGame.markedCount)
    }
    checkGameOver();
}

function expandShown(board, rowIdx, colIdx, elCell) {

    elCell.innerText = ''
    elCell.style.backgroundColor = '#34537d'

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (i === rowIdx && j === colIdx) continue;

            var cell = board[i][j];
            if (!cell.isShown && !cell.isMine && !cell.isMarked) {

                cell.isShown = true;
                gGame.shownCount++;

                var mineNegs = countMinesAround(board, i, j);
                elCell = document.querySelector(`.cell-${i}-${j}`);

                elCell.innerText = mineNegs;
                gScore++

                if (cell.minesAroundCount === 0) {
                    expandShown(board, i, j, elCell);
                }
            }
        }
    }
}

//-----------------------Mines----------------------------

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j]
            // console.log('i:', i , 'j:', j)
            var mineNegs = countMinesAround(gBoard, i, j)
            // console.log('i:', i , 'j:', j , 'mineNegs:' ,mineNegs)
            cell.minesAroundCount = mineNegs
            // cell.content = mineNegs
        }
    }
}

function countMinesAround(board, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue

            var cell = board[i][j]
            if (cell.isMine) count++
        }
    }
    return count
}

function addRandomMines() {
    for (var i = 0; i <= gLevel.mine; i++) {
        const emptyPos = getEmptyPos(gBoard)
        if (!emptyPos) return

        //model
        gBoard[emptyPos.i][emptyPos.j].isMine = true
    }
}

//-------------------Check & Update--------------------------------
function checkGameOver() {
    if (gGame.shownCount === (gLevel.size ** 2) - gLevel.mine && gGame.markedCount === gLevel.mine) {
        clearInterval(timerInterval)
        gameOver('You Win!')
        gUserName = prompt('What is your name?')
        saveScoreWithName(gUserName, gScore)
    }
}

function gameOver(msg) {
    clearInterval(timerInterval)
    gGame.shownCount = 0
    gGame.isMarked = 0
    openModal(msg)
    gGame.isOn = false
}

function updateLife() {
    const elLife = document.querySelector('.life')
    if (gGame.life === 2) elLife.innerText = '🛟🛟'
    if (gGame.life === 1) elLife.innerText = '🛟'
    if (gGame.life === 0) {
        elLife.innerText = ''
        gameOver('You Lost!')
        gUserName = prompt('What is your name?')
        saveScoreWithName(gUserName, gScore)
    }
}

function restart() {
    // console.log('gLevel.size', gLevel.size)
    switch (gLevel.size) {
        case 4:
            chooseDif(4)
            break;
        case 6:
            chooseDif(6)
            break;
        case 8:
            chooseDif(8)
            break;
    }
}

function sadBtn() {
    const elBtn = document.querySelector('.restart h1')
    elBtn.innerText = '🤯'
}

//--------Hints----------------------------

function onLightHint(elLight) {
    gisHintOn = true

    if (gisHintOn) {
        elLight.style.boxShadow = '0 0 15px yellow'
        gHintCount--
        // console.log('gHintCount', gHintCount)
        if (gHintCount <= 0) {
            return gisHintOn = false
        }
    }
}

function revealNegs(rowIdx, colIdx, elCell) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue

            var mineNegs = countMinesAround(gBoard, i, j);
            elCell = document.querySelector(`.cell-${i}-${j}`);
            elCell.innerText = mineNegs;
        }
    }
}

function hideNegs(rowIdx, colIdx, elCell) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = gBoard[i][j]
            if (cell.isShown) continue
            elCell = document.querySelector(`.cell-${i}-${j}`);
            elCell.innerText = '';
            if (cell.isMarked) elCell.innerText = MARKED
        }
    }
}

//---------Handle--------------------------

function handleFirstClick(i, j, elCell) {
    var cell = gBoard[i][j]
    buildBoard(gBoard)

    cell.isShown = true

    addRandomMines(gBoard)
    setMinesNegsCount(gBoard)
    elCell.innerText = cell.minesAroundCount

    gGame.shownCount++

    var minesAroundCell = countMinesAround(gBoard, i, j);
    if (minesAroundCell === 0) {
        expandShown(gBoard, i, j, elCell);
    }
    startTimer()
}

function handleMine(elCell) {
    elCell.innerText = MINE
    gGame.life--
    if (gGame.life === 0) sadBtn()
    updateLife()
}

function handleDiffList(diff) {
    const elEasyList = document.querySelector('#easy-scores-list')
    const elMedList = document.querySelector('#med-scores-list')
    const elHardList = document.querySelector('#hard-scores-list')

    if (diff === 4) {
        elEasyList.style.display = 'inline'
        elMedList.style.display = 'none'
        elHardList.style.display = 'none'
    } else if (diff === 6) {
        elEasyList.style.display = 'none'
        elMedList.style.display = 'inline'
        elHardList.style.display = 'none'
    } else {
        elEasyList.style.display = 'none'
        elMedList.style.display = 'none'
        elHardList.style.display = 'inline'
    }
}

function checkLists() {
    if (gLevel.size === 4) {
        gUserName = prompt('What is your name?')
        saveScoreWithName(gUserName, gScore)
    } else if (gLevel.size === 6) {
        gUserName = prompt('What is your name?')
        saveScoreWithName(gUserName, gScore)
    } else {
        gUserName = prompt('What is your name?')
        saveScoreWithName(gUserName, gScore)
    }
}

function turnOfLights() {
    for (var i = 1; i <= 3; i++) {
        const elLight = document.querySelector(`.hint${i}`)
        elLight.style.boxShadow = 'none'
    }
}
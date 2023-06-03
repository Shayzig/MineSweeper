


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
var gSortedPosMegaHint
var isMegaHint = false
var gClicksCounter = 0
var gMegaHintAmount = 1
var gMegaHints = [
    { i: 1, j: 4, elCell: 'elCell' },
    { i: 2, j: 3, elCell: 'elCell' },
    { i: 3, j: 2, elCell: 'elCell' },
    { i: 4, j: 1, elCell: 'elCell' },
]

var gCountSafeClick = 3
var isSafeClickOn = true

var gIsDarkMode = false

var gUserName
var gScore = 0
var gisHintOn = false
var gHintCount = 4
var gIsMarked = false
var timerInterval

var gIsFirstClick = true
var gIsManualMode = false

var gMineCells = []
var gMinesCount = 0

const MINE = '💣'
const MARKED = '🎁'

var gameStateStack = []

// var isExpandShown = false
// var gExpandCounter = 1

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

    gIsFirstClick = true

    gMineCells = []
    gMinesCount = 0

    const elHints = document.querySelectorAll('.hint1, .hint2, .hint3');
    elHints.forEach(hint => {
        hint.style.boxShadow = '0 0 0px black';
    });

    gameStateStack = []

    // isExpandShown = false
    // gExpandCounter = 0

    gCountSafeClick = 3
    const elCount = document.querySelector('.safe-btn p span')
        elCount.innerText = gCountSafeClick

    isMegaHint = false
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

    if (isMegaHint) {
        if (gClicksCounter < 4) {
          gMegaHints[gClicksCounter].i = i;
          gMegaHints[gClicksCounter].j = j;
          elCell.innerText = '';
          elCell.style.backgroundColor = 'blue'
          setTimeout(() => {
            elCell.style.backgroundColor = '#dde6ed'
          }, 1000);
      
          gClicksCounter++;
          if (gClicksCounter === 4) {
            isMegaHint = false;
            console.log('isMegaHint', isMegaHint);
            gSortedPosMegaHint = sortIndex();
            revealMegaHint();
            gGame.isOn = false;
            setTimeout(hideMegaHint, 3000);
          }
        }
      }

    saveGameState(elCell, i, j)

    if (gGame.isOn && !gIsManualMode) {
        if (gIsFirstClick) {
            handleFirstClick(i, j, elCell)

            gIsFirstClick = false
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
                    isExpandShown = true
                    console.log('isExpandShown', isExpandShown)
                    console.log('gExpandCounter', gExpandCounter)

                } else {
                    cell.isShown = true;
                    gGame.shownCount++;
                    gScore++
                    elCell.innerText = minesAroundCell;
                    checkGameOver();
                }
            }
        }
    } else if (!gGame.isOn && gIsManualMode) {
        const elMinesLeft = document.querySelector('.mines-left')

        if (elCell.innerText === MINE) {
            return
        }
        elCell.innerText = MINE
        cell.isMine = true
        gMineCells.push(elCell)
        gMinesCount++
        elMinesLeft.innerText = gMinesCount

        if (gMinesCount === gLevel.mine) {
            gGame.isOn = true
            gIsManualMode = false
            gIsFirstClick = false

            setTimeout(() => {
                for (var i = 0; i < gMineCells.length; i++) {
                    gMineCells[i].innerText = ''
                }
            }, 2000);

            setMinesNegsCount(gBoard)

            const elDivider = document.querySelector('.divider')
            elDivider.style.display = 'none'

            const elMines = document.querySelector('.mines-left')
            elMines.style.display = 'none'


            const elMinesLeft = document.querySelector('.mines-total')
            elMinesLeft.style.display = 'none'


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

    gIsFirstClick = false

    var pos = getPos(elCell);

    saveGameState(elCell, +pos[1], +pos[2])
    console.log('gameStateStack', gameStateStack)

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

                gExpandCounter++

                saveGameState(elCell, i, j)

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

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) {
                const elCell = document.querySelector(`.cell-${i}-${j}`);
                elCell.innerText = MINE;
            }
        }
    }
}
//-------------------Check & Update--------------------------------
function checkGameOver() {
    if (gGame.shownCount === (gLevel.size ** 2) - gLevel.mine && gGame.markedCount === gLevel.mine) {
        clearInterval(timerInterval)
        gameOver('You Win!')

    }
}

function gameOver(msg) {
    clearInterval(timerInterval)
    openModal(msg)

    setTimeout(() => {
        gUserName = prompt('What is your name?')
        saveScoreWithName(gUserName, gScore)
    }, 1000);

    gGame.isOn = false
}

function updateLife() {
    const elLife = document.querySelector('.life')
    if (gGame.life === 3) elLife.innerText = '🛟🛟🛟'
    if (gGame.life === 2) elLife.innerText = '🛟🛟'
    if (gGame.life === 1) elLife.innerText = '🛟'
    if (gGame.life === 0) {
        elLife.innerText = ''
        revealMines()
        gameOver('You Lost!')
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
        isExpandShown = true
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


//------------Features---------------------

function onSafeClick() {

    if (isSafeClickOn) {

        var randRow, randCol, cell;

        do {
            randRow = getRandomInt(0, gLevel.size);
            randCol = getRandomInt(0, gLevel.size);
            cell = gBoard[randRow][randCol];

        } while (cell.isMine || cell.isShown);

        const elCell = document.querySelector(`.cell-${randRow}-${randCol}`);
        var cellContent = countMinesAround(gBoard, randRow, randCol);
        elCell.innerText = cellContent;

        cell.isShown = true

        setTimeout(() => {
            elCell.innerText = ''
            cell.isShown = false
        }, 2000);

        gCountSafeClick--
        const elCount = document.querySelector('.safe-btn p span')
        elCount.innerText = gCountSafeClick

        if (gCountSafeClick === 0) isSafeClickOn = false

    }
}


function activeManuallyMode() {
    if (gIsFirstClick) {
        gGame.isOn = false

        gIsManualMode = true

        const elMinesTotal = document.querySelector('.mines-total')
        elMinesTotal.innerText = gLevel.mine

        const elDivider = document.querySelector('.divider')
        elDivider.style.display = 'inline'

        const elMines = document.querySelector('.mines-left')
        elMines.style.display = 'inline'
        elMines.innerText = gMinesCount

        const elMinesLeft = document.querySelector('.mines-total')
        elMinesLeft.style.display = 'inline'
        elMinesLeft.innerText = gLevel.mine

    }

}

function saveGameState(elCell, i, j) {

    if (gisHintOn) return

    gameState = {
        elCell: elCell,
        i: i,
        j: j
    }

    gameStateStack.push(gameState)
}

function undoGameState() {
    if (gameStateStack.length >= 1) {

        const prevState = gameStateStack[gameStateStack.length - 1] // object {td.cell.cell-0-0, i:0 j:0}
        gameStateStack.pop()

        var elCell = prevState.elCell
        var cell = gBoard[prevState.i][prevState.j]

        elCell.innerText = ''
        elCell.style.backgroundColor = '#dde6ed'
        cell.isShown = false

        if (cell.isMine) {
            gGame.life++
            updateLife()
        }
    }
}


function darkMode(newStyle) {

    if (!gIsDarkMode) {
        const styleLink = document.getElementById('styleLink')
        styleLink.href = newStyle
        gIsDarkMode = true
    } else if (gIsDarkMode) {
        const styleLink = document.getElementById('styleLink')
        styleLink.href = 'css/style.css'
        gIsDarkMode = false
    }
}

function megaHint(elCell) {
    if(gMegaHintAmount === 1) {

        isMegaHint = true
        gGame.isOn = false
        gMegaHintAmount--
    }


}

function revealMegaHint() {

    for (var i = gSortedPosMegaHint.lowestI; i <= gSortedPosMegaHint.highestI; i++) {
        for (var j = gSortedPosMegaHint.lowestJ; j <= gSortedPosMegaHint.highestJ; j++) {
            
            var mineNegs = countMinesAround(gBoard, i, j);
            elCell = document.querySelector(`.cell-${i}-${j}`);
            elCell.innerText = mineNegs;
        }
    }
}


function sortIndex() {
    let lowestI = gMegaHints[0].i;
    let highestI = gMegaHints[0].i;
    let lowestJ = gMegaHints[0].j;
    let highestJ = gMegaHints[0].j;

    for (let i = 1; i < gMegaHints.length; i++) {
        const hint = gMegaHints[i];

        if (hint.i < lowestI) {
            lowestI = hint.i;
        }
        if (hint.i > highestI) {
            highestI = hint.i;
        }
        if (hint.j < lowestJ) {
            lowestJ = hint.j;
        }
        if (hint.j > highestJ) {
            highestJ = hint.j;
        }
    }

    return {
        'lowestI': lowestI,
        'highestI': highestI,
        'lowestJ': lowestJ,
        'highestJ': highestJ,
    };
}


function hideMegaHint () {
    for (var i = gSortedPosMegaHint.lowestI; i <= gSortedPosMegaHint.highestI; i++) {
        for (var j = gSortedPosMegaHint.lowestJ; j <= gSortedPosMegaHint.highestJ; j++) {
            if (gBoard[i][j].isShown) continue
            
            elCell = document.querySelector(`.cell-${i}-${j}`);
            elCell.innerText = '';
        }
    }

    gGame.isOn = true
}

// var gExterminatorCounter = 0
// var gIsExterminatorOn = true
// function exterminator() {
//     if (gIsExterminatorOn ) {
        

//         var randRow, randCol, cell;

//         do {
//             randRow = getRandomInt(0, gLevel.size);
//             randCol = getRandomInt(0, gLevel.size);
//             cell = gBoard[randRow][randCol];

//             console.log('randRow', randRow)
//             console.log('randCol', randCol)

//         } while (gExterminatorCounter !==3);
//         console.log('cell', cell)
//         gExterminatorCounter++
//         console.log('gExterminatorCounter', gExterminatorCounter)

//     }
    
// }
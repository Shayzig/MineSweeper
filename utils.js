function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min //The maximum is inclusive and the minimum is inclusive
}

function getEmptyPos(board) {
    const emptyPoss = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isShown) {
                emptyPoss.push({ i, j })
            }
        }
    }
    var randIdx = getRandomInt(0, emptyPoss.length)
    return emptyPoss[randIdx]
}

function startTimer() {
    const elTimer = document.getElementById('timer');
    elTimer.style.display = 'block'
    timerInterval = setInterval(updateTimer, 10);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateTimer() {
    const elTimer = document.getElementById('timer');
    gGame.secPassed += 0.01;
    elTimer.textContent = gGame.secPassed.toFixed(2);
}

function clearTimer() {
    document.getElementById('timer').textContent = (0 / 1000).toFixed(2)
}

function openModal(msg) {
    const elModal = document.querySelector('.modal')
    const elMsg = elModal.querySelector('.msg')
    elMsg.innerText = msg
    elModal.style.display = 'block'
}

function closeModal() {
    const elModal = document.querySelector('.modal')
    elModal.style.display = 'none'
    chooseDif(gLevel.size)
}

function getPos(element) {
    // console.log('element', element)
    // var res = []
    var str = element.classList[1]
    // console.log('str', str)
    var locationArray = str.split('-')
    // console.log('locationArray', locationArray)
    return locationArray

}


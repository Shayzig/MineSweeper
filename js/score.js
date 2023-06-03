
function saveScoreWithName(name, score) {

    if (gLevel.size === 4) {
        let scores = JSON.parse(localStorage.getItem('easy-scores')) || [];
        scores.push({ name, score });
        localStorage.setItem('easy-scores', JSON.stringify(scores));
        updateScoresList();
    } else if (gLevel.size === 6) {
        let scores = JSON.parse(localStorage.getItem('med-scores')) || [];
        scores.push({ name, score });
        localStorage.setItem('med-scores', JSON.stringify(scores));
    } else if (gLevel.size === 8) {
        let scores = JSON.parse(localStorage.getItem('hard-scores')) || [];
        scores.push({ name, score });
        localStorage.setItem('hard-scores', JSON.stringify(scores));
    }
    updateScoresList(gLevel.size);
}

function updateScoresList(size) {

    if (size === 4) {
        const scoresList = document.getElementById('easy-scores-list')
        scoresList.innerHTML = ''
        const scores = JSON.parse(localStorage.getItem('easy-scores')) || []
        scores.sort((a, b) => b.score - a.score)
        for (const { name, score } of scores) {
            const listItem = document.createElement('li')
            listItem.textContent = `${name}: ${score}`
            scoresList.appendChild(listItem)
        }
    } else if (size === 6) {
        const scoresList = document.getElementById('med-scores-list')
        scoresList.innerHTML = '';
        const scores = JSON.parse(localStorage.getItem('med-scores')) || []
        scores.sort((a, b) => b.score - a.score)
        for (const { name, score } of scores) {
            const listItem = document.createElement('li')
            listItem.textContent = `${name}: ${score}`
            scoresList.appendChild(listItem);
        }
    } else if (size === 8) {
        const scoresList = document.getElementById('hard-scores-list')
        scoresList.innerHTML = '';
        const scores = JSON.parse(localStorage.getItem('hard-scores')) || []
        scores.sort((a, b) => b.score - a.score)
        for (const { name, score } of scores) {
            const listItem = document.createElement('li')
            listItem.textContent = `${name}: ${score}`
            scoresList.appendChild(listItem);
        }
    }
}

function deleteScores() {
   
      localStorage.removeItem('easy-scores');
      const scoresList1 = document.getElementById('easy-scores-list');
      scoresList1.innerHTML = '';
 
      localStorage.removeItem('med-scores');
      const scoresList2 = document.getElementById('med-scores-list');
      scoresList2.innerHTML = '';
    
      localStorage.removeItem('hard-scores');
      const scoresList3 = document.getElementById('hard-scores-list');
      scoresList3.innerHTML = '';
    
  }
  

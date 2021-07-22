function initGame(data) {
    gameContainer.innerHTML = data.gameTemplate;

    gameUsers = document.querySelector('.game-container > .game > .participants');
    gameResults = document.querySelector('.game-container > .game > .results');
    gameCards = document.querySelector('.game-container > .cards');

    populateCards();

    if(data.room.revealed) {
        countResults(data.room);
    }

    socket.on('leader-change', data => {
        populateUsers(data)
    })

    socket.on('user-vote', data => {
        populateUsers(data);
    });

    socket.on('result-reveal', data => {
        gameResults.innerHTML = '';
        populateUsers(data);
        countResults(data);
    })

    socket.on('result-reset', data => {
        gameResults.innerHTML = '';
        populateUsers(data);
    })
}

function countResults(data) {
    gameResults.innerHTML = '';
    let count = {
        nv: 0
    }

    data.users.forEach(({ vote }) => {
        if (!count[vote]) {
            count[vote] = 0;
        }
        if (!vote) {
            count['nv'] += 1;
            return;
        }
        count[vote] += 1;
    });

    gameResults.innerHTML += `<h3>Results:</h3>`
    if (count.nv == 0) {
        delete count.nv;
    }
    Object.keys(count).forEach(c => {
        let voteName = c;

        if (c ==  'doubt') {
            voteName = '?'
        }

        if (c == 'nv' || !c) {
            return;
        }

        let picLink = '';
        
        picLink = cardList[c] ? cardList[c].picture : '';
        
        let imgString = '';

        for (let i = 0; i < count[c]; i++) {
            imgString += `<img src="${picLink ? picLink : '/cards/nv.png'}" />`
        }
        console.log(imgString);

        gameResults.innerHTML += `<div class="result">
                                    <div>
                                    <span>${voteName}: </span>
                                    <span>${count[c]}</span>
                                    </div>
                                    ${imgString}
                                    </div>`
    })
}


function sendVote(e) {
    socket.emit('user-vote', {
        ...currentUser,
        vote: e
    });
}

function revealVotes() {
    socket.emit('result-reveal', currentUser);
}

function resetVotes() {
    socket.emit('result-reset', currentUser);
}

function populateCards() {
    const cards = Object.keys(cardList);

    cards.forEach(c => {
        const card = cardList[c];
        const cardNumber = c == 'doubt' ? '?' : c;
        gameCards.innerHTML += `<div class="card" id="${c}" onclick="sendVote('${c}')">
                                    <div class="number">
                                        <span>${cardNumber}</span>
                                        <span>${card.icon}</span>
                                    </div>
                                    <img  class="picture" src="${card.picture}">
                                    <div class="number">
                                        <span>${card.icon}</span>
                                        <span>${cardNumber}</span>
                                    </div>
                                </div>`
    });
}
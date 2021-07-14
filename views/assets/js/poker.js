const socket = io();
const urlSearchParams = new URLSearchParams(window.location.search);
const urlQuery = Object.fromEntries(urlSearchParams.entries());
const statusContainer = document.querySelector('.status-container');
const chatContainer = document.querySelector('.chat-container');
const gameContainer = document.querySelector('.game-container');
const authContainer = document.querySelector('.auth-container');

const cardList = (() => {
    const cardVotes = ['1', '2', '3', '5', '8', '13', '21', '34', '55', '89', 'doubt'];
    const cardIcons = ['♠️', '♥️', '♣️', '♦️'];
    let list = {};

    cardVotes.forEach(vote => {
        list[vote] = {
            picture: `/cards/${vote}.png`,
            icon: cardIcons[Math.floor(Math.random() * 4)]
        }
    })

    return list;
})();

chatContainer.style = "display: none";
let userform = undefined;
let gameUsers = undefined;
let gameResults = undefined;
let messageBox = undefined;
let chatForm = undefined;
let username = undefined;
let currentUser = undefined;

let { room, pwd } = urlQuery;

function alert(message) {
    statusContainer.innerHTML = message;
    statusContainer.style = "";
    setTimeout(() => {
        statusContainer.innerHTML = ``;
        statusContainer.style = "display: none";
    }, 2000);
}

socket.on('connect', function () {
    alert(`<span class="success">Connected.</span>`);

    socket.on('socket-connected', data => {
        loginInit(data);
    });

    socket.on('auth-fail', (data) => {
        alert(`<span class="error">${data.message}</span>`);
    });

    socket.on('disconnect', () => {
        window.location.reload();
    });

    socket.on('auth-success', (data) => {
        currentUser = data.user;
        initChat(data)
        initGame(data)
    });
});

function loginInit(data) {
    authContainer.innerHTML = data.loginTemplate
    userform = document.getElementById('userform');

    userform.onsubmit = (e) => {
        e.preventDefault();

        console.log(userform.username.value);
        username = userform.username.value;
        if (!username) {
            return;
        }
        socket.emit('auth', { name: userform.username.value, room, pwd });
    }
}

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

function initChat(data) {
    authContainer.remove();
    chatContainer.innerHTML = data.chatTemplate;
    chatContainer.style = "";
    messageBox = document.querySelector('.chat-container .messages')
    userList = document.querySelector('.participant-container > .participants')
    chatForm = document.querySelector('.chat-container .form')

    data.room.messages.forEach(m => {
        handleMessage(m);
    });

    chatForm.onsubmit = e => {
        e.preventDefault();
        let message = chatForm.message.value;
        if (!message) {
            return;
        }
        socket.emit('chat-message', { room, pwd, user: username, message });
        chatForm.message.value = '';
    }

    socket.on('chat-message', data => {
        handleMessage(data);
    })

    socket.on('user-new', data => {
        populateUsers(data);
    })
    socket.on('user-disconnect', data => {
        populateUsers(data);
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

function populateUsers(data) {
    if (userList) {
        userList.innerHTML = '';
    }

    if (gameUsers) {
        gameUsers.innerHTML = '';
    }

    data.users.forEach(u => {
        if (userList) {
            userList.innerHTML += `<div class="user-container"><span class="icon">${u.leader ? '👑' : '👤'}</span><span class="name">${u.name}</span></div>`
        }

        if (gameUsers) {
            const reveal = u.vote && data.revealed;
            let card = undefined;
            if (reveal) {
                card = cardList[u.vote]
            }
            const vote = u.vote == 'doubt' ? '?' : u.vote;
            gameUsers.innerHTML += `<div class="user user-${u.id}">
                                        <div class="icon">${u.leader ? '👑' : '👤'}</div>
                                        <div class="name">${u.name}</div>
                                        <div class="vote">${reveal ? `<div class="uncovered"><p>${vote}</p><img src="${card.picture}"/></div>` : u.voted ? `<div class="covered"><span>❓</span></div>` : ''}</div>
                                    </div>`
        }
    });
}

function handleMessage(data) {
    switch (data.type) {
        case 'user':
            messageBox.innerHTML += `<div class="message-container"><span class="icon">▶</span><span class="user">${data.user}:</span><span class="message">${data.message}</span></div>`;
            break;
        case 'status':
            messageBox.innerHTML += `<div class="message-container"><span class="status">${data.message}</span></div>`;
            break;
        default:
            console.error('Wrong message type');
            break;
    }
}

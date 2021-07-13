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
let messageBox = undefined;
let chatForm = undefined;
let username = undefined;
let connectedUsers = [];

let { room, pwd } = urlQuery;

socket.on('connect', function () {
    statusContainer.innerHTML = `<span class="success">Connected.</span>`;
    setTimeout(() => {
        statusContainer.innerHTML = ``;
        statusContainer.style = "display: none";
    }, 2000);

    socket.on('socket-connected', data => {
        loginInit(data);
    });

    socket.on('auth-fail', (data) => {
        statusContainer.style = "";
        statusContainer.innerHTML = `<span class="error">${data.message}</span>`
    });

    socket.on('disconnect', () => {
        window.location.reload();
        statusContainer.style = "";
        statusContainer.innerHTML = `<span class="error">Socket is disconnected, retrying...</span>`
    });

    socket.on('auth-success', (data) => {
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
    gameCards = document.querySelector('.game-container > .cards');

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


function populateUsers(data) {
    userList.innerHTML = '';
    connectedUsers = data.users;
    data.users.forEach(u => {
        if (userList) {
            userList.innerHTML += `<div id="${u.id}" class="user-container"><span class="icon">${u.leader  ? '👑' : '👤'}</span><span class="name">${u.name}</span></div>`
        }

        if(gameUsers) {
            gameUsers.innerHTML += `<div class="user">
                                        <div class="icon">${u.leader  ? '👑' : '👤'}</div>
                                        <div class="name">${u.name}</div>
                                        <div class="vote">${u.vote}</div>
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

function sendVote(e) {
    console.log(e);
}
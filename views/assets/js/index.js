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



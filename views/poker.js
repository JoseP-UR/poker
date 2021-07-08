const socket = io();
const urlSearchParams = new URLSearchParams(window.location.search);
const urlQuery = Object.fromEntries(urlSearchParams.entries());
const userform = document.getElementById('userform');
const statusContainer = document.querySelector('.status-container');
const chatContainer = document.querySelector('.chat-container');
chatContainer.style = "display: none";
let messageBox = undefined;
let chatForm = undefined;
let username = undefined;
let connectedUsers = [];

let {room, pwd} = urlQuery;

socket.on('connect', function() {
    console.log('connected');

    socket.on('auth-fail', (data) => {
        statusContainer.innerHTML = `<span class="-error">${data.message}</span>`
    });

    socket.on('auth-success', (data) => {
        console.log(data);
        chatInit(data)
    })
});


userform.onsubmit = (e) => {
    e.preventDefault();

    console.log(userform.username.value);
    username = userform.username.value;
    if (!username) {
        return;
    }
    console.log(location);
    socket.emit('auth', {name: userform.username.value, room, pwd});
}


function chatInit(data) {
    userform.remove();
    chatContainer.innerHTML = data.template
    chatContainer.style = "";
    messageBox = document.querySelector('.chat-container .-messages')
    userList = document.querySelector('.participant-container > .-participants')
    chatForm = document.querySelector('.chat-container .-form')

    data.room.messages.forEach(m => {
        handleMessage(m);
    });
    
    chatForm.onsubmit = e => {
        e.preventDefault();
        let message = chatForm.message.value;
        if (!message) {
            return;
        }
        socket.emit('chat-message', {room, pwd, user: username, message});
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
    data.users.forEach(u => {
        userList.innerHTML += `<div id="${u.id}" class="user-container"><span class="-icon">👤</span><span class="-name">${u.name}</span></div>`
    });
}

function handleMessage(data) {
    switch (data.type) {
        case 'user':
            messageBox.innerHTML += `<div class="message-container"><span class="-icon">▶</span><span class="-user">${data.user}:</span><span class="-message">${data.message}</span></div>`;
        break;
        case 'status':
            messageBox.innerHTML += `<div class="message-container"><span class="-status">${data.message}</span></div>`;
        break;
        default:
            console.error('Wrong message type');
        break;
    }
}
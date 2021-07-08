const socket = io();
const urlSearchParams = new URLSearchParams(window.location.search);
const urlQuery = Object.fromEntries(urlSearchParams.entries());
const userform = document.getElementById('userform');
const statusContainer = document.querySelector('.status-container');
const chatContainer = document.querySelector('.chat-container');
let messageBox = undefined;
let chatForm = undefined;
let username = undefined;

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
    
    console.log(location);
    socket.emit('auth', {name: userform.username.value, room, pwd});
}


function chatInit(data) {
    userform.remove();
    chatContainer.innerHTML = data.template
    messageBox = document.querySelector('.chat-container .-messages')
    chatForm = document.querySelector('.chat-container .-form form')
    
    chatForm.onsubmit = e => {
        e.preventDefault();
        let message = chatForm.message.value;

        socket.emit('chat-message', {room, pwd, user: username, message});
    }

    socket.on('chat-message', data => {
        messageBox.innerHTML += `<div class="message-container"><span class="-user">${data.user}:</span><span class="-message">${data.message}</span></div>`;
    })
}
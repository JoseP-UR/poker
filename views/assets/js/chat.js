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

    messageBox.scrollTop = messageBox.scrollHeight;
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

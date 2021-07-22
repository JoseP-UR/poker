
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
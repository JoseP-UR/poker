module.exports = (pwd) => {
    return {
        users: [],
        pwd,
        created: new Date().getTime(),
        messages: []
    }
}
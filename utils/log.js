module.exports = (message, type = "log") => {
    //get current date dd-mm-yyyy hh:mm:ss
    var date = new Date();
    var dateFormat = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    if (type == 'error'){
        console.error(dateFormat + ' - ' + message);
    }
    console.log(`${dateFormat} - ${message}`)
};

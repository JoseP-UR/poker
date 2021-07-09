const {writeFileSync} = require('fs');
const {resolve} = require('path');

module.exports = (rooms) => {
    writeFileSync(resolve(__dirname, '../rooms.json'), JSON.stringify(rooms));
}
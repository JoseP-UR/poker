const { readFileSync } = require('fs');
const { resolve } = require('path');
module.exports = () => {
    return JSON.parse(readFileSync(resolve(__dirname, '../rooms.json')));
}

const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');
module.exports = () => {
    try {
        return JSON.parse(readFileSync(resolve(__dirname, '../rooms.json')));
    } catch(e) {
        writeFileSync(resolve(__dirname, '../rooms.json'), "{}");
        return {}
    }
}

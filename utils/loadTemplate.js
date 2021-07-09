const { readFileSync, read } = require('fs');
const {resolve} = require('path');

module.exports = (template) => {
    return readFileSync(resolve(__dirname, `../views/templates/${template}.html`), { encoding: 'utf-8'});
}
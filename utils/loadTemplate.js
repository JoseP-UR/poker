const { readFileSync, read } = require('fs');
const { resolve } = require('path');

module.exports = (template) => {
    try {
        const templateHtml = readFileSync(resolve(__dirname, `../views/templates/${template}.html`), { encoding: 'utf-8' });
        return templateHtml;
    } catch(e) {
        return `<span class="-error">${template} is currently Unavailable</span>`;
    }
}
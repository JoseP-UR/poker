const sanitizeHtml = require('sanitize-html');

const allowedTags = ["a", "abbr", "b", "i", "s", "span", "strong", "u", "img"];

module.exports = (html) => {
    const options = { allowedTags };

    return sanitizeHtml(html, options);
}
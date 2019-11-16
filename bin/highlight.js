function highlight(text) {
    return `\x1b[36m${text}\x1b[0m`;
}

module.exports = { highlight }
const mammoth = require('mammoth');

async function parseDOC(filePath) {
    const data = await mammoth.extractRawText({ path: filePath });
    return data.value;
}

module.exports = { parseDOC };
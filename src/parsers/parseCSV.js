const fs = require('fs');
const { parse } = require('csv-parse');

async function parseCSV(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    return new Promise((resolve, reject) => {
        parse(data, { delimiter: ',' }, (err, records) => {
            if (err) return reject(err);
            const text = records.map(row => row.join(', ')).join('\n');
            resolve(text);
        });
    });
}

module.exports = { parseCSV };
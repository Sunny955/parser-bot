require("dotenv").config();
const { Client, IntentsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const https = require('https');

const { parseCSV } = require("./parsers/parseCSV");
const { parseDOC } = require("./parsers/parseDOC")
const { parsePDF } = require("./parsers/parsePDF")

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.GuildEmojisAndStickers,
        IntentsBitField.Flags.GuildMessageReactions,
    ],
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) {
        return;
    }

    if (message.content === "/parser" && message.attachments.size > 0) {
        const attachment = message.attachments.first();
        const filePath = path.join(__dirname, attachment.name);

        const file = fs.createWriteStream(filePath);
        https.get(attachment.url, (response) => {
            response.pipe(file);

            file.on('finish', async () => {
                file.close();

                const fileExtn = path.extname(attachment.name).toLowerCase();
                let textContent = '';

                try {
                    switch (fileExtn) {
                        case '.pdf':
                            textContent = await parsePDF(filePath);
                            break;
                        case '.doc':
                        case '.docx':
                            textContent = await parseDOC(filePath);
                            break;
                        case '.csv':
                            textContent = await parseCSV(filePath);
                            break;
                        default:
                            message.channel.send('Unsupported file format!');
                            fs.unlinkSync(filePath);
                            return;
                    }

                    const outputFilePath = filePath.replace(fileExtn, '.txt');
                    fs.writeFileSync(outputFilePath, textContent);

                    await message.channel.send({
                        content: 'Here is your converted file:',
                        files: [outputFilePath]
                    });

                    fs.unlinkSync(filePath);
                    fs.unlinkSync(outputFilePath);

                } catch (error) {
                    console.error(error);
                    message.channel.send('An error occurred while processing the file.');
                }

            })
        })
    }
});


client.login(process.env.TOKEN);



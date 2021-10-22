/* 
  CODINGHELP BOT
  USING DISCORD.JS V13.1.0
*/
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES
  ],
});
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');

// configurations
const config = require('./config/config.json');
const bot = require('./config/bot.json');
client.commands = new Discord.Collection();
client.slashCommands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

console.log('|-----------------------------------|');
console.log('     Loading Command Files...        ');
console.log('|-----------------------------------|');
function readFilesFromPath(pathString) {
  const directoryEntries = fs.readdirSync(pathString, { withFileTypes: true });

  return directoryEntries.reduce((filteredEntries, dirEnt) => {
    if (dirEnt.isDirectory()) {
      // If the entry is a directory, call this function again
      // but now add the directory name to the path string.
      filteredEntries.push(...readFilesFromPath(`${pathString}/${dirEnt.name}`))
    } else if (dirEnt.isFile()) {
      // Check if the entry is a file instead. And if so, check
      // if the file name ends with `.js`.
      if (dirEnt.name.endsWith('.js')) {
        // Add the file to the command file array.
        filteredEntries.push(`${pathString}/${dirEnt.name}`);
      }
    }

    return filteredEntries;
  }, []);
}


// Call the read files function with the root folder of the commands and
// store all the file paths in the constant.
const commandFilePaths = readFilesFromPath('./commands');

// Loop over the array of file paths and set the command on the client.
commandFilePaths.forEach((filePath) => {
  const command = require(filePath);

  client.commands.set(command.name, command);
  console.log(command.name + ' loaded successfully!');
});


// create slash commands
let data = [];
console.log('|-----------------------------------|')
console.log('      Loading Slash Commands...      ')
console.log('|-----------------------------------|')
function readFilesFromPath(pathString) {
  const directoryEntries = fs.readdirSync(pathString, { withFileTypes: true });

  return directoryEntries.reduce((filteredEntries, dirEnt) => {
    if (dirEnt.isDirectory()) {
      // If the entry is a directory, call this function again
      // but now add the directory name to the path string.
      filteredEntries.push(...readFilesFromPath(`${pathString}/${dirEnt.name}`))
    } else if (dirEnt.isFile()) {
      // Check if the entry is a file instead. And if so, check
      // if the file name ends with `.js`.
      if (dirEnt.name.endsWith('.js')) {
        // Add the file to the command file array.
        filteredEntries.push(`${pathString}/${dirEnt.name}`);
      }
    }

    return filteredEntries;
  }, []);
}

const commandFilePaths1 = readFilesFromPath('./slashcommands');

commandFilePaths1.forEach((filePath) => {
  const cmd = require(filePath);

  let object = {};
  if (cmd.name) { object.name = cmd.name; }
  if (cmd.description) { object.description = cmd.description; }
  if (cmd.options) { object.options = cmd.options; }

  data.push(object);
  //client.commands.delete(cmd.name, cmd);
  client.slashCommands.set(cmd.name, cmd);
  console.log(cmd.name + ' loaded successfully!');
});




// events
console.log('|-----------------------------------|')
console.log('       Loading Event Files...        ')
console.log('|-----------------------------------|')
const eventFiles = fs.readdirSync(`${__dirname}/events`).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`${__dirname}/events/${file}`);
  if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
  else client.on(event.name, (...args) => event.execute(...args, client));
  console.log(event.name + ' loaded successfully!');
}


// end of file
(async () => {
  connection = await require('./database.js');
  await client.login(config.token);
  await client.guilds.cache.get(bot.serverId)?.commands.set(data);
})();
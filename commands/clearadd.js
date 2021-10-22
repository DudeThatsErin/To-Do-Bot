const Discord = require('discord.js');
const connection = require('../database.js');

module.exports = {
    name: 'clearadd',
    aliases: ['clear-add', 'no-additions', 'remove', 'noadditions', 'rem', 'noadd', 'no-add'],
    description: 'Clears the channel this is ran it and clears out the database.',
    usage: '++clearadd',
    note: '',
    userPerms: ['ADMINISTRATOR', 'MANAGE_CHANNELS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
    ownerOnly: 'yes',
    inHelp: 'yes',
    async execute(message, args, client) {
        const results = await connection.query(
            `select sum(cast(rowNo as unsigned)) as total from todo;`
        );
        const item = results[0][0].total;
        connection.query(
            `DELETE FROM todo`
        )
        message.channel.bulkDelete(99);
        message.author.send({ content: `I have deleted \`${item}\` items from the \`to do\` database and cleared \`99\` messages out of the channel.` });

    }
};
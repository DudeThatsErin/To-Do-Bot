const Discord = require('discord.js');
const connection = require('../database.js');

module.exports = {
    name: 'toadd',
    aliases: ['to-add', 'additions', 'add'],
    description: 'Pushes an embed to display in the channel telling Erin what she wants to add to the bot',
    usage: '++toadd Item to Add',
    note: '',
    userPerms: ['ADMINISTRATOR', 'MANAGE_CHANNELS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
    ownerOnly: 'yes',
    inHelp: 'yes',
    async execute(message, args, client) {

        const reason = args.slice(0).join(" ");
        if (!reason && !message.attachments.first()) return message.reply('Erin, you forgot to include a todo message. SMH');

        const id = message.id;
        const channel = client.channels.cache.find(channel => channel.id === '899175302385766420');
        const url = (message.attachments.first()?.url || 'no');

        connection.query(
            `INSERT INTO todo (messageId, message, attach) VALUES (?, ?, ?);`,
            [id, reason, url]
        );

        const results = await connection.query(
            `select sum(cast(rowNo as unsigned)) as total from todo;`
        );
        const item = results[0][0].total;

        let embed = new Discord.MessageEmbed()
            .setColor('#096F5C')
            .setTitle('NEW TO DO ITEM!')
            .setDescription(`${reason}\n\n**Any files uploaded?**\n${url}`)
            .setTimestamp()
            .setFooter(`This is item number ${item}`);
        message.react('👍');
        channel.send({ embeds: [embed] });

    }
};
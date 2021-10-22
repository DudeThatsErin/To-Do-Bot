const Discord = require('discord.js');
const connection = require('../database.js');

module.exports = {
    name: 'quicknotes',
    aliases: ['quickNotes', 'qn', 'newnote', 'quick-notes', 'quicknotes', 'quicknote', 'qns'],
    description: 'Pushes an embed to display in the channel about something .',
    usage: '++quicknotes Status Message',
    note: '',
    userPerms: ['ADMINISTRATOR', 'MANAGE_CHANNELS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
    ownerOnly: 'yes',
    inHelp: 'yes',
    async execute(message, args, client) {

        const reason = args.slice(0).join(" ");
        if (!reason && !message.attachments.first()) return message.reply('Erin, you forgot to include a \'quick note\' message. SMH');

        const id = message.id;
        const channel = client.channels.cache.find(channel => channel.id === '899174176676519937');
        const url = (message.attachments.first()?.url || 'no');

        connection.query(
            `INSERT INTO quickNotes (messageId, message, attach) VALUES (?, ?, ?, ?);`,
            [id, reason, url]
        );

        const results = await connection.query(
            `select sum(cast(rowNo as unsigned)) as total from quickNotes;`
        );
        const item = results[0][0].total;


        let embed = new Discord.MessageEmbed()
            .setColor('#6F0964')
            .setTitle('NEW NOTE!')
            .setDescription(`${reason}\n\n**Any files uploaded?**\n${url}`)
            .setTimestamp()
            .setFooter(`This is item number ${item}`);
        message.react('👍');
        channel.send({ embeds: [embed] });

    }
};
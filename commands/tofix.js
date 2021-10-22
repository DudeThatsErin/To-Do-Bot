const Discord = require('discord.js');
const connection = require('../database.js');

module.exports = {
    name: 'tofix',
    aliases: ['to-fix', 'fixthis', 'fix', 'fix-this'],
    description: 'Pushes an embed to display in the channel about something .',
    usage: '++bot-status Status Message',
    note: '',
    userPerms: ['ADMINISTRATOR', 'MANAGE_CHANNELS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
    ownerOnly: 'yes',
    inHelp: 'yes',
    async execute(message, args, client) {

        const reason = args.slice(0).join(" ");
        if (!reason && !message.attachments.first()) return message.reply('Erin, you forgot to include a \'to fix\' message. SMH');

        const id = message.id;
        const channel = client.channels.cache.find(channel => channel.id === '899175342772723742');
        const url = (message.attachments.first()?.url || 'no');

        connection.query(
            `INSERT INTO tofix (messageId, message, attach) VALUES (?, ?, ?);`,
            [id, reason, url]
        );

        const results = await connection.query(
            `select sum(cast(rowNo as unsigned)) as total from tofix;`
        );
        const item = results[0][0].total;


        let embed = new Discord.MessageEmbed()
            .setColor('#6F0964')
            .setTitle('NEW TO FIX ITEM!')
            .setDescription(`${reason}\n\n**Any files uploaded?**\n${url}`)
            .setTimestamp()
            .setFooter(`This is item number ${item}`);
        message.react('👍');
        channel.send({ embeds: [embed] });

    }
};
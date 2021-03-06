const config = require('../config/config.json');
const Discord = require('discord.js');
const ee = require('../config/embed.json');
const me = require('../config/owner.json');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isMessageComponent()) return;
        if (!interaction.isCommand()) return interaction.reply({ content: 'That is not a valid slash command.', ephemeral: true });
        if (!client.commands.has(interaction.commandName)) return;

        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return interaction.reply({ content: 'This command no longer exists.', ephemeral: true }) && client.commands.delete(interaction.commandName);

        // command cooldowns
        // NEED TO GET THIS WORKING.

        // actually running the commands.
        try {
            await interaction.deferReply({ ephemeral: true });
            await client.commands.get(interaction.commandName).execute(interaction, client);
        } catch (error) {
            console.error(error);
            const embed = new Discord.MessageEmbed()
                .setColor(ee.bad_color)
                .setTitle('Oh no! An _error_ has appeared!')
                .setDescription(`**Contact Bot Owner:** <@${me.id}>`)
                .addFields({
                    name: '**Error Name:**',
                    value: `\`${error.name}\``
                }, {
                    name: '**Error Message:**',
                    value: `\`${error.message}\``
                }, {
                    name: '**Error Location:**',
                    value: `\`${error.stack}\``
                }, {
                    name: '**Ways to Report:**',
                    value: `Run the \`${config.prefix}report\` command, [Fill out this form](https://codinghelp.site/contact-us/), Message her on Discord, or Email her at me@dudethatserin.site\n\nPlease include all of the information in this embed (message) as well as any additional information you can think to provide. Screenshots are also VERY helpful. Thank you!`
                })
                .setTimestamp()
                .setFooter(`Thanks for using ${client.user.tag}! I'm sorry you encountered this error!`, `${client.user.displayAvatarURL()}`);
            interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    }
};
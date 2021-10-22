const config = require('../config/config.json');
const Discord = require('discord.js');
const bot = require('../config/bot.json');
const me = require('../config/owner.json');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        //console.log(message)
        const { cooldowns } = client;
        let connection;


        if (message.author.bot) {
            //console.log('bot message');
            return;
        };
        if (!message.content.startsWith(config.prefix)) {
            //console.log('does not start with prefix.');
            return;
        };
        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        if (!command) return message.channel.send(`That command does not exist. Run \`${config.prefix}help\` to see all of my commands.`);
        //console.log(command);

        // owner only
        if (command.ownerOnly === 'yes') {
            if (!message.author.id === me.id) {
                return message.reply(`This is only a command Erin (<@${me.id}>) can use. If you are seeing this in error use the \`${config.prefix}report\` command.`);
            }
        }

        if (command.userPerms.length > 0) {
            let memberChannelPermissions = message.channel.permissionsFor(message.member);
            memberChannelPermissions = new Discord.Permissions(memberChannelPermissions.bitfield);
            if (!memberChannelPermissions.has(command.userPerms)) {
                let missingPermissions = command.userPerms.filter(perm => memberChannelPermissions.has(perm) === false).join(', ');
                let currentPermissions = command.botPerms.filter(perm => memberChannelPermissions.has(perm) === true).join(', ');
                console.error(`I can\'t execute this command, ${message.author.tag} with ID of ${message.author.id} is missing permissions these perms: ${missingPermissions}.\nThey currently have these perms: ${currentPermissions}.`);
                const userPermsEmbed = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Oh no! An _error_ has appeared!')
                    .setDescription(`**Contact Bot Owner:** <@${me.id}>`)
                    .addFields({
                        name: '**Error Name:**',
                        value: `\`MISSING PERMISSIONS\``
                    }, {
                        name: '**Error Message:**',
                        value: `${message.author.tag} is missing these permissions for this command:\n\`\`\`${missingPermissions}\`\`\``
                    }, {
                        name: '**Message That Triggered Error:**',
                        value: `\`\`\`Message Content: ${message.content}\nBy: ${message.author.tag} - ${message.author.id}\nLocated in the Channel: ${message.channel.name}\nChannel ID: ${message.channel.id}\nMessage ID: ${message.id}\`\`\``
                    }, {
                        name: `**${message.author.username}\'s Current Roles:**`,
                        value: `\`\`\`${currentPermissions}\`\`\``
                    }, {
                        name: '**Ways to Fix:**',
                        value: 'In order to resolve this error, a moderator needs to go into either this channel or their server\'s role settings and give you the permissions that she is stating you are missing above. If they aren\'t sure how to do that, you can give them [this link](https://support.discord.com/hc/en-us/articles/206029707-How-do-I-set-up-permissions-).'
                    }, {
                        name: '**Ways to Report:**',
                        value: `If you or the mods feel like you are still receiving this message in error. Please take screenshots of the permissions that are set for **${message.author.tag}** and use the options below to report the error to the developer.\nRun the \`${config.prefix}report\` command, [Join My Support Server](https://discord.gg/tT3VEW8AYF), [Fill out this form](https://codinghelp.site/contact-us/) (Erin owns CodingHelp so that form goes directly to her), Message her on Discord, or Email her at me@dudethatserin.site\n\nPlease include all of the information in this embed (message) as well as any additional information you can think to provide. Screenshots are also VERY helpful. Thank you!`
                    })
                    .setTimestamp()
                    .setFooter(`Thanks for using ${client.user.tag}! I'm sorry you encountered this error!`, `${client.user.displayAvatarURL()}`);
                client.users.cache.get(message.member.id).send(userPermsEmbed);
                message.react('❌');
                message.reply(`You do not have the required permissions. If your DMs are open, I have sent you a DM on the matter. Just in case you don\'t have your DMs open, the permissions you need are:\n\`\`\`${missingPermissions}\`\`\` and your current permissions are:\n\`\`\`${currentPermissions}\`\`\`If you feel you are receiving this message in error, open your DMs and run the command again to get ways to report this to the developer.`)
                return;
            }
        }

        // command cooldowns
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 1) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        // actually running the commands.
        try {
            command.execute(message, args, client);
        } catch (error) {
            console.error(error);
            const embed = new Discord.MessageEmbed()
                .setColor('RED')
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
                    value: `Run the \`${config.prefix}report\` command, [Fill out this form](https://codinghelp.site/contact-us/), Message her on Discord, or Email her at crimson.galaxy.slayer@gmail.com\n\nPlease include all of the information in this embed (message) as well as any additional information you can think to provide. Screenshots are also VERY helpful. Thank you!`
                })
                .setTimestamp()
                .setFooter(`Thanks for using ${client.user.tag}! I'm sorry you encountered this error!`, `${client.user.displayAvatarURL()}`)
            message.channel.send(embed);
        }
    }
}// end client.on message
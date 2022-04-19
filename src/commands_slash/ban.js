const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans the given user.')
        .addUserOption(o => o
            .setName('user')
            .setDescription('User to ban')
            .setRequired(true)
        )
        .addStringOption(o => o
            .setName('reason')
            .setDescription('Reason for the ban (Will appear in Audit Logs)')
        )
        .addIntegerOption(o => o
            .setName('msg-history')
            .setDescription('Delete the message history for the given time')
            .addChoices([
                {name: 'Don\'t delete', value: 0},
                {name: '1 Day / 24 Hours', value: 1},
                {name: '2 Days / 48 Hours', value: 2},
                {name: '3 Days / 72 Hours', value: 3},
                {name: '4 Days / 96 Hours', value: 4},
                {name: '5 Days / 120 Hours', value: 5},
                {name: '6 Days / 144 Hours', value: 6},
                {name: '7 Days / 168 Hours', value: 7}
            ])
        ),
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false,
    helpEmbed: new MessageEmbed()
        .setTitle("Use of Ban")
        .setAuthor({
            name: "PYL Bot#9640",
            iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
        })
        .setColor("GREEN")
        .setDescription(
            `Syntax and use of 'Ban' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   /ban <user> [reason] [days-of-messages-to-delete]\`\`\`\n\`\`\`\nUse:\nThe ban command bans the provided user, sending them a DM with an invite to a ban appeals . A tag is a custom command which has a custom reply. The first field is the one which defines the name of the tag. The second one determines if it is staff-only, or admin-only, or can be used by everyone. The last field is for the reply.\`\`\``
    ),
            
}


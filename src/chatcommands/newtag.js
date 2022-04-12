const { MessageEmbed } = require('discord.js')

module.exports = {
    data: {
        name: 'newtag',
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false
    },
    helpEmbed: new MessageEmbed()
        .setTitle("Use of Eval")
        .setAuthor({
            name: "PYL Bot#9640",
            iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
        })
        .setColor("GREEN")
        .setDescription(
            `Syntax and use of 'newtag' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   !!newtag <new tag name> <admin-only / staff-only / everyone> <tag reply>\`\`\`\n\`\`\`\nUse:\nThe newtag command helps create a new tag for the bot. A tag is a custom command which has a custom reply. The first field is the one which defines the name of the tag. The second one determines if it is staff-only, or admin-only, or can be used by everyone. The last field is for the reply.\`\`\``
    ),
    async execute (msg, client, args) {

    }
}
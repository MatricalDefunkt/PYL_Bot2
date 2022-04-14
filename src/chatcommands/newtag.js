const { MessageEmbed } = require('discord.js')
const { Tags } = require('../database/database')

module.exports = {
    data: {
        name: 'newtag',
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false
    },
    helpEmbed: new MessageEmbed()
        .setTitle("Use of NewTag")
        .setAuthor({
            name: "PYL Bot#9640",
            iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
        })
        .setColor("GREEN")
        .setDescription(
            `Syntax and use of 'newtag' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   !!newtag <new tag name> <admin-only / staff-only / everyone> <tag reply>\`\`\`\n\`\`\`\nUse:\nThe newtag command helps create a new tag for the bot. A tag is a custom command which has a custom reply. The first field is the one which defines the name of the tag. The second one determines if it is staff-only, or admin-only, or can be used by everyone. The last field is for the reply.\`\`\``
    ),
    async execute (msg, client, args) {

        if (args[1] != 'everyone' && args[1] != 'staff-only' && args[1] != 'admin-only' || !args[1]) {
            return msg.reply(
                {
                    content: 'Please include whether you want the tag to be usable by everyone, only staff or only admins by typing \'everyone\', \'staff-only\' or \'admin-only\' in the second arguement.'
                }
            )
        } else {

            if (!args[2]) return msg.reply({content: 'Please include the reply for the tag and try again.'})

            let integerPerm;

            switch (args[1]) {
                case 'everyone':
                    integerPerm = 0
                    break;
            
                case 'staff-only':
                    integerPerm = 1
                    break;
                
                case 'admin-only':
                    integerPerm = 2
                    break;
            }

            try {

                const tag = await Tags.create({
                    tagName: `${args[0]}`,
                    tagPerms: integerPerm,
                    tagReply: `${args.slice(2, args.size).join(' ')}`,
                    tagAuthor: `${msg.author.id}`,
                });

                msg.reply({content: `${tag.toJSON()}`})
                
            } catch (error) {

                if (error.name == 'SequelizeUniqueConstraintError') {
                    return msg.reply({content: `Tag with the name '${args[0]}' already exists`})
                }
                
            }
        }
    }
}
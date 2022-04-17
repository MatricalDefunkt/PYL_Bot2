const { MessageEmbed } = require('discord.js')
const { Tags } = require('../database/database')

module.exports = {
    data: {
        name: 'gettag',
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false
    },
    helpEmbed: new MessageEmbed()
        .setTitle("Use of GetTags")
        .setAuthor({
            name: "PYL Bot#9640",
            iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
        })
        .setColor("GREEN")
        .setDescription(
            `Syntax and use of 'gettags' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   !!gettags <all / tag-name>\`\`\`\n\`\`\`\nUse:\nThe gettags command replies to the command with either all the tags for PYL or, if given a name, data about that tag.\`\`\``
    ),
    async execute (msg, client, args) {

        const permissionHandle = (permissionLevel) => {
            switch (permissionLevel) {
                case 0:
                    return 'Everyone';
                case 1:
                    return 'Staff-Only';
                case 2:
                    return 'Admin-Only';
                default:
                    return 'Permission stored invalidly. Please contact Matrical.'
            }
        }

        if (args[0].toLowerCase() === 'all') {

            const tags = await Tags.findAll()
            const messageBuilder = [];
            try {
                tags.forEach(tag => {
                    messageBuilder.push(`\`\`\`Name: ${tag.getDataValue('tagName')}\n\nReply: ${tag.getDataValue('tagReply')}\n\nPermission Level: ${permissionHandle(tag.getDataValue('tagPerms'))}\n\`\`\`Author: <@${tag.getDataValue('tagAuthor')}>`)
                });
            } catch (e) {
                console.error(e)
                msg.reply(e)
            } finally {
                const joinedReply = messageBuilder.join(';;//..//;;//\n')
                if (joinedReply.length >= 2000) {
                    
                } else {
                    const finalReply = await joinedReply.replaceAll(';;//..//;;//', '')
                    if (!finalReply) return msg.reply({content: `No tags have been created yet. You can begin by typing \`<prefix>newtag\`!`})
                    msg.reply({content: finalReply, embeds: [
                        new MessageEmbed()
                        .setTitle('All PYL tags')
                        .setDescription(finalReply)
                    ]})
                }
            }

        } else {

            const tag = await Tags.findOne({where: {tagName: `${args[0]}`}})
            if (!tag) return msg.reply({content: `Tag with name ${args[0]} was not found.`})
            msg.reply({embeds: [
                new MessageEmbed()
                .setTitle(`${tag.getDataValue('tagName')}`)
                .setDescription(`Name: ${tag.getDataValue('tagName')}\n\nReply: ${tag.getDataValue('tagReply')}\n\nAuthor: <@${tag.getDataValue('tagAuthor')}>`)
            ]});

        }
    }
}
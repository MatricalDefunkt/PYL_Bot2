const { MessageEmbed } = require('discord.js')
const { Tags } = require('../database/database')
const { BaseGuild } = require('discord.js')

module.exports = {
    data: {
        name: 'gettags',
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
            `Syntax and use of 'newtag' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   !!gettags <all / tag-name>\`\`\`\n\`\`\`\nUse:\nThe gettags command replies to the command with either all the tags for PYL or, if given a name, data about that tag.\`\`\``
    ),
    async execute (msg, client, args) {

        if (args[0] === 'all') {

            const tags = Tags.findAll()
            console.log(tags);

        } else {

            console.log(msg.guild.shard)

            const tag = await Tags.findOne({where: {tagName: `${args[0]}`}})
            if (!tag) return msg.reply({content: `Tag with name ${args[0]} was not found.`})
            const author = await msg.guild.members.fetch({id: `${tag.getDataValue('tagAuthor')}`, force: false})
            msg.reply({embeds: [
                new MessageEmbed()
                .setTitle(`${tag.getDataValue('tagName')}`)
                .setDescription(`Name: ${tag.getDataValue('tagName')}\nReply: ${tag.getDataValue('tagReply')}\nAuthor: ${author.tag}`)
            ]});

        }
    }
}
const { ActionRow } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, InteractionCollector } = require('discord.js')
const { Tags } = require('../database/database')

module.exports = {
    data: {
        name: 'gettags',
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false
    },
    helpEmbed: new MessageEmbed()
        .setTitle("Use of DelTag")
        .setAuthor({
            name: "PYL Bot#9640",
            iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
        })
        .setColor("GREEN")
        .setDescription(
            `Syntax and use of 'deltag' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   !!deltag <tag-name>\`\`\`\n\`\`\`\nUse:\nThe deltags command deletes the provided tag.\`\`\``
    ),
    async execute (msg, client, args) {

        const tag = await Tags.findOne({where: {tagName: `${args[0]}`}});

        if (!tag) return msg.reply({content: `Tag with name \`${args[0]}\` was not found.`})

        const row = new ActionRow().addComponents(
            new MessageButton()
            .setCustomId('dotagdelete')
            .setLabel('Yes, delete')
            .setStyle('DANGER')
            .emoji('✅'),

            new MessageButton()
            .setCustomId('cancletagdelete')
            .setLabel('No, cancel')
            .setStyle('SUCCESS')
            .emoji('❎')
        )
        const reply = await msg.reply({content: `Are you sure you want to delete the tag \`${tag.getDataValue('tagName')}\`?`, components: [row]})
        const btnCollector = new InteractionCollector(client, {interactionType: 'MESSAGE_COMPONENT', componentType: 'BUTTON', guild: msg.guild, max: 1, maxComponents: 1, message: reply})

        btnCollector.on('collect', async button => {
            button.reply({content: 'Doing...', ephemeral: true})
        })
    }
}
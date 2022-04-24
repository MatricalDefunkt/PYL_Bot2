const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { MessageEmbed, MessageActionRow, MessageButton, InteractionCollector } = require( 'discord.js' )
const { tempBans } = require( '../database/database' )
const { rules } = require( '../rules.json' )

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName( 'convertban' )
            .setDescription( 'Converts the user\'s temp-ban to permanent ban' )
            .addStringOption( o => o
                .setName( 'user-id' )
                .setDescription( 'UserID of the user to be converted.' )
                .setRequired( true )
            )
            .addStringOption( o => o
                .setName( 'reason' )
                .setDescription( 'Reason for the conversion.' )
                .setRequired( true )
            ),
    helpEmbed: new MessageEmbed()
        .setTitle( "Use of ConvertBan" )
        .setAuthor( {
            name: "PYL Bot#9640",
            iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
        } )
        .setColor( "GREEN" )
        .setDescription(
            `Syntax and use of 'ConvertBan' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   /convertban <user-id> <reason>\`\`\`\n\`\`\`\nUse:\nThe convertban command removes the provided user from the temporary bans databse, thus making it impossible to unban them with the temp-ban logic.\`\`\``
        ),
    permissions: {
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false,
    },
    async execute ( interaction, client )
    {

        await interaction.deferReply( { ephemeral: true } )

        const convertId = interaction.options.getString( 'user-id' )
        if ( interaction.options.getString( 'user-id' ).length != 18 ) return interaction.editReply( { content: `Please enter a valid user ID` } )
        const reason = interaction.options.getString( 'reason' )

        const convertee = await tempBans.findOne( { where: { userID: convertId } } )

        const row = new MessageActionRow()
            .addComponents( [
                new MessageButton()
                    .setCustomId( 'addtempban' )
                    .setLabel( 'Yes, convert.' )
                    .setEmoji( '✅' )
                    .setStyle( 'DANGER' ),
                new MessageButton()
                    .setCustomId( 'canceladdtempban' )
                    .setLabel( 'No, cancel.' )
                    .setEmoji( '❎' )
                    .setStyle( 'SUCCESS' )
            ] )

        if ( !convertee )
        {
            const reply = await interaction.editReply( { content: `User with the ID ${ convertId } does not exist in temporary bans. Do you want to add their ban to temporary bans?`, components: [ row ] } )

            const buttonCollector = new InteractionCollector( client, { componentType: 'BUTTON', message: reply, time: '120000', maxComponents: 1 } )

            buttonCollector.on( 'collect', async collected =>
            {
                await collected.deferReply( { ephemeral: true } )
                if (collected.customId === 'addtempban') {
                    collected.editReply({content: `Send a message in this channel for the reason of conversion within one minute`})
                    const reason = collected.channel.awaitMessages()
                }
            } )
            return
        }

        await convertee.destroy();

        return interaction.editReply( { content: `Ban conversion completed.` } )

    }
}
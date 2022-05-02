const { Client, CommandInteraction, MessageActionRow, MessageButton } = require( 'discord.js' );
const { tempBans } = require( '../../../database/database' );
const { rules } = require( '../../../utils/rules.json' );
const Infraction = require( '../../../utils/Infraction.js' );

module.exports = {
    data: {
        name: '',
        parent: 'ban'
    },
    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @returns {Promise<void>}
     */
    async execute ( client, interaction )
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
                if ( collected.customId === 'addtempban' )
                {
                    await collected.editReply( { content: `Send a message in this channel for the reason of conversion within one minute` } )
                    const filter = msg => msg.author === collected.user
                    const reason = await collected.channel.awaitMessages( { filter: filter, max: 1, time: 60000 } )
                    if ( !reason )
                    {
                        await collected.editReply( { content: `You did not reply in time. Please try again` } )
                        return
                    }
                }
            } )
            return
        }

        await convertee.destroy();

        return interaction.editReply( { content: `Ban conversion completed.` } )

    }
}
const { Client, CommandInteraction, MessageActionRow, MessageButton, InteractionCollector } = require( 'discord.js' );
const { tempInfractions } = require( '../../../database/database' );
const { rules } = require( '../../../utils/rules.json' );
const Infraction = require( '../../../utils/Infraction.js' );

module.exports = {
    data: {
        name: '',
        parent: 'mute'
    },
    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @returns {Promise<void>}
     */
    async execute ( client, interaction )
    {

        const convertId = interaction.options.getString( 'user-id' )
        if ( interaction.options.getString( 'user-id' ).length != 18 ) return interaction.editReply( { content: `Please enter a valid user ID` } )
        const reason = interaction.options.getString( 'reason' )

        const convertee = await tempInfractions.findOne( { where: { userID: convertId } } )

        const row = new MessageActionRow()
            .addComponents( [
                new MessageButton()
                    .setCustomId( 'addtempmute' )
                    .setLabel( 'Yes, convert.' )
                    .setEmoji( '✅' )
                    .setStyle( 'DANGER' ),
                new MessageButton()
                    .setCustomId( 'canceladdtempmute' )
                    .setLabel( 'No, cancel.' )
                    .setEmoji( '❎' )
                    .setStyle( 'SUCCESS' )
            ] )

        if ( !convertee )
        {
            const reply = await interaction.editReply( { content: `User with the ID ${ convertId } does not exist in temporary mutes. Do you want to add their mute to temporary mutes?`, components: [ row ] } )

            const buttonCollector = new InteractionCollector( client, { componentType: 'BUTTON', message: reply, time: '120000', maxComponents: 1 } )

            buttonCollector.on( 'collect', async collected =>
            {
                await collected.deferReply( { ephemeral: true } )
                if ( collected.customId === 'addtempmute' )
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

        return interaction.editReply( { content: `mute conversion completed.` } )

    }
}
const { Client, CommandInteraction, MessageEmbed } = require( 'discord.js' );
const Infraction = require( '../../../utils/infraction' );
const { rules } = require( '../../../utils/rules.json' );

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

        const unbanId = interaction.options.getString( 'user-id' )
        if ( unbanId.length != 18 ) return interaction.editReply( { content: `Please enter a valid user ID` } )
        const reason = interaction.options.getString( 'reason' )

        interaction.guild.bans.fetch( unbanId ).then( unbanUser =>
        {
            interaction.editReply( { content: `Unbanning <@${ unbanId }>` } )
            interaction.guild.bans.remove( unbanId, `${ interaction.user.tag } || ${ reason }` ).then( ( unbannedUser ) =>
            {
                interaction.editReply( { content: `Unbanned ${ unbannedUser }.` } )
                const unban = new Infraction()
                unban.addUnBan(interaction.user.id, unbanId, reason)
                return;

            } ).catch( ( err ) =>
            {
                console.error( err );
                interaction.editReply( { content: `There was an error, please contact Matrical ASAP.` } )

            } );

        } ).catch( ( err ) =>
        {

            if ( err.code === 10026 ) return interaction.editReply( { content: `<@${ unbanId }> has not been banned.` } )
            interaction.editReply( { content: `There was an error. Please contact Matrical ASAP.` } )
            console.error( err );

        } );

        return
    }
}
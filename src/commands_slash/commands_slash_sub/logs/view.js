const { Client, CommandInteraction, MessageEmbed } = require( 'discord.js' );
const { Infractions } = require( '../../../database/database' );

module.exports = {
    data: {
        name: 'view',
        parent: 'logs'
    },
    /**
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @returns {Promise<void>}
     */
    async execute ( client, interaction )
    {
        const target = interaction.options.getMember( 'target' );

        if ( !target ) return interaction.editReply( 'Invalid input for `target`.' )

        const infractions = await Infractions.findAll( { where: { targetID: target.id } } )

        if ( !infractions[ 0 ] ) return interaction.editReply( { content: `${ target }'s record is clean. ✅` } )

        const messageBuilder = []

        infractions.forEach( infraction =>
        {
            const caseId = infraction.getDataValue( 'caseID' );
            const type = infraction.getDataValue( 'type' );
            const target = `<@${ infraction.getDataValue( 'targetID' ) }>`;
            const mod = `<@${ infraction.getDataValue( 'modID' ) }>`;
            const reason = infraction.getDataValue( 'reason' );
            const time = `<t:${ Math.trunc( Date.parse( infraction.getDataValue( 'createdAt' ) ) / 1000 ) }:F>`;
            messageBuilder.push( `Case ID - ${ caseId }\nType - ${ type }\nTarget - ${ target }\nModerator - ${ mod }\n${ ( type == 'Note' ) ? `Note` : `Reason` } - ${ reason }\nTime - ${ time }` )

        } )

        const embed = new MessageEmbed()
            .setAuthor( { name: interaction.user.tag, iconURL: interaction.user.avatarURL() } )
            .setDescription( messageBuilder.join( '\n**======**\n' ) )
            .setColor( ( messageBuilder.join().includes( 'Type - Ban' ) ) ? 'RED' : 'YELLOW' )

        await interaction.editReply( { embeds: [ embed ] } )
        return
    }
}
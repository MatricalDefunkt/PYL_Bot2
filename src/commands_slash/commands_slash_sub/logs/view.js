const { Client, CommandInteraction } = require( 'discord.js' );
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

        const infractions = await Infractions.findAll( { where: { targetID: target.id } } )

        const messageBuilder = []

        infractions.forEach( infraction =>
        {
            const caseId = infraction.getDataValue( 'caseID' );
            const type = infraction.getDataValue( 'type' );
            const target = `<@${ infraction.getDataValue( 'targetID' ) }>`;
            const mod = `<@${ infraction.getDataValue( 'modID' ) }>`;
            const reason = infraction.getDataValue( 'reason' );
            const time = `<t:${ Math.trunc( Date.parse( infraction.getDataValue( 'createdAt' ) ) / 1000 ) }:F>`;
            messageBuilder.push( `Case ID - ${ caseId }\nType - ${ type }\nTarget - ${ target }\nModerator - ${ mod }\nReason - ${ reason }\nTime - ${ time }` )

        } )

        interaction.editReply( { content: messageBuilder.join( '\n--------\n' ) } )
    }
}
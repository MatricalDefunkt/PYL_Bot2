const { Client, CommandInteraction, MessageEmbed } = require( 'discord.js' );
const { Infractions } = require( '../../../database/database' );

module.exports = {
    data: {
        name: 'clear',
        parent: 'logs'
    },
    /**
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @returns {Promise<void>}
     */
    async execute ( client, interaction )
    {
        const caseId = interaction.options.getString( 'caseid' );

        const caseToRemove = await Infractions.findOne( { where: { caseId: caseId } } )

        if ( !caseToRemove ) return interaction.editReply( { content: `Case with the ID \`${ caseId }\` was not found.` } )

        const type = caseToRemove.getDataValue( 'type' );
        const target = `<@${ caseToRemove.getDataValue( 'targetID' ) }>`;
        const mod = `<@${ caseToRemove.getDataValue( 'modID' ) }>`;
        const reason = caseToRemove.getDataValue( 'reason' );
        const time = `<t:${ Math.trunc( Date.parse( caseToRemove.getDataValue( 'createdAt' ) ) / 1000 ) }:F>`;

        await caseToRemove.destroy()

        const embed = new MessageEmbed()
            .setAuthor( { name: client.user.tag, iconURL: client.user.avatarURL() } )
            .setColor( 'YELLOW' )
            .setDescription( `**Case ID -** ${ caseId }\n**Type -** ${ type }\n**Target -** ${ target }\n**Moderator -** ${ mod }\n**Reason -** ${ reason }\n**Time -** ${ time }` )
        await interaction.editReply( { content: `Cleared case with ID \`${ caseId }\` for ${ target }`, embeds: [ embed ] } )
        return
    }
}
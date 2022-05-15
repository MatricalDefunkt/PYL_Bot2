const { Client, CommandInteraction, MessageEmbed, MessageActionRow, InteractionCollector, MessageButton } = require( 'discord.js' );
const { Infractions } = require( '../../../database/database' );

module.exports = {
    data: {
        name: 'view_with_id',
        parent: 'logs'
    },
    /**
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @returns {Promise<void>}
     */
    async execute ( client, interaction )
    {
        const target = interaction.options.getString( 'target' );
        if ( target.length != 18 ) return interaction.editReply( { content: `Please enter a valid user ID` } )

        const { rows: infractions, count: totalCount } = await Infractions.findAndCountAll( { where: { targetID: target } } )

        if ( !infractions[ 0 ] ) return interaction.editReply( { content: `Either <@${ target }>'s record is clean or the ID is wrong.` } )

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

        const row = new MessageActionRow()
            .addComponents( [
                new MessageButton()
                    .setCustomId( 'previous' )
                    .setEmoji( '◀️' )
                    .setStyle( 'SECONDARY' ),
                new MessageButton()
                    .setCustomId( 'next' )
                    .setEmoji( '▶️' )
                    .setStyle( 'SECONDARY' )
            ] )

        const disabledRow = new MessageActionRow()
            .addComponents( [
                new MessageButton()
                    .setCustomId( 'previous' )
                    .setEmoji( '◀️' )
                    .setStyle( 'SECONDARY' )
                    .setDisabled( true ),
                new MessageButton()
                    .setCustomId( 'next' )
                    .setEmoji( '▶️' )
                    .setStyle( 'SECONDARY' )
                    .setDisabled( true )
            ] )

        const reply = await interaction.editReply( { embeds: [ embed ], components: [ row ] } )

        let counter = 0;

        const collector = new InteractionCollector( client, { message: reply, componentType: 'BUTTON', interactionType: 'MESSAGE_COMPONENT', time: 300_000 } )

        collector.on( 'collect', async collected =>
        {
            if ( collected.customId === 'next' )
            {
                if ( ( counter + 5 ) >= totalCount ) return collected.reply( { content: 'No more pages after this!', ephemeral: true } )

                counter += 5

                const localInfractions = await Infractions.findAll( { where: { targetID: target }, limit: 5, offset: counter } )
                const loacalMessageBuilder = [];

                localInfractions.forEach( infraction =>
                {
                    const caseId = infraction.getDataValue( 'caseID' );
                    const type = infraction.getDataValue( 'type' );
                    const target = `<@${ infraction.getDataValue( 'targetID' ) }>`;
                    const mod = `<@${ infraction.getDataValue( 'modID' ) }>`;
                    const reason = infraction.getDataValue( 'reason' );
                    const time = `<t:${ Math.trunc( Date.parse( infraction.getDataValue( 'createdAt' ) ) / 1000 ) }:F>`;
                    loacalMessageBuilder.push( `**Case ID** - ${ caseId }\n**Type** - ${ type }\n**Target** - ${ target }\n**Moderator** - ${ mod }\n${ ( type == 'Note' ) ? `**Note**` : `**Reason**` } - ${ reason }\n**Time** - ${ time }` )

                } )

                const localEmbed = new MessageEmbed()
                    .setAuthor( { name: interaction.user.tag, iconURL: interaction.user.avatarURL() } )
                    .setDescription( loacalMessageBuilder.join( '\n**======**\n' ) )
                    .setColor( ( loacalMessageBuilder.join().includes( 'Type - Ban' ) ) ? 'RED' : 'YELLOW' )

                await collected.update( { embeds: [ localEmbed ] } )
            } else
            {
                if ( ( counter - 5 ) < 0 ) return collected.reply( { content: 'No more pages before this!', ephemeral: true } )

                counter -= 5

                const localInfractions = await Infractions.findAll( { where: { targetID: target }, limit: 5, offset: counter } )
                const loacalMessageBuilder = [];

                localInfractions.forEach( infraction =>
                {
                    const caseId = infraction.getDataValue( 'caseID' );
                    const type = infraction.getDataValue( 'type' );
                    const target = `<@${ infraction.getDataValue( 'targetID' ) }>`;
                    const mod = `<@${ infraction.getDataValue( 'modID' ) }>`;
                    const reason = infraction.getDataValue( 'reason' );
                    const time = `<t:${ Math.trunc( Date.parse( infraction.getDataValue( 'createdAt' ) ) / 1000 ) }:F>`;
                    loacalMessageBuilder.push( `**Case ID** - ${ caseId }\n**Type** - ${ type }\n**Target** - ${ target }\n**Moderator** - ${ mod }\n${ ( type == 'Note' ) ? `**Note**` : `**Reason**` } - ${ reason }\n**Time** - ${ time }` )

                } )

                const localEmbed = new MessageEmbed()
                    .setAuthor( { name: interaction.user.tag, iconURL: interaction.user.avatarURL() } )
                    .setDescription( loacalMessageBuilder.join( '\n**======**\n' ) )
                    .setColor( ( loacalMessageBuilder.join().includes( 'Type - Ban' ) ) ? 'RED' : 'YELLOW' )

                await collected.update( { embeds: [ localEmbed ] } )
            }
        } )

        collector.on( 'end', async collected =>
        {
            try
            {
                await interaction.editReply( { components: [ disabledRow ] } )
            } catch ( error )
            {
                console.error( error )
            }
        } )
        return
    }
}
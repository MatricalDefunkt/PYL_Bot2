const { MessageEmbed, MessageActionRow, MessageButton, Message, Client, InteractionCollector } = require( 'discord.js' )
const { Tags } = require( '../database/database' )

/**
 * 
 * @param {Number} permissionLevel The permission level to parse
 * @returns The string of the permission level
 */
const permissionHandle = ( permissionLevel ) =>
{
    switch ( permissionLevel )
    {
        case 0:
            return 'Everyone';
        case 1:
            return 'Staff-Only';
        case 2:
            return 'Admin-Only';
        default:
            return 'Permission stored incorrectly. Please contact Matrical ASAP.';
    }
}

module.exports = {
    data: {
        name: 'gettags',
    },
    help: {
        helpName: 'Get tags',
        helpDescription: `The Gettags command replies with an embed containing all the tags, with authors and replies.`,
        helpSyntax: `gettag <all / tagname>`,
        helpEmbed: true
    },
    permissions: {
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false,
    },
    /**
     * 
     * @param {Message} msg 
     * @param {Client} client 
     * @param {Array<String>} args 
     * @returns {void}
     */
    async execute ( msg, client, args )
    {

        if ( args[ 0 ].toLowerCase() === 'all' )
        {

            const row = new MessageActionRow()
                .addComponents( [
                    new MessageButton()
                        .setCustomId( 'previous' )
                        .setStyle( 'SECONDARY' )
                        .setEmoji( '◀️' ),
                    new MessageButton()
                        .setCustomId( 'next' )
                        .setStyle( 'SECONDARY' )
                        .setEmoji( '▶️' )
                ] )

            const disabledRow = new MessageActionRow()
                .addComponents( [
                    new MessageButton()
                        .setCustomId( 'previous' )
                        .setStyle( 'SECONDARY' )
                        .setEmoji( '◀️' )
                        .setDisabled( true ),
                    new MessageButton()
                        .setCustomId( 'next' )
                        .setStyle( 'SECONDARY' )
                        .setEmoji( '▶️' )
                        .setDisabled( true )
                ] )

            let counter = 0
            const { rows: tags, count: count } = await Tags.findAndCountAll( { limit: 5, offset: counter } )
            const messageBuilder = [];
            try
            {
                tags.forEach( tag =>
                {
                    const reply = ( tag.getDataValue( 'tagReply' ).length >= 100 ) ? tag.getDataValue( 'tagReply' ).slice( 0, 96 ) + '...' : tag.getDataValue( 'tagReply' )
                    messageBuilder.push( `\`\`\`Name: ${ tag.getDataValue( 'tagName' ) }\n\nReply: ${ reply }\n\nPermission Level: ${ permissionHandle( tag.getDataValue( 'tagPerms' ) ) }\n\`\`\`Author: <@${ tag.getDataValue( 'tagAuthor' ) }>` )
                } );
            } catch ( e )
            {
                console.error( e )
                msg.reply( e )
            }

            const joinedReply = messageBuilder.join( ';][][\][,.\/][,.\/][\,./\,].\n\n' )

            const finalReplyText = await joinedReply.replaceAll( ';][][\][,.\/][,.\/][\,./\,].', '' )
            if ( !finalReplyText ) return msg.reply( { content: `No tags have been created yet. You can begin by typing \`${ client.prefixes.get( 'command' ) }newtag\`!` } )
            const reply = await msg.reply( {
                content: `Here are the tags for PYL:`, embeds: [
                    new MessageEmbed()
                        .setTitle( 'Tags' )
                        .setDescription( finalReplyText )
                        .setColor( 'GREEN' )
                ],
                components: [ row ]
            } )

            const filter = ( interaction ) => interaction.user.id === msg.author.id
            const collector = new InteractionCollector( client, { componentType: 'BUTTON', message: reply, filter: filter, interactionType: 'MESSAGE_COMPONENT', time: 300_000 } )

            collector.on( 'collect', async ( collected ) =>
            {
                if ( collected.customId === 'next' )
                {
                    if ( counter + 5 > count ) return collected.reply( { content: `No more pages after this!`, ephemeral: true } )
                    counter += 5
                    const { rows: tags, count: tagCount } = await Tags.findAndCountAll( { limit: 5, offset: counter } )
                    const messageBuilder = [];

                    tags.forEach( tag =>
                    {
                        const reply = ( tag.getDataValue( 'tagReply' ).length >= 100 ) ? tag.getDataValue( 'tagReply' ).slice( 0, 96 ) + '...' : tag.getDataValue( 'tagReply' )
                        messageBuilder.push( `\`\`\`Name: ${ tag.getDataValue( 'tagName' ) }\n\nReply: ${ reply }\n\nPermission Level: ${ permissionHandle( tag.getDataValue( 'tagPerms' ) ) }\n\`\`\`Author: <@${ tag.getDataValue( 'tagAuthor' ) }>` )
                    } );

                    const joinedReply = messageBuilder.join( ';][][\][,.\/][,.\/][\,./\,].\n\n' )

                    const finalReplyText = await joinedReply.replaceAll( ';][][\][,.\/][,.\/][\,./\,].', '' )
                    if ( !finalReplyText ) return collected.update( { content: `No more tags left!`, embeds: [] } )
                    const reply = await collected.update( {
                        content: `Here are the tags for PYL:`, embeds: [
                            new MessageEmbed()
                                .setTitle( 'Tags' )
                                .setDescription( finalReplyText )
                                .setColor( 'GREEN' )
                        ],
                        components: [ row ]
                    } )

                    return counter;

                } else if ( collected.customId === 'previous' )
                {
                    if ( counter <= 0 ) return collected.reply( { content: `No pages behind this one`, ephemeral: true } )
                    counter -= 5
                    const { rows: tags, count: count } = await Tags.findAndCountAll( { limit: 5, offset: counter } )
                    const messageBuilder = [];

                    tags.forEach( tag =>
                    {
                        const reply = ( tag.getDataValue( 'tagReply' ).length >= 100 ) ? tag.getDataValue( 'tagReply' ).slice( 0, 96 ) + '...' : tag.getDataValue( 'tagReply' )
                        messageBuilder.push( `\`\`\`Name: ${ tag.getDataValue( 'tagName' ) }\n\nReply: ${ reply }\n\nPermission Level: ${ permissionHandle( tag.getDataValue( 'tagPerms' ) ) }\n\`\`\`Author: <@${ tag.getDataValue( 'tagAuthor' ) }>` )
                    } );

                    const joinedReply = messageBuilder.join( ';][][\][,.\/][,.\/][\,./\,].\n\n' )

                    const finalReplyText = await joinedReply.replaceAll( ';][][\][,.\/][,.\/][\,./\,].', '' )
                    if ( !finalReplyText ) return collected.update( { content: `No more tags left!` } )
                    const reply = await collected.update( {
                        content: `Here are the tags for PYL:`, embeds: [
                            new MessageEmbed()
                                .setTitle( 'Tags' )
                                .setDescription( finalReplyText )
                                .setColor( 'GREEN' )
                        ],
                        components: [ row ]
                    } )

                    return counter;

                }
            } )
            collector.on( 'end', async collected =>
            {
                await reply.edit( { components: [ disabledRow ] } )
            } )
        } else
        {

            const tag = await Tags.findOne( { where: { tagName: `${ args[ 0 ] }` } } )
            if ( !tag ) return msg.reply( { content: `Tag with name ${ args[ 0 ] } was not found.` } )
            const reply = ( tag.getDataValue( 'tagReply' ).length >= 1500 ) ? tag.getDataValue( 'tagReply' ).slice( 0, 1496 ) + '...' : tag.getDataValue( 'tagReply' )
            msg.reply( {
                embeds: [
                    new MessageEmbed()
                        .setTitle( `${ tag.getDataValue( 'tagName' ) }` )
                        .setDescription(
                            `\`\`\`Name: ${ tag.getDataValue( 'tagName' ) }\n\nReply: ${ reply }\n\nPermission Level: ${ permissionHandle( tag.getDataValue( 'tagPerms' ) ) }\n\`\`\`Author: <@${ tag.getDataValue( 'tagAuthor' ) }>` )
                        .setColor( 'GREEN' )
                ]
            } );

        }
    }
}
const { MessageEmbed, MessageActionRow, MessageButton, Message, Client, InteractionCollector } = require( 'discord.js' )
const { Tags } = require( '../database/database' )

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
                    return 'Permission stored incorrectly. Please contact Matrical.';
            }
        }

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

            let counter = 0
            const tags = await Tags.findAll( { limit: counter + 5, offset: counter } )
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
            } finally
            {
                const joinedReply = messageBuilder.join( ';][][\][,.\/][,.\/][\,./\,].\n\n' )

                const finalReplyText = await joinedReply.replaceAll( ';][][\][,.\/][,.\/][\,./\,].', '' )
                if ( !finalReplyText ) return msg.reply( { content: `No tags have been created yet. You can begin by typing \`${ client.prefixes.get( 'command' ) }newtag\`!` } )
                const reply = msg.reply( {
                    content: `Here are all the tags for PYL:`, embeds: [
                        new MessageEmbed()
                            .setTitle( 'All PYL tags' )
                            .setDescription( finalReplyText )
                    ],
                    components: [ row ]
                } )

                const filter = (interaction) => interaction.user === msg.author.id
                const collector = new InteractionCollector(client, {componentType: 'BUTTON', message: reply, filter: filter, interactionType: 'MESSAGE_COMPONENT'})

            }

        } else
        {

            const tag = await Tags.findOne( { where: { tagName: `${ args[ 0 ] }` } } )
            if ( !tag ) return msg.reply( { content: `Tag with name ${ args[ 0 ] } was not found.` } )
            msg.reply( {
                embeds: [
                    new MessageEmbed()
                        .setTitle( `${ tag.getDataValue( 'tagName' ) }` )
                        .setDescription( `Name: ${ tag.getDataValue( 'tagName' ) }\n\nReply: ${ tag.getDataValue( 'tagReply' ) }\n\nAuthor: <@${ tag.getDataValue( 'tagAuthor' ) }>` )
                ]
            } );

        }
    }
}
const { MessageEmbed } = require( 'discord.js' )
const { Tags } = require( '../database/database' )



module.exports = {
    data: {
        name: 'gettag',
    },
    help: {
        helpDescription: `The Gettags command replies with an embed containing all the tags, with authors and replies.`,
        helpSyntax: `gettag <all / tagname>`,
        helpEmbed: true
    },
    permissions: {
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false,
    },
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

            const tags = await Tags.findAll()
            const messageBuilder = [];
            try
            {
                tags.forEach( tag =>
                {
                    messageBuilder.push( `\`\`\`Name: ${ tag.getDataValue( 'tagName' ) }\n\nReply: ${ tag.getDataValue( 'tagReply' ) }\n\nPermission Level: ${ permissionHandle( tag.getDataValue( 'tagPerms' ) ) }\n\`\`\`Author: <@${ tag.getDataValue( 'tagAuthor' ) }>` )
                } );
            } catch ( e )
            {
                console.error( e )
                msg.reply( e )
            } finally
            {
                const joinedReply = messageBuilder.join( ';][][\][,.\/][,.\/][\,./\,].\n' )
                if ( joinedReply.length >= 2000 )
                {

                } else
                {
                    const finalReply = await joinedReply.replaceAll( ';][][\][,.\/][,.\/][\,./\,].', '' )
                    if ( !finalReply ) return msg.reply( { content: `No tags have been created yet. You can begin by typing \`${ client.prefixes.get( 'command' ) }newtag\`!` } )
                    msg.reply( {
                        content: `Here are all the tags for PYL:`, embeds: [
                            new MessageEmbed()
                                .setTitle( 'All PYL tags' )
                                .setDescription( finalReply )
                        ]
                    } )
                }
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
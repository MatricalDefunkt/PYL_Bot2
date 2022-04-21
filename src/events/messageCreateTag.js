require( 'dotenv' ).config()
const { Tags } = require( '../database/database' )
const tagprefix = process.env.TAGPREFIX;

module.exports = {
    name: 'messageCreate',
    async handle ( client, msg )
    {
        {

            if ( !msg.guild ) return;
            if ( msg.author.bot ) return;
            if ( msg.content.startsWith( `${ tagprefix }` ) )
            {

                if ( msg.content.length <= 2 )
                {
                    const reply = await msg.reply( { content: `Please provide a tag` } );
                    msg.delete()
                    setTimeout( async () =>
                    {
                        await reply.delete()
                    }, 4000 );
                    return;
                }

                const tag = await Tags.findOne( { where: { tagName: `${ msg.content.slice( 2 ) }` } } );

                if ( !tag )
                {
                    const reply = await msg.reply( { content: `Tag \`${ msg.content.slice( 2 ) }\` was not found.` } );
                    msg.delete()
                    setTimeout( () =>
                    {
                        reply.delete()
                    }, 4000 );
                    return;
                }

                switch ( tag.getDataValue( 'tagPerms' ) )
                {
                    case 0:
                        return msg.channel.send( { content: `${ tag.getDataValue( 'tagReply' ) }` } ).then(msg.delete())
                    case 1:
                        if ( msg.member._roles.includes( '963537947255255092' ) ) { return msg.channel.send( { content: `${ tag.getDataValue( 'tagReply' ) }` } ) } else return msg.reply( { content: `Missing permissions` } ).then(msg.delete())
                    case 2:
                        if ( msg.member._roles.includes( '963537994596364288' ) ) { return msg.channel.send( { content: `${ tag.getDataValue( 'tagReply' ) }` } ) } else return msg.reply( { content: `Missing permissions` } ).then(msg.delete())
                    default:
                        return msg.reply( { content: `Tag permissions were incorrectly stored. Please contact Matrical ASAP.` } )
                }
            }
        }
    }
}
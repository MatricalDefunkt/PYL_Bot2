const { ActionRow } = require( '@discordjs/builders' );
const { MessageButton, InteractionCollector } = require( 'discord.js' )
const { Tags } = require( '../database/database' )

module.exports = {
    data: {
        name: 'deltag',
    },
    help: {
        helpDescription: `The deltags command deletes the provided tag.`,
        helpSyntax: `deltag <tag-name>`,
        helpEmbed: true
    },
    permissions: {
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false,
    },
    async execute ( msg, client, args )
    {

        const tag = await Tags.findOne( { where: { tagName: `${ args[ 0 ] }` } } );

        if ( !tag ) return msg.reply( { content: `Tag with name \`${ args[ 0 ] }\` was not found.` } )

        const row = new ActionRow().addComponents(
            new MessageButton()
                .setCustomId( 'dotagdelete' )
                .setLabel( 'Yes, delete' )
                .setStyle( 'DANGER' )
                .setEmoji( '✅' ),

            new MessageButton()
                .setCustomId( 'canceltagdelete' )
                .setLabel( 'No, cancel' )
                .setStyle( 'SUCCESS' )
                .setEmoji( '❎' )
        )

        const disabledRow = new ActionRow().addComponents(
            new MessageButton()
                .setCustomId( 'dotagdelete' )
                .setLabel( 'Yes, delete' )
                .setStyle( 'DANGER' )
                .setEmoji( '✅' )
                .setDisabled( true ),

            new MessageButton()
                .setCustomId( 'canceltagdelete' )
                .setLabel( 'No, cancel' )
                .setStyle( 'SUCCESS' )
                .setEmoji( '❎' )
                .setDisabled( true )
        )
        const reply = await msg.reply( { content: `Are you sure you want to delete the tag \`${ tag.getDataValue( 'tagName' ) }\`?`, components: [ row ] } )
        const filter = ( interaction ) => interaction.user.id === msg.author.id
        const btnCollector = new InteractionCollector( client, { interactionType: 'MESSAGE_COMPONENT', componentType: 'BUTTON', guild: msg.guild, max: 1, maxComponents: 1, message: reply, time: 60000, filter: filter } )

        btnCollector.on( 'collect', async button =>
        {
            if ( button.customId === 'dotagdelete' )
            {
                tag.destroy().then( async () =>
                {
                    const btnReply = await button.reply( { content: `Tag \`${ args[ 0 ] }\` was deleted.`, fetchReply: true } )
                    reply.edit( { content: reply.content, components: [ disabledRow ] } )
                    setTimeout( () =>
                    {
                        btnReply.delete();
                        reply.delete();
                        msg.delete();
                        return;
                    }, 10000 );
                } )
            } else if ( button.customId === 'canceltagdelete' )
            {
                const btnReply = await button.reply( { content: `Cancelled the deletion of ${ args[ 0 ] }!` } ).then( () =>
                {
                    reply.edit( { content: reply.content, components: [ disabledRow ] } )
                    setTimeout( () =>
                    {
                        btnReply.delete();
                        reply.delete();
                        msg.delete()
                    }, 10000 );
                    return
                } )
            }
        } )
        btnCollector.on( 'end', async collected =>
        {
            if ( collected.size > 0 )
            {
                return
            } else
            {
                msg.reply( { content: `Timed out. (60 seconds have passed.)` } ).then( msgReply =>
                {
                    setTimeout( () =>
                    {
                        msgReply.delete()
                        msg.delete()
                        reply.delete()
                        return
                    }, 10000 );
                } )
            }
        } )
    }
}
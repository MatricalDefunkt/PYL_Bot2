module.exports = {
    data: {
        name: 'massping',
    },
    help: {
        helpDescription: `The massping command ghost-pings the mentioned user 5 times.`,
        helpSyntax: `massping <user>`,
        helpEmbed: true
    },
    permissions: {
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false,
    },
    async execute ( msg, client, args )
    {

        if ( !msg.mentions.users.first() ) { return msg.reply( { content: `Mention someone.` } ) }

        const member = msg.mentions.users.first()

        msg.delete()

        let i = 0

        setInterval( () =>
        {
            i++
            msg.channel.send( { content: `${ member }` } ).then( message => message.delete() )
            if ( i >= 5 ) return;

        }, 300 )
    }
}
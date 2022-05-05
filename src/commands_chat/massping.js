const { MessageEmbed } = require( 'discord.js' )

module.exports = {
    data: {
        name: 'massping',
    },
    permissions: {
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false,
    },
    async execute ( msg, client, args )
    {

        const prefix = client.prefixes.get( 'command' )

        const helpEmbed = new MessageEmbed()
            .setTitle( "Use of massping" )
            .setAuthor( {
                name: "PYL Bot#9640",
                iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
            } )
            .setColor( "GREEN" )
            .setDescription(
                `Syntax and use of 'massping' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+  ${ prefix }massping <user>\`\`\`\n\`\`\`\nUse:\nThe massping command ghost-pings the mentioned user 5 times.\`\`\``
            )

        console.log( msg )

        if ( !args[ 0 ] )
        {
            return msg.reply( { embeds: [ helpEmbed ] } ).then( msg => setTimeout( () =>
            {
                try
                {
                    msg.delete()
                } catch ( err )
                {
                    console.error( err )
                }
            }, 30000 ) )
        }

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
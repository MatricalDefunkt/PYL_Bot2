const { MessageEmbed } = require( 'discord.js' )
const { Tags } = require( '../database/database' )

module.exports = {
    data: {
        name: 'newtag',
    },
    help: {
        helpDescription: `The ping command replies with the roundtrip latency of the bot. Meaning, the time it takes for a bot to recieve a message subtracted from the time it takes to send a message, from, and to Discord.`,
        helpSyntax: `ping`,
        helpEmbed: true
    },
    permissions: {
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false,
    },
    async execute ( msg, client, args )
    {

        const helpEmbed = new MessageEmbed()
            .setTitle( `Use of ${ this.data.name }` )
            .setAuthor( {
                name: "PYL Bot#9640",
                iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
            } )
            .setColor( "GREEN" )
            .setDescription(
                `Syntax and use of \`${ this.data.name }\` command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n${ client.prefixes.get( 'command' ) }${ this.help.helpSyntax }\`\`\`\n\`\`\`\nUse:\n${ this.help.helpDescription }\`\`\``
            )

        if ( !args[ 1 ] || !args[ 2 ] )
        {
            return msg.reply( { content: `\`\`\`diff\n- Invalid arguements.\`\`\``, embeds: [ helpEmbed ] } ).then( msg => setTimeout( () =>
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

        if ( args[ 1 ].toLowerCase() != 'everyone' && args[ 1 ] != 'staff-only' && args[ 1 ] != 'admin-only' )
        {
            return msg.reply(
                {
                    content: 'Please include whether you want the tag to be usable by everyone, only staff or only admins by typing \`everyone\`, \`staff-only\` or \`admin-only\` in the second arguement, and try again.'
                }
            )
        } else
        {

            let integerPerm;

            switch ( args[ 1 ].toLowerCase() )
            {
                case 'everyone':
                    integerPerm = 0
                    break;

                case 'staff-only':
                    integerPerm = 1
                    break;

                case 'admin-only':
                    integerPerm = 2
                    break;
            }

            if ( args.slice( 2, args.size ).join( ' ' ).length > 256 )
            {
                return msg.reply( { content: `Reply lengths cannot exceed 256 characters.` } )
            }

            try
            {

                const tag = await Tags.create( {
                    tagName: `${ args[ 0 ] }`,
                    tagPerms: integerPerm,
                    tagReply: `${ args.slice( 2, args.size ).join( ' ' ) }`,
                    tagAuthor: `${ msg.author.id }`,
                } );

                msg.reply( { content: `New tag with the name \`${ args[ 0 ] }\` was created successfully!!` } )

            } catch ( error )
            {

                if ( error.name == 'SequelizeUniqueConstraintError' )
                {
                    return msg.reply( { content: `Tag with the name \`${ args[ 0 ] }\` already exists.` } )
                } else
                {
                    return msg.reply( { content: `There was an error. please contact Matrical ASAP.` } )
                }

            }
        }
    }
}
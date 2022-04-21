const { MessageEmbed } = require( 'discord.js' )
const { Tags } = require( '../database/database' )

module.exports = {
    data: {
        name: 'newtag',
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false
    },
    helpEmbed: new MessageEmbed()
        .setTitle( "Use of NewTag" )
        .setAuthor( {
            name: "PYL Bot#9640",
            iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
        } )
        .setColor( "GREEN" )
        .setDescription(
            `Syntax and use of 'newtag' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   !!newtag <new tag name> <admin-only / staff-only / everyone> <tag reply>\`\`\`\n\`\`\`\nUse:\nThe newtag command helps create a new tag for the bot. A tag is a custom command which has a custom reply. The first field is the one which defines the name of the tag. The second one determines if it is staff-only, or admin-only, or can be used by everyone. The last field is for the reply.\`\`\``
        ),
    permissions: {
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false,
    },
    async execute ( msg, client, args )
    {

        if ( !args[ 0 ] )
        {
            return msg.reply( { embeds: [ this.helpEmbed ] } ).then( msg => setTimeout( () =>
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

        if ( !args[ 1 ] || !args[ 2 ] )
        {
            return msg.reply( { content: `\`\`\`diff\n- Invalid arguements.\`\`\``, embeds: [ this.helpEmbed ] } )
        }

        if ( args[ 1 ].toLowerCase() != 'everyone' && args[ 1 ] != 'staff-only' && args[ 1 ] != 'admin-only' || !args[ 1 ] )
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

                msg.reply( { content: `${ tag.toJSON() }` } )

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
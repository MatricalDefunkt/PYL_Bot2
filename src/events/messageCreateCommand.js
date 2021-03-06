require( 'dotenv' ).config();
const fs = require( 'fs' );
const path = require( 'path' );
const { Message, Client, MessageEmbed } = require( 'discord.js' );

const names = []
const textCommandFiles = fs.readdirSync( path.join( __dirname, '../commands_chat' ) ).filter( file => file.endsWith( '.js' ) );
for ( const file of textCommandFiles )
{
    const textCommand = require( `../commands_chat/${ file }` );
    names.push( textCommand.data.name )
}

const autocorrect = require( 'autocorrect' )( { words: names } )

module.exports = {
    name: 'messageCreate',
    /**
     * 
     * @param {Client} client 
     * @param {Message} msg 
     * @returns 
     */
    async handle ( client, msg ) 
    {

        const prefix = client.prefixes.get( 'command' )
        const tagPrefix = client.prefixes.get( 'tag' )

        if ( !msg.guild ) return;
        if ( msg.author.bot ) return;

        if ( msg.content === String( '<@' + client.user.id + '>' ) ) return msg.reply( { content: `Hey there! My command prefix is \`${ prefix }\` and my tag prefix is \`${ tagPrefix }\`! Feel free to use \`/help\` if you need help with a command.` } )

        if ( msg.content.startsWith( `${ prefix }` ) )
        {

            const args = msg.content.substring( `${ prefix.length }` ).trim().split( ' ' )
            if ( autocorrect( args[ 0 ] ) != args[ 0 ] )
            {
                const command = client.textCommands.get( autocorrect( args[ 0 ] ) )

                if ( command.permissions.ownerOnly === true && !msg.author.id == '714473790939332679' ) { return }

                if ( command.permissions.staffOnly === true && !msg.member._roles.includes( '963537947255255092' ) ) { return }

                if ( command.permissions.adminOnly === true && !msg.member._roles.includes( '963537994596364288' ) ) { return }

                return msg.author.send( { content: `Did you mean \`${ autocorrect( args[ 0 ] ) }\`?` } ).catch( () => { } )
            }

            const command = client.textCommands.get( args[ 0 ].toLowerCase() )

            if ( !command ) { return } else
            {

                if ( command.permissions.ownerOnly === true && !msg.author.id == '714473790939332679' ) { return }

                if ( command.permissions.staffOnly === true && !msg.member._roles.includes( '963537947255255092' ) ) { return }

                if ( command.permissions.adminOnly === true && !msg.member._roles.includes( '963537994596364288' ) ) { return }

                args.shift()

                if ( command.help.helpEmbed === true && args.length === 0 )
                {

                    const helpEmbed = new MessageEmbed()
                        .setTitle( `Use of ${ command.data.name }` )
                        .setAuthor( {
                            name: "PYL Bot#9640",
                            iconURL: client.user.avatarURL(),
                        } )
                        .setColor( "GREEN" )
                        .setDescription(
                            `Syntax and use of \`${ command.data.name }\` command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`\n${ prefix }${ command.help.helpSyntax }\`\`\`\n\`\`\`\nUse:\n${ command.help.helpDescription }\`\`\``
                        )

                    return msg.reply( { embeds: [ helpEmbed ] } ).then( reply => setTimeout( () =>
                    {
                        reply.delete().catch( () => { } )
                        msg.delete().catch( () => { } )
                    }, 15000 ) )
                }

                try
                {

                    command.execute( msg, client, args )

                } catch ( error )
                {

                    msg.reply( { content: 'There was an error. Please contact Matrical ASAP' } )

                }
            }
        }
    }
}
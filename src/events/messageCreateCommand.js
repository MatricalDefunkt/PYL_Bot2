require('dotenv').config();
const prefix = process.env.PREFIX
const fs = require('fs');
const path = require('path');

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
    async handle ( client, msg ) 
    {

        if ( !msg.guild ) return;
        if ( msg.author.bot ) return;
        if ( msg.content.startsWith( `${ prefix }` ) )

        {

            const args = msg.content.substring( `${ prefix.length }` ).split( ' ' )
            if ( autocorrect( args[ 0 ] ) != args[ 0 ] )
            {
                const command = client.textCommands.get( autocorrect( args[ 0 ] ) )
                
                if ( command.permissions.ownerOnly === true && !msg.author.id == '714473790939332679' ) { return }

                if ( command.permissions.staffOnly === true && !msg.member._roles.includes( '963537947255255092' ) ) { return }

                if ( command.permissions.adminOnly === true && !msg.member._roles.includes( '963537994596364288' ) ) { return }

                return msg.author.send( { content: `Did you mean \`${ autocorrect( args[ 0 ] ) }\`?` } )
            }
            const command = client.textCommands.get( args[ 0 ].toLowerCase() )

            if ( !command ) { return } else
            {

                if ( command.permissions.ownerOnly === true && !msg.author.id == '714473790939332679' ) { return }

                if ( command.permissions.staffOnly === true && !msg.member._roles.includes( '963537947255255092' ) ) { return }

                if ( command.permissions.adminOnly === true && !msg.member._roles.includes( '963537994596364288' ) ) { return }

                args.shift()

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
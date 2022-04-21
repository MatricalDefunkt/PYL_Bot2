require( 'dotenv' ).config();
const { Client, Collection } = require( 'discord.js' );
const { tempBans } = require( './database/database' );
const token = process.env.TOKEN;
const path = require( 'path' )
const fs = require( 'fs' );

const client = new Client( { intents: 131071 } );

const textCommandFiles = fs.readdirSync( path.join( __dirname, './commands_chat' ) ).filter( file => file.endsWith( '.js' ) );
const slashCommandFiles = fs.readdirSync( path.join( __dirname, './commands_slash' ) ).filter( file => file.endsWith( '.js' ) );
const eventFiles = fs.readdirSync( path.join( __dirname, './events' ) ).filter( file => file.endsWith( 'js' ) )

client.textCommands = new Collection();
const names = []

for ( const file of textCommandFiles )
{
	const textCommand = require( `./commands_chat/${ file }` );
	names.push( textCommand.data.name )
	client.textCommands.set( textCommand.data.name, textCommand );
}

client.slashCommands = new Collection();

for ( const file of slashCommandFiles )
{
	const slashCommand = require( `./commands_slash/${ file }` );
	client.slashCommands.set( slashCommand.data.name, slashCommand );
}

client.once( 'ready', () =>
{
	console.log( 'Ready!' );
	client.user.setPresence( { status: `idle` } );
	client.user.setActivity( { name: `PYL do PYL stuff`, type: 3 } )
} );

//Event Handler
for ( const file of eventFiles )
{
	const event = require( `./events/${ file }` );
	if ( event.once )
	{
		client.once( event.name, ( ...args ) => event.handle( client, ...args ) );
	} else
	{
		client.on( event.name, ( ...args ) => event.handle( client, ...args ) );
	}
	
}

module.exports = {
	names
}

client.login( token );

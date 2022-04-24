require( 'dotenv' ).config();
const { Client, Collection } = require( 'discord.js' );
const { tempBans } = require( './src/database/database' );
const token = process.env.TOKEN;
const path = require( 'path' )
const fs = require( 'fs' );
const { Op } = require( 'sequelize' );

const client = new Client( { intents: 131071 } );

const textCommandFiles = fs.readdirSync( path.join( __dirname, './src/commands_chat' ) ).filter( file => file.endsWith( '.js' ) );
const slashCommandFiles = fs.readdirSync( path.join( __dirname, './src/commands_slash' ) ).filter( file => file.endsWith( '.js' ) );
const eventFiles = fs.readdirSync( path.join( __dirname, './src/events' ) ).filter( file => file.endsWith( 'js' ) )

client.textCommands = new Collection();
const names = []

for ( const file of textCommandFiles )
{
	const textCommand = require( `./src/commands_chat/${ file }` );
	names.push( textCommand.data.name )
	client.textCommands.set( textCommand.data.name, textCommand );
}

client.slashCommands = new Collection();

for ( const file of slashCommandFiles )
{
	const slashCommand = require( `./src/commands_slash/${ file }` );
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
	const event = require( `./src/events/${ file }` );
	if ( event.once )
	{
		client.once( event.name, ( ...args ) => event.handle( client, ...args ) );
	} else
	{
		client.on( event.name, ( ...args ) => event.handle( client, ...args ) );
	}

}

// TempBan Check
setInterval( async () =>
{
	const tempBan = await tempBans.findOne( {
		where: {
			finishTimeStamp: {
				[ Op.lt ]:
					Math.trunc(Date.now()/1000)
			}
		}
	} )

	if ( !tempBan ) return;

	const banGuild = await client.guilds.fetch( String( tempBan.getDataValue( 'guildID' ) ), false );
	banGuild.bans.remove( tempBan.getDataValue( 'userID' ), `Temporary ban of duration: ${ Math.trunc( ( Date.now() - tempBan.getDataValue( 'finishTimeStamp' ) ) / 86400 ) } days.` ).catch( error => { return console.error( error ) } )
	await tempBan.destroy().catch( error => console.error( error ) )
	return

}, 1000 );

client.login( token );

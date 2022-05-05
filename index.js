require( 'dotenv' ).config();
const { Client, Collection } = require( 'discord.js' );
const { tempBans, Prefix } = require( './src/database/database' );
const token = process.env.TOKEN;
const path = require( 'path' )
const fs = require( 'fs' );
const { Op } = require( 'sequelize' );

const client = new Client( { intents: 131071, failIfNotExists: false } );

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

client.prefixes = new Collection();

Prefix.findAll().then( async ( [ command, tag ] ) =>
{
	if ( !command || !tag )
	{
		const newCommand = await Prefix.findOrCreate( { where: { type: 'command' }, defaults: { prefix: '!!' } } )
		const newTag = await Prefix.findOrCreate( { where: { type: 'tag' }, defaults: { prefix: '--' } } )
		client.prefixes.set( 'command', newCommand.getDataValue( 'prefix' ) );
		client.prefixes.set( 'tag', newTag.getDataValue( 'prefix' ) );
		console.log( client.prefixes )
		return
	} else
	{
		client.prefixes.set( 'command', command.getDataValue( 'prefix' ) );
		client.prefixes.set( 'tag', tag.getDataValue( 'prefix' ) );
		console.log( client.prefixes )
	}
} )

client.once( 'ready', async () =>
{
	console.log( 'Ready!' );
	client.user.setPresence( { status: `idle` } );
	client.user.setActivity( { name: `PYL do PYL stuff`, type: 3 } )

	const testGuild = await client.guilds.fetch( { force: false, cache: true, guild: '945355751260557393' } );
	const errChannel = await testGuild.channels.fetch( '948089637774188564', { force: false, cache: true } );
	errChannel.send( { content: `${ client.user } logged in while watching ${ client.guilds.cache.reduce( ( acc, guild ) => acc + guild.memberCount, 0 ) } members, at the moment, and command prefix \`${ client.prefixes.get( 'command' ) }\`, along with command prefix of \`${ client.prefixes.get( 'tag' ) }\` at <t:${ Math.trunc( client.readyTimestamp / 1000 ) }:F>.` } )
	const confessionsBot = await testGuild.members.fetch( { force: true, cache: true, user: '937038291998478456' } )
	if ( !confessionsBot.presence )
	{
		await errChannel.send( { content: '<@714473790939332679>, <@937038291998478456> is offline.' } )
	}

} );

// Event Handler
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
					Math.trunc( Date.now() / 1000 )
			}
		}
	} )

	if ( !tempBan ) return;

	const banGuild = await client.guilds.fetch( String( tempBan.getDataValue( 'guildID' ) ), false );
	banGuild.bans.remove( tempBan.getDataValue( 'userID' ), `Temporary ban of duration: ${ Math.trunc( ( Math.trunc( Date.now() / 1000 ) - tempBan.getDataValue( 'finishTimeStamp' ) ) / 86400 ) } days.` ).catch( error => { return console.error( error ) } )
	await tempBan.destroy().catch( error => console.error( error ) )
	return

}, 1000 );

//Check if ConfessionsBot is online, ping if not

setInterval( async () =>
{
	const testGuild = await client.guilds.fetch( { force: false, cache: true, guild: '945355751260557393' } );
	const confessionsBot = await testGuild.members.fetch( { force: false, cache: true, user: '937038291998478456' } )
	if ( !confessionsBot.presence )
	{
		const errChannel = await testGuild.channels.fetch( '948089637774188564' );
		await errChannel.send( { content: '<@714473790939332679>, <@937038291998478456> is offline.' } )
	}
}, 600000 );

client.login( token );

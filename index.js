require( 'dotenv' ).config();
const { Client, Collection, Intents } = require( 'discord.js' );
const { tempInfractions, Prefix, Infractions } = require( './src/database/database' );
const token = process.env.TOKEN;
const path = require( 'path' )
const fs = require( 'fs' );
const { Op, where } = require( 'sequelize' );

const client = new Client( { intents: 66559, failIfNotExists: false } );

const textCommandFiles = fs.readdirSync( path.join( __dirname, './src/commands_chat' ) ).filter( file => file.endsWith( '.js' ) );
const slashCommandFiles = fs.readdirSync( path.join( __dirname, './src/commands_slash' ) ).filter( file => file.endsWith( '.js' ) );
const eventFiles = fs.readdirSync( path.join( __dirname, './src/events' ) ).filter( file => file.endsWith( 'js' ) )

const allCommands = new Collection();

client.textCommands = new Collection();
const names = []

for ( const file of textCommandFiles )
{
	const textCommand = require( `./src/commands_chat/${ file }` );
	names.push( textCommand.data.name )
	client.textCommands.set( textCommand.data.name, textCommand );
	allCommands.set( textCommand.data.name, textCommand );
}

client.slashCommands = new Collection();

for ( const file of slashCommandFiles )
{
	const slashCommand = require( `./src/commands_slash/${ file }` );
	client.slashCommands.set( slashCommand.data.name, slashCommand );
	allCommands.set( slashCommand.data.name, slashCommand );
}

client.prefixes = new Collection();

client.once( 'ready', async () =>
{
	const testGuild = await client.guilds.fetch( { force: false, cache: true, guild: '945355751260557393' } );
	const errChannel = await testGuild.channels.fetch( '948089637774188564', { force: false, cache: true } );
	errChannel.send( { content: `${ client.user } logged in while watching ${ client.guilds.cache.reduce( ( acc, guild ) => acc + guild.memberCount, 0 ) } members, at the moment, at <t:${ Math.trunc( client.readyTimestamp / 1000 ) }:F>.` } )
	Prefix.findAll().then( async ( [ command, tag ] ) =>
	{
		if ( !command || !tag )
		{
			Prefix.findOne( { where: { type: 'command' } } )
				.then( commandPrefix =>
				{
					if ( !commandPrefix )
					{
						Prefix.create( {
							type: 'command',
							prefix: '!!'
						} )
							.then( createdPrefix =>
							{
								client.prefixes.set( 'command', createdPrefix.getDataValue( 'prefix' ) )
								errChannel.send( ` Command prefix => \`${ client.prefixes.get( 'command' ) }\`` )
							} )
							.catch( err =>
							{
								console.error( err );
								client.destroy()
							} )
					} else
					{
						client.prefixes.set( 'command', commandPrefix.getDataValue( 'prefix' ) );
						errChannel.send( ` Command prefix => \`${ client.prefixes.get( 'command' ) }\`` )
					}
				} )
				.catch( err =>
				{
					console.error( err );
					client.destroy()
				} )
			Prefix.findOne( { where: { type: 'tag' } } )
				.then( tagPrefix =>
				{
					if ( !tagPrefix )
					{
						Prefix.create( {
							type: 'tag',
							prefix: '--'
						} )
							.then( createdPrefix =>
							{
								client.prefixes.set( 'tag', createdPrefix.getDataValue( 'prefix' ) )
								errChannel.send( `Tag prefix => \`${ client.prefixes.get( 'tag' ) }\`` )
							} )
							.catch( err =>
							{
								console.error( err );
								client.destroy()
							} )
					} else
					{
						client.prefixes.set( 'tag', tagPrefix.getDataValue( 'prefix' ) );
					}
				} )
				.catch( err =>
				{
					console.error( err );
					client.destroy()
				} )
			console.log( client.prefixes )
			return
		} else
		{
			client.prefixes.set( 'command', command.getDataValue( 'prefix' ) );
			client.prefixes.set( 'tag', tag.getDataValue( 'prefix' ) );
			console.log( client.prefixes )
			const testGuild = await client.guilds.fetch( { force: false, cache: true, guild: '945355751260557393' } );
			const errChannel = await testGuild.channels.fetch( '948089637774188564', { force: false, cache: true } );
			errChannel.send( { content: `${ client.user } logged in while watching ${ client.guilds.cache.reduce( ( acc, guild ) => acc + guild.memberCount, 0 ) } members, at the moment, and command prefix \`${ client.prefixes.get( 'command' ) }\`, along with command prefix of \`${ client.prefixes.get( 'tag' ) }\` at <t:${ Math.trunc( client.readyTimestamp / 1000 ) }:F>.` } )
		}
	} )

	console.log( 'Ready!' );
	client.user.setPresence( { status: `idle` } );
	client.user.setActivity( { name: `PYL do PYL stuff`, type: 3 } )

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

// Temporary infractions Check
setInterval( async () =>
{
	const infraction = await Infractions.findOne( {
		where: {
			duration: {
				[ Op.lt ]:
					`${ Math.trunc( Date.now() / 1000 ) }`
			}
		}
	} )

	if ( !infraction ) return;

	if ( infraction.getDataValue( 'type' ) === 'TempMute' )
	{
		const guild = await client.guilds.fetch( { force: false, cache: true, guild: '945355751260557393' } )
		const mute = await guild.members.fetch( { member: infraction.getDataValue( 'targetID' ), force: false, cache: true } )
		mute.roles.remove( '974245786781102081', `Temporary mute of duration: ${ Math.trunc( ( Math.trunc( Date.now() / 1000 ) - infraction.getDataValue( 'duration' ) ) / 3600 ) } hour(s).` )
			.then( async () =>
			{
				await infraction.update( { duration: `Completed` }, { where: { caseID: infraction.getDataValue( 'caseID' ) } } )
			} )
			.catch( async ( err ) =>
			{
				console.error( err )
				const testGuild = await client.guilds.fetch( { force: false, cache: true, guild: '945355751260557393' } );
				const errChannel = await testGuild.channels.fetch( '948089637774188564', { force: false, cache: true } );
				errChannel.send( { content: `<@714473790939332679>, could not unmute <@${ infraction.getDataValue( 'targetID' ) }> for some reason. Check console.` } )
			} )
	} else if ( infraction.getDataValue( 'type' ) === 'TempBan' )
	{
		const guild = await client.guilds.fetch( { force: false, cache: true, guild: '945355751260557393' } )
		guild.bans.remove( infraction.getDataValue( 'targetID' ), `Temporary ban of duration: ${ Math.trunc( ( Math.trunc( Date.now() / 1000 ) - infraction.getDataValue( 'duration' ) ) / 3600 ) } hour(s).` )
			.then( async () =>
			{
				await infraction.update( { duration: `Completed` }, { where: { caseID: infraction.getDataValue( 'caseID' ) } } )
			} )
			.catch( async ( err ) =>
			{
				console.error( err )
				const testGuild = await client.guilds.fetch( { force: false, cache: true, guild: '945355751260557393' } );
				const errChannel = await testGuild.channels.fetch( '948089637774188564', { force: false, cache: true } );
				errChannel.send( { content: `<@714473790939332679>, could not unmute <@${ infraction.getDataValue( 'targetID' ) }> for some reason. Check console.` } )
			} )
	}

	return

}, 5000 );

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

setTimeout( () =>
{
	client.login( token );
}, 5000 );

module.exports = {
	allCommands
}

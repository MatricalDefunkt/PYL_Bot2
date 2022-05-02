/** @format */

require( "dotenv" ).config();
const errChannelId = process.env.ERRCHANNELID;
const errGuildId = process.env.ERRGUILDID;
const { Embed } = require( "@discordjs/builders" );
const { MessageEmbed, Permissions, Client, Channel, GuildChannel } = require( "discord.js" );

/**
 * Converts any casing with spaces to Title Casing
 * @param {String} str
 */
function toTitleCase ( str )
{
	return str.replace(
		/\w\S*/g,
		function ( txt )
		{
			return txt.charAt( 0 ).toUpperCase() + txt.substring( 1 ).toLowerCase();
		}
	);
}

/**
 * Creates a webhook for a server changes logger, which logs even the channel which was just created.
 * @param {GuildChannel} channelForWebhook 
 * @param {Client} client 
 * @param {GuildChannel} channel 
 * @param {MessageEmbed} sendEmbed 
 */
async function createWebhook ( channelForWebhook, client, channel, sendEmbed )
{
	const serverWebhook = await channelForWebhook.createWebhook(
		"PYL Server Logs",
		{
			avatar: client.user.avatarURL(),
			reason: "Server changes logging webhook.",
		}
	);
	serverWebhook
		.send( {
			content: `A new channel ${ channel.toString() } was created.`,
			embeds: [ sendEmbed ],
		} )
		.catch( async ( err ) =>
		{
			const errGuild = await client.guilds.fetch( `${ errGuildId }` );
			const errChannel = await errGuild.channels.fetch( `${ errChannelId }` );

			console.error( err );

			await errChannel.send( {
				content: `There was an error:\n\`\`\`js\n${ err }\`\`\``,
			} );
		} );
}

module.exports = {
	name: "channelCreate",
	/**
	 * @param {Client} client 
	 * @param {GuildChannel} channel 
	 */
	async handle ( client, channel )
	{
		if ( channel.type === "GUILD_CATEGORY" ) return;
		const auditEntry = (
			await channel.guild.fetchAuditLogs( { type: 10, limit: 1 } )
		).entries.at( 0 );

		const allowPerms = [];
		const denyPerms = [];
		for ( const value of channel.permissionOverwrites.cache )
		{
			allowPerms.push( { id: value[ 0 ], bits: value[ 1 ].allow } );
			denyPerms.push( { id: value[ 0 ], bits: value[ 1 ].deny } );
		}

		let allowTextArray;
		allowPerms.forEach( element =>
		{
			allowTextArray = element.bits.toArray()
		} )
		let denyTextArray;
		denyPerms.forEach( element =>
		{
			console.log( element );
			console.log( ( ( element.bits.bitfield == 0n ) ) )
			denyTextArray = element.bits.toArray()
		} )

		let allowText = allowTextArray.join( ', ' ).replaceAll( '_', ' ' )
		let denyText = denyTextArray.join( ', ' ).replaceAll( '_', ' ' )


		allowText = toTitleCase( allowText )
		denyText = toTitleCase( denyText );

		console.log( allowText, denyText );

		const sendEmbed = new MessageEmbed()
			.setAuthor( {
				name: channel.name,
				iconURL: channel.guild.iconURL(),
			} )
			.setDescription(
				`A channel was created under ${ channel.parent ? channel.parent.name : `\`no category\``
				}: ${ channel.toString() }:\n`
			)
			.addField(
				"Details:",
				`\nID: ${ channel.id }\nPosition: ${ channel.rawPosition }\n`
			)
			.addField( "Creator:", `${ auditEntry.executor.toString() }` )
			// .addFields()
			.setColor( "DARK_BLUE" )
			.setTimestamp();

		const _logChannel = channel.guild.channels.cache.find(
			( channel ) =>
				channel.name === "🔃┃server-changes" &&
				channel.type === "GUILD_TEXT"
		);
		const logChannel = _logChannel ? await _logChannel.fetch() : null;

		const webhooks = logChannel ? await logChannel.fetchWebhooks() : null;
		const webhook = webhooks
			? webhooks.find(
				( hook ) =>
					hook.name === "PYL Server Logs" &&
					hook.owner.id === client.user.id
			)
			: null;

		if ( !logChannel )
		{
			const category = channel.guild.channels.cache.find(
				( channel ) =>
					channel.name === "━━━━ Mod Logs ━━━━" &&
					channel.type === "GUILD_CATEGORY"
			);
			try
			{
				let newCategory;
				if ( !category )
				{
					newCategory = await channel.guild.channels.create(
						"━━━━ Mod Logs ━━━━",
						{
							type: "GUILD_CATEGORY",
							permissionOverwrites: [
								{
									deny: Permissions.FLAGS.VIEW_CHANNEL,
									id: channel.guildId,
								},
								{
									allow: Permissions.FLAGS.VIEW_CHANNEL,
									id: "963537947255255092",
								},
							],
						}
					);
				}
				const newLogChannel = await channel.guild.channels.create(
					"🔃┃server-changes",
					{
						type: "GUILD_TEXT",
						permissionOverwrites: [
							{
								deny: Permissions.FLAGS.VIEW_CHANNEL,
								id: channel.guildId,
							},
							{
								allow: Permissions.FLAGS.VIEW_CHANNEL,
								id: "963537947255255092",
							},
						],
						parent: category ? category.id : newCategory.id,
					}
				);
				newLogChannel.lockPermissions();
				createWebhook( newLogChannel, client, channel, sendEmbed );
			} catch ( error )
			{
				const errGuild = await client.guilds.fetch( `${ errGuildId }` );
				const errChannel = await errGuild.channels.fetch(
					`${ errChannelId }`
				);

				console.error( error );

				await errChannel.send( {
					content: `There was an error:\n\`\`\`js\n${ error }\`\`\``,
				} );
				return;
			}
		}
		if ( webhook )
		{
			webhook
				.send( {
					content: `A new channel, ${ channel.toString() }, was created.`,
					embeds: [ sendEmbed ],
				} )
				.catch( async ( err ) =>
				{
					const errGuild = await client.guilds.fetch( `${ errGuildId }` );
					const errChannel = await errGuild.channels.fetch(
						`${ errChannelId }`
					);

					console.error( err );

					await errChannel.send( {
						content: `There was an error:\n\`\`\`js\n${ err }\`\`\``,
					} );
				} );
			return;
		}
	},
};

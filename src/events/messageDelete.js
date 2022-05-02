require( "dotenv" ).config();
const errChannelId = process.env.ERRCHANNELID;
const errGuildId = process.env.ERRGUILDID;
const { MessageEmbed, Permissions, Client, Message } = require( "discord.js" );

const createWebhook = async ( channelForWebhook, client, msg, sendEmbed ) =>
{
	const messageWebhook = await channelForWebhook.createWebhook(
		"PYL Message Logs",
		{
			avatar: client.user.avatarURL(),
			reason: "Message logging webhook.",
		}
	);
	messageWebhook
		.send( {
			content: `Deleted message by ${ msg.author.tag }`,
			embeds: [ sendEmbed ],
		} )
		.catch( async ( err ) =>
		{
			const errGuild = await client.guilds.fetch(
				`${ errGuildId }`
			);
			const errChannel = await errGuild.channels.fetch(
				`${ errChannelId }`
			);

			console.error( error );

			await errChannel.send( {
				content: `There was an error:\n\`\`\`js\n${ err }\`\`\``,
			} );
		} );
}

const getReply = async ( msgId, msg ) =>
{
	const reply = await msg.channel.messages.fetch( msgId ).catch( async error =>
	{
		if ( error.code === 10008 ) return
		const errGuild = await client.guilds.fetch(
			`${ errGuildId }`
		);
		const errChannel = await errGuild.channels.fetch(
			`${ errChannelId }`
		);

		console.error( error );

		await errChannel.send( {
			content: `There was an error:\n\`\`\`js\n${ err }\`\`\``,
		} )
	} )
	return ( reply ) ? reply.content + `\n\n[Jump to Reply](${reply.url})` : ( ( msg.channel.messages.cache.get( msgId ) ) ? msg.channel.messages.cache.get( msgId ).content + `\n\n[Jump to Reply](${msg.channel.messages.cache.get( msgId ).url})` : "Message was not found." )
}

module.exports = {
	name: "messageDelete",
	/**
	 * Handles the messageDelete event
	 * @param {Client} client 
	 * @param {Message} msg 
	 */
	async handle ( client, msg )
	{
		if ( msg.author.bot ) return;
		const sendEmbed = new MessageEmbed()
			.setAuthor( {
				name:
					msg.member.nickname === null
						? msg.author.tag
						: `${ msg.member.nickname } (${ msg.author.tag })`,
				iconURL: msg.author.avatarURL(),
			} )
			.setDescription(
				`A deleted message was recovered from ${ msg.channel.toString() }:\n`
			)
			.addField( "Content:", `\n${ msg.content }` )
			.addField(
				"In reply to:",
				!msg.reference
					? "`Null`"
					: `\n${ await getReply( msg.reference.messageId, msg ) }`
			)
			.setColor( "RED" );

		const _logChannel = msg.guild.channels.cache.find(
			( channel ) =>
				channel.name === "🔴┃message-log" &&
				channel.type === "GUILD_TEXT"
		);
		const logChannel = ( _logChannel ) ? await _logChannel.fetch() : null

		const webhooks = ( logChannel ) ? await logChannel.fetchWebhooks() : null
		const webhook = ( webhooks ) ? webhooks.find( hook => hook.name === 'PYL Message Logs' && hook.owner.id === client.user.id ) : null

		if ( !logChannel )
		{
			const category = msg.guild.channels.cache.find(
				( channel ) =>
					channel.name === "━━━━ Mod Logs ━━━━" &&
					channel.type === "GUILD_CATEGORY"
			);
			try
			{
				let newCategory;
				if ( !category )
				{
					newCategory = await msg.guild.channels.create(
						"━━━━ Mod Logs ━━━━",
						{
							type: "GUILD_CATEGORY",
							permissionOverwrites: [
								{
									deny: Permissions.FLAGS.VIEW_CHANNEL,
									id: msg.guildId,
								},
								{
									allow: Permissions.FLAGS.VIEW_CHANNEL,
									id: "963537947255255092",
								},
							],
						}
					);
				}
				const newLogChannel = await msg.guild.channels.create(
					"🔴┃message-log",
					{
						type: "GUILD_TEXT",
						permissionOverwrites: [
							{
								deny: Permissions.FLAGS.VIEW_CHANNEL,
								id: msg.guildId,
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
				createWebhook( newLogChannel, client, msg, sendEmbed )
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
					content: `Deleted message by ${ msg.author.tag }`,
					embeds: [ sendEmbed ]
				} )
				.catch( async ( err ) =>
				{
					const errGuild = await client.guilds.fetch(
						`${ errGuildId }`
					);
					const errChannel = await errGuild.channels.fetch(
						`${ errChannelId }`
					);

					console.error( error );

					await errChannel.send( {
						content: `There was an error:\n\`\`\`js\n${ err }\`\`\``,
					} );
				} );
			return;
		}
	},
};

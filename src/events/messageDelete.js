

require( "dotenv" ).config();
const errChannelId = process.env.ERRCHANNELID;
const errGuildId = process.env.ERRGUILDID;
const { MessageEmbed, Permissions } = require( "discord.js" );

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
		.then( ( msg ) =>
		{
			messageWebhook.delete();
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

module.exports = {
	name: "messageDelete",
	async handle ( client, msg )
	{
		if (msg.author.bot) return;
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
					: `\n${ (
						await msg.channel.messages.fetch(
							msg.reference.messageId
						)
					).content
					}`
			)
			.setColor( "RED" );
		const _logChannel = msg.guild.channels.cache.find(
			( channel ) =>
				channel.name === "🔴┃message-log" &&
				channel.type === "GUILD_TEXT"
		);
		const logChannel = await _logChannel.fetch();

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
						parent: category.id ? category.id : newCategory.id,
					}
				);
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
		} else
		{
			createWebhook( logChannel, client, msg, sendEmbed )
		}
	},
};

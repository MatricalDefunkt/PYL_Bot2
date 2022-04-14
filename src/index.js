require('dotenv').config();
const { Client, Intents, Collection } = require('discord.js');
const { Tags } = require('./database/database');
const token = process.env.TOKEN;
const errChannelId = process.env.ERRCHANNELID;
const errGuildId = process.env.ERRGUILDID;
const prefix = process.env.PREFIX;
const tagprefix = process.env.TAGPREFIX;
const path = require('path')
const fs = require('fs');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

const textCommandFiles = fs.readdirSync(path.join(__dirname, './chatcommands')).filter(file => file.endsWith('.js'));

client.textCommands = new Collection();

for (const file of textCommandFiles) {
	const textCommand = require(`./chatcommands/${file}`);
	client.textCommands.set(textCommand.data.name, textCommand);
}

client.once('ready', () => {
	console.log('Ready!');
	client.user.setPresence({status: `idle`});
	client.user.setActivity({name: `PYL do PYL stuff`, type:3})
});

let errGuild;
let errChannel;

const getErrChannel = async (errGuild, errChannel) => { 

	errGuild = await client.guilds.fetch(`${errGuildId}`)
	errChannel = errGuild.channels.cache.get(`${errChannelId}`)
	return errChannel, errGuild;

}

getErrChannel(errGuild, errChannel);

//Command listener
client.on('messageCreate', async (msg) => {

	if (!msg.guild) return;
	if (msg.author.bot) return;
	if (msg.content.startsWith(`${prefix}`)) {

		const args = msg.content.substring(`${prefix.length}`).toLowerCase().split(' ')
		const command = client.textCommands.get(args[0])

		if (!command) {return} else {

			if (command.data.ownerOnly === true && !msg.author.id == '714473790939332679') {
				return
			}
			if (command.data.staffOnly === true && !msg.member._roles.includes('963537947255255092')) {
				return
			}

			if (command.data.adminOnly === true && !msg.member._roles.includes('963537994596364288')) {
				return
			}

			if (!args[1]) {
				return msg.reply({embeds:[command.helpEmbed]}).then(msg => setTimeout(() => {
					try {
						msg.delete()
					} catch (err) {console.error(err)}
				}, 300))
			}

			args.shift()
			
			try {

				command.execute(msg, client, args)

			} catch (error) {

				errChannel.send({content: `An error was caught: \n\`\`\`js\n${error.stack}\`\`\``})

			}
		}
	}
})

//Tag Listener
client.on('messageCreate', async (msg) => {

	if (!msg.guild) return;
	if (msg.author.bot) return;
	if (msg.content.startsWith(`${tagprefix}`)) {

		if (msg.content.length <= 2) {
			const reply = await msg.reply({content: `Please provide a tag`});
			msg.delete()
			setTimeout(() => {
				reply.delete()
			}, 10000);
			return;
		}
		
		const tag = await Tags.findOne({where: {tagName: `${msg.content.slice(2)}`}});

		if (!tag) {
			const reply = await msg.reply({content: `Tag \`${msg.content.slice(2)}\` was not found.`});
			msg.delete()
			setTimeout(() => {
				reply.delete()
			}, 10000);
			return;
		}

		switch (tag.getDataValue('tagPerms')) {
			case 0:
				return msg.reply({content: `${tag.getDataValue('tagReply')}`})
			case 1:
				if (msg.member._roles.includes('963537947255255092')) {return msg.reply({content: `${tag.getDataValue('tagReply')}`})} else return msg.reply({content: `Missing permissions`})	
			case 2:
				if (msg.member._roles.includes('963537994596364288')) {return msg.reply({content: `${tag.getDataValue('tagReply')}`})} else return msg.reply({content: `Missing permissions`})
		}

	}
})

client.on('error', async (err) => {

	getErrChannel(errGuild, errChannel);

	errChannel.send({content: `An error was caught: \n\`\`\`js\n${err.stack}\`\`\``})

});

client.login(token);
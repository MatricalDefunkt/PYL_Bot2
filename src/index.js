require('dotenv').config();
const { Client, Intents, Collection } = require('discord.js');
const { Sequelize } = require('sequelize')
const token = process.env.TOKEN;
const errChannelId = process.env.ERRCHANNELID;
const errGuildId = process.env.ERRGUILDID;
const prefix = process.env.PREFIX;
const fs = require('fs');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

const textCommandFiles = fs.readdirSync('./chatcommands').filter(file => file.endsWith('.js'));



const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Tags = sequelize.define('tags', {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
	description: Sequelize.TEXT,
	username: Sequelize.STRING,
	usage_count: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	},
});

client.textCommands = new Collection();

for (const file of textCommandFiles) {
	const textCommand = require(`./chatcommands/${file}`);
	client.textCommands.set(textCommand.data.name, textCommand);
}

client.once('ready', () => {
	console.log('Ready!');
	const members = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
	client.user.setPresence({status: `idle`});
	client.user.setActivity({name: `PYL do PYL stuff`, type:3})
});

let errGuild
let errChannel

const getErrChannel = async (errGuild, errChannel) => { 

	errGuild = await client.guilds.fetch(`${errGuildId}`)
	errChannel = errGuild.channels.cache.get(`${errChannelId}`)
	return errChannel, errGuild;

}

client.on('interactionCreate', async interaction => {

	getErrChannel(errGuild, errChannel);

	if (interaction.isCommand()) {

		const command = client.commands.get(interaction.commandName);
		if (!command) return;

		try {

			await interaction.deferReply({ephemeral:true});
			await command.execute(interaction, client);

		} catch (error) {

			console.error(error);
			errChannel.send({content: `An error was caught: \n\`\`\`js\n${error.stack}\`\`\``})

		};

	}

	if (interaction.isContextMenu()) {

		try {

			await interaction.deferReply({ ephemeral: true });
        	const contextMenu = client.contextMenus.get(interaction.commandName);
			if (contextMenu) contextMenu.execute(interaction, client);
			
		} catch (error) {

			console.error(error);
			errChannel.send({content: `An error was caught: \n\`\`\`js\n${error.stack}\`\`\``})
			
		};
    }

	if (interaction.isButton()) {

		const button = client.buttons.get(interaction.customId);
		if (!button) return;

		try {

			await button.execute(interaction, client);

		} catch (error) {

			console.error(error);
			errChannel.send({content: `An error was caught: \n\`\`\`js\n${error.stack}\`\`\``})

		};

	}

});

client.on('messageCreate', async (msg) => {

	getErrChannel(errGuild, errChannel);

	if (!msg.guild) return;
	if (msg.author.bot) return;
	if (msg.content.startsWith(`${prefix}`)) {

		const args = msg.content.substring(`${prefix.length}`).toLowerCase().split(' ')
		const command = client.textCommands.get(args[0])
		


		if (!command) {

			return

		} else {

			if (!args[1]) return msg.reply({embeds:[command.helpEmbed]})
			args.shift()
			
			try {

				command.execute(msg, client, args)

			} catch (error) {

				errChannel.send({content: `An error was caught: \n\`\`\`js\n${error.stack}\`\`\``})

			}
		}
	}
})

client.on('error', async (err) => {

	getErrChannel(errGuild, errChannel);

	errChannel.send({content: `An error was caught: \n\`\`\`js\n${err.stack}\`\`\``})

});


class CommandDaddy {
	
	commandType(type) {
		this.type = type
	}

	commandName(name) {
		if (name.length > 16) throw new RangeError(`Error:\nCommand names cannot be longer than 15 characters, but ${name} has a length of ${name.length}`)
	}

}

module.exports = { CommandDaddy }



client.login(token);

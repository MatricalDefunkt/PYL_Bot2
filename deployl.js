require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const token = process.env.TOKEN
const fs = require('fs');
const guildId = process.env.GUILDID;
const clientId = process.env.CLIENTID;

const commands = [];
const commandFiles = fs
  .readdirSync("./src/commands_slash")
  .filter((file) => file.endsWith(".js"));
const contextFiles = fs
  .readdirSync("./src/commands_contextmenu")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./src/commands_slash/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands. (**LOCAL ONLY**)');

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands. (**LOCAL ONLY**)');
	} catch (error) {
		console.error(error);
	}
})();

require("dotenv").config();
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
const { token } = process.env.TOKEN;
import fs from 'fs';
const { guildId } = process.env.GUILDID;
const { clientId } = process.env.CLIENTID;

const commands = [];
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
const contextFiles = fs
  .readdirSync("./contextmenus")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

for (const file of contextFiles) {
  const contextMenu = require(`./contextmenus/${file}`);
  commands.push(contextMenu.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(token);

async () => {
  try {
    console.log(
      "Started refreshing application (/) commands. (**LOCAL ONLY**)"
    );

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });

    console.log(
      "Successfully reloaded application (/) commands. (**LOCAL ONLY**)"
    );
  } catch (error) {
    console.error(error);
  }
};

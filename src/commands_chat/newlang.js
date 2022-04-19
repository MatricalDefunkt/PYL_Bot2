const { Permissions, MessageEmbed } = require("discord.js");

module.exports = {
   data: {
    name: "newlang",
    ownerOnly: false,
    staffOnly: false,
    adminOnly: true,
  },
  helpEmbed: new MessageEmbed()
  .setTitle("Use of NewLang")
  .setAuthor({
    name: "PYL Bot#9640",
    iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
  })
  .setColor("GREEN")
  .setDescription(
    `Syntax and use of 'newlang' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   !!newlang <name of new language>\`\`\`\n\`\`\`\nUse:\nNewLang helps in creating a new language category by making a new category, general chat, no-speaking text, and voice channel.\nOnce you've run the first command, that is !!newlang <name of language>, you will be asked for 3 inputs, namely the names of the three channels.\`\`\``
  ),
  async execute(msg, client, args) {

    if (!args[0]) {
      return msg.reply({embeds:[this.helpEmbed]}).then(msg => setTimeout(() => {
        try {
          msg.delete()
        } catch (err) {
          console.error(err)
        }
      }, 30000))
    }

    reply = await msg.reply({ content: `Creating...` });

    const category = await msg.guild.channels.create(`${args[0]}`, {
      type: "GUILD_CATEGORY",
    });

    const filter = (m) => m.author === msg.author;
    let channel;
    let noVoice;
    let voice;

    await msg.channel.send({
      content: `${msg.author}, please give a name for the general chat in the next minute`,
    });
    await msg.channel
      .awaitMessages({ filter, max: 1, time: 60000, errors: ["time"] })
      .then(async (collected) => {
        channel = await msg.guild.channels.create(
          `${collected.first().content}`,
          {
            type: "GUILD_TEXT",
            parent: category,
          }
        );
        return channel;
      });

    await msg.channel.send({
      content: `${msg.author}, please give a name for the no-voice chat in the next minute`,
    });
    await msg.channel
      .awaitMessages({ filter, max: 1, time: 60000, errors: ["time"] })
      .then(async (collected) => {
        noVoice = await msg.guild.channels.create(
          `${collected.first().content}`,
          {
            type: "GUILD_TEXT",
            parent: category,
          }
        );
        return noVoice;
      });

    await msg.channel.send({
      content: `${msg.author}, please give a name for the voice chat in the next minute`,
    });
    await msg.channel
      .awaitMessages({ filter, max: 1, time: 60000, errors: ["time"] })
      .then(async (collected) => {
        voice = await msg.guild.channels.create(`${collected.first().content}`, {
          type: "GUILD_VOICE",
          parent: category,
        });
        return voice;
      });

    await category.permissionOverwrites.set([
      {
        id: msg.guild.id,
        deny: [Permissions.FLAGS.VIEW_CHANNEL],
      },
    ]);

    channel.lockPermissions();
    noVoice.lockPermissions();
    voice.lockPermissions();
    reply.edit({ content: "Done!" });

    setImmediate((msg) => {
      setTimeout(function () {
        msg.channel.bulkDelete(6);
      }, 1000);
    }, msg);
  }
}

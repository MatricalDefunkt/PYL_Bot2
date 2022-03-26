const { MessageEmbed } = require('discord.js');
require('dotenv').config()
const errChannelId = process.env.ERRCHANNELID;
const errGuildId = process.env.ERRGUILDID;

module.exports = {
   data: {
    name: "eval",
    ownerOnly: true,
    staffOnly: false,
    adminOnly: false,
  },
  helpEmbed: new MessageEmbed()
  .setTitle("Use of Eval")
  .setAuthor({
    name: "PYL Bot#9640",
    iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
  })
  .setColor("GREEN")
  .setDescription(
    `Syntax and use of 'eval' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   !!eval <code in javascript>\`\`\`\n\`\`\`\nUse:\nThe eval command accepts input in the form of a string. If the input is in the proper format, it runs the code as if it's javascript.\`\`\``
  ),
  async execute(msg, client, args) {
    const errGuild = await client.guilds.fetch(`${errGuildId}`);
    const errChannel = await errGuild.channels.fetch(`${errChannelId}`);

    if (msg.author.id != 714473790939332679n) return;

    try {
      const evalCommand = args.join(" ");

      const evalReply = eval(evalCommand);
      if (evalReply) {
        msg.reply({ content: `${evalReply}` });
      } else {
        msg.reply({ content: `Check console.` });
      }
    } catch (error) {
      console.error(error);
      errChannel.send({
        content: `An error was caught: \n\`\`\`js\n${error.stack}\`\`\``,
      });
    }
  }
}
